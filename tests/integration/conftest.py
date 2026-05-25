"""
conftest.py — fixtures para tests de integración backend + frontend.

Cada test de integración usa:
 - admin_client: httpx.Client autenticado para llamadas directas a la API
 - page (Playwright): browser que apunta al frontend (localhost:3000)
 - _inject_auth: helper para inyectar el token en localStorage
"""
import re
import pytest
import httpx
from playwright.sync_api import Page, expect

API  = "http://localhost:4000/api"
BASE = "http://localhost:3000"

# ─────────────────────────────────────────────────────────
# Token compartido (scope=session → 1 login por suite)
# ─────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def admin_token_data():
    r = httpx.post(f"{API}/auth/login", json={"username": "admin", "password": "admin123"})
    assert r.status_code == 200, f"Login admin falló: {r.text}"
    return r.json()

@pytest.fixture(scope="session")
def guest_token_data():
    r = httpx.post(f"{API}/auth/login", json={"username": "rutero01", "password": "guest123"})
    assert r.status_code == 200, f"Login guest falló: {r.text}"
    return r.json()

@pytest.fixture(scope="session")
def admin_client(admin_token_data):
    return httpx.Client(
        base_url=API,
        headers={"Authorization": f"Bearer {admin_token_data['token']}"},
        timeout=10,
    )

@pytest.fixture(scope="session")
def guest_client(guest_token_data):
    return httpx.Client(
        base_url=API,
        headers={"Authorization": f"Bearer {guest_token_data['token']}"},
        timeout=10,
    )

# ─────────────────────────────────────────────────────────
# Helper: inyectar token en localStorage del browser
# ─────────────────────────────────────────────────────────

def inject_auth(page: Page, token_data: dict):
    """Inyecta aljaba_auth (Zustand) y aljaba_token (axios interceptor)."""
    page.goto(BASE)
    page.wait_for_load_state("domcontentloaded")
    page.evaluate("""(d) => {
        localStorage.setItem('aljaba_auth', JSON.stringify({
            state: { token: d.token, user: d.user, isAuthenticated: true },
            version: 0
        }));
        localStorage.setItem('aljaba_token', d.token);
    }""", token_data)
    page.goto(f"{BASE}/dashboard")
    page.wait_for_function(
        "() => !window.location.pathname.includes('/login')", timeout=8000
    )
