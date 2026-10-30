from locust import HttpUser, between, task


class CatalogUser(HttpUser):
    wait_time = between(1, 3)

    @task
    def browse_catalog(self):
        self.client.get('/api/products/', name='/api/products/')