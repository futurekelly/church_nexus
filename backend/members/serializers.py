from rest_framework import serializers
from django.db import models
from django.utils import timezone
from django.conf import settings
from members.models import Member, Family, FamilyRelationship, MemberLifecycleTimeline
from branches.serializers import BranchSerializer
from drf_spectacular.utils import extend_schema_field

class FamilySerializer(serializers.ModelSerializer):
    class Meta:
        model = Family
        fields = '__all__'

class FamilyRelationshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = FamilyRelationship
        fields = '__all__'

class MemberLifecycleTimelineSerializer(serializers.ModelSerializer):
    changed_by_email = serializers.ReadOnlyField(source='changed_by.email')

    class Meta:
        model = MemberLifecycleTimeline
        fields = '__all__'

class MemberSerializer(serializers.ModelSerializer):
    age_group = serializers.SerializerMethodField()
    membership_duration = serializers.SerializerMethodField()
    relationships = serializers.SerializerMethodField()
    branch_details = BranchSerializer(source='branch', read_only=True)

    class Meta:
        model = Member
        fields = '__all__'
        read_only_fields = ('branch', 'membership_number', 'is_archived', 'archived_at', 'archived_by', 'created_at', 'updated_at', 'created_by', 'updated_by')

    def validate_profile_photo(self, value):
        if value:
            max_size = getattr(settings, 'MAX_UPLOAD_SIZE', 5 * 1024 * 1024)
            if value.size > max_size:
                max_mb = max_size // (1024 * 1024)
                raise serializers.ValidationError(
                    f"Profile photo file size must not exceed {max_mb}MB."
                )
            allowed_types = ['image/jpeg', 'image/png']
            if getattr(value, 'content_type', None) not in allowed_types:
                raise serializers.ValidationError("Only JPEG and PNG formats are allowed.")
        return value

    @extend_schema_field(serializers.CharField())
    def get_age_group(self, obj):
        if not obj.date_of_birth:
            return "Adult"
        birth_year = obj.date_of_birth.year
        current_year = timezone.now().year
        age = current_year - birth_year
        if age < 13:
            return "Child"
        elif age <= 25:
            return "Youth"
        elif age <= 64:
            return "Adult"
        else:
            return "Senior"

    @extend_schema_field(serializers.CharField())
    def get_membership_duration(self, obj):
        if not obj.join_date:
            return "0 months"
        join = obj.join_date
        now = timezone.now().date()
        months = (now.year - join.year) * 12 + now.month - join.month
        if months < 12:
            return f"{months} month{'s' if months != 1 else ''}"
        else:
            years = months // 12
            rem_months = months % 12
            return f"{years} yr{'s' if years != 1 else ''}{f' {rem_months} mo' if rem_months > 0 else ''}"

    @extend_schema_field(serializers.ListField(child=serializers.DictField()))
    def get_relationships(self, obj):
        relations = FamilyRelationship.objects.filter(
            models.Q(from_member=obj) | models.Q(to_member=obj)
        )
        result = []
        for r in relations:
            if r.from_member_id == obj.id:
                result.append({
                    'id': str(r.id),
                    'from_member_id': str(r.from_member_id),
                    'to_member_id': str(r.to_member_id),
                    'relationship_type': r.relationship_type,
                    'created_at': r.created_at.isoformat()
                })
            else:
                recip_type = self._get_reciprocal_type(r.relationship_type)
                result.append({
                    'id': f"{r.id}-recip",
                    'from_member_id': str(r.to_member_id),
                    'to_member_id': str(r.from_member_id),
                    'relationship_type': recip_type,
                    'created_at': r.created_at.isoformat()
                })
        return result

    def _get_reciprocal_type(self, rel_type):
        mapping = {
            'Parent': 'Child',
            'Child': 'Parent',
            'Spouse': 'Spouse',
            'Sibling': 'Sibling',
            'Guardian': 'Child',
        }
        return mapping.get(rel_type, rel_type)
