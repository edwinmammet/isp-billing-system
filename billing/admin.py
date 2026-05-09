from django.contrib import admin
from .models import Package

@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ['name', 'duration_hours', 'price_kes', 'is_active']
    
    def price_kes(self, obj):
        return f"KES {obj.price}"
    price_kes.short_description = 'Price'