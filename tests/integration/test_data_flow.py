"""
test_data_flow.py — Tests de integración: flujo bidireccional API ↔ UI.

Categorías de tests:
  1. API crea → UI muestra
  2. UI envía form → API persiste
  3. Búsqueda/filtros UI ↔ query params API
  4. Errores backend → mensaje en frontend
  5. Permisos admin vs guest
"""
import re
import time
import pytest
import httpx
from playwright.sync_api import Page, expect

from conftest import inject_auth, API, BASE


# ══════════════════════════════════════════════════════════
# 1. API CREA → UI MUESTRA
#    Crear entidad vía API directa y verificar que
#    el frontend la renderiza sin ninguna acción manual.
# ══════════════════════════════════════════════════════════

class TestApiCreatesUIShows:
    """Datos creados en el backend deben aparecer en la UI tras recarga."""

    def test_new_product_visible_in_table(self, page: Page, admin_client, admin_token_data):
        """Crear producto vía API → verificar que aparece en tabla de productos."""
        code = f"INT-SHOW-{int(time.time())}"
        r = admin_client.post("/products", json={
            "code": code, "name": "Producto Integración Visible",
            "description": "Test", "price1": 99.99,
            "categoryId": None, "stockQuality": 5
        })
        assert r.status_code == 201, f"No se pudo crear producto: {r.text}"
        created_id = r.json()["id"]

        inject_auth(page, admin_token_data)
        page.goto(f"{BASE}/products")
        page.wait_for_load_state("networkidle")

        # Buscar por código para filtrar la tabla
        search = page.locator("input[placeholder*='buscar' i], input[type='search'], input[placeholder*='search' i]").first
        search.fill(code)
        page.wait_for_timeout(600)

        expect(page.get_by_text(code).first).to_be_visible(timeout=6000)

        # Cleanup
        admin_client.delete(f"/products/{created_id}")

    def test_new_category_visible_in_tree(self, page: Page, admin_client, admin_token_data):
        """Crear categoría vía API → aparece en árbol de categorías."""
        cat_name = f"IntCat-{int(time.time())}"
        r = admin_client.post("/categories", json={"name": cat_name})
        assert r.status_code == 201, f"No se pudo crear categoría: {r.text}"
        cat_id = r.json()["id"]

        inject_auth(page, admin_token_data)
        page.goto(f"{BASE}/categories")
        page.wait_for_load_state("networkidle")

        expect(page.get_by_text(cat_name).first).to_be_visible(timeout=6000)

        # Cleanup
        admin_client.delete(f"/categories/{cat_id}")

    def test_deleted_product_disappears_from_table(self, page: Page, admin_client, admin_token_data):
        """Eliminar producto vía API → ya no aparece en la tabla del frontend."""
        code = f"INT-DEL-{int(time.time())}"
        r = admin_client.post("/products", json={
            "code": code, "name": "Producto Para Eliminar",
            "description": "Test", "price1": 10,
            "categoryId": None, "stockQuality": 1
        })
        assert r.status_code == 201
        pid = r.json()["id"]

        # Eliminar vía API
        admin_client.delete(f"/products/{pid}")

        inject_auth(page, admin_token_data)
        page.goto(f"{BASE}/products")
        page.wait_for_load_state("networkidle")

        search = page.locator("input[placeholder*='buscar' i], input[type='search'], input[placeholder*='search' i]").first
        search.fill(code)
        page.wait_for_timeout(600)

        assert page.get_by_text(code).count() == 0, "Producto eliminado sigue visible en la UI"


# ══════════════════════════════════════════════════════════
# 2. UI ENVÍA FORM → API PERSISTE
#    Acción en el frontend → verificar persistencia
#    consultando la API directamente después.
# ══════════════════════════════════════════════════════════

