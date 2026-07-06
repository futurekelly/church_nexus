import os
import base64
from django.core.files.base import ContentFile
from django.conf import settings
from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import Sermon, SermonSeries


class SermonSeriesSerializer(serializers.ModelSerializer):
    sermons_count = serializers.SerializerMethodField()

    class Meta:
        model = SermonSeries
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'slug')
        extra_kwargs = {
            'branch': {'required': False}
        }

    def get_sermons_count(self, obj):
        if hasattr(obj, 'sermons_count'):
            return obj.sermons_count
        return obj.sermons.count()

    def validate(self, attrs):
        request = self.context.get('request')
        user = request.user if (request and request.user) else None
        if not attrs.get('branch') and user:
            if user.role != 'super_admin':
                attrs['branch'] = user.branch
            else:
                msg = "A branch assignment is required for Super Admins."
                raise serializers.ValidationError({"branch": msg})
        return attrs


class SermonSeriesSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = SermonSeries
        fields = ('id', 'title', 'slug', 'cover_image')


class SermonSerializer(serializers.ModelSerializer):
    series_details = SermonSeriesSummarySerializer(
        source='series', read_only=True
    )
    hls_url = serializers.SerializerMethodField()
    thumbnail = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = Sermon
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by')
        extra_kwargs = {
            'branch': {'required': False}
        }

    def get_hls_url(self, obj):
        if not obj or not obj.video_file:
            return ""
        from .storage_manager import StorageManager
        branch_str = str(obj.branch.id) if obj.branch else "global"
        hls_key = f"sermons/{branch_str}/hls/{obj.id}/master.m3u8"
        url = StorageManager.get_file_url(hls_key)
        request = self.context.get('request')
        if url.startswith('/') and request:
            return request.build_absolute_uri(url)
        return url

    def to_internal_value(self, data):
        # Handle thumbnail base64 or SVG data URI strings
        if ('thumbnail' in data and isinstance(data['thumbnail'], str) and
                data['thumbnail']):
            data = data.copy() if hasattr(data, 'copy') else data
            thumbnail_str = data['thumbnail']
            if thumbnail_str.startswith('data:image'):
                if ';base64,' in thumbnail_str:
                    try:
                        header, image_data = thumbnail_str.split(';base64,')
                        file_ext = header.split('/')[-1]
                        if '+' in file_ext:
                            file_ext = file_ext.split('+')[0]
                        decoded_file = base64.b64decode(image_data)
                        data['thumbnail'] = ContentFile(
                            decoded_file, name=f"thumbnail.{file_ext}"
                        )
                    except Exception:
                        data['thumbnail'] = None
                elif 'utf8,' in thumbnail_str or ';utf8,' in thumbnail_str:
                    try:
                        div = 'utf8,' if 'utf8,' in thumbnail_str else ';utf8,'
                        _, svg_content = thumbnail_str.split(div)
                        import urllib.parse
                        decoded_file = urllib.parse.unquote(svg_content).encode('utf-8')
                        data['thumbnail'] = ContentFile(
                            decoded_file, name="thumbnail.svg"
                        )
                    except Exception:
                        data['thumbnail'] = None
                else:
                    data['thumbnail'] = None
            elif (thumbnail_str.startswith('http://') or
                  thumbnail_str.startswith('https://')):
                if (self.instance and self.instance.thumbnail and
                        thumbnail_str.endswith(self.instance.thumbnail.name)):
                    data.pop('thumbnail', None)
                else:
                    from django.core.files.storage import default_storage
                    key = thumbnail_str
                    if settings.MEDIA_URL in key:
                        key = key.split(settings.MEDIA_URL)[-1]
                    if '/media/' in key:
                        key = key.split('/media/')[-1]
                    if default_storage.exists(key):
                        try:
                            f = default_storage.open(key)
                            data['thumbnail'] = ContentFile(f.read(), name=os.path.basename(key))
                        except Exception:
                            data['thumbnail'] = None
                    else:
                        data['thumbnail'] = None
            else:
                from django.core.files.storage import default_storage
                if default_storage.exists(thumbnail_str):
                    try:
                        f = default_storage.open(thumbnail_str)
                        data['thumbnail'] = ContentFile(f.read(), name=os.path.basename(thumbnail_str))
                    except Exception:
                        pass

        return super().to_internal_value(data)

    def validate(self, attrs):
        request = self.context.get('request')
        user = request.user if (request and request.user) else None

        # Populate branch automatically if not provided
        if not attrs.get('branch') and user:
            if user.role != 'super_admin':
                attrs['branch'] = user.branch
            else:
                msg = "A branch assignment is required for Super Admins."
                raise serializers.ValidationError({"branch": msg})

        # Multi-tenant isolation: prevent mutation of branch ownership
        if (self.instance and 'branch' in attrs and
                attrs['branch'] != self.instance.branch):
            if not user or user.role != 'super_admin':
                raise serializers.ValidationError({
                    "branch": "Branch ownership is immutable once set."
                })
            else:
                self.instance._bypass_branch_immutable = True

        # Run model clean validation
        if self.instance:
            temp_instance = Sermon.objects.get(pk=self.instance.pk)
            if getattr(self.instance, '_bypass_branch_immutable', False):
                temp_instance._bypass_branch_immutable = True
            for attr, value in attrs.items():
                setattr(temp_instance, attr, value)
        else:
            temp_instance = Sermon(**attrs)

        try:
            temp_instance.clean()
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message_dict)

        return attrs

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        from django.conf import settings

        # Absolute URLs for thumbnail
        if ret.get('thumbnail') and not ret['thumbnail'].startswith('http') and request:
            ret['thumbnail'] = request.build_absolute_uri(ret['thumbnail'])

        # Absolute URLs for video_url if it's a storage path
        video_url = ret.get('video_url')
        if video_url and not video_url.startswith('http'):
            from .storage_manager import StorageManager
            url = StorageManager.get_file_url(video_url)
            if url.startswith('/') and request:
                ret['video_url'] = request.build_absolute_uri(url)
            else:
                ret['video_url'] = url

        # Absolute URLs for audio_url if it's a storage path
        audio_url = ret.get('audio_url')
        if audio_url and not audio_url.startswith('http'):
            from .storage_manager import StorageManager
            url = StorageManager.get_file_url(audio_url)
            if url.startswith('/') and request:
                ret['audio_url'] = request.build_absolute_uri(url)
            else:
                ret['audio_url'] = url

        # Absolute URLs for video_file and audio_file
        for field in ['video_file', 'audio_file']:
            val = ret.get(field)
            if val and not val.startswith('http') and request:
                ret[field] = request.build_absolute_uri(val)

        return ret


