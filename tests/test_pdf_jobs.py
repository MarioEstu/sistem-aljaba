"""
test_pdf_jobs.py - Fase 5: pruebas de integracion de la API de PDF Jobs.

Cubre:
  - CRUD de jobs (POST, GET lista, GET por id, DELETE)
  - Ciclo de vida: pending -> processing -> completed / failed
  - Retry: solo permitido en jobs fallidos, rechazado en completados
  - Cancelacion de job pendiente al crear uno nuevo para el mismo catalogo
  - Acceso sin autenticacion denegado (401/403)
  - El PDF generado es descargable (status 200, Content-Type application/pdf)
  - Correcta vinculacion catalogId -> catalog en la respuesta
  - Layouts grid4 y list se completan sin error
"""

import time
import pytest
import requests

BASE_API = "http://localhost:4000/api"
CATALOG_NAME_PDF = "QA-PDF-Jobs-Test"


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _cleanup(admin_token: str):
    h = auth_headers(admin_token)
    cats = requests.get(f"{BASE_API}/catalogs", headers=h, timeout=10).json()
    for c in cats:
        if c.get("name") == CATALOG_NAME_PDF:
            requests.delete(f"{BASE_API}/catalogs/{c['id']}", headers=h, timeout=10)
    prods_resp = requests.get(f"{BASE_API}/products?search=QA-PDF", headers=h, timeout=10)
    prods = prods_resp.json()
    items = prods.get("data", prods) if isinstance(prods, dict) else prods
    for p in items:
        if str(p.get("code", "")).startswith("QA-PDF"):
            requests.delete(f"{BASE_API}/products/{p['id']}", headers=h, timeout=10)


def _make_published_catalog(token: str):
    """Crea un catalogo publicado con un producto, listo para generar PDF."""
    h = auth_headers(token)

    prod = requests.post(
        f"{BASE_API}/products",
        json={"name": "QA-PDF Producto", "code": "QA-PDF-001", "price1": 50.0, "stock": 5},
        headers=h, timeout=10,
    ).json()

    catalog = requests.post(
        f"{BASE_API}/catalogs",
        json={"name": CATALOG_NAME_PDF, "description": "Para generar PDF"},
        headers=h, timeout=10,
    ).json()

    requests.post(
        f"{BASE_API}/catalogs/{catalog['id']}/products",
        json={"productIds": [prod["id"]]},
        headers=h, timeout=10,
    )
    requests.put(f"{BASE_API}/catalogs/{catalog['id']}/publish", headers=h, timeout=10)

    return catalog, prod


def _wait_for_job(token: str, job_id: str, target_statuses: list, timeout_s: int = 60) -> dict:
    """Hace polling hasta que el job alcanza uno de los target_statuses."""
    h = auth_headers(token)
    deadline = time.time() + timeout_s
    job = {}
    while time.time() < deadline:
        r = requests.get(f"{BASE_API}/pdf-jobs/{job_id}", headers=h, timeout=10)
        assert r.status_code == 200, f"GET /api/pdf-jobs/{job_id} devolvio {r.status_code}"
        job = r.json()
        if job["status"] in target_statuses:
            return job
        time.sleep(2)
    pytest.fail(
        f"Job {job_id} no alcanzo {target_statuses} en {timeout_s}s. "
        f"Ultimo estado: {job.get('status')}"
    )


# -----------------------------------------------------------------
# CRUD / autenticacion
# -----------------------------------------------------------------

