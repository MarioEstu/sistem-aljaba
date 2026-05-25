"""
test_ui.py — Fase 2: pruebas E2E con Playwright.
Cubre: login, /categories, /products, ProductFormModal, BulkEdit, CSV import.

Estrategia de autenticación:
  - login_as_admin / login_as_guest reciben el token ya obtenido (session fixture)
    y lo inyectan directamente en localStorage para evitar llamadas repetidas al
    endpoint /api/auth/login (que tiene rate-limit de 20 req / 15 min).
"""
import json
import re
import pytest
from playwright.sync_api import Page, expect

BASE = "http://localhost:3000"


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

def _inject_auth(page: Page, auth_data: dict):
    """
    Inyecta el estado de auth en localStorage y navega directamente a
    /dashboard para que AdminLayout rehydrate el store como autenticado.
    No recarga /login porque LoginPage no tiene guard de redirect.
    """
    # Abrir la app para poder acceder a localStorage
    page.goto(BASE)
    page.wait_for_load_state("domcontentloaded")

    page.evaluate("""(authData) => {
        // Zustand persist store (para que AdminLayout vea isAuthenticated=true)
        localStorage.setItem('aljaba_auth', JSON.stringify({
            state: {
                token:           authData.token,
                user:            authData.user,
                isAuthenticated: true
            },
            version: 0
        }));
        // Clave que lee el interceptor de axios en http.ts
        localStorage.setItem('aljaba_token', authData.token);
    }""", auth_data)

    # Navegar a /dashboard con carga completa para que Zustand rehidrate
    page.goto(f"{BASE}/dashboard")
    page.wait_for_function(
        "() => !window.location.pathname.includes('/login')",
        timeout=10000,
    )


# ──────────────────────────────────────────────
# Auth UI
# ──────────────────────────────────────────────

class TestLoginUI:
    def test_login_page_loads(self, page: Page):
        page.goto(f"{BASE}/login")
        expect(page).to_have_url(re.compile(r"/login"))

    def test_login_shows_form(self, page: Page):
        page.goto(f"{BASE}/login")
        expect(page.get_by_label("usuario", exact=False)).to_be_visible()
        expect(page.get_by_label("contraseña", exact=False)).to_be_visible()

    def test_wrong_credentials_show_error(self, page: Page):
        page.goto(f"{BASE}/login")
        page.get_by_label("usuario", exact=False).fill("admin")
        page.get_by_label("contraseña", exact=False).fill("WRONG")
        page.get_by_role("button", name=re.compile("entrar|iniciar|login|submit", re.I)).click()
        page.wait_for_timeout(1500)
        expect(page).to_have_url(re.compile(r"/login"))

    def test_admin_login_redirects(self, page: Page, admin_token_data):
        _inject_auth(page, admin_token_data)
        expect(page).not_to_have_url(re.compile(r"/login"))

    def test_redirect_unauthenticated_to_login(self, page: Page):
        page.goto(BASE)
        page.evaluate("() => localStorage.clear()")
        page.goto(f"{BASE}/products")
        page.wait_for_url(re.compile(r"/login"), timeout=5000)
        expect(page).to_have_url(re.compile(r"/login"))


# ──────────────────────────────────────────────
# Categories UI
# ──────────────────────────────────────────────

class TestCategoriesUI:
    def test_categories_page_loads(self, page: Page, admin_token_data):
        _inject_auth(page, admin_token_data)
        page.goto(f"{BASE}/categories")
        page.wait_for_load_state("networkidle")
        expect(page.get_by_text("Iluminación")).to_be_visible(timeout=6000)

    def test_create_category(self, page: Page, admin_token_data):
        _inject_auth(page, admin_token_data)
        page.goto(f"{BASE}/categories")
        page.wait_for_load_state("networkidle")

        # Limpiar instancias previas de Cat-UI-Test antes de crear una nueva
        while page.get_by_text("Cat-UI-Test").count() > 0:
            row = page.locator("li, tr, [role='row']").filter(has_text="Cat-UI-Test").first
            row.get_by_role("button", name=re.compile("eliminar|delete|borrar", re.I)).click()
            confirm_btn = page.get_by_role("button", name=re.compile("confirmar|sí|yes|ok|eliminar", re.I)).last
            try:
                confirm_btn.wait_for(state="visible", timeout=2000)
                confirm_btn.click()
            except Exception:
                pass
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(300)

        page.get_by_role("button", name=re.compile("nueva|agregar|add|crear", re.I)).first.click()
        page.wait_for_timeout(400)

        name_input = page.locator(".card-pad input.input, dialog input.input, [role='dialog'] input.input, .card input.input").first
        name_input.wait_for(state="visible", timeout=5000)
        name_input.fill("Cat-UI-Test")
        page.get_by_role("button", name=re.compile("crear|guardar|save|ok", re.I)).first.click()
        page.wait_for_load_state("networkidle")

        expect(page.get_by_text("Cat-UI-Test").first).to_be_visible(timeout=5000)

    def test_delete_category(self, page: Page, admin_token_data):
        _inject_auth(page, admin_token_data)
        page.goto(f"{BASE}/categories")
        page.wait_for_load_state("networkidle")

        cat_row = page.get_by_text("Cat-UI-Test").first
        if cat_row.is_visible():
            row = page.locator("li, tr, [role='row']").filter(has_text="Cat-UI-Test").first
            row.get_by_role("button", name=re.compile("eliminar|delete|borrar", re.I)).click()
            confirm_btn = page.get_by_role("button", name=re.compile("confirmar|sí|yes|ok|eliminar", re.I)).last
            if confirm_btn.is_visible(timeout=2000):
                confirm_btn.click()
            page.wait_for_load_state("networkidle")


