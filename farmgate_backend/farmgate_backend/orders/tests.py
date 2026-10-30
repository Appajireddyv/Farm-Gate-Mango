from django.test import TestCase
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

from accounts.models import User
from orders.models import Order, OrderItem
from orders.serializers import OrderSerializer
from orders.views import CustomerOrdersView
from products.models import Product


class OrderSerializationQueryTests(TestCase):
	def test_customer_orders_serialization_uses_constant_queries(self):
		customer = User.objects.create_user(username='customer')
		farmer = User.objects.create_user(username='farmer', role='farmer')
		product = Product.objects.create(
			farmer=farmer,
			name='Mango',
			description='Fresh mangoes',
			price_per_unit='50.00',
		)
		for index in range(3):
			order = Order.objects.create(
				customer=customer,
				farmer=farmer,
				total_amount='50.00',
				delivery_address=f'{index} Orchard Road',
				delivery_pincode='123456',
			)
			OrderItem.objects.create(
				order=order,
				product=product,
				product_name=product.name,
				quantity=1,
				price_per_unit=product.price_per_unit,
				unit=product.unit,
			)

		request = Request(APIRequestFactory().get('/api/orders/customer/'))
		request.user = customer
		view = CustomerOrdersView()
		view.request = request
		queryset = view.get_queryset()

		with self.assertNumQueries(2):
			serialized = OrderSerializer(queryset, many=True).data

		self.assertEqual(len(serialized), 3)
