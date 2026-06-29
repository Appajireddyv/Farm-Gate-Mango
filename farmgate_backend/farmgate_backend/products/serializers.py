from decimal import Decimal

from django.conf import settings
from rest_framework import serializers
from .models import Product, ProductReview
from farmgate_backend.serializers_base import StrictModelSerializer, StrictSerializer, strip_string_fields

CATEGORY_CHOICES = [choice[0] for choice in Product.CATEGORY_CHOICES]
UNIT_CHOICES = [choice[0] for choice in Product.UNIT_CHOICES]


class ProductReviewSerializer(StrictModelSerializer):
    customer_name = serializers.SerializerMethodField()

    class Meta:
        model = ProductReview
        fields = ['id', 'customer', 'customer_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['customer']

    def get_customer_name(self, obj):
        return obj.customer.get_full_name() or obj.customer.username

    def validate(self, attrs):
        attrs = strip_string_fields(attrs)
        return attrs


class ProductReviewCreateSerializer(StrictSerializer):
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(min_length=1, max_length=2000)

    def validate(self, attrs):
        return strip_string_fields(attrs)


class ProductSerializer(StrictModelSerializer):
    farmer_name = serializers.SerializerMethodField()
    farmer_village = serializers.SerializerMethodField()
    reviews = ProductReviewSerializer(many=True, read_only=True)
    avg_rating = serializers.SerializerMethodField()
    category = serializers.ChoiceField(choices=CATEGORY_CHOICES)
    unit = serializers.ChoiceField(choices=UNIT_CHOICES)
    name = serializers.CharField(max_length=200)
    description = serializers.CharField(max_length=5000)
    price_per_unit = serializers.DecimalField(
        max_digits=8, decimal_places=2, min_value=Decimal('0.01'),
    )
    stock = serializers.IntegerField(min_value=0, max_value=1_000_000)
    min_order_qty = serializers.IntegerField(min_value=1, max_value=10_000)

    class Meta:
        model = Product
        fields = [
            'id', 'farmer', 'farmer_name', 'farmer_village', 'name', 'category', 'description',
            'price_per_unit', 'unit', 'stock', 'image', 'is_organic', 'is_available',
            'min_order_qty', 'harvest_date', 'reviews', 'avg_rating', 'created_at',
        ]
        read_only_fields = ['farmer']

    def validate(self, attrs):
        return strip_string_fields(attrs)

    def get_farmer_name(self, obj):
        return obj.farmer.get_full_name() or obj.farmer.username

    def get_farmer_village(self, obj):
        return f"{obj.farmer.village}, {obj.farmer.district}" if obj.farmer.village else ""

    def get_avg_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews.exists():
            return round(sum(r.rating for r in reviews) / reviews.count(), 1)
        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        image = data.get('image')
        if image:
            request = self.context.get('request')
            if request is not None:
                data['image'] = request.build_absolute_uri(image)
            elif settings.MEDIA_BASE_URL:
                path = image if image.startswith('/') else f'/{settings.MEDIA_URL.strip("/")}/{image}'
                data['image'] = f'{settings.MEDIA_BASE_URL}{path}'
        return data
