from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import VisitorProfile, FollowUpTicket, ContactHistoryLog

User = get_user_model()

class AssignedPastorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'email')


class VisitorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitorProfile
        fields = '__all__'
        read_only_fields = ('membership_number', 'created_at', 'updated_at', 'created_by')
        extra_kwargs = {
            'branch': {'required': False}
        }

    def validate(self, attrs):
        request = self.context.get('request')
        user = request.user if (request and request.user) else None
        
        # Populate branch automatically if not provided
        if not attrs.get('branch') and user:
            if user.role != 'super_admin':
                attrs['branch'] = user.branch
            else:
                raise serializers.ValidationError({"branch": "A branch assignment is required for Super Admins."})
                
        email = attrs.get('email')
        branch = attrs.get('branch')
        
        if self.instance:
            email = email or self.instance.email
            branch = branch or self.instance.branch

        if email and branch:
            query = VisitorProfile.objects.filter(email__iexact=email, branch=branch, is_archived=False)
            if self.instance:
                query = query.exclude(id=self.instance.id)
            if query.exists():
                raise serializers.ValidationError({"email": "A visitor with this email already exists in this branch."})
                
        return attrs


class FollowUpTicketSerializer(serializers.ModelSerializer):
    visitor_details = VisitorProfileSerializer(source='visitor', read_only=True)
    assigned_pastor_details = AssignedPastorSerializer(source='assigned_pastor', read_only=True)

    class Meta:
        model = FollowUpTicket
        fields = '__all__'
        read_only_fields = ('is_completed', 'integrated_at', 'created_at', 'updated_at')
        extra_kwargs = {
            'branch': {'required': False}
        }

    def validate(self, attrs):
        request = self.context.get('request')
        user = request.user if (request and request.user) else None
        
        # Populate branch automatically if not provided
        if not attrs.get('branch') and user:
            if user.role != 'super_admin':
                attrs['branch'] = user.branch
            else:
                raise serializers.ValidationError({"branch": "A branch assignment is required for Super Admins."})

        # We need to run model validation (for FSM and branch checks)
        if self.instance:
            temp_instance = FollowUpTicket.objects.get(pk=self.instance.pk)
            for attr, value in attrs.items():
                setattr(temp_instance, attr, value)
        else:
            temp_instance = FollowUpTicket(**attrs)

        try:
            temp_instance.clean()
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message_dict)

        return attrs


class ContactHistoryLogSerializer(serializers.ModelSerializer):
    contacted_by_details = AssignedPastorSerializer(source='contacted_by', read_only=True)

    class Meta:
        model = ContactHistoryLog
        fields = '__all__'
        read_only_fields = ('contact_date', 'contacted_by')