class TestUIFormPersistsToAPI:
    """Lo que se envía desde el formulario debe estar en la BD."""

    def test_product_created_via_form_exists_in_api(self, page: Page, admin_client, admin_token_data):
        """Crear producto desde el modal de la UI → verificar vía GET /api/products."""
        inject_auth(page, admin_token_data)
        page.goto(f"{BASE}/products")
        page.wait_for_load_state("networkidle")

        # Abrir modal de creación — buscar el botón "Nuevo producto" o similar
        page.get_by_role("button", name=re.compile("nuevo|agregar|add|crear", re.I)).first.click()

        # Esperar a que el modal esté abierto (el h2 "Nuevo producto")
        page.get_by_role("heading", name=re.compile("nuevo producto", re.I)).wait_for(
            state="visible", timeout=5000
        )

        form_code = f"UI-FORM-{int(time.time())}"

        # Rellenar nombre primero (primer campo en el grid)
        name_input = page.locator("input[name='name']")
        name_input.wait_for(state="visible", timeout=5000)
        name_input.fill("Producto desde formulario UI")

        # Rellenar código (segundo campo en el grid)
        page.locator("input[name='code']").fill(form_code)

        # Precio 1
        page.locator("input[name='price1']").fill("55.50")

        # Click en el botón submit con texto exacto "Crear producto"
        page.get_by_role("button", name="Crear producto").click()

        # Esperar que el modal cierre (el heading desaparezca)
        page.wait_for_function(
            "() => !document.querySelector('[style*=\"z-index: 200\"]')",
            timeout=8000
        )
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(500)

        # Verificar en API
        r = admin_client.get(f"/products?search={form_code}&limit=5")
        assert r.status_code == 200
        body = r.json()
        items = body.get("data", body.get("items", body if isinstance(body, list) else []))
        codes = [p.get("code", "") for p in items]
        assert form_code in codes, f"Producto {form_code} no encontrado en API tras creación UI. Respuesta: {body}"

        # Cleanup
        pid = next(p["id"] for p in items if p.get("code") == form_code)
        admin_client.delete(f"/products/{pid}")

    def test_category_created_via_form_exists_in_api(self, page: Page, admin_client, admin_token_data):
        """Crear categoría desde la UI → verificar en GET /api/categories/flat."""
        inject_auth(page, admin_token_data)
        page.goto(f"{BASE}/categories")
        page.wait_for_load_state("networkidle")

        cat_name = f"UICat-{int(time.time())}"
        page.get_by_role("button", name=re.compile("nueva|agregar|add|crear", re.I)).first.click()
        page.wait_for_timeout(400)

        name_input = page.locator(".card-pad input.input, dialog input.input, [role='dialog'] input.input, .card input.input").first
        name_input.wait_for(state="visible", timeout=5000)
        name_input.fill(cat_name)
        page.get_by_role("button", name=re.compile("crear|guardar|save|ok", re.I)).first.click()
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(500)

        # Verificar en API
        r = admin_client.get("/categories/flat")
        assert r.status_code == 200
        names = [c.get("name", "") for c in r.json()]
        assert cat_name in names, f"Categoría '{cat_name}' no encontrada en API. Lista: {names}"

        # Cleanup
        cat_id = next(c["id"] for c in r.json() if c.get("name") == cat_name)
        admin_client.delete(f"/categories/{cat_id}")


# ══════════════════════════════════════════════════════════
# 3. FILTROS/BÚSQUEDA UI ↔ QUERY PARAMS API
#    Verificar que los controles de filtro del frontend
#    producen el mismo subset que llamar a la API con
#    los mismos parámetros.
# ══════════════════════════════════════════════════════════

