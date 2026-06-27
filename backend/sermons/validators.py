import os
from django.core.exceptions import ValidationError

def validate_thumbnail(file):
    # Size limit: 5MB
    max_size = 5 * 1024 * 1024
    if file.size > max_size:
        raise ValidationError("Thumbnail file size cannot exceed 5MB.")
    
    content_type = getattr(file, 'content_type', None)
    ext = os.path.splitext(file.name)[1].lower()
    allowed_exts = ['.jpg', '.jpeg', '.png', '.gif', '.svg']
    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml']
    
    if content_type and content_type not in allowed_types:
        raise ValidationError("Invalid thumbnail file format. Allowed formats: JPEG, PNG, GIF, SVG.")
    if ext not in allowed_exts:
        raise ValidationError("Invalid thumbnail file format. Allowed formats: JPEG, PNG, GIF, SVG.")

def validate_audio(file):
    # Size limit: 50MB
    max_size = 50 * 1024 * 1024
    if file.size > max_size:
        raise ValidationError("Audio file size cannot exceed 50MB.")
    
    content_type = getattr(file, 'content_type', None)
    ext = os.path.splitext(file.name)[1].lower()
    allowed_exts = ['.mp3', '.wav', '.ogg', '.mpeg']
    allowed_types = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-wav']
    
    if content_type and content_type not in allowed_types:
        raise ValidationError("Invalid audio file format. Allowed formats: MP3, WAV, OGG.")
    if ext not in allowed_exts:
        raise ValidationError("Invalid audio file format. Allowed formats: MP3, WAV, OGG.")

def validate_video(file):
    # Size limit: 250MB
    max_size = 250 * 1024 * 1024
    if file.size > max_size:
        raise ValidationError("Video file size cannot exceed 250MB.")
    
    content_type = getattr(file, 'content_type', None)
    ext = os.path.splitext(file.name)[1].lower()
    allowed_exts = ['.mp4', '.webm', '.ogg', '.mov', '.quicktime']
    allowed_types = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
    
    if content_type and content_type not in allowed_types:
        raise ValidationError("Invalid video file format. Allowed formats: MP4, WEBM, OGG, MOV.")
    if ext not in allowed_exts:
        raise ValidationError("Invalid video file format. Allowed formats: MP4, WEBM, OGG, MOV.")
