import os
import uuid
from django.core.files.storage import default_storage
from django.conf import settings


class StorageManager:
    """
    Provider-agnostic storage service abstraction manager.
    Encapsulates centralized storage operations, path generation,
    and URL retrieval while maintaining local filesystem compatibility.
    """

    @staticmethod
    def generate_storage_path(branch_id, filename, subfolder="media"):
        """
        Generate a standardized storage key path scoped by branch tenant ID.
        Example: sermons/b123/media/550e8400_sermon.mp4
        """
        unique_filename = f"{uuid.uuid4().hex[:8]}_{filename}"
        branch_str = str(branch_id) if branch_id else "global"
        return os.path.join("sermons", branch_str, subfolder, unique_filename)

    @staticmethod
    def save_file(storage_path, content):
        """
        Save file content using the configured Django storage engine.
        Returns the saved file path key.
        """
        saved_path = default_storage.save(storage_path, content)
        return saved_path

    @staticmethod
    def delete_file(storage_path):
        """
        Delete file from storage if it exists.
        Returns True if deleted or False if not found.
        """
        if storage_path and default_storage.exists(storage_path):
            default_storage.delete(storage_path)
            return True
        return False

    @staticmethod
    def get_file_url(storage_path):
        """
        Retrieve public or local access URL for a stored asset key.
        """
        if not storage_path:
            return ""
        try:
            return default_storage.url(storage_path)
        except Exception:
            return os.path.join(settings.MEDIA_URL, storage_path)

    @staticmethod
    def exists(storage_path):
        """
        Check if a file key exists in storage.
        """
        if not storage_path:
            return False
        return default_storage.exists(storage_path)