class SermonListSerializer(serializers.ModelSerializer):
    series_details = SermonSeriesSummarySerializer(
        source='series', read_only=True
    )
    hls_url = serializers.SerializerMethodField()

    class Meta:
        model = Sermon
        exclude = ('notes', 'description')
        read_only_fields = ('created_at', 'updated_at', 'created_by')

    def get_hls_url(self, obj):
        if not obj or not obj.video_file:
            return ""
        from .storage_manager import StorageManager
        branch_str = str(obj.branch.id) if obj.branch else "global"
        hls_key = f"sermons/{branch_str}/hls/{obj.id}/master.m3u8"
        url = StorageManager.get_file_url(hls_key)
        request = self.context.get('request')
        if url.startswith('/') and request:
            return request.build_absolute_uri(url)
        return url

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        from django.conf import settings

        # Absolute URLs for thumbnail
        if ret.get('thumbnail') and not ret['thumbnail'].startswith('http' ) and request:
            ret['thumbnail'] = request.build_absolute_uri(ret['thumbnail'])

        # Absolute URLs for video_url if it's a storage path
        video_url = ret.get('video_url')
        if video_url and not video_url.startswith('http'):
            from .storage_manager import StorageManager
            url = StorageManager.get_file_url(video_url)
            if url.startswith('/') and request:
                ret['video_url'] = request.build_absolute_uri(url)
            else:
                ret['video_url'] = url

        # Absolute URLs for audio_url if it's a storage path
        audio_url = ret.get('audio_url')
        if audio_url and not audio_url.startswith('http'):
            from .storage_manager import StorageManager
            url = StorageManager.get_file_url(audio_url)
            if url.startswith('/') and request:
                ret['audio_url'] = request.build_absolute_uri(url)
            else:
                ret['audio_url'] = url

        # Absolute URLs for video_file and audio_file
        for field in ['video_file', 'audio_file']:
            val = ret.get(field)
            if val and not val.startswith('http') and request:
                ret[field] = request.build_absolute_uri(val)

        return ret
