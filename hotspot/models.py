from django.db import models
from billing.models import Package

class HotspotUser(models.Model):
    phone_number = models.CharField(max_length=15)
    package = models.ForeignKey(Package, on_delete=models.CASCADE)

    router_username = models.CharField(max_length=100)
    router_password = models.CharField(max_length=100)

    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.phone_number 