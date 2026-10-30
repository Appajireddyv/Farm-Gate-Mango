from django.test import TestCase
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

from accounts.models import User
from products.models import Product, ProductReview
from products.serializers import ProductSerializer
from products.views import ProductListCreateView


class ProductSerializationQueryTests(TestCase):
	def test_catalog_serialization_uses_constant_queries(self):
		farmer = User.objects.create_user(username='farmer', role='farmer')
		customer = User.objects.create_user(username='customer')
		for index in range(3):
			product = Product.objects.create(
				farmer=farmer,
				name=f'Mango {index}',
				description='Fresh mangoes',
				price_per_unit='50.00',
			)
			ProductReview.objects.create(
				product=product,
				customer=customer,
				rating=5,
				comment='Fresh',
			)

		view = ProductListCreateView()
		view.request = Request(APIRequestFactory().get('/api/products/'))
		queryset = view.get_queryset()

		with self.assertNumQueries(3):
			serialized = ProductSerializer(queryset, many=True).data

		self.assertEqual(len(serialized), 3)
		self.assertEqual([item['avg_rating'] for item in serialized], [5.0, 5.0, 5.0])
