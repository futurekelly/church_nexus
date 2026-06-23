from rest_framework import serializers
from testimonies.models import Testimony

class TestimonySerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimony
        fields = '__all__'
        read_only_fields = ('id', 'views', 'created_at', 'updated_at')

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        request = self.context.get('request')
        user = request.user if request else None

        # Mask author details if anonymous AND requesting user is not a moderator or the author itself
        is_privileged = False
        if user and user.is_authenticated:
            if user.role in ['super_admin', 'church_admin', 'pastor'] or user == instance.author_user:
                is_privileged = True

        if instance.is_anonymous and not is_privileged:
            rep['author_name'] = 'Anonymous Member'
            rep['author_email'] = None
            rep['author_user'] = None

        return rep

    def validate(self, attrs):
        request = self.context.get('request')
        user = request.user if request else None

        is_moderator = user and user.is_authenticated and user.role in ['super_admin', 'church_admin', 'pastor']

        is_featured = attrs.get('is_featured')
        status = attrs.get('status')

        # Compute combined target state
        if self.instance:
            target_featured = is_featured if is_featured is not None else self.instance.is_featured
            target_status = status if status is not None else self.instance.status
        else:
            target_featured = is_featured or False
            target_status = status or 'Pending'

        if target_featured and target_status != 'Approved':
            raise serializers.ValidationError({
                'is_featured': 'Only Approved testimonies can be marked as featured.'
            })

        # Non-moderator restrictions
        if not is_moderator:
            if is_featured is not None and (not self.instance or self.instance.is_featured != is_featured):
                raise serializers.ValidationError({'is_featured': 'Only moderators can modify featured status.'})
            if status is not None and status != 'Pending' and (not self.instance or self.instance.status != status):
                raise serializers.ValidationError({'status': 'Only moderators can approve or reject testimonies.'})
            if attrs.get('rejection_reason') is not None and (not self.instance or self.instance.rejection_reason != attrs.get('rejection_reason')):
                raise serializers.ValidationError({'rejection_reason': 'Only moderators can set a rejection reason.'})

        return attrs
