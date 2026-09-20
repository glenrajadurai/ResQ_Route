from rest_framework import serializers
from .models import SOSRequest

class SOSRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = SOSRequest
        fields = '__all__'
