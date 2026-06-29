from rest_framework import serializers
from django.utils import timezone  # noqa: F401
from events.models import Event, EventRegistration, EventCheckIn, EventResource, ResourceBooking
from branches.models import Branch
from members.models import Member
from authentication.models import User
from branches.serializers import BranchSerializer
from drf_spectacular.utils import extend_schema_field

class EventSerializer(serializers.ModelSerializer):
    branch_id = serializers.PrimaryKeyRelatedField(
        queryset=Branch.objects.all(),
        source='branch',
        required=False
    )
    branch_details = BranchSerializer(source='branch', read_only=True)
    registered_count = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ('branch', 'attendance_snapshot', 'snapshot_generated_at', 'snapshot_version', 'created_at', 'updated_at', 'created_by', 'updated_by')

    @extend_schema_field(serializers.IntegerField())
    def get_registered_count(self, obj) -> int:
        return obj.registrations.filter(
            status__in=['REGISTERED', 'PROMOTED', 'ATTENDED'],
            is_archived=False
        ).count()

    def validate(self, attrs):
        # Validate dates
        start_date = attrs.get('start_date', self.instance.start_date if self.instance else None)
        end_date = attrs.get('end_date', self.instance.end_date if self.instance else None)
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError("Start date cannot be after end date.")

        # Lifecycle transitions validation
        status_val = attrs.get('status')
        if self.instance and status_val and self.instance.status != status_val:
            allowed = self.instance.ALLOWED_TRANSITIONS.get(self.instance.status, set())
            if status_val not in allowed:
                raise serializers.ValidationError(f"Transition from {self.instance.status} to {status_val} is not allowed.")
        
        return attrs


class EventRegistrationSerializer(serializers.ModelSerializer):
    event_id = serializers.PrimaryKeyRelatedField(
        queryset=Event.objects.all(),
        source='event'
    )
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='user',
        allow_null=True,
        required=False
    )
    member_id = serializers.PrimaryKeyRelatedField(
        queryset=Member.objects.all(),
        source='member',
        allow_null=True,
        required=False
    )
    attendee_name = serializers.SerializerMethodField()
    attendee_email = serializers.SerializerMethodField()
    attendee_phone = serializers.SerializerMethodField()

    class Meta:
        model = EventRegistration
        fields = '__all__'
        read_only_fields = ('event', 'user', 'member', 'registration_token', 'is_archived', 'archived_at', 'archived_by', 'created_at', 'updated_at', 'created_by', 'updated_by')

    def get_attendee_name(self, obj) -> str:
        if obj.member:
            return f"{obj.member.first_name} {obj.member.last_name}".strip()
        if obj.user:
            name = f"{obj.user.first_name} {obj.user.last_name}".strip()
            return name if name else obj.user.email
        return obj.visitor_name or "Guest Attendee"

    def get_attendee_email(self, obj) -> str:
        if obj.member and obj.member.email:
            return obj.member.email
        if obj.user and obj.user.email:
            return obj.user.email
        return obj.visitor_email or ""

    def get_attendee_phone(self, obj) -> str:
        if obj.member and hasattr(obj.member, 'phone_number') and obj.member.phone_number:
            return obj.member.phone_number
        return obj.visitor_phone or ""

    def validate(self, attrs):
        event = attrs.get('event')
        status_val = attrs.get('status', 'REGISTERED')

        # Capacity guards and FIFO waitlist placement
        if not self.instance:
            if status_val in ['REGISTERED', 'PROMOTED', 'ATTENDED']:
                active_count = event.registrations.filter(
                    status__in=['REGISTERED', 'PROMOTED', 'ATTENDED'],
                    is_archived=False
                ).count()
                
                if event.capacity > 0 and active_count >= event.capacity:
                    if event.waitlist_enabled:
                        attrs['status'] = 'WAITLISTED'
                    else:
                        raise serializers.ValidationError("Event has reached maximum capacity and waitlisting is disabled.")
        
        return attrs


class EventCheckInSerializer(serializers.ModelSerializer):
    registration_id = serializers.PrimaryKeyRelatedField(
        queryset=EventRegistration.objects.all(),
        source='registration'
    )
    checked_in_by_email = serializers.ReadOnlyField(source='checked_in_by.email')

    class Meta:
        model = EventCheckIn
        fields = '__all__'
        read_only_fields = ('registration', 'checked_in_by', 'is_archived', 'archived_at', 'archived_by', 'created_at', 'updated_at', 'created_by', 'updated_by')


class EventResourceSerializer(serializers.ModelSerializer):
    branch_id = serializers.PrimaryKeyRelatedField(
        queryset=Branch.objects.all(),
        source='branch'
    )

    class Meta:
        model = EventResource
        fields = '__all__'
        read_only_fields = ('branch',)


class ResourceBookingSerializer(serializers.ModelSerializer):
    event_id = serializers.PrimaryKeyRelatedField(
        queryset=Event.objects.all(),
        source='event'
    )
    resource_id = serializers.PrimaryKeyRelatedField(
        queryset=EventResource.objects.all(),
        source='resource'
    )

    class Meta:
        model = ResourceBooking
        fields = '__all__'
        read_only_fields = ('event', 'resource', 'approved_by', 'approved_at', 'created_at')

    def validate(self, attrs):
        start_time = attrs.get('start_time', self.instance.start_time if self.instance else None)
        end_time = attrs.get('end_time', self.instance.end_time if self.instance else None)
        if start_time and end_time and start_time > end_time:
            raise serializers.ValidationError("Start time cannot be after end time.")

        # Check overlappingbookings
        resource = attrs.get('resource', self.instance.resource if self.instance else None)
        status_val = attrs.get('status', self.instance.status if self.instance else 'Pending')

        if resource and status_val in ['Pending', 'Approved']:
            overlapping = ResourceBooking.objects.filter(
                resource=resource,
                status__in=['Pending', 'Approved']
            )
            if self.instance:
                overlapping = overlapping.exclude(id=self.instance.id)

            overlap_exists = overlapping.filter(
                start_time__lt=end_time,
                end_time__gt=start_time
            ).exists()

            if overlap_exists:
                raise serializers.ValidationError("Resource is already booked during this time window.")

        return attrs
