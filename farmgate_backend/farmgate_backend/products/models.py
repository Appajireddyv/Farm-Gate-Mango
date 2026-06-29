from django.db import models
from accounts.models import User

class Product(models.Model):
    UNIT_CHOICES = [('kg', 'Kilogram'), ('box', 'Box'), ('dozen', 'Dozen'), ('piece', 'Piece')]
    CATEGORY_CHOICES = [('alphonso', 'Alphonso'), ('kesar', 'Kesar'), ('dasheri', 'Dasheri'), ('langra', 'Langra'), ('totapuri', 'Totapuri'), ('other', 'Other')]

    farmer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    description = models.TextField()
    price_per_unit = models.DecimalField(max_digits=8, decimal_places=2)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default='kg')
    stock = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    is_organic = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    min_order_qty = models.PositiveIntegerField(default=1)
    harvest_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['is_available', '-created_at']),
            models.Index(fields=['category', 'is_available']),
            models.Index(fields=['farmer', '-created_at']),
        ]

    def __str__(self):
        return f"{self.name} by {self.farmer.username}"

class ProductReview(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['product', 'customer']
