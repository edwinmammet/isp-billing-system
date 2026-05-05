from rest_framework import serializers
from .models import HotspotUser

class HotspotUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotspotUser
        fields = '__all__'