class TestFilterConsistency:
    """Los resultados filtrados en la UI deben coincidir con los de la API."""

    def test_search_text_matches_api(self, page: Page, admin_client, admin_token_data):
        """Escribir un término de búsqueda en UI → comparar con API?search=."""
        # Crear producto específico para buscar
        code = f"SRCH-{int(time.time())}"
        r = admin_client.post("/products", json={
            "code": code, "name": f"BusquedaUnica {code}",
            "description": "Test búsqueda", "price1": 1,
            "categoryId": None, "stockQuality": 0
        })
        assert r.status_code == 201
        pid = r.json()["id"]

        inject_auth(page, admin_token_data)
        page.goto(f"{BASE}/products")
        page.wait_for_load_state("networkidle")

        # Búsqueda en UI
        search_box = page.locator("input[placeholder*='buscar' i], input[type='search'], input[placeholder*='search' i]").first
        search_box.fill(code)
        page.wait_for_timeout(700)

        # Contar filas en UI (excluyendo cabecera)
        rows_ui = page.locator("tbody tr").count()

        # Contar resultados en API
        api_r = admin_client.get(f"/products?search={code}&limit=100")
        assert api_r.status_code == 200
        body = api_r.json()
        total_api = body.get("total", len(body.get("data", body.get("items", []))))

        assert rows_ui == total_api, (
            f"UI muestra {rows_ui} filas pero API devuelve {total_api} para search='{code}'"
        )

        # Cleanup
        admin_client.delete(f"/products/{pid}")

    def test_category_filter_narrows_products(self, page: Page, admin_client, admin_token_data):
        """Filtrar por categoría en UI → solo aparecen productos de esa categoría."""
        # Crear categoría y producto asociado
        cat_r = admin_client.post("/categories", json={"name": f"FiltCat-{int(time.time())}"})
        assert cat_r.status_code == 201
        cat = cat_r.json()

        code = f"FILT-{int(time.time())}"
        prod_r = admin_client.post("/products", json={
            "code": code, "name": "Producto Filtrado",
            "description": "Test filtro categoría", "price1": 1,
            "categoryId": cat["id"], "stockQuality": 0
        })
        assert prod_r.status_code == 201
        pid = prod_r.json()["id"]

        inject_auth(page, admin_token_data)
        page.goto(f"{BASE}/products")
        page.wait_for_load_state("networkidle")

        # Abrir selector de categoría y elegir la creada
        cat_select = page.locator("select[name*='category' i], select[id*='category' i], [data-testid*='category' i] select").first
        if cat_select.count() > 0:
            cat_select.select_option(label=re.compile(re.escape(cat["name"]), re.I))
            page.wait_for_timeout(700)
            page.wait_for_load_state("networkidle")
            # El producto recién creado debe ser visible
            expect(page.get_by_text(code).first).to_be_visible(timeout=5000)
        else:
            pytest.skip("No se encontró el selector de categorías en la UI")

        # Cleanup
        admin_client.delete(f"/products/{pid}")
        admin_client.delete(f"/categories/{cat['id']}")


# ══════════════════════════════════════════════════════════
# 4. ERRORES BACKEND → MENSAJE EN FRONTEND
#    Las respuestas 4xx del backend deben producir
#    mensajes de error visibles en la UI.
# ══════════════════════════════════════════════════════════

class TestBackendErrorsShownInUI:
    """Errores de validación del backend deben ser visibles en el frontend."""

    def test_duplicate_code_shows_error(self, page: Page, admin_client, admin_token_data):
        """Crear producto con código duplicado → mensaje de error en UI."""
        code = f"DUP-{int(time.time())}"
        r = admin_client.post("/products", json={
            "code": code, "name": "Original",
            "description": "Test", "price1": 1,
            "categoryId": None, "stockQuality": 0
        })
        assert r.status_code == 201
        pid = r.json()["id"]

        inject_auth(page, admin_token_data)
        page.goto(f"{BASE}/products")
        page.wait_for_load_state("networkidle")

        # Intentar crear duplicado desde la UI
        page.get_by_role("button", name=re.compile("nuevo|agregar|add|crear", re.I)).first.click()
        page.wait_for_timeout(500)

        code_input = page.locator("input[name='code'], input[placeholder*='código' i], input[placeholder*='code' i]").first
        code_input.wait_for(state="visible", timeout=5000)
        code_input.fill(code)

        name_input = page.locator("input[name='name'], input[placeholder*='nombre' i], input[placeholder*='name' i]").first
        name_input.fill("Duplicado")

        page.locator("form button[type='submit']").click()
        page.wait_for_timeout(1500)

        # Verificar que aparece algún mensaje de error
        error_visible = (
            page.locator("[role='alert'], .toast, .alert, .error, [class*='error' i], [class*='toast' i]").count() > 0
            or page.get_by_text(re.compile("duplicado|ya existe|already|conflict", re.I)).count() > 0
        )
        assert error_visible, "No se mostró mensaje de error al crear producto duplicado"

        # Cleanup
        admin_client.delete(f"/products/{pid}")

    def test_missing_required_field_shows_error(self, page: Page, admin_token_data):
        """Intentar crear producto sin nombre → error de validación visible."""
        inject_auth(page, admin_token_data)
        page.goto(f"{BASE}/products")
        page.wait_for_load_state("networkidle")

        page.get_by_role("button", name=re.compile("nuevo|agregar|add|crear", re.I)).first.click()
        page.wait_for_timeout(500)

        # Solo rellenar código, dejar nombre vacío
        code_input = page.locator("input[name='code'], input[placeholder*='código' i], input[placeholder*='code' i]").first
        if code_input.count() > 0:
            code_input.wait_for(state="visible", timeout=5000)
            code_input.fill(f"NONAME-{int(time.time())}")

        # Intentar guardar con nombre vacío
        page.locator("form button[type='submit']").click()
        page.wait_for_timeout(1000)

        # Validación en frontend (Zod) o error de backend
        error_visible = (
            page.locator("[role='alert'], .toast, .alert, .error, [class*='error' i], [class*='invalid' i]").count() > 0
            or page.locator("input:invalid").count() > 0
            or page.get_by_text(re.compile("requerido|obligatorio|required", re.I)).count() > 0
        )
        assert error_visible, "No se mostró error de validación al omitir campo requerido"


