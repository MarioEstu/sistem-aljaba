"""
test_products.py — Fase 2: CRUD, paginación/filtros, bulk y CSV import.
"""
import io
import pytest
import httpx

API = "http://localhost:4000/api"

# El servicio CSV requiere exactamente: code,name,description,category,price1,[price2..6],stock quality
# "stock quality" es el nombre de columna esperado por el backend (con espacio)

SAMPLE_CSV = """code,name,description,category,price1,price2,stock quality
TEST-001,Producto Alfa,Desc alfa,Iluminación,10.50,12.00,100
TEST-002,Producto Beta,,Plomería,20.00,,50
TEST-003,,,,,, 
"""

SAMPLE_CSV_VALID = """code,name,description,category,price1,price2,price3,price4,price5,price6,stock quality
BULK-001,Artículo Uno,Desc uno,Ferretería,15.00,,,,,, 10
BULK-002,Artículo Dos,,Plomería,25.00,,,,,, 20
BULK-003,Artículo Tres,Desc tres,,35.00,,,,,, 30
"""


class TestProductsList:
    """GET /api/products — filtros, paginación, ordenamiento."""

    def test_list_returns_paginated(self, admin_client):
        r = admin_client.get("/products")
        assert r.status_code == 200
        body = r.json()
        assert "data" in body
        assert "total" in body
        assert "page" in body
        assert isinstance(body["data"], list)

    def test_default_page_is_1(self, admin_client):
        r = admin_client.get("/products")
        assert r.json()["page"] == 1

    def test_pagination_limit(self, admin_client):
        r = admin_client.get("/products?limit=5")
        assert r.status_code == 200
        assert len(r.json()["data"]) <= 5

    def test_search_by_name(self, admin_client):
        # Primero crear un producto con nombre único para buscar
        r = admin_client.post("/products", json={
            "name": "ProductoUnicoDeTest",
            "code": "SEARCHTEST-001",
        })
        assert r.status_code == 201
        pid = r.json()["id"]

        r2 = admin_client.get("/products?search=UnicoDeTest")
        assert any(p["code"] == "SEARCHTEST-001" for p in r2.json()["data"])

        admin_client.delete(f"/products/{pid}")

    def test_search_by_code(self, admin_client):
        r = admin_client.post("/products", json={
            "name": "Prod para búsqueda código",
            "code": "CODESRCH-99",
        })
        assert r.status_code == 201
        pid = r.json()["id"]

        r2 = admin_client.get("/products?search=CODESRCH-99")
        assert any(p["code"] == "CODESRCH-99" for p in r2.json()["data"])

        admin_client.delete(f"/products/{pid}")

    def test_orderby_name_asc(self, admin_client):
        r = admin_client.get("/products?orderBy=name&order=asc")
        assert r.status_code == 200

    def test_orderby_price1_desc(self, admin_client):
        r = admin_client.get("/products?orderBy=price1&order=desc")
        assert r.status_code == 200

    def test_guest_can_list(self, guest_client):
        r = guest_client.get("/products")
        assert r.status_code == 200