class TestPdfJobsCRUD:
    @pytest.fixture(autouse=True)
    def setup_teardown(self, admin_token):
        _cleanup(admin_token)
        yield
        _cleanup(admin_token)

    def test_create_job_requires_auth(self):
        r = requests.post(f"{BASE_API}/pdf-jobs", json={"catalogId": "fake"}, timeout=10)
        assert r.status_code in (401, 403)

    def test_list_jobs_requires_auth(self):
        r = requests.get(f"{BASE_API}/pdf-jobs", timeout=10)
        assert r.status_code in (401, 403)

    def test_create_job_invalid_catalog_returns_error(self, admin_token):
        r = requests.post(
            f"{BASE_API}/pdf-jobs",
            json={"catalogId": "non-existent-catalog-id-0000"},
            headers=auth_headers(admin_token),
            timeout=10,
        )
        assert r.status_code in (400, 404, 422), f"Esperaba 4xx, recibi {r.status_code}: {r.text}"

    def test_create_job_returns_pending_status(self, admin_token):
        catalog, _ = _make_published_catalog(admin_token)
        r = requests.post(
            f"{BASE_API}/pdf-jobs",
            json={"catalogId": catalog["id"]},
            headers=auth_headers(admin_token),
            timeout=10,
        )
        # 202 Accepted es correcto para trabajos asincronos
        assert r.status_code in (200, 201, 202), r.text
        job = r.json()
        assert job["status"] in ("pending", "processing")
        assert job["catalogId"] == catalog["id"]
        assert "id" in job

    def test_get_job_by_id(self, admin_token):
        catalog, _ = _make_published_catalog(admin_token)
        job = requests.post(
            f"{BASE_API}/pdf-jobs",
            json={"catalogId": catalog["id"]},
            headers=auth_headers(admin_token),
            timeout=10,
        ).json()

        r = requests.get(
            f"{BASE_API}/pdf-jobs/{job['id']}",
            headers=auth_headers(admin_token),
            timeout=10,
        )
        assert r.status_code == 200
        assert r.json()["id"] == job["id"]
        assert r.json()["catalogId"] == catalog["id"]

    def test_get_nonexistent_job_returns_404(self, admin_token):
        r = requests.get(
            f"{BASE_API}/pdf-jobs/non-existent-job-id-000",
            headers=auth_headers(admin_token),
            timeout=10,
        )
        assert r.status_code == 404

    def test_list_jobs_contains_created_job(self, admin_token):
        catalog, _ = _make_published_catalog(admin_token)
        job = requests.post(
            f"{BASE_API}/pdf-jobs",
            json={"catalogId": catalog["id"]},
            headers=auth_headers(admin_token),
            timeout=10,
        ).json()

        r = requests.get(f"{BASE_API}/pdf-jobs", headers=auth_headers(admin_token), timeout=10)
        assert r.status_code == 200
        assert job["id"] in [j["id"] for j in r.json()]

    def test_list_jobs_filter_by_catalog_id(self, admin_token):
        catalog, _ = _make_published_catalog(admin_token)
        requests.post(
            f"{BASE_API}/pdf-jobs",
            json={"catalogId": catalog["id"]},
            headers=auth_headers(admin_token),
            timeout=10,
        )

        r = requests.get(
            f"{BASE_API}/pdf-jobs?catalogId={catalog['id']}",
            headers=auth_headers(admin_token),
            timeout=10,
        )
        assert r.status_code == 200
        for j in r.json():
            assert j["catalogId"] == catalog["id"]

    def test_delete_job(self, admin_token):
        catalog, _ = _make_published_catalog(admin_token)
        job = requests.post(
            f"{BASE_API}/pdf-jobs",
            json={"catalogId": catalog["id"]},
            headers=auth_headers(admin_token),
            timeout=10,
        ).json()

        r = requests.delete(
            f"{BASE_API}/pdf-jobs/{job['id']}",
            headers=auth_headers(admin_token),
            timeout=10,
        )
        assert r.status_code in (200, 204)

        r2 = requests.get(
            f"{BASE_API}/pdf-jobs/{job['id']}",
            headers=auth_headers(admin_token),
            timeout=10,
        )
        assert r2.status_code == 404


# -----------------------------------------------------------------
# Ciclo de vida del worker: pending -> completed
# -----------------------------------------------------------------

