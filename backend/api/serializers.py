from rest_framework import serializers
from .models import Replica, Attachment, Ammunition

class ReplicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Replica
        fields = ['name', 'company', 'category', 'size', 'weight', 'drive', 'hopUp', 'energy', 'description']

class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['name', 'company', 'category', 'size', 'weight', 'description', 'compatibility']

class AmmunitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ammunition
        fields = ['name', 'company', 'weight', 'amount', 'biodegradable', 'glowing',]