class TestProductsCRUD:
    """Crear, leer, actualizar, eliminar productos individuales."""

    @pytest.fixture
    def sample_product(self, admin_client):
        """Crea un producto de prueba y lo limpia al finalizar."""
        r = admin_client.post("/products", json={
            "name": "Producto de Prueba",
            "code": "TEST-CRUD-001",
            "price1": 10.0,
            "price2": 12.0,
            "price3": 14.0,
            "price4": 16.0,
            "price5": 18.0,
            "price6": 20.0,
            "stock": 50,
        })
        assert r.status_code == 201
        product = r.json()
        yield product
        admin_client.delete(f"/products/{product['id']}")

    def test_create_product(self, admin_client):
        r = admin_client.post("/products", json={
            "name": "Producto Nuevo",
            "code": "TEST-NEW-002",
            "price1": 5.00,
        })
        assert r.status_code == 201
        body = r.json()
        assert body["code"] == "TEST-NEW-002"
        assert float(body["price1"]) == 5.00
        admin_client.delete(f"/products/{body['id']}")

    def test_get_by_id(self, admin_client, sample_product):
        r = admin_client.get(f"/products/{sample_product['id']}")
        assert r.status_code == 200
        assert r.json()["code"] == "TEST-CRUD-001"

    def test_update_product(self, admin_client, sample_product):
        r = admin_client.put(f"/products/{sample_product['id']}", json={
            "name": "Producto Actualizado",
            "stock": 99,
        })
        assert r.status_code == 200
        assert r.json()["name"] == "Producto Actualizado"
        assert r.json()["stock"] == 99

    def test_delete_product(self, admin_client):
        r = admin_client.post("/products", json={
            "name": "Prod a Eliminar",
            "code": "TEST-DEL-003",
        })
        pid = r.json()["id"]
        r2 = admin_client.delete(f"/products/{pid}")
        assert r2.status_code == 200
        # Verificar que ya no existe
        r3 = admin_client.get(f"/products/{pid}")
        assert r3.status_code == 404

    def test_duplicate_code_rejected(self, admin_client, sample_product):
        r = admin_client.post("/products", json={
            "name": "Duplicado",
            "code": "TEST-CRUD-001",  # mismo código
        })
        assert r.status_code == 400

    def test_create_without_name_rejected(self, admin_client):
        r = admin_client.post("/products", json={"code": "NONAME-001"})
        assert r.status_code == 400

    def test_create_without_code_rejected(self, admin_client):
        r = admin_client.post("/products", json={"name": "Sin código"})
        assert r.status_code == 400

    def test_guest_cannot_create(self, guest_client):
        r = guest_client.post("/products", json={"name": "X", "code": "GUEST-001"})
        assert r.status_code == 403

    def test_six_prices_stored(self, admin_client, sample_product):
        r = admin_client.get(f"/products/{sample_product['id']}")
        body = r.json()
        assert float(body["price1"]) == 10.0
        assert float(body["price6"]) == 20.0


class TestBulkActions:
    """POST /api/products/bulk — 4 acciones masivas."""

    @pytest.fixture(scope="class")
    def three_products(self, admin_client):
        """Crea 3 productos para operaciones masivas."""
        ids = []
        for i in range(1, 4):
            r = admin_client.post("/products", json={
                "name": f"BulkProd {i}",
                "code": f"BULK-SCOPE-{i:03d}",
                "price1": float(10 * i),
                "stock": 10 * i,
            })
            assert r.status_code == 201
            ids.append(r.json()["id"])
        yield ids
        for pid in ids:
            admin_client.delete(f"/products/{pid}")

    def test_bulk_update_stock(self, admin_client, three_products):
        r = admin_client.post("/products/bulk", json={
            "action": "updateStock",
            "ids": three_products,
            "stock": 999,
        })
        assert r.status_code == 200
        # Verificar stock actualizado en el primer producto
        r2 = admin_client.get(f"/products/{three_products[0]}")
        assert r2.json()["stock"] == 999

    def test_bulk_apply_discount(self, admin_client, three_products):
        # Primero aseguramos que price1 tenga valor
        for pid in three_products:
            admin_client.put(f"/products/{pid}", json={"price1": 100.0})

        r = admin_client.post("/products/bulk", json={
            "action": "applyDiscount",
            "ids": three_products,
            "percent": 10,
        })
        assert r.status_code == 200
        # price1 debe ser 90 (100 * 0.9)
        r2 = admin_client.get(f"/products/{three_products[0]}")
        assert abs(float(r2.json()["price1"]) - 90.0) < 0.01

    def test_bulk_change_category(self, admin_client, three_products):
        r = admin_client.post("/products/bulk", json={
            "action": "changeCategory",
            "ids": three_products,
            "categoryId": None,
        })
        assert r.status_code == 200

    def test_bulk_delete(self, admin_client):
        # Crear productos específicos para eliminar masivamente
        ids = []
        for i in range(1, 3):
            r = admin_client.post("/products", json={
                "name": f"BulkDel {i}",
                "code": f"BULKDEL-{i:03d}",
            })
            ids.append(r.json()["id"])

        r = admin_client.post("/products/bulk", json={
            "action": "delete",
            "ids": ids,
        })
        assert r.status_code == 200
        # Verificar que ya no existen
        for pid in ids:
            assert admin_client.get(f"/products/{pid}").status_code == 404

    def test_bulk_missing_ids_rejected(self, admin_client):
        r = admin_client.post("/products/bulk", json={
            "action": "updateStock",
            "ids": [],
            "stock": 5,
        })
        assert r.status_code == 400

    def test_bulk_invalid_action_rejected(self, admin_client):
        r = admin_client.post("/products/bulk", json={
            "action": "nonexistent",
            "ids": ["00000000-0000-0000-0000-000000000000"],
        })
        assert r.status_code == 400