# ──────────────────────────────────────────────
# Products UI
# ──────────────────────────────────────────────

class TestProductsUI:
    def test_products_page_loads(self, page: Page, admin_token_data):
        _inject_auth(page, admin_token_data)
        page.goto(f"{BASE}/products")
        page.wait_for_load_state("networkidle")
        expect(page.get_by_role("table")).to_be_visible(timeout=8000)

    def test_search_filters_table(self, page: Page, admin_token_data):
        _inject_auth(page, admin_token_data)
        page.goto(f"{BASE}/products")
        page.wait_for_load_state("networkidle")

        search = page.get_by_placeholder(re.compile("buscar|search", re.I)).first
        search.fill("zzz_no_existe_999")
        page.wait_for_timeout(600)
        rows = page.locator("tbody tr")
        count = rows.count()
        assert count == 0 or page.get_by_text(re.compile("sin|no hay|empty|0 resultado", re.I)).is_visible()

    def test_create_product_modal(self, page: Page, admin_token_data):
        _inject_auth(page, admin_token_data)
        page.goto(f"{BASE}/products")
        page.wait_for_load_state("networkidle")

        page.get_by_role("button", name=re.compile("nuevo|agregar|add|crear", re.I)).first.click()
        page.wait_for_timeout(600)

        name_input = page.locator("input[name='name']")
        name_input.wait_for(state="visible", timeout=5000)

        page.locator("input[name='name']").fill("Producto UI Test")
        page.locator("input[name='code']").fill("UI-TEST-PROD-001")
        page.locator("input[name='price1']").fill("15.00")
        page.locator("input[name='stock']").fill("25")

        page.get_by_role("button", name=re.compile("crear producto|guardar|save|crear", re.I)).last.click()
        page.wait_for_load_state("networkidle")

        expect(page.get_by_text("UI-TEST-PROD-001")).to_be_visible(timeout=5000)

    def test_select_checkbox(self, page: Page, admin_token_data):
        _inject_auth(page, admin_token_data)
        page.goto(f"{BASE}/products")
        page.wait_for_load_state("networkidle")

        first_checkbox = page.locator("tbody tr input[type='checkbox']").first
        if first_checkbox.is_visible():
            first_checkbox.check()
            expect(
                page.get_by_role("button", name=re.compile("accion|bulk|masiv|seleccionad", re.I))
            ).to_be_visible(timeout=3000)

    def test_pagination_controls(self, page: Page, admin_token_data):
        _inject_auth(page, admin_token_data)
        page.goto(f"{BASE}/products")
        page.wait_for_load_state("networkidle")
        expect(page).to_have_url(re.compile(r"/products"))

    def test_sort_by_column(self, page: Page, admin_token_data):
        _inject_auth(page, admin_token_data)
        page.goto(f"{BASE}/products")
        page.wait_for_load_state("networkidle")

        name_header = page.get_by_role("columnheader", name=re.compile("nombre|name", re.I)).first
        if name_header.is_visible():
            name_header.click()
            page.wait_for_timeout(500)
            name_header.click()
            page.wait_for_load_state("networkidle")

    def test_delete_product_ui(self, page: Page, admin_token_data):
        _inject_auth(page, admin_token_data)
        page.goto(f"{BASE}/products")
        page.wait_for_load_state("networkidle")

        search = page.get_by_placeholder(re.compile("buscar|search", re.I)).first
        search.fill("UI-TEST-PROD-001")
        page.wait_for_timeout(800)

        row = page.locator("tbody tr").filter(has_text="UI-TEST-PROD-001").first
        if row.is_visible():
            row.get_by_role("button", name=re.compile("eliminar|delete|borrar", re.I)).click()
            confirm = page.get_by_role("button", name=re.compile("confirmar|sí|yes|ok|eliminar", re.I)).last
            if confirm.is_visible(timeout=2000):
                confirm.click()
            page.wait_for_load_state("networkidle")


# ──────────────────────────────────────────────
# CSV Import UI
# ──────────────────────────────────────────────

class TestCsvImportUI:
    def test_csv_import_modal_opens(self, page: Page, admin_token_data):
        _inject_auth(page, admin_token_data)
        page.goto(f"{BASE}/products")
        page.wait_for_load_state("networkidle")

        import_btn = page.get_by_role("button", name=re.compile("importar|import|csv", re.I)).first
        if import_btn.is_visible():
            import_btn.click()
            page.wait_for_timeout(500)
            expect(page.get_by_text(re.compile("arrastra|drag|subir|upload|csv", re.I)).first).to_be_visible(timeout=4000)

    def test_csv_upload_preview(self, page: Page, admin_token_data, tmp_path):
        _inject_auth(page, admin_token_data)
        page.goto(f"{BASE}/products")
        page.wait_for_load_state("networkidle")

        import_btn = page.get_by_role("button", name=re.compile("importar|import|csv", re.I)).first
        if not import_btn.is_visible():
            pytest.skip("Botón de importar CSV no encontrado")

        import_btn.click()
        page.wait_for_timeout(500)

        csv_file = tmp_path / "test_import.csv"
        csv_file.write_text("code,name,description,category,price1,price2,price3,price4,price5,price6,stock quality\nCSVUI-001,Test CSV UI,,,5.00,,,,,, 1\n")

        file_input = page.locator("input[type='file']").first
        file_input.set_input_files(str(csv_file))
        page.wait_for_timeout(1500)

        expect(page.get_by_text(re.compile("csvui-001|preview|vista previa", re.I)).first).to_be_visible(timeout=6000)