# ══════════════════════════════════════════════════════════
# 5. PERMISOS ADMIN VS GUEST EN UI
#    El rol del usuario en el token determina qué acciones
#    son visibles/disponibles en el frontend.
# ══════════════════════════════════════════════════════════

class TestRoleBasedUI:
    """La UI debe mostrar/ocultar controles según el rol del token."""

    def test_admin_sees_create_button(self, page: Page, admin_token_data):
        """Admin debe ver el botón de crear producto."""
        inject_auth(page, admin_token_data)
        page.goto(f"{BASE}/products")
        page.wait_for_load_state("networkidle")

        create_btn = page.get_by_role("button", name=re.compile("nuevo|agregar|add|crear", re.I)).first
        expect(create_btn).to_be_visible(timeout=5000)

    def test_guest_cannot_reach_create_endpoint(self, guest_client):
        """Guest no puede crear productos vía API (solo lectura)."""
        r = guest_client.post("/products", json={
            "code": "GUEST-FAIL", "name": "No debería crearse",
            "description": "Test", "price1": 1,
            "categoryId": None, "stockQuality": 0
        })
        assert r.status_code in (401, 403), f"Guest pudo crear producto: {r.status_code} {r.text}"

    def test_admin_can_delete_product(self, admin_client):
        """Admin puede crear y eliminar productos vía API."""
        r = admin_client.post("/products", json={
            "code": f"ADMDEL-{int(time.time())}", "name": "Para eliminar",
            "description": "Test", "price1": 1,
            "categoryId": None, "stockQuality": 0
        })
        assert r.status_code == 201
        pid = r.json()["id"]
        del_r = admin_client.delete(f"/products/{pid}")
        assert del_r.status_code in (200, 204), f"Admin no pudo eliminar: {del_r.status_code}"

    def test_guest_sees_product_list(self, page: Page, guest_token_data):
        """Guest es redirigido al portal de catálogos (Fase 7: GuestLayout).

        Antes de Fase 7 el guest podía ver /products.
        Desde Fase 7 AdminLayout redirige a /portal; el guest ve el portal de catálogos.
        """
        inject_auth(page, guest_token_data)
        page.goto(f"{BASE}/products")
        page.wait_for_load_state("networkidle")

        # El guest es redirigido a /portal — la URL debe cambiar
        expect(page).to_have_url(re.compile(r"/portal"), timeout=5000)
        # El header del GuestLayout muestra la marca
        expect(page.get_by_text("ALJABA")).to_be_visible(timeout=5000)

    def test_admin_token_has_admin_role(self, admin_token_data):
        """El token de admin debe contener role='admin' en el payload."""
        import base64, json as _json
        token = admin_token_data["token"]
        payload = _json.loads(base64.b64decode(token.split(".")[1] + "==").decode())
        assert payload.get("role") == "admin", f"Payload inesperado: {payload}"

    def test_guest_token_has_guest_role(self, guest_token_data):
        """El token de guest debe contener role='guest'."""
        import base64, json as _json
        token = guest_token_data["token"]
        payload = _json.loads(base64.b64decode(token.split(".")[1] + "==").decode())
        assert payload.get("role") in ("guest", "viewer", "rutero"), f"Payload inesperado: {payload}"
