from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderCreateSerializer, OrderStatusUpdateSerializer
from products.models import Product
from accounts.models import User


class PlaceOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        items_data = data['items']

        product_ids = [item['product_id'] for item in items_data]
        products = {p.id: p for p in Product.objects.filter(id__in=product_ids, is_available=True)}

        missing = [pid for pid in product_ids if pid not in products]
        if missing:
            return Response(
                {'error': f'Products not found or unavailable: {missing}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        farmer_ids = {p.farmer_id for p in products.values()}
        if len(farmer_ids) > 1:
            return Response(
                {'error': 'All items must be from the same farmer'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for item in items_data:
            product = products[item['product_id']]
            qty = item['quantity']
            if qty < product.min_order_qty:
                return Response(
                    {
                        'error': (
                            f'Minimum order for {product.name} is '
                            f'{product.min_order_qty} {product.unit}.'
                        ),
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if product.stock < qty:
                return Response(
                    {'error': f'Insufficient stock for {product.name}.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        farmer = User.objects.get(id=farmer_ids.pop())
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

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


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
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'farmer':
            return Order.objects.filter(farmer=user)
        return Order.objects.filter(customer=user)

    def patch(self, request, *args, **kwargs):
        order = self.get_object()
        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if 'status' in serializer.validated_data:
            order.status = serializer.validated_data['status']
        if 'payment_status' in serializer.validated_data:
            order.payment_status = serializer.validated_data['payment_status']
        order.save()
        return Response(OrderSerializer(order).data)
