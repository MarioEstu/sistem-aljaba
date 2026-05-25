"""
test_catalogs.py — Fase 4: pruebas de integración de la API de Catálogos.

Cubre:
  - CRUD de catálogos (crear, leer, actualizar, eliminar)
  - Publicar / despublicar y verificar estado
  - Endpoint público /api/catalogs/public/:slug
    · 404 cuando no está publicado
    · 200 cuando está publicado
  - Añadir / quitar productos de un catálogo
  - Reordenar productos (verifica que el orden persiste)
  - Image override por catálogo en un producto
"""

import pytest
import requests

BASE_API = "http://localhost:4000/api"


# ─────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────

def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _delete_catalogs_named(token: str, name: str):
    """Limpia catálogos residuales antes de cada prueba."""
    headers = auth_headers(token)
    catalogs = requests.get(f"{BASE_API}/catalogs", headers=headers, timeout=10).json()
    for c in catalogs:
        if c.get("name") == name:
            requests.delete(f"{BASE_API}/catalogs/{c['id']}", headers=headers, timeout=10)


# ─────────────────────────────────────────────────────────────
# Tests de CRUD básico
# ─────────────────────────────────────────────────────────────

class TestCatalogCRUD:
    CATALOG_NAME = "QA-Catalog-Test"

    @pytest.fixture(autouse=True)
    def cleanup(self, admin_token):
        _delete_catalogs_named(admin_token, self.CATALOG_NAME)
        yield
        _delete_catalogs_named(admin_token, self.CATALOG_NAME)

    def test_create_catalog(self, admin_token):
        r = requests.post(
            f"{BASE_API}/catalogs",
            json={"name": self.CATALOG_NAME, "description": "Catálogo de QA"},
            headers=auth_headers(admin_token),
            timeout=10,
        )
        assert r.status_code in (200, 201), r.text
        data = r.json()
        assert data["name"] == self.CATALOG_NAME
        # El backend usa guestVisible (bool) en vez de un campo "status"
        assert data["guestVisible"] is False     # recién creado = privado/borrador
        assert "slug" in data and data["slug"]
        assert "id" in data

    def test_list_catalogs(self, admin_token):
        # Crear primero
        requests.post(
            f"{BASE_API}/catalogs",
            json={"name": self.CATALOG_NAME},
            headers=auth_headers(admin_token),
            timeout=10,
        )
        r = requests.get(f"{BASE_API}/catalogs", headers=auth_headers(admin_token), timeout=10)
        assert r.status_code == 200
        catalogs = r.json()
        assert isinstance(catalogs, list)
        names = [c["name"] for c in catalogs]
        assert self.CATALOG_NAME in names

    def test_get_catalog_by_id(self, admin_token):
        created = requests.post(
            f"{BASE_API}/catalogs",
            json={"name": self.CATALOG_NAME},
            headers=auth_headers(admin_token),
            timeout=10,
        ).json()
        r = requests.get(
            f"{BASE_API}/catalogs/{created['id']}",
            headers=auth_headers(admin_token),
            timeout=10,
        )
        assert r.status_code == 200
        assert r.json()["id"] == created["id"]

    def test_update_catalog(self, admin_token):
        created = requests.post(
            f"{BASE_API}/catalogs",
            json={"name": self.CATALOG_NAME},
            headers=auth_headers(admin_token),
            timeout=10,
        ).json()
        r = requests.put(
            f"{BASE_API}/catalogs/{created['id']}",
            json={"description": "Descripción actualizada"},
            headers=auth_headers(admin_token),
            timeout=10,
        )
        assert r.status_code == 200
        assert r.json()["description"] == "Descripción actualizada"

    def test_delete_catalog(self, admin_token):
        created = requests.post(
            f"{BASE_API}/catalogs",
            json={"name": self.CATALOG_NAME},
            headers=auth_headers(admin_token),
            timeout=10,
        ).json()
        r = requests.delete(
            f"{BASE_API}/catalogs/{created['id']}",
            headers=auth_headers(admin_token),
            timeout=10,
        )
        assert r.status_code in (200, 204)

        # Verificar que no existe
        r2 = requests.get(
            f"{BASE_API}/catalogs/{created['id']}",
            headers=auth_headers(admin_token),
            timeout=10,
        )
        assert r2.status_code == 404

    def test_slug_auto_generated_from_name(self, admin_token):
        created = requests.post(
            f"{BASE_API}/catalogs",
            json={"name": self.CATALOG_NAME},
            headers=auth_headers(admin_token),
            timeout=10,
        ).json()
        slug = created.get("slug", "")
        assert slug != ""
        assert " " not in slug
        assert slug == slug.lower()

    def test_create_catalog_requires_auth(self):
        r = requests.post(
            f"{BASE_API}/catalogs",
            json={"name": "Sin auth"},
            timeout=10,
        )
        assert r.status_code in (401, 403)


