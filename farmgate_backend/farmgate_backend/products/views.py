from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from .models import Product, ProductReview
from .serializers import (
    ProductSerializer,
    ProductReviewSerializer,
    ProductReviewCreateSerializer,
    CATEGORY_CHOICES,
)


class IsFarmerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'farmer'


class IsProductOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.farmer == request.user


class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsFarmerOrReadOnly]

    def get_queryset(self):
        qs = Product.objects.filter(is_available=True)
        category = self.request.query_params.get('category')
        farmer_id = self.request.query_params.get('farmer')
        if category is not None:
            if category not in CATEGORY_CHOICES:
                raise ValidationError({'category': ['Invalid category.']})
            qs = qs.filter(category=category)
        if farmer_id is not None:
            try:
                farmer_pk = int(farmer_id)
            except (TypeError, ValueError):
                raise ValidationError({'farmer': ['Farmer id must be a positive integer.']})
            if farmer_pk < 1:
                raise ValidationError({'farmer': ['Farmer id must be a positive integer.']})
            qs = qs.filter(farmer_id=farmer_pk)
        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsFarmerOrReadOnly, IsProductOwnerOrReadOnly]
    queryset = Product.objects.all()


class FarmerProductsView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Product.objects.filter(farmer=self.request.user).order_by('-created_at')


class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ProductReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        input_serializer = ProductReviewCreateSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        product = Product.objects.get(pk=self.kwargs['pk'])
        if ProductReview.objects.filter(product=product, customer=request.user).exists():
            return Response(
                {'error': 'You have already reviewed this product.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        review = ProductReview.objects.create(
            product=product,
            customer=request.user,
            **input_serializer.validated_data,
        )
        return Response(
            ProductReviewSerializer(review).data,
            status=status.HTTP_201_CREATED,
        )
