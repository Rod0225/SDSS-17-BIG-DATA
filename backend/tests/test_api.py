import os
import sys
import asyncio
import unittest
import httpx

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))
from backend.app.main import app, seed_initial_users
from backend.app.database.session import engine, Base

class TestAstronomicalPlatformAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        seed_initial_users()
        cls.transport = httpx.ASGITransport(app=app)

    def run_async(self, coro):
        return asyncio.run(coro)

    def test_01_health_check(self):
        async def _test():
            async with httpx.AsyncClient(transport=self.transport, base_url="http://test") as client:
                res = await client.get("/health")
                self.assertEqual(res.status_code, 200)
                self.assertEqual(res.json()["status"], "healthy")
        self.run_async(_test())

    def test_02_login_success_and_failure(self):
        async def _test():
            async with httpx.AsyncClient(transport=self.transport, base_url="http://test") as client:
                res = await client.post("/api/v1/auth/login", json={"email": "admin@sdss.astro", "password": "Admin123!"})
                self.assertEqual(res.status_code, 200)
                self.assertIn("access_token", res.json())

                res_bad = await client.post("/api/v1/auth/login", json={"email": "admin@sdss.astro", "password": "WrongPassword"})
                self.assertEqual(res_bad.status_code, 401)
        self.run_async(_test())

    def test_03_overview_endpoint(self):
        async def _test():
            async with httpx.AsyncClient(transport=self.transport, base_url="http://test") as client:
                res = await client.get("/api/v1/overview")
                self.assertEqual(res.status_code, 200)
                data = res.json()
                self.assertIn("total_records", data)
                self.assertGreater(data["galaxy_count"], 0)
                self.assertGreaterEqual(data["best_model"]["accuracy"], 80.0)
        self.run_async(_test())

    def test_04_variables_documentation(self):
        async def _test():
            async with httpx.AsyncClient(transport=self.transport, base_url="http://test") as client:
                login_res = await client.post("/api/v1/auth/login", json={"email": "admin@sdss.astro", "password": "Admin123!"})
                token = login_res.json()["access_token"]
                headers = {"Authorization": f"Bearer {token}"}

                res = await client.get("/api/v1/eda/variables", headers=headers)
                self.assertEqual(res.status_code, 200)
                vars_data = res.json()["variables"]
                self.assertEqual(len(vars_data), 18)
        self.run_async(_test())

    def test_05_single_prediction_quasar(self):
        async def _test():
            async with httpx.AsyncClient(transport=self.transport, base_url="http://test") as client:
                login_res = await client.post("/api/v1/auth/login", json={"email": "analyst@sdss.astro", "password": "Analyst123!"})
                token = login_res.json()["access_token"]
                headers = {"Authorization": f"Bearer {token}"}

                sample_quasar = {
                    "u": 22.1,
                    "g": 21.8,
                    "r": 21.4,
                    "i": 21.0,
                    "z": 20.7,
                    "redshift": 2.15
                }
                res = await client.post("/api/v1/predictions/single", json=sample_quasar, headers=headers)
                self.assertEqual(res.status_code, 200)
                data = res.json()
                self.assertEqual(data["predicted_class"], "QSO")
                self.assertGreater(data["confidence"], 0.80)
        self.run_async(_test())

    def test_06_astronomy_points_and_object_detail(self):
        async def _test():
            async with httpx.AsyncClient(transport=self.transport, base_url="http://test") as client:
                login_res = await client.post("/api/v1/auth/login", json={"email": "viewer@sdss.astro", "password": "Viewer123!"})
                token = login_res.json()["access_token"]
                headers = {"Authorization": f"Bearer {token}"}

                res = await client.get("/api/v1/astronomy/points?mode=celestial&limit=10", headers=headers)
                self.assertEqual(res.status_code, 200)
                pts = res.json()["points"]
                self.assertEqual(len(pts), 10)

                obj_id = pts[0]["id"]
                res_obj = await client.get(f"/api/v1/astronomy/object/{obj_id}", headers=headers)
                self.assertEqual(res_obj.status_code, 200)
                self.assertEqual(res_obj.json()["obj_ID"], obj_id)
        self.run_async(_test())

    def test_07_users_crud_and_last_admin_protection(self):
        async def _test():
            async with httpx.AsyncClient(transport=self.transport, base_url="http://test") as client:
                login_res = await client.post("/api/v1/auth/login", json={"email": "admin@sdss.astro", "password": "Admin123!"})
                token = login_res.json()["access_token"]
                headers = {"Authorization": f"Bearer {token}"}

                # 1. Create temporary user
                payload = {
                    "email": "test_astronomer@sdss.astro",
                    "full_name": "Carl Sagan",
                    "password": "Password123!",
                    "role": "ANALYST"
                }
                create_res = await client.post("/api/v1/users/", json=payload, headers=headers)
                self.assertEqual(create_res.status_code, 200)
                created_id = create_res.json()["id"]

                # 2. Update role
                up_res = await client.put(f"/api/v1/users/{created_id}", json={"role": "VIEWER"}, headers=headers)
                self.assertEqual(up_res.status_code, 200)
                self.assertEqual(up_res.json()["role"], "VIEWER")

                # 3. Delete temporary user
                del_res = await client.delete(f"/api/v1/users/{created_id}", headers=headers)
                self.assertEqual(del_res.status_code, 200)

                # 4. Attempt to delete last admin (should fail with 400)
                me_res = await client.get("/api/v1/auth/me", headers=headers)
                admin_id = me_res.json()["id"]
                del_admin_res = await client.delete(f"/api/v1/users/{admin_id}", headers=headers)
                self.assertEqual(del_admin_res.status_code, 400)
                self.assertIn("No es posible eliminar la única cuenta administradora", del_admin_res.json()["detail"])
        self.run_async(_test())

if __name__ == "__main__":
    unittest.main()