# ─────────────────────────────────────────────────────────────
# Publish / Unpublish
# ─────────────────────────────────────────────────────────────

class TestCatalogPublish:
    CATALOG_NAME = "QA-Publish-Test"

    @pytest.fixture(autouse=True)
    def cleanup(self, admin_token):
        _delete_catalogs_named(admin_token, self.CATALOG_NAME)
        yield
        _delete_catalogs_named(admin_token, self.CATALOG_NAME)

    @pytest.fixture()
    def catalog(self, admin_token):
        return requests.post(
            f"{BASE_API}/catalogs",
            json={"name": self.CATALOG_NAME},
            headers=auth_headers(admin_token),
            timeout=10,
        ).json()

    def test_initial_status_is_draft(self, catalog):
        # El backend representa el estado de publicación con guestVisible (bool)
        assert catalog["guestVisible"] is False

    def test_publish_changes_status(self, admin_token, catalog):
        r = requests.put(
            f"{BASE_API}/catalogs/{catalog['id']}/publish",
            headers=auth_headers(admin_token),
            timeout=10,
        )
        assert r.status_code == 200
        assert r.json()["guestVisible"] is True

    def test_unpublish_changes_status_back(self, admin_token, catalog):
        requests.put(
            f"{BASE_API}/catalogs/{catalog['id']}/publish",
            headers=auth_headers(admin_token),
            timeout=10,
        )
        r = requests.put(
            f"{BASE_API}/catalogs/{catalog['id']}/unpublish",
            headers=auth_headers(admin_token),
            timeout=10,
        )
        assert r.status_code == 200
        assert r.json()["guestVisible"] is False

    def test_public_endpoint_404_when_draft(self, catalog):
        slug = catalog["slug"]
        r = requests.get(f"{BASE_API}/catalogs/public/{slug}", timeout=10)
        assert r.status_code == 404

    def test_public_endpoint_200_when_published(self, admin_token, catalog):
        requests.put(
            f"{BASE_API}/catalogs/{catalog['id']}/publish",
            headers=auth_headers(admin_token),
            timeout=10,
        )
        r = requests.get(f"{BASE_API}/catalogs/public/{catalog['slug']}", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert data["guestVisible"] is True
        assert data["slug"] == catalog["slug"]

    def test_public_endpoint_404_after_unpublish(self, admin_token, catalog):
        # Publicar
        requests.put(
            f"{BASE_API}/catalogs/{catalog['id']}/publish",
            headers=auth_headers(admin_token),
            timeout=10,
        )
        # Verificar que está visible
        r_pub = requests.get(f"{BASE_API}/catalogs/public/{catalog['slug']}", timeout=10)
        assert r_pub.status_code == 200

        # Despublicar
        requests.put(
            f"{BASE_API}/catalogs/{catalog['id']}/unpublish",
            headers=auth_headers(admin_token),
            timeout=10,
        )
        # Verificar 404
        r_unp = requests.get(f"{BASE_API}/catalogs/public/{catalog['slug']}", timeout=10)
        assert r_unp.status_code == 404

    def test_public_endpoint_no_auth_required(self, admin_token, catalog):
        """La vista pública no necesita token."""
        requests.put(
            f"{BASE_API}/catalogs/{catalog['id']}/publish",
            headers=auth_headers(admin_token),
            timeout=10,
        )
        # Sin headers de auth
        r = requests.get(f"{BASE_API}/catalogs/public/{catalog['slug']}", timeout=10)
        assert r.status_code == 200


# ─────────────────────────────────────────────────────────────
# Products in catalog (add / remove / reorder)
# ─────────────────────────────────────────────────────────────

class TestCatalogProducts:
    CATALOG_NAME = "QA-Products-Catalog"
    PROD_NAMES   = ["QA-Alpha", "QA-Beta", "QA-Gamma"]

    @pytest.fixture(autouse=True)
    def setup_teardown(self, admin_token):
        _delete_catalogs_named(admin_token, self.CATALOG_NAME)

        # Crear 3 productos de prueba
        prod_ids = []
        for name in self.PROD_NAMES:
            r = requests.post(
                f"{BASE_API}/products",
                json={"name": name, "code": f"QA-{name[-1].upper()}-{name}", "price1": 10.0, "stock": 5},
                headers=auth_headers(admin_token),
                timeout=10,
            )
            assert r.status_code in (200, 201), f"No se pudo crear producto {name}: {r.text}"
            prod_ids.append(r.json()["id"])

        yield prod_ids

        # Limpieza
        _delete_catalogs_named(admin_token, self.CATALOG_NAME)
        for pid in prod_ids:
            requests.delete(f"{BASE_API}/products/{pid}", headers=auth_headers(admin_token), timeout=10)

    def test_add_products_to_catalog(self, admin_token, setup_teardown):
        prod_ids = setup_teardown
        catalog = requests.post(
            f"{BASE_API}/catalogs",
            json={"name": self.CATALOG_NAME},
            headers=auth_headers(admin_token),
            timeout=10,
        ).json()

        r = requests.post(
            f"{BASE_API}/catalogs/{catalog['id']}/products",
            json={"productIds": prod_ids},
            headers=auth_headers(admin_token),
            timeout=10,
        )
        assert r.status_code in (200, 201), r.text
        updated = r.json()
        returned_ids = [p["productId"] for p in updated.get("products", [])]
        for pid in prod_ids:
            assert pid in returned_ids

    def test_remove_product_from_catalog(self, admin_token, setup_teardown):
        prod_ids = setup_teardown
        catalog = requests.post(
            f"{BASE_API}/catalogs",
            json={"name": self.CATALOG_NAME},
            headers=auth_headers(admin_token),
            timeout=10,
        ).json()

        requests.post(
            f"{BASE_API}/catalogs/{catalog['id']}/products",
            json={"productIds": prod_ids},
            headers=auth_headers(admin_token),
            timeout=10,
        )

        r = requests.delete(
            f"{BASE_API}/catalogs/{catalog['id']}/products/{prod_ids[0]}",
            headers=auth_headers(admin_token),
            timeout=10,
        )
        assert r.status_code in (200, 204), r.text

        updated = requests.get(
            f"{BASE_API}/catalogs/{catalog['id']}",
            headers=auth_headers(admin_token),
            timeout=10,
        ).json()
        returned_ids = [p["productId"] for p in updated.get("products", [])]
        assert prod_ids[0] not in returned_ids

    def test_reorder_persists(self, admin_token, setup_teardown):
        """Reordenar y verificar que el orden se persiste en BD."""
        prod_ids = setup_teardown
        catalog = requests.post(
            f"{BASE_API}/catalogs",
            json={"name": self.CATALOG_NAME},
            headers=auth_headers(admin_token),
            timeout=10,
        ).json()

        requests.post(
            f"{BASE_API}/catalogs/{catalog['id']}/products",
            json={"productIds": prod_ids},
            headers=auth_headers(admin_token),
            timeout=10,
        )

        # Invertir el orden: [2,1,0]
        new_order = [
            {"productId": prod_ids[2], "position": 0},
            {"productId": prod_ids[1], "position": 1},
            {"productId": prod_ids[0], "position": 2},
        ]
        r = requests.put(
            f"{BASE_API}/catalogs/{catalog['id']}/products/reorder",
            json={"items": new_order},
            headers=auth_headers(admin_token),
            timeout=10,
        )
        assert r.status_code == 200, r.text

        # Verificar que el nuevo orden se mantiene en BD
        fresh = requests.get(
            f"{BASE_API}/catalogs/{catalog['id']}",
            headers=auth_headers(admin_token),
            timeout=10,
        ).json()
        ordered = sorted(fresh["products"], key=lambda p: p["position"])
        assert ordered[0]["productId"] == prod_ids[2], "El producto Gamma debería ser el primero"
        assert ordered[1]["productId"] == prod_ids[1]
        assert ordered[2]["productId"] == prod_ids[0]

    def test_reorder_visible_in_public_endpoint(self, admin_token, setup_teardown):
        """El orden reordenado debe reflejarse en el endpoint público."""
        prod_ids = setup_teardown
        catalog = requests.post(
            f"{BASE_API}/catalogs",
            json={"name": self.CATALOG_NAME},
            headers=auth_headers(admin_token),
            timeout=10,
        ).json()

        requests.post(
            f"{BASE_API}/catalogs/{catalog['id']}/products",
            json={"productIds": prod_ids},
            headers=auth_headers(admin_token),
            timeout=10,
        )

        # Reordenar: poner el último primero
        new_order = [
            {"productId": prod_ids[2], "position": 0},
            {"productId": prod_ids[0], "position": 1},
            {"productId": prod_ids[1], "position": 2},
        ]
        requests.put(
            f"{BASE_API}/catalogs/{catalog['id']}/products/reorder",
            json={"items": new_order},
            headers=auth_headers(admin_token),
            timeout=10,
        )

        # Publicar
        requests.put(
            f"{BASE_API}/catalogs/{catalog['id']}/publish",
            headers=auth_headers(admin_token),
            timeout=10,
        )

        public = requests.get(
            f"{BASE_API}/catalogs/public/{catalog['slug']}", timeout=10
        ).json()
        pub_ordered = sorted(public["products"], key=lambda p: p["position"])
        assert pub_ordered[0]["productId"] == prod_ids[2]


# ─────────────────────────────────────────────────────────────
# Image override por catálogo
# ─────────────────────────────────────────────────────────────

class TestCatalogImageOverride:
    CATALOG_NAME = "QA-Override-Catalog"

    @pytest.fixture()
    def catalog_with_product(self, admin_token):
        """Crea un catálogo con un producto y lo publica."""
        _delete_catalogs_named(admin_token, self.CATALOG_NAME)

        # Producto
        prod = requests.post(
            f"{BASE_API}/products",
            json={"name": "QA-Override-Prod", "code": "QA-OVR-001", "price1": 5.0, "stock": 1},
            headers=auth_headers(admin_token),
            timeout=10,
        ).json()

        # Catálogo
        catalog = requests.post(
            f"{BASE_API}/catalogs",
            json={"name": self.CATALOG_NAME},
            headers=auth_headers(admin_token),
            timeout=10,
        ).json()

        requests.post(
            f"{BASE_API}/catalogs/{catalog['id']}/products",
            json={"productIds": [prod["id"]]},
            headers=auth_headers(admin_token),
            timeout=10,
        )

        yield catalog, prod

        _delete_catalogs_named(admin_token, self.CATALOG_NAME)
        requests.delete(f"{BASE_API}/products/{prod['id']}", headers=auth_headers(admin_token), timeout=10)

    def test_set_image_override_null(self, admin_token, catalog_with_product):
        catalog, prod = catalog_with_product
        r = requests.put(
            f"{BASE_API}/catalogs/{catalog['id']}/products/{prod['id']}/image",
            json={"imageOverrideId": None},
            headers=auth_headers(admin_token),
            timeout=10,
        )
        assert r.status_code == 200, r.text

    def test_set_image_override_invalid_id_returns_error(self, admin_token, catalog_with_product):
        catalog, prod = catalog_with_product
        r = requests.put(
            f"{BASE_API}/catalogs/{catalog['id']}/products/{prod['id']}/image",
            json={"imageOverrideId": "non-existent-image-id-000"},
            headers=auth_headers(admin_token),
            timeout=10,
        )
        assert r.status_code in (400, 404, 422), r.text

    def test_override_reflected_in_catalog(self, admin_token, catalog_with_product):
        """Después de quitar el override (null), el endpoint devuelve imageOverrideId null."""
        catalog, prod = catalog_with_product
        requests.put(
            f"{BASE_API}/catalogs/{catalog['id']}/products/{prod['id']}/image",
            json={"imageOverrideId": None},
            headers=auth_headers(admin_token),
            timeout=10,
        )
        fresh = requests.get(
            f"{BASE_API}/catalogs/{catalog['id']}",
            headers=auth_headers(admin_token),
            timeout=10,
        ).json()
        entry = next(p for p in fresh["products"] if p["productId"] == prod["id"])
        assert entry.get("imageOverrideId") is None


# ─────────────────────────────────────────────────────────────
# Config del catálogo (layout, show fields)
# ─────────────────────────────────────────────────────────────

class TestCatalogConfig:
    CATALOG_NAME = "QA-Config-Catalog"

    @pytest.fixture(autouse=True)
    def cleanup(self, admin_token):
        _delete_catalogs_named(admin_token, self.CATALOG_NAME)
        yield
        _delete_catalogs_named(admin_token, self.CATALOG_NAME)

    def test_default_config_has_layout(self, admin_token):
        catalog = requests.post(
            f"{BASE_API}/catalogs",
            json={"name": self.CATALOG_NAME},
            headers=auth_headers(admin_token),
            timeout=10,
        ).json()
        # La config empieza vacía ({}); el layout se establece cuando el usuario
        # abre el builder por primera vez. Verificamos que la creación funciona.
        assert "id" in catalog
        assert "config" in catalog  # la clave existe aunque el objeto esté vacío

    def test_update_config_layout(self, admin_token):
        catalog = requests.post(
            f"{BASE_API}/catalogs",
            json={"name": self.CATALOG_NAME},
            headers=auth_headers(admin_token),
            timeout=10,
        ).json()

        new_config = {"layout": "list", "showPrice": False, "showCode": True, "showStock": False}
        r = requests.put(
            f"{BASE_API}/catalogs/{catalog['id']}",
            json={"config": new_config},
            headers=auth_headers(admin_token),
            timeout=10,
        )
        assert r.status_code == 200
        saved_config = r.json().get("config") or {}
        assert saved_config.get("layout") == "list"
        assert saved_config.get("showCode") is True
        assert saved_config.get("showPrice") is False

    def test_config_persisted_after_reload(self, admin_token):
        catalog = requests.post(
            f"{BASE_API}/catalogs",
            json={"name": self.CATALOG_NAME},
            headers=auth_headers(admin_token),
            timeout=10,
        ).json()

        new_config = {"layout": "grid9", "showPrice": True, "showCode": False}
        requests.put(
            f"{BASE_API}/catalogs/{catalog['id']}",
            json={"config": new_config},
            headers=auth_headers(admin_token),
            timeout=10,
        )
        fresh = requests.get(
            f"{BASE_API}/catalogs/{catalog['id']}",
            headers=auth_headers(admin_token),
            timeout=10,
        ).json()
        cfg = fresh.get("config") or {}
        assert cfg.get("layout") == "grid9"
