from django.db import models


# Create your models here.
#package model
class Package(models.Model):
  name = models.CharField(max_length=100)
  duration_hours = models.PositiveBigIntegerField()
  price = models.DecimalField(max_digits=10, decimal_places=2)
  is_active = models.BooleanField(default=True)

  created_at = models.DateTimeField(auto_now_add=True)  

  def __str__(self):
    return f"{self.name} - {self.duration_hours} hours - ${self.price}"
  
  