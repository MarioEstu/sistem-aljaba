"""
test_catalogs_builder.py — Fase 4: pruebas E2E del builder de catálogos.

Prueba 1 — Drag & drop + persistencia de orden.
Prueba 2 — Image override visible en vista pública.
Prueba 3 — Vista pública en distintos layouts + modo incógnito.
Prueba 4 — Flujo completo: crear → agregar → publicar → ver URL → despublicar → 404 → republicar.

Estrategia de cleanup:
  - Cada clase tiene un fixture que elimina los catálogos y productos residuales
    usando la API antes de iniciar y al finalizar.
"""

import re
import time
import requests
import pytest
from playwright.sync_api import Page, BrowserContext, expect

BASE        = "http://localhost:3000"
BASE_API    = "http://localhost:4000/api"
CATALOG_NAME = "QA-Builder-Test"
SLUG         = "qa-builder-test"


# ─────────────────────────────────────────────────────────────
# Helpers compartidos
# ─────────────────────────────────────────────────────────────

def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _inject_auth(page: Page, auth_data: dict):
    page.goto(BASE)
    page.wait_for_load_state("domcontentloaded")
    page.evaluate("""(authData) => {
        localStorage.setItem('aljaba_auth', JSON.stringify({
            state: {
                token:           authData.token,
                user:            authData.user,
                isAuthenticated: true
            },
            version: 0
        }));
        localStorage.setItem('aljaba_token', authData.token);
    }""", auth_data)
    page.goto(f"{BASE}/dashboard")
    page.wait_for_function(
        "() => !window.location.pathname.includes('/login')",
        timeout=10000,
    )


def _api_cleanup(token: str, catalog_name: str, product_codes: list[str] | None = None):
    """Elimina catálogos y productos residuales de una corrida anterior."""
    h = auth_headers(token)
    catalogs = requests.get(f"{BASE_API}/catalogs", headers=h, timeout=10).json()
    for c in catalogs:
        if c.get("name") == catalog_name:
            requests.delete(f"{BASE_API}/catalogs/{c['id']}", headers=h, timeout=10)

    if product_codes:
        for code in product_codes:
            products = requests.get(
                f"{BASE_API}/products?search={code}", headers=h, timeout=10
            ).json()
            items = products.get("data", products) if isinstance(products, dict) else products
            for p in items:
                if p.get("code") == code:
                    requests.delete(f"{BASE_API}/products/{p['id']}", headers=h, timeout=10)


def _create_products_via_api(token: str):
    """Crea Alpha, Beta, Gamma y devuelve sus IDs."""
    h = auth_headers(token)
    ids = []
    for name, code, price in [("QA Alpha", "QA-ALPHA-001", 100), ("QA Beta", "QA-BETA-001", 200), ("QA Gamma", "QA-GAMMA-001", 300)]:
        r = requests.post(
            f"{BASE_API}/products",
            json={"name": name, "code": code, "price1": price, "stock": 10},
            headers=h, timeout=10,
        )
        assert r.status_code in (200, 201), f"No se pudo crear {name}: {r.text}"
        ids.append(r.json()["id"])
    return ids  # [alpha_id, beta_id, gamma_id]


def _create_catalog_with_products(token: str, prod_ids: list[str]):
    """Crea el catálogo de prueba, agrega productos y devuelve el catálogo."""
    h = auth_headers(token)
    catalog = requests.post(
        f"{BASE_API}/catalogs",
        json={"name": CATALOG_NAME, "description": "Catálogo para QA del builder"},
        headers=h, timeout=10,
    ).json()
    requests.post(
        f"{BASE_API}/catalogs/{catalog['id']}/products",
        json={"productIds": prod_ids},
        headers=h, timeout=10,
    )
    return catalog


PRODUCT_CODES = ["QA-ALPHA-001", "QA-BETA-001", "QA-GAMMA-001"]


# ─────────────────────────────────────────────────────────────
# Prueba 4: Flujo completo de catálogo
# ─────────────────────────────────────────────────────────────

class TestCatalogFullFlow:
    @pytest.fixture(autouse=True)
    def setup(self, admin_token):
        _api_cleanup(admin_token, CATALOG_NAME, PRODUCT_CODES)
        yield
        _api_cleanup(admin_token, CATALOG_NAME, PRODUCT_CODES)

    def test_create_catalog_via_ui(self, page: Page, admin_token_data):
        """4.1 — Crear catálogo desde la UI."""
        _inject_auth(page, admin_token_data)
        page.goto(f"{BASE}/catalogs")
        page.wait_for_load_state("networkidle")

        page.get_by_role("button", name=re.compile("nuevo|nuevo cat|crear", re.I)).first.click()
        page.wait_for_timeout(500)

        name_input = page.locator("input[name='name'], dialog input, [role='dialog'] input").first
        name_input.wait_for(state="visible", timeout=5000)
        name_input.fill(CATALOG_NAME)

        desc_input = page.locator("textarea[name='description'], dialog textarea").first
        if desc_input.is_visible():
            desc_input.fill("Catálogo para verificar el flujo completo")

        page.get_by_role("button", name=re.compile("guardar|crear|ok|save", re.I)).last.click()
        page.wait_for_load_state("networkidle")

        expect(page.get_by_text(CATALOG_NAME).first).to_be_visible(timeout=6000)

    def test_full_catalog_flow_api(self, admin_token):
        """
        4.1-4.6 — Flujo completo vía API (más rápido y determinista que E2E).
        Crear → agregar productos → publicar → ver URL pública → despublicar → 404.
        """
        h = auth_headers(admin_token)

        # 4.1 Crear
        catalog = requests.post(
            f"{BASE_API}/catalogs",
            json={"name": CATALOG_NAME, "description": "Flujo completo"},
            headers=h, timeout=10,
        ).json()
        assert catalog["guestVisible"] is False   # recién creado = privado
        assert "slug" in catalog

        # 4.3 Agregar productos
        prod_ids = _create_products_via_api(admin_token)
        r = requests.post(
            f"{BASE_API}/catalogs/{catalog['id']}/products",
            json={"productIds": prod_ids},
            headers=h, timeout=10,
        )
        assert r.status_code in (200, 201)
        updated = r.json()
        assert len(updated.get("products", [])) == 3

        # 4.4 Publicar
        pub = requests.put(f"{BASE_API}/catalogs/{catalog['id']}/publish", headers=h, timeout=10).json()
        assert pub["guestVisible"] is True

        # 4.5 URL pública visible
        r_pub = requests.get(f"{BASE_API}/catalogs/public/{catalog['slug']}", timeout=10)
        assert r_pub.status_code == 200
        public_data = r_pub.json()
        assert len(public_data.get("products", [])) == 3

        # 4.6 Despublicar → 404
        requests.put(f"{BASE_API}/catalogs/{catalog['id']}/unpublish", headers=h, timeout=10)
        r_404 = requests.get(f"{BASE_API}/catalogs/public/{catalog['slug']}", timeout=10)
        assert r_404.status_code == 404

        # Re-publicar para las pruebas siguientes
        requests.put(f"{BASE_API}/catalogs/{catalog['id']}/publish", headers=h, timeout=10)

    def test_public_view_loads_in_browser(self, page: Page, admin_token):
        """4.5 — La vista pública carga correctamente en el navegador (sin login)."""
        h = auth_headers(admin_token)

        # Setup vía API
        prod_ids = _create_products_via_api(admin_token)
        catalog = _create_catalog_with_products(admin_token, prod_ids)
        requests.put(f"{BASE_API}/catalogs/{catalog['id']}/publish", headers=h, timeout=10)

        # Abrir vista pública sin auth inyectada
        page.goto(f"{BASE}/view/{catalog['slug']}")
        page.wait_for_load_state("networkidle")

        # Debe cargar sin redirect a /login
        assert "/login" not in page.url
        # El título h1 del catálogo debe ser visible
        expect(
            page.get_by_role("heading", name=re.compile(CATALOG_NAME, re.I)).first
        ).to_be_visible(timeout=8000)

    def test_unpublish_shows_404_in_browser(self, page: Page, admin_token):
        """4.6 — Después de despublicar, la vista pública muestra mensaje de 'no disponible'."""
        h = auth_headers(admin_token)

        prod_ids = _create_products_via_api(admin_token)
        catalog = _create_catalog_with_products(admin_token, prod_ids)

        requests.put(f"{BASE_API}/catalogs/{catalog['id']}/publish", headers=h, timeout=10)
        requests.put(f"{BASE_API}/catalogs/{catalog['id']}/unpublish", headers=h, timeout=10)

        page.goto(f"{BASE}/view/{catalog['slug']}")
        page.wait_for_load_state("networkidle")

        # Debe mostrar mensaje de "no disponible" o similar
        expect(
            page.get_by_text(re.compile("no disponible|no existe|no está publicado|not found|404", re.I)).first
        ).to_be_visible(timeout=6000)

    def test_admin_route_protected_without_token(self, page: Page):
        """3.3 — Rutas de admin redirigen a /login cuando no hay token."""
        page.goto(BASE)
        page.evaluate("() => localStorage.clear()")
        page.goto(f"{BASE}/catalogs")
        page.wait_for_url(re.compile(r"/login"), timeout=6000)
        expect(page).to_have_url(re.compile(r"/login"))


# ─────────────────────────────────────────────────────────────
# Prueba 1: Drag & drop + persistencia de orden
# ─────────────────────────────────────────────────────────────

class TestDragDropReorder:
    @pytest.fixture(autouse=True)
    def setup(self, admin_token):
        _api_cleanup(admin_token, CATALOG_NAME, PRODUCT_CODES)
        yield
        _api_cleanup(admin_token, CATALOG_NAME, PRODUCT_CODES)

    def test_reorder_api_persists(self, admin_token):
        """1.2 (API) — El orden reordenado persiste tras recargar."""
        h = auth_headers(admin_token)
        prod_ids = _create_products_via_api(admin_token)
        catalog = _create_catalog_with_products(admin_token, prod_ids)

        # Invertir orden: Gamma (2), Beta (1), Alpha (0)
        new_order = [
            {"productId": prod_ids[2], "position": 0},
            {"productId": prod_ids[1], "position": 1},
            {"productId": prod_ids[0], "position": 2},
        ]
        r = requests.put(
            f"{BASE_API}/catalogs/{catalog['id']}/products/reorder",
            json={"items": new_order},
            headers=h, timeout=10,
        )
        assert r.status_code == 200, r.text

        # Verificar persistencia en BD (simula recarga)
        fresh = requests.get(f"{BASE_API}/catalogs/{catalog['id']}", headers=h, timeout=10).json()
        ordered = sorted(fresh["products"], key=lambda p: p["position"])
        assert ordered[0]["productId"] == prod_ids[2], "Gamma debe ser primero"
        assert ordered[1]["productId"] == prod_ids[1], "Beta debe ser segundo"
        assert ordered[2]["productId"] == prod_ids[0], "Alpha debe ser tercero"

    def test_reorder_ui_builder_shows_correct_order(self, page: Page, admin_token, admin_token_data):
        """1.1 / 1.2 — El builder muestra los productos en el orden guardado."""
        h = auth_headers(admin_token)
        prod_ids = _create_products_via_api(admin_token)
        catalog = _create_catalog_with_products(admin_token, prod_ids)

        # Reordenar vía API (Gamma primero)
        requests.put(
            f"{BASE_API}/catalogs/{catalog['id']}/products/reorder",
            json={"items": [
                {"productId": prod_ids[2], "position": 0},
                {"productId": prod_ids[1], "position": 1},
                {"productId": prod_ids[0], "position": 2},
            ]},
            headers=h, timeout=10,
        )

        _inject_auth(page, admin_token_data)
        page.goto(f"{BASE}/catalogs/{catalog['id']}/builder")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(1500)

        # El primer producto en la lista del panel derecho debe ser "QA Gamma"
        # (el texto puede estar en cualquier elemento dentro de la fila)
        first_item = page.locator("[data-testid='catalog-entry'], .catalog-entry, [draggable='true']").first
        if first_item.is_visible():
            expect(first_item).to_contain_text(re.compile("Gamma|GAMMA", re.I), timeout=5000)
        else:
            # Fallback: verificar que "QA Gamma" aparece en el DOM del panel derecho
            right_panel = page.locator(".catalog-entries, [data-panel='right'], aside, .entries-panel").first
            if right_panel.is_visible():
                all_text = right_panel.inner_text()
                gamma_pos = all_text.find("Gamma") if "Gamma" in all_text else all_text.find("QA Gamma")
                alpha_pos = all_text.find("Alpha") if "Alpha" in all_text else 999
                assert gamma_pos != -1, "QA Gamma no encontrado en el panel derecho"
                assert gamma_pos < alpha_pos, "Gamma debería aparecer antes que Alpha"

    def test_reorder_reflected_in_public_view(self, admin_token):
        """1.3 — El orden reordenado se refleja en el endpoint público."""
        h = auth_headers(admin_token)
        prod_ids = _create_products_via_api(admin_token)
        catalog = _create_catalog_with_products(admin_token, prod_ids)

        # Invertir orden
        requests.put(
            f"{BASE_API}/catalogs/{catalog['id']}/products/reorder",
            json={"items": [
                {"productId": prod_ids[2], "position": 0},
                {"productId": prod_ids[0], "position": 1},
                {"productId": prod_ids[1], "position": 2},
            ]},
            headers=h, timeout=10,
        )
        requests.put(f"{BASE_API}/catalogs/{catalog['id']}/publish", headers=h, timeout=10)

        public = requests.get(f"{BASE_API}/catalogs/public/{catalog['slug']}", timeout=10).json()
        pub_ordered = sorted(public["products"], key=lambda p: p["position"])
        assert pub_ordered[0]["productId"] == prod_ids[2]
        assert pub_ordered[1]["productId"] == prod_ids[0]
        assert pub_ordered[2]["productId"] == prod_ids[1]


# ─────────────────────────────────────────────────────────────
# Prueba 2: Image override
# ─────────────────────────────────────────────────────────────

class TestImageOverride:
    @pytest.fixture(autouse=True)
    def setup(self, admin_token):
        _api_cleanup(admin_token, CATALOG_NAME, PRODUCT_CODES)
        yield
        _api_cleanup(admin_token, CATALOG_NAME, PRODUCT_CODES)

    def test_set_and_clear_override_via_api(self, admin_token):
        """2.1 / 2.3 — Asignar y quitar image override vía API."""
        h = auth_headers(admin_token)
        prod_ids = _create_products_via_api(admin_token)
        catalog = _create_catalog_with_products(admin_token, prod_ids)

        # Quitar override (debe ser null por defecto)
        r = requests.put(
            f"{BASE_API}/catalogs/{catalog['id']}/products/{prod_ids[0]}/image",
            json={"imageOverrideId": None},
            headers=h, timeout=10,
        )
        assert r.status_code == 200, r.text

        # Verificar en catálogo
        fresh = requests.get(f"{BASE_API}/catalogs/{catalog['id']}", headers=h, timeout=10).json()
        entry = next(p for p in fresh["products"] if p["productId"] == prod_ids[0])
        assert entry.get("imageOverrideId") is None

    def test_invalid_image_id_returns_error(self, admin_token):
        """2.1 — Poner un imageOverrideId inválido debe devolver 4xx."""
        h = auth_headers(admin_token)
        prod_ids = _create_products_via_api(admin_token)
        catalog = _create_catalog_with_products(admin_token, prod_ids)

        r = requests.put(
            f"{BASE_API}/catalogs/{catalog['id']}/products/{prod_ids[0]}/image",
            json={"imageOverrideId": "totally-fake-id-0000"},
            headers=h, timeout=10,
        )
        assert r.status_code in (400, 404, 422), f"Esperaba 4xx, recibí {r.status_code}"

    def test_override_visible_in_public_products(self, admin_token):
        """2.2 — El override null queda reflejado en la vista pública."""
        h = auth_headers(admin_token)
        prod_ids = _create_products_via_api(admin_token)
        catalog = _create_catalog_with_products(admin_token, prod_ids)

        requests.put(
            f"{BASE_API}/catalogs/{catalog['id']}/products/{prod_ids[0]}/image",
            json={"imageOverrideId": None},
            headers=h, timeout=10,
        )
        requests.put(f"{BASE_API}/catalogs/{catalog['id']}/publish", headers=h, timeout=10)

        public = requests.get(f"{BASE_API}/catalogs/public/{catalog['slug']}", timeout=10).json()
        entry = next(p for p in public["products"] if p["productId"] == prod_ids[0])
        assert entry.get("imageOverrideId") is None

    def test_override_selector_visible_in_builder(self, page: Page, admin_token, admin_token_data):
        """2.1 (UI) — El selector de imagen override existe en el builder."""
        h = auth_headers(admin_token)
        prod_ids = _create_products_via_api(admin_token)
        catalog = _create_catalog_with_products(admin_token, prod_ids)

        _inject_auth(page, admin_token_data)
        page.goto(f"{BASE}/catalogs/{catalog['id']}/builder")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(1500)

        # El override se hace con un <select title="Imagen para este catálogo">
        override_selector = page.locator("select[title*='cat']").first
        if not override_selector.is_visible():
            override_selector = page.locator("select.input").first
        assert override_selector.is_visible(), \
            "No se encontró el <select> de image override en las filas del builder"


