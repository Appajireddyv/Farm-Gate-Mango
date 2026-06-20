from rest_framework import serializers
from .models import Product, ProductReview
from accounts.serializers import UserSerializer

class ProductReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    class Meta:
        model = ProductReview
        fields = ['id', 'customer', 'customer_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['customer']

    def get_customer_name(self, obj):
        return obj.customer.get_full_name() or obj.customer.username

class ProductSerializer(serializers.ModelSerializer):
    farmer_name = serializers.SerializerMethodField()
    farmer_village = serializers.SerializerMethodField()
    reviews = ProductReviewSerializer(many=True, read_only=True)
    avg_rating = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'farmer', 'farmer_name', 'farmer_village', 'name', 'category', 'description',
                  'price_per_unit', 'unit', 'stock', 'image', 'is_organic', 'is_available',
                  'min_order_qty', 'harvest_date', 'reviews', 'avg_rating', 'created_at']
        read_only_fields = ['farmer']

    def get_farmer_name(self, obj):
        return obj.farmer.get_full_name() or obj.farmer.username

    def get_farmer_village(self, obj):
        return f"{obj.farmer.village}, {obj.farmer.district}" if obj.farmer.village else ""

    def get_avg_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews.exists():
            return round(sum(r.rating for r in reviews) / reviews.count(), 1)
        return None
