"""
conftest.py — fixtures globales para la suite de Catalog Aljaba.
El token de sesión se obtiene UNA sola vez (scope='session') para no
superar el rate-limit del endpoint /api/auth/login.
"""
import pytest
import httpx

API = "http://localhost:4000/api"

# ─────────────────────────────────────────────────────────
# Login único por rol (1 request por rol para toda la suite)
# ─────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def admin_token_data():
    """Login admin → devuelve {token, user} completo."""
    r = httpx.post(f"{API}/auth/login", json={"username": "admin", "password": "admin123"})
    assert r.status_code == 200, f"Login admin falló: {r.text}"
    return r.json()

@pytest.fixture(scope="session")
def guest_token_data():
    """Login guest → devuelve {token, user} completo."""
    r = httpx.post(f"{API}/auth/login", json={"username": "rutero01", "password": "guest123"})
    assert r.status_code == 200, f"Login guest falló: {r.text}"
    return r.json()

@pytest.fixture(scope="session")
def admin_token(admin_token_data):
    """Extrae solo el JWT (para los API tests que solo necesitan el bearer)."""
    return admin_token_data["token"]

@pytest.fixture(scope="session")
def guest_token(guest_token_data):
    return guest_token_data["token"]

# ─────────────────────────────────────────────────────────
# Clientes HTTP reutilizables (API tests)
# ─────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def admin_client(admin_token):
    return httpx.Client(
        base_url=API,
        headers={"Authorization": f"Bearer {admin_token}"},
        timeout=10,
    )

@pytest.fixture(scope="session")
def guest_client(guest_token):
    return httpx.Client(
        base_url=API,
        headers={"Authorization": f"Bearer {guest_token}"},
        timeout=10,
    )
