from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import Child, Classroom, CheckInLog
from members.models import Member  # noqa: F401

class ClassroomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classroom
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
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

        # Run model clean
        if self.instance:
            temp_instance = Classroom.objects.get(pk=self.instance.pk)
            for attr, value in attrs.items():
                setattr(temp_instance, attr, value)
        else:
            temp_instance = Classroom(**attrs)

        try:
            temp_instance.clean()
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message_dict)

        return attrs


class ChildSerializer(serializers.ModelSerializer):
    age = serializers.IntegerField(read_only=True)
    parent_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Child
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
        extra_kwargs = {
            'branch': {'required': False}
        }

    def get_parent_details(self, obj):
        return [
            {
                'id': str(parent.id),
                'first_name': parent.first_name,
                'last_name': parent.last_name,
                'phone_number': parent.phone_number if hasattr(parent, 'phone_number') else getattr(parent, 'phone', ''),
                'email': parent.email
            }
            for parent in obj.parents.all()
        ]

    def validate(self, attrs):
        request = self.context.get('request')
        user = request.user if (request and request.user) else None
        
        # Populate branch automatically if not provided
        if not attrs.get('branch') and user:
            if user.role != 'super_admin':
                attrs['branch'] = user.branch
            else:
                raise serializers.ValidationError({"branch": "A branch assignment is required for Super Admins."})

        # Run model clean
        if self.instance:
            temp_instance = Child.objects.get(pk=self.instance.pk)
            for attr, value in attrs.items():
                setattr(temp_instance, attr, value)
        else:
            temp_instance = Child(**attrs)

        try:
            temp_instance.clean()
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message_dict)

        return attrs


class CheckInLogSerializer(serializers.ModelSerializer):
    child_details = serializers.SerializerMethodField(read_only=True)
    classroom_details = serializers.SerializerMethodField(read_only=True)
    checked_in_by_details = serializers.SerializerMethodField(read_only=True)
    checked_out_by_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = CheckInLog
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'security_code')
        extra_kwargs = {
            'branch': {'required': False}
        }

    def get_child_details(self, obj):
        if obj.child:
            parents_list = [
                {
                    'id': str(p.id),
                    'first_name': p.first_name,
                    'last_name': p.last_name,
                    'phone_number': p.phone_number if hasattr(p, 'phone_number') else getattr(p, 'phone', '')
                }
                for p in obj.child.parents.all()
            ]
            return {
                'id': str(obj.child.id),
                'first_name': obj.child.first_name,
                'last_name': obj.child.last_name,
                'age': obj.child.age,
                'allergy_alerts': obj.child.allergy_alerts,
                'special_needs': obj.child.special_needs,
                'parents': parents_list
            }
        return None

    def get_classroom_details(self, obj):
        if obj.classroom:
            return {
                'id': str(obj.classroom.id),
                'name': obj.classroom.name
            }
        return None

    def get_checked_in_by_details(self, obj):
        if obj.checked_in_by:
            return {
                'id': str(obj.checked_in_by.id),
                'first_name': obj.checked_in_by.first_name,
                'last_name': obj.checked_in_by.last_name
            }
        return None

    def get_checked_out_by_details(self, obj):
        if obj.checked_out_by:
            return {
                'id': str(obj.checked_out_by.id),
                'first_name': obj.checked_out_by.first_name,
                'last_name': obj.checked_out_by.last_name
            }
        return None

    def validate(self, attrs):
        request = self.context.get('request')
        user = request.user if (request and request.user) else None
        
        # Populate branch automatically if not provided
        if not attrs.get('branch') and user:
            if user.role != 'super_admin':
                attrs['branch'] = user.branch
            else:
                # If child or classroom is provided, inherit branch from them
                child = attrs.get('child') or (self.instance.child if self.instance else None)
                if child:
                    attrs['branch'] = child.branch
                else:
                    raise serializers.ValidationError({"branch": "A branch assignment is required for Super Admins."})

        # Run model clean
        if self.instance:
            temp_instance = CheckInLog.objects.get(pk=self.instance.pk)
            for attr, value in attrs.items():
                setattr(temp_instance, attr, value)
        else:
            temp_instance = CheckInLog(**attrs)

        try:
            temp_instance.clean()
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message_dict)

        return attrs
