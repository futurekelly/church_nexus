from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from authentication.models import User, Notification, Announcement
from branches.models import Branch
from branches.serializers import BranchSerializer

class UserSerializer(serializers.ModelSerializer):
    branch = BranchSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'branch', 'member_id')

class RegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, required=True)
    last_name = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all(), required=True)
    gender = serializers.ChoiceField(choices=[('male', 'Male'), ('female', 'Female')], required=False, default='male')

    def validate_email(self, value):
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("A user with this email address already exists.")
        return value.lower()

    def create(self, validated_data):
        gender = validated_data.pop('gender', 'male')
        
        from members.models import Member
        from django.utils import timezone
        
        # Check if member with this email already exists to avoid unique constraint violations
        member = Member.objects.filter(email=validated_data['email'].lower()).first()
        if not member:
            member = Member.objects.create(
                branch=validated_data['branch'],
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name'],
                email=validated_data['email'].lower(),
                phone_number="",
                gender=gender,
                status="Visitor",
                join_date=timezone.now().date()
            )
            
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            branch=validated_data['branch'],
            role='visitor',
            member_id=str(member.id)
        )
        return user


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = '__all__'


