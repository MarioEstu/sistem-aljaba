"""
test_auth.py — Fase 1: autenticación JWT.
"""
import httpx
import pytest

API = "http://localhost:4000/api"


class TestAuth:
    def test_health(self):
        r = httpx.get(f"{API}/health")
        assert r.status_code == 200

    def test_login_admin_ok(self):
        r = httpx.post(f"{API}/auth/login", json={"username": "admin", "password": "admin123"})
        assert r.status_code == 200
        body = r.json()
        assert "token" in body
        assert body["user"]["role"] == "admin"

    def test_login_guest_ok(self):
        r = httpx.post(f"{API}/auth/login", json={"username": "rutero01", "password": "guest123"})
        assert r.status_code == 200
        assert r.json()["user"]["role"] == "guest"

    def test_login_wrong_password(self):
        r = httpx.post(f"{API}/auth/login", json={"username": "admin", "password": "WRONG"})
        assert r.status_code == 401

    def test_login_unknown_user(self):
        r = httpx.post(f"{API}/auth/login", json={"username": "noexiste", "password": "x"})
        assert r.status_code == 401

    def test_protected_route_no_token(self):
        r = httpx.get(f"{API}/products")
        assert r.status_code == 401

    def test_protected_route_bad_token(self):
        r = httpx.get(f"{API}/products", headers={"Authorization": "Bearer TOKEN_INVALIDO"})
        assert r.status_code == 401

    def test_me_endpoint(self, admin_token):
        r = httpx.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200
        assert r.json()["username"] == "admin"