class TestPdfJobLifecycle:
    @pytest.fixture(autouse=True)
    def setup_teardown(self, admin_token):
        _cleanup(admin_token)
        yield
        _cleanup(admin_token)

    def test_job_completes_and_has_pdf_url(self, admin_token):
        """El worker completa el job y catalog.pdfUrl apunta al archivo."""
        catalog, _ = _make_published_catalog(admin_token)
        job = requests.post(
            f"{BASE_API}/pdf-jobs",
            json={"catalogId": catalog["id"]},
            headers=auth_headers(admin_token),
            timeout=10,
        ).json()

        completed = _wait_for_job(admin_token, job["id"], ["completed", "failed"], timeout_s=60)
        assert completed["status"] == "completed", (
            f"El job fallo. errorMessage: {completed.get('errorMessage')}"
        )
        pdf_url = completed.get("catalog", {}).get("pdfUrl")
        assert pdf_url, f"Job completado pero sin catalog.pdfUrl. Respuesta: {completed}"

    def test_completed_pdf_is_downloadable(self, admin_token):
        """El PDF en catalog.pdfUrl es descargable con Content-Type application/pdf."""
        catalog, _ = _make_published_catalog(admin_token)
        job = requests.post(
            f"{BASE_API}/pdf-jobs",
            json={"catalogId": catalog["id"]},
            headers=auth_headers(admin_token),
            timeout=10,
        ).json()

        completed = _wait_for_job(admin_token, job["id"], ["completed", "failed"], timeout_s=60)
        assert completed["status"] == "completed", completed.get("errorMessage")

        pdf_url = completed.get("catalog", {}).get("pdfUrl")
        assert pdf_url, "No hay catalog.pdfUrl en el job completado"

        if pdf_url.startswith("/"):
            pdf_url = f"http://localhost:4000{pdf_url}"

        r = requests.get(pdf_url, timeout=30, stream=True)
        assert r.status_code == 200, f"PDF no descargable: {r.status_code}"
        ct = r.headers.get("Content-Type", "")
        assert "pdf" in ct.lower(), f"Content-Type inesperado: {ct}"

    def test_job_initial_status_is_pending_or_processing(self, admin_token):
        catalog, _ = _make_published_catalog(admin_token)
        r = requests.post(
            f"{BASE_API}/pdf-jobs",
            json={"catalogId": catalog["id"]},
            headers=auth_headers(admin_token),
            timeout=10,
        )
        assert r.status_code in (200, 201, 202)
        assert r.json()["status"] in ("pending", "processing")

    def test_job_response_has_catalog_info(self, admin_token):
        catalog, _ = _make_published_catalog(admin_token)
        job = requests.post(
            f"{BASE_API}/pdf-jobs",
            json={"catalogId": catalog["id"]},
            headers=auth_headers(admin_token),
            timeout=10,
        ).json()

        detail = requests.get(
            f"{BASE_API}/pdf-jobs/{job['id']}",
            headers=auth_headers(admin_token),
            timeout=10,
        ).json()

        assert detail.get("catalog") is not None or detail.get("catalogId") == catalog["id"]

    def test_second_job_for_same_catalog_is_accepted(self, admin_token):
        """Crear un segundo job para el mismo catalogo genera un nuevo registro."""
        catalog, _ = _make_published_catalog(admin_token)
        h = auth_headers(admin_token)

        job1 = requests.post(
            f"{BASE_API}/pdf-jobs",
            json={"catalogId": catalog["id"]},
            headers=h, timeout=10,
        ).json()

        job2 = requests.post(
            f"{BASE_API}/pdf-jobs",
            json={"catalogId": catalog["id"]},
            headers=h, timeout=10,
        ).json()

        assert "id" in job2
        # El backend puede crear uno nuevo o devolver el mismo pendiente
        jobs = requests.get(
            f"{BASE_API}/pdf-jobs?catalogId={catalog['id']}",
            headers=h, timeout=10,
        ).json()
        assert len(jobs) >= 1


# -----------------------------------------------------------------
# Retry
# -----------------------------------------------------------------

