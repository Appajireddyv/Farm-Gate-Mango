from rest_framework import serializers
from .models import Order, OrderItem
from products.models import Product

class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.ReadOnlyField()
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price_per_unit', 'unit', 'subtotal']

class OrderCreateSerializer(serializers.Serializer):
    items = serializers.ListField(child=serializers.DictField())
    delivery_address = serializers.CharField()
    delivery_pincode = serializers.CharField()
    payment_method = serializers.CharField()
    notes = serializers.CharField(required=False, allow_blank=True)

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.SerializerMethodField()
    farmer_name = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'customer', 'customer_name', 'farmer', 'farmer_name', 'status',
                  'payment_status', 'payment_method', 'payment_id', 'total_amount',
                  'delivery_address', 'delivery_pincode', 'notes', 'items', 'created_at', 'updated_at']
        read_only_fields = ['customer', 'farmer', 'total_amount']

    def get_customer_name(self, obj):
        return obj.customer.get_full_name() or obj.customer.username

    def get_farmer_name(self, obj):
        return obj.farmer.get_full_name() or obj.farmer.username
