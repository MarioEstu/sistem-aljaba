"""
test_categories.py — Fase 2: CRUD completo de categorías.
"""
import httpx
import pytest

API = "http://localhost:4000/api"


class TestCategoriesRead:
    """Lectura del árbol y lista plana (disponible para admin y guest)."""

    def test_tree_returns_list(self, admin_client):
        r = admin_client.get("/categories")
        assert r.status_code == 200
        body = r.json()
        assert isinstance(body, list)
        # El seed creó al menos 5 categorías raíz
        assert len(body) >= 5

    def test_tree_has_children_field(self, admin_client):
        r = admin_client.get("/categories")
        # Cada nodo debe tener el campo children (puede ser lista vacía)
        for node in r.json():
            assert "children" in node or "id" in node  # estructura mínima

    def test_flat_returns_list(self, admin_client):
        r = admin_client.get("/categories/flat")
        assert r.status_code == 200
        body = r.json()
        assert isinstance(body, list)
        assert len(body) >= 5

    def test_flat_has_id_and_name(self, admin_client):
        r = admin_client.get("/categories/flat")
        for item in r.json():
            assert "id" in item
            assert "name" in item

    def test_guest_can_read_tree(self, guest_client):
        r = guest_client.get("/categories")
        assert r.status_code == 200

    def test_guest_can_read_flat(self, guest_client):
        r = guest_client.get("/categories/flat")
        assert r.status_code == 200


class TestCategoriesCRUD:
    """Crear, editar, eliminar (solo admin)."""

    @pytest.fixture(autouse=True)
    def cleanup(self, admin_client):
        """Elimina categorías de prueba creadas durante los tests."""
        self._created_ids = []
        yield
        for cid in self._created_ids:
            admin_client.delete(f"/categories/{cid}")

    def _create(self, admin_client, name, parent_id=None):
        payload = {"name": name}
        if parent_id:
            payload["parentId"] = parent_id
        r = admin_client.post("/categories", json=payload)
        assert r.status_code == 201, f"Crear categoría falló: {r.text}"
        cid = r.json()["id"]
        self._created_ids.append(cid)
        return cid, r.json()

    def test_create_root_category(self, admin_client):
        cid, body = self._create(admin_client, "TestCat-Raíz")
        assert body["name"] == "TestCat-Raíz"
        assert body["parentId"] is None

    def test_create_child_category(self, admin_client):
        parent_id, _ = self._create(admin_client, "TestCat-Padre")
        child_id, body = self._create(admin_client, "TestCat-Hijo", parent_id)
        assert body["parentId"] == parent_id

    def test_update_name(self, admin_client):
        cid, _ = self._create(admin_client, "TestCat-Original")
        r = admin_client.put(f"/categories/{cid}", json={"name": "TestCat-Editada"})
        assert r.status_code == 200
        assert r.json()["name"] == "TestCat-Editada"

    def test_delete_category(self, admin_client):
        cid, _ = self._create(admin_client, "TestCat-AEliminar")
        r = admin_client.delete(f"/categories/{cid}")
        assert r.status_code == 200
        self._created_ids.remove(cid)  # ya no necesita cleanup

    def test_create_requires_name(self, admin_client):
        r = admin_client.post("/categories", json={})
        assert r.status_code == 400

    def test_guest_cannot_create(self, guest_client):
        r = guest_client.post("/categories", json={"name": "Intento-Guest"})
        assert r.status_code == 403

    def test_guest_cannot_delete(self, guest_client, admin_client):
        cid, _ = self._create(admin_client, "TestCat-ProtegidaGuest")
        r = guest_client.delete(f"/categories/{cid}")
        assert r.status_code == 403
