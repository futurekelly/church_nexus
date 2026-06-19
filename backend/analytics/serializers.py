from rest_framework import serializers
from analytics.models import PerformanceKPISnapshot

class PerformanceKPISnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerformanceKPISnapshot
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')