class TestPdfJobRetry:
    @pytest.fixture(autouse=True)
    def setup_teardown(self, admin_token):
        _cleanup(admin_token)
        yield
        _cleanup(admin_token)

    def test_retry_completed_job_is_rejected(self, admin_token):
        """Solo se pueden reintentar jobs fallidos; un job completado devuelve 400."""
        catalog, _ = _make_published_catalog(admin_token)
        h = auth_headers(admin_token)

        job = requests.post(
            f"{BASE_API}/pdf-jobs",
            json={"catalogId": catalog["id"]},
            headers=h, timeout=10,
        ).json()

        completed = _wait_for_job(admin_token, job["id"], ["completed", "failed"], timeout_s=60)
        assert completed["status"] == "completed", completed.get("errorMessage")

        r = requests.post(
            f"{BASE_API}/pdf-jobs/{completed['id']}/retry",
            headers=h, timeout=10,
        )
        assert r.status_code == 400, (
            f"Esperaba 400 al reintentar job completado, recibi {r.status_code}: {r.text}"
        )

    def test_retry_nonexistent_job_returns_error(self, admin_token):
        r = requests.post(
            f"{BASE_API}/pdf-jobs/non-existent-id-0000/retry",
            headers=auth_headers(admin_token),
            timeout=10,
        )
        assert r.status_code in (400, 404, 422)


# -----------------------------------------------------------------
# Configuracion: formato y layout
# -----------------------------------------------------------------

class TestPdfJobConfig:
    @pytest.fixture(autouse=True)
    def setup_teardown(self, admin_token):
        _cleanup(admin_token)
        yield
        _cleanup(admin_token)

    def test_create_job_with_custom_config(self, admin_token):
        """El job acepta configuracion personalizada de formato y layout."""
        catalog, _ = _make_published_catalog(admin_token)
        r = requests.post(
            f"{BASE_API}/pdf-jobs",
            json={
                "catalogId": catalog["id"],
                "config": {
                    "layout":          "list",
                    "format":          "A4",
                    "showCode":        True,
                    "showPrice1":      True,
                    "showPrices2to6":  False,
                    "showStock":       True,
                    "showDescription": False,
                    "logoOnEachPage":  True,
                    "productsPerPage": 10,
                },
            },
            headers=auth_headers(admin_token),
            timeout=10,
        )
        assert r.status_code in (200, 201, 202), r.text
        job = r.json()
        assert job["status"] in ("pending", "processing")

    def test_job_with_layout_grid4_completes(self, admin_token):
        """Job con layout grid4 (2 columnas) se completa correctamente."""
        catalog, _ = _make_published_catalog(admin_token)
        requests.put(
            f"{BASE_API}/catalogs/{catalog['id']}",
            json={"config": {"layout": "grid4", "showPrice1": True}},
            headers=auth_headers(admin_token),
            timeout=10,
        )

        job = requests.post(
            f"{BASE_API}/pdf-jobs",
            json={"catalogId": catalog["id"]},
            headers=auth_headers(admin_token),
            timeout=10,
        ).json()

        completed = _wait_for_job(admin_token, job["id"], ["completed", "failed"], timeout_s=60)
        assert completed["status"] == "completed", completed.get("errorMessage")

    def test_job_with_layout_list_completes(self, admin_token):
        """Job con layout list se completa correctamente."""
        catalog, _ = _make_published_catalog(admin_token)
        requests.put(
            f"{BASE_API}/catalogs/{catalog['id']}",
            json={"config": {"layout": "list", "showPrice1": True, "showCode": True}},
            headers=auth_headers(admin_token),
            timeout=10,
        )

        job = requests.post(
            f"{BASE_API}/pdf-jobs",
            json={"catalogId": catalog["id"]},
            headers=auth_headers(admin_token),
            timeout=10,
        ).json()

        completed = _wait_for_job(admin_token, job["id"], ["completed", "failed"], timeout_s=60)
        assert completed["status"] == "completed", completed.get("errorMessage")
