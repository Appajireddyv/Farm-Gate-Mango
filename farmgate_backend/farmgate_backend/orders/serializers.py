from rest_framework import serializers
from .models import Order, OrderItem
from products.models import Product
from farmgate_backend.serializers_base import StrictSerializer, strip_string_fields

PAYMENT_METHODS = ('cod', 'upi', 'card')
ORDER_STATUSES = [choice[0] for choice in Order.STATUS_CHOICES]
PAYMENT_STATUSES = [choice[0] for choice in Order.PAYMENT_STATUS]


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price_per_unit', 'unit', 'subtotal']


class PlaceOrderItemSerializer(StrictSerializer):
    product_id = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=1, max_value=1000)


class OrderCreateSerializer(StrictSerializer):
    items = serializers.ListField(
        child=PlaceOrderItemSerializer(),
        min_length=1,
        max_length=50,
    )
    delivery_address = serializers.CharField(min_length=5, max_length=1000)
    delivery_pincode = serializers.CharField(min_length=6, max_length=10)
    payment_method = serializers.ChoiceField(choices=PAYMENT_METHODS)
    notes = serializers.CharField(max_length=500, required=False, allow_blank=True, default='')

    def validate(self, attrs):
        attrs = strip_string_fields(attrs)
        pincode = attrs.get('delivery_pincode', '')
        if not pincode.isdigit():
            raise serializers.ValidationError(
                {'delivery_pincode': ['Pincode must contain only digits.']}
            )
        product_ids = [item['product_id'] for item in attrs['items']]
        if len(product_ids) != len(set(product_ids)):
            raise serializers.ValidationError(
                {'items': ['Duplicate products in the same order are not allowed.']}
            )
        return attrs


class OrderStatusUpdateSerializer(StrictSerializer):
    status = serializers.ChoiceField(choices=ORDER_STATUSES, required=False)
    payment_status = serializers.ChoiceField(choices=PAYMENT_STATUSES, required=False)

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError(
                {'non_field_errors': ['At least one of status or payment_status is required.']}
            )
        return attrs


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.SerializerMethodField()
    farmer_name = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'customer_name', 'farmer', 'farmer_name', 'status',
            'payment_status', 'payment_method', 'payment_id', 'total_amount',
            'delivery_address', 'delivery_pincode', 'notes', 'items', 'created_at', 'updated_at',
        ]
        read_only_fields = ['customer', 'farmer', 'total_amount']

    def get_customer_name(self, obj):
        return obj.customer.get_full_name() or obj.customer.username

    def get_farmer_name(self, obj):
        return obj.farmer.get_full_name() or obj.farmer.username