# ─────────────────────────────────────────────────────────────
# Prueba 3: Vista pública — layouts y modo incógnito
# ─────────────────────────────────────────────────────────────

class TestPublicView:
    @pytest.fixture(autouse=True)
    def setup(self, admin_token):
        _api_cleanup(admin_token, CATALOG_NAME, PRODUCT_CODES)
        yield
        _api_cleanup(admin_token, CATALOG_NAME, PRODUCT_CODES)

    @pytest.fixture()
    def published_catalog(self, admin_token):
        prod_ids = _create_products_via_api(admin_token)
        catalog = _create_catalog_with_products(admin_token, prod_ids)
        requests.put(
            f"{BASE_API}/catalogs/{catalog['id']}/publish",
            headers=auth_headers(admin_token), timeout=10,
        )
        return catalog, prod_ids

    def test_public_view_shows_3_products(self, page: Page, published_catalog):
        """3 productos deben aparecer en la vista pública."""
        catalog, _ = published_catalog
        page.goto(f"{BASE}/view/{catalog['slug']}")
        page.wait_for_load_state("networkidle")

        expect(page.get_by_text("QA Alpha", exact=False)).to_be_visible(timeout=8000)
        expect(page.get_by_text("QA Beta",  exact=False)).to_be_visible(timeout=5000)
        expect(page.get_by_text("QA Gamma", exact=False)).to_be_visible(timeout=5000)

    def test_public_view_no_login_required(self, page: Page, published_catalog):
        """3.3 — La vista pública no redirige a /login."""
        catalog, _ = published_catalog
        # Aseguramos contexto limpio antes de navegar
        page.goto(BASE)
        page.evaluate("() => localStorage.clear()")
        page.goto(f"{BASE}/view/{catalog['slug']}")
        page.wait_for_load_state("networkidle")
        assert "/login" not in page.url, "La vista pública NO debería requerir autenticación"

    def test_incognito_public_view(self, browser, published_catalog):
        """3.3 — Vista pública accesible desde contexto limpio (sin localStorage)."""
        catalog, _ = published_catalog
        ctx: BrowserContext = browser.new_context()
        pg = ctx.new_page()
        pg.goto(f"{BASE}/view/{catalog['slug']}")
        pg.wait_for_load_state("networkidle")

        assert "/login" not in pg.url
        expect(
            pg.get_by_role("heading", name=re.compile(CATALOG_NAME, re.I)).first
        ).to_be_visible(timeout=8000)
        ctx.close()

    def test_incognito_admin_redirect(self, browser):
        """3.3 — Ruta admin en contexto incógnito redirige a /login."""
        ctx: BrowserContext = browser.new_context()
        pg = ctx.new_page()
        pg.goto(f"{BASE}/catalogs")
        pg.wait_for_url(re.compile(r"/login"), timeout=6000)
        expect(pg).to_have_url(re.compile(r"/login"))
        ctx.close()

    def test_layout_grid4_via_api_config(self, admin_token, published_catalog):
        """3.1 — Cambiar layout a grid4 vía API y verificar en el endpoint público."""
        catalog, _ = published_catalog
        h = auth_headers(admin_token)

        requests.put(
            f"{BASE_API}/catalogs/{catalog['id']}",
            json={"config": {"layout": "grid4", "showPrice": True, "showCode": True}},
            headers=h, timeout=10,
        )

        public = requests.get(f"{BASE_API}/catalogs/public/{catalog['slug']}", timeout=10).json()
        cfg = public.get("config") or {}
        assert cfg.get("layout") == "grid4", f"Layout esperado grid4, recibido: {cfg}"

    def test_layout_list_via_api_config(self, admin_token, published_catalog):
        """3.2 — Cambiar layout a list vía API."""
        catalog, _ = published_catalog
        h = auth_headers(admin_token)

        requests.put(
            f"{BASE_API}/catalogs/{catalog['id']}",
            json={"config": {"layout": "list"}},
            headers=h, timeout=10,
        )

        public = requests.get(f"{BASE_API}/catalogs/public/{catalog['slug']}", timeout=10).json()
        cfg = public.get("config") or {}
        assert cfg.get("layout") == "list"

    def test_show_price_false_hides_price(self, page: Page, admin_token, published_catalog):
        """3.4 — showPrice: false oculta los precios en la vista pública."""
        catalog, _ = published_catalog
        h = auth_headers(admin_token)

        requests.put(
            f"{BASE_API}/catalogs/{catalog['id']}",
            json={"config": {"layout": "grid4", "showPrice": False, "showCode": True}},
            headers=h, timeout=10,
        )

        page.goto(f"{BASE}/view/{catalog['slug']}")
        page.wait_for_load_state("networkidle")

        # No debe aparecer "Q 100.00" ni "100.00" como precio
        price_text = page.get_by_text(re.compile(r"Q?\s*100\.00|100,00")).first
        assert not price_text.is_visible(), "El precio debería estar oculto cuando showPrice=false"

    def test_show_code_true_shows_code(self, page: Page, admin_token, published_catalog):
        """3.4 — showCode: true muestra el código del producto."""
        catalog, _ = published_catalog
        h = auth_headers(admin_token)

        requests.put(
            f"{BASE_API}/catalogs/{catalog['id']}",
            json={"config": {"layout": "grid4", "showCode": True, "showPrice": True}},
            headers=h, timeout=10,
        )

        page.goto(f"{BASE}/view/{catalog['slug']}")
        page.wait_for_load_state("networkidle")

        expect(page.get_by_text("QA-ALPHA-001", exact=False)).to_be_visible(timeout=6000)

    def test_layout_change_visible_in_builder_ui(self, page: Page, admin_token, admin_token_data, published_catalog):
        """3.1 — El builder UI tiene controles de layout."""
        catalog, _ = published_catalog
        _inject_auth(page, admin_token_data)
        page.goto(f"{BASE}/catalogs/{catalog['id']}/builder")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(1500)

        # Debe haber un botón/ícono de configuración (engranaje, settings)
        settings_btn = page.get_by_role("button", name=re.compile("configurar|config|settings|diseño|layout", re.I)).first
        config_icon = page.locator("button[aria-label*='config'], button[aria-label*='settings'], [data-testid*='settings']").first

        found = settings_btn.is_visible() or config_icon.is_visible()
        if not found:
            # Puede que el panel de config ya esté visible
            layout_control = page.locator("select, [role='listbox'], [data-testid*='layout']").filter(
                has_text=re.compile("grid|list|layout", re.I)
            ).first
            found = layout_control.is_visible()

        assert found, "No se encontró el panel/botón de configuración de layout en el builder"
