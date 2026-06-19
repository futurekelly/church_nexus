from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from groups.models import ConnectGroup, GroupMember, GroupAttendance, GroupAttendanceAttendee, GroupPrayerRequest, StudyOutline
from branches.models import Branch
from members.models import Member
from branches.serializers import BranchSerializer
from drf_spectacular.utils import extend_schema_field

class ConnectGroupSerializer(serializers.ModelSerializer):
    branch_id = serializers.PrimaryKeyRelatedField(
        queryset=Branch.objects.all(),
        source='branch',
        required=False
    )
    leader_id = serializers.PrimaryKeyRelatedField(
        queryset=Member.objects.all(),
        source='leader',
        allow_null=True,
        required=False
    )
    assistant_leader_id = serializers.PrimaryKeyRelatedField(
        queryset=Member.objects.all(),
        source='assistant_leader',
        allow_null=True,
        required=False
    )
    branch_details = BranchSerializer(source='branch', read_only=True)

    class Meta:
        model = ConnectGroup
        fields = '__all__'
        read_only_fields = ('branch', 'created_at', 'updated_at', 'created_by', 'updated_by')


class GroupMemberSerializer(serializers.ModelSerializer):
    group_id = serializers.PrimaryKeyRelatedField(
        queryset=ConnectGroup.objects.all(),
        source='group'
    )
    member_id = serializers.PrimaryKeyRelatedField(
        queryset=Member.objects.all(),
        source='member',
        allow_null=True,
        required=False
    )

    class Meta:
        model = GroupMember
        fields = '__all__'
        read_only_fields = ('group', 'member', 'is_archived', 'archived_at', 'archived_by', 'created_at', 'updated_at', 'created_by', 'updated_by')

    def validate(self, attrs):
        member = attrs.get('member')
        status = attrs.get('status', 'Active')
        
        if member and status == 'Active':
            active_memberships = GroupMember.objects.filter(
                member=member,
                status='Active',
                is_archived=False
            )
            if self.instance:
                active_memberships = active_memberships.exclude(id=self.instance.id)
            
            if active_memberships.count() >= 2:
                raise serializers.ValidationError("Member cannot belong to more than 2 active Connect Groups simultaneously.")
        
        return attrs


class GroupAttendanceAttendeeSerializer(serializers.ModelSerializer):
    member_id = serializers.PrimaryKeyRelatedField(
        queryset=GroupMember.objects.all(),
        source='member'
    )

    class Meta:
        model = GroupAttendanceAttendee
        fields = ('member_id', 'attended', 'status', 'notes')


class GroupAttendanceSerializer(serializers.ModelSerializer):
    group_id = serializers.PrimaryKeyRelatedField(
        queryset=ConnectGroup.objects.all(),
        source='group'
    )
    attendees = GroupAttendanceAttendeeSerializer(many=True)

    class Meta:
        model = GroupAttendance
        fields = '__all__'
        read_only_fields = ('group', 'is_archived', 'archived_at', 'archived_by', 'created_at', 'updated_at', 'created_by', 'updated_by')

    def create(self, validated_data):
        attendees_data = validated_data.pop('attendees', [])
        with transaction.atomic():
            attendance = GroupAttendance.objects.create(**validated_data)
            for att_data in attendees_data:
                GroupAttendanceAttendee.objects.create(attendance=attendance, **att_data)
        return attendance

    def update(self, instance, validated_data):
        attendees_data = validated_data.pop('attendees', None)
        with transaction.atomic():
            instance = super().update(instance, validated_data)
            if attendees_data is not None:
                instance.attendees.all().delete()
                for att_data in attendees_data:
                    GroupAttendanceAttendee.objects.create(attendance=instance, **att_data)
        return instance


class GroupPrayerRequestSerializer(serializers.ModelSerializer):
    group_id = serializers.PrimaryKeyRelatedField(
        queryset=ConnectGroup.objects.all(),
        source='group'
    )
    shared_with_branch = serializers.BooleanField(required=False, default=False)

    class Meta:
        model = GroupPrayerRequest
        fields = '__all__'
        read_only_fields = ('group', 'is_archived', 'archived_at', 'archived_by', 'created_at', 'updated_at', 'created_by', 'updated_by')

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['shared_with_branch'] = (instance.visibility_level == 'BRANCH')
        return ret

    def validate(self, attrs):
        shared = attrs.pop('shared_with_branch', None)
        if shared is not None:
            attrs['visibility_level'] = 'BRANCH' if shared else 'PRIVATE'
        return attrs


class StudyOutlineSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyOutline
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'published_at')