class TestCsvImport:
    """POST /api/products/csv/preview  y  /csv/import."""

    def test_preview_without_file_rejected(self, admin_client):
        r = admin_client.post("/products/csv/preview")
        assert r.status_code == 400

    def test_preview_valid_csv(self, admin_client):
        csv_bytes = io.BytesIO(SAMPLE_CSV_VALID.encode())
        r = admin_client.post(
            "/products/csv/preview",
            files={"file": ("productos.csv", csv_bytes, "text/csv")},
        )
        assert r.status_code == 200
        body = r.json()
        assert "rows" in body
        # 3 filas con price1 válido (pueden ser ok o warning, nunca error de formato)
        non_error_rows = [row for row in body["rows"] if row["status"] in ("ok", "warning", "duplicate")]
        assert len(non_error_rows) == 3

    def test_preview_mixed_csv(self, admin_client):
        """CSV con filas válidas/warning y filas con error (falta nombre y code)."""
        r = admin_client.post(
            "/products/csv/preview",
            files={"file": ("mix.csv", io.BytesIO(SAMPLE_CSV.encode()), "text/csv")},
        )
        assert r.status_code == 200
        body = r.json()
        statuses = [row["status"] for row in body["rows"]]
        # Al menos una fila importable (ok/warning/duplicate) y una con error
        assert any(s in ("ok", "warning", "duplicate") for s in statuses)
        assert "error" in statuses

    def test_import_approved_rows(self, admin_client):
        """Preview + import de filas aprobadas, luego limpieza."""
        # Usar códigos únicos para no colisionar con otros tests
        unique_csv = "code,name,description,category,price1,price2,price3,price4,price5,price6,stock quality\nIMPORT-TST-A,Prod Import A,,,9.99,,,,,, 5\nIMPORT-TST-B,Prod Import B,,,19.99,,,,,, 10\n"
        r_prev = admin_client.post(
            "/products/csv/preview",
            files={"file": ("import.csv", io.BytesIO(unique_csv.encode()), "text/csv")},
        )
        assert r_prev.status_code == 200
        rows = r_prev.json()["rows"]
        # Las filas pueden ser ok, warning o duplicate (no error)
        importable_rows = [row for row in rows if row["status"] in ("ok", "warning", "duplicate")]
        assert len(importable_rows) == 2

        r_imp = admin_client.post("/products/csv/import", json={
            "rows": importable_rows,
            "overwriteDuplicates": False,
        })
        assert r_imp.status_code == 200
        body = r_imp.json()
        assert body.get("imported", 0) == 2

        # Limpieza
        r_list = admin_client.get("/products?search=IMPORT-TST")
        for p in r_list.json()["data"]:
            admin_client.delete(f"/products/{p['id']}")

    def test_import_overwrite_duplicate(self, admin_client):
        """Importa un producto, luego reimporta con overwrite=True."""
        csv1 = "code,name,description,category,price1,price2,price3,price4,price5,price6,stock quality\nOVR-001,Original,,,10.00,,,,,, 1\n"
        r_prev = admin_client.post(
            "/products/csv/preview",
            files={"file": ("ovr.csv", io.BytesIO(csv1.encode()), "text/csv")},
        )
        rows = [r for r in r_prev.json()["rows"] if r["status"] == "ok"]
        admin_client.post("/products/csv/import", json={"rows": rows, "overwriteDuplicates": False})

        # Reimportar con precio diferente y overwrite
        csv2 = "code,name,description,category,price1,price2,price3,price4,price5,price6,stock quality\nOVR-001,OriginalModif,,,99.00,,,,,, 1\n"
        r_prev2 = admin_client.post(
            "/products/csv/preview",
            files={"file": ("ovr2.csv", io.BytesIO(csv2.encode()), "text/csv")},
        )
        rows2 = r_prev2.json()["rows"]
        r_imp = admin_client.post("/products/csv/import", json={
            "rows": rows2,
            "overwriteDuplicates": True,
        })
        assert r_imp.status_code == 200

        # Limpieza
        r_list = admin_client.get("/products?search=OVR-001")
        for p in r_list.json()["data"]:
            admin_client.delete(f"/products/{p['id']}")

    def test_guest_cannot_preview(self, guest_client):
        csv_bytes = io.BytesIO(SAMPLE_CSV_VALID.encode())
        r = guest_client.post(
            "/products/csv/preview",
            files={"file": ("productos.csv", csv_bytes, "text/csv")},
        )
        assert r.status_code == 403
