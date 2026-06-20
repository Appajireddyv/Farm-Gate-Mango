from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderCreateSerializer
from products.models import Product
from accounts.models import User

class PlaceOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        data = serializer.validated_data
        items_data = data['items']

        if not items_data:
            return Response({'error': 'No items in order'}, status=400)

        # Validate all products belong to same farmer
        product_ids = [item['product_id'] for item in items_data]
        products = {p.id: p for p in Product.objects.filter(id__in=product_ids)}

        farmer_ids = set(p.farmer_id for p in products.values())
        if len(farmer_ids) > 1:
            return Response({'error': 'All items must be from the same farmer'}, status=400)

        farmer = User.objects.get(id=list(farmer_ids)[0])
        total = 0

        order = Order.objects.create(
            customer=request.user,
            farmer=farmer,
            total_amount=0,
            delivery_address=data['delivery_address'],
            delivery_pincode=data['delivery_pincode'],
            payment_method=data['payment_method'],
            notes=data.get('notes', ''),
        )

        for item in items_data:
            product = products[item['product_id']]
            qty = item['quantity']
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                quantity=qty,
                price_per_unit=product.price_per_unit,
                unit=product.unit,
            )
            total += qty * product.price_per_unit
            product.stock = max(0, product.stock - qty)
            product.save()

        order.total_amount = total
        if data['payment_method'] == 'cod':
            order.payment_status = 'unpaid'
        order.save()

        return Response(OrderSerializer(order).data, status=201)

class CustomerOrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user).order_by('-created_at')

class FarmerOrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(farmer=self.request.user).order_by('-created_at')

class OrderDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'farmer':
            return Order.objects.filter(farmer=user)
        return Order.objects.filter(customer=user)

    def patch(self, request, *args, **kwargs):
        order = self.get_object()
        new_status = request.data.get('status')
        payment_status = request.data.get('payment_status')
        if new_status:
            order.status = new_status
        if payment_status:
            order.payment_status = payment_status
        order.save()
        return Response(OrderSerializer(order).data)
