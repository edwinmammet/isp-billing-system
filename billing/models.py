from django.db import models

# Create your models here.
#package model
class Package(models.Model):
  name = models.CharField(max_length=100)
  duration_hours = models.PositiveBigIntegerField()
  price = models.DecimalField(max_digits=10)
  is_active = models.BooleanField(default=True)

  created_at = models.DateTimeField(auto_now_add=True)  

  def __str__(self):
    return f"{self.name} - {self.duration_hours} hours - ${self.price}"
  
  #payment model
class Payment(models.Model):
  phone_number = models.CharField(max_length=15)
  package = models.ForeignKey(Package, on_delete=models.CASCADE)
  amount = models.DecimalField(max_digits=10, decimal_places=2)
  mpesa_reference = models.CharField(max_length=100, blank=True, null=True)
  status = models.CharField(max_length=20, default="PENDING")
  created_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return f"{self.phone_number} - {self.package.name}"
  
#Hotspot user model
class HotspotUser(models.Model):
  phone_number = models.CharField(max_length=15)
  package = models.ForeignKey(Package, on_delete=models.CASCADE)
  router_username = models.CharField(max_length=100)
  router_password = models.CharField(max_length=100)
  expires_at = models.DateTimeField()
  is_active = models.BooleanField(default=True)

  def __str__(self):
        return f"{self.phone_number} - {self.router_username}"    
    
  