import pytest
from django.urls import reverse
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APIClient
from .models import Sermon
from authentication.factories import BranchFactory, UserFactory


@pytest.mark.django_db
class TestSermonModels:
    def test_sermon_creation_and_defaults(self):
        branch = BranchFactory()
        sermon = Sermon.objects.create(
            branch=branch,
            title="Growing in Grace",
            description="A deep dive into Grace.",
            speaker="Pastor John",
            category="Grace"
        )
        assert sermon.status == "Draft"
        assert sermon.featured is False
        assert sermon.tags == []
        assert str(sermon).startswith("Growing in Grace")

    def test_draft_sermon_cannot_be_featured(self):
        branch = BranchFactory()
        sermon = Sermon(
            branch=branch,
            title="Growing in Grace",
            description="A deep dive into Grace.",
            speaker="Pastor John",
            category="Grace",
            status="Draft",
            featured=True
        )
        with pytest.raises(ValidationError) as excinfo:
            sermon.clean()
        assert "featured" in excinfo.value.message_dict
        assert "Only Published sermons can be marked as Featured." in excinfo.value.message_dict["featured"]

    def test_exactly_one_featured_sermon_per_branch(self):
        branch_a = BranchFactory()
        branch_b = BranchFactory()

        # Create published sermons for Branch A
        sermon_a1 = Sermon.objects.create(
            branch=branch_a,
            title="Sermon A1",
            description="Description A1",
            speaker="Pastor John",
            category="Grace",
            status="Published",
            featured=True
        )
        sermon_a2 = Sermon.objects.create(
            branch=branch_a,
            title="Sermon A2",
            description="Description A2",
            speaker="Pastor John",
            category="Grace",
            status="Published",
            featured=True
        )

        # sermon_a1 should be unfeatured automatically
        sermon_a1.refresh_from_db()
        sermon_a2.refresh_from_db()
        assert sermon_a1.featured is False
        assert sermon_a2.featured is True

        # Now create featured sermon in Branch B
        sermon_b1 = Sermon.objects.create(
            branch=branch_b,
            title="Sermon B1",
            description="Description B1",
            speaker="Pastor Bob",
            category="Faith",
            status="Published",
            featured=True
        )

        # Branch B featured shouldn't affect Branch A
        sermon_a2.refresh_from_db()
        sermon_b1.refresh_from_db()
        assert sermon_a2.featured is True
        assert sermon_b1.featured is True

    def test_branch_immutability_at_model_level(self):
        """Changing branch on an existing sermon should raise ValidationError."""
        branch_a = BranchFactory()
        branch_b = BranchFactory()
        sermon = Sermon.objects.create(
            branch=branch_a,
            title="Test Sermon",
            description="Desc",
            speaker="Speaker",
            category="Faith",
            status="Draft"
        )
        sermon.branch = branch_b
        with pytest.raises(ValidationError) as excinfo:
            sermon.clean()
        assert "branch" in excinfo.value.message_dict


@pytest.mark.django_db
class TestSermonAPI:
    @pytest.fixture(autouse=True)
    def setup_method(self):
        self.client = APIClient()
        self.branch_a = BranchFactory()
        self.branch_b = BranchFactory()

        # Users
        self.super_admin = UserFactory(role='super_admin', branch=None)
        self.pastor_a = UserFactory(role='pastor', branch=self.branch_a)
        self.pastor_b = UserFactory(role='pastor', branch=self.branch_b)
        self.media_a = UserFactory(role='church_admin', branch=self.branch_a)
        self.member_a = UserFactory(role='member', branch=self.branch_a)

        # Test Sermons in Branch A
        self.sermon_pub_a = Sermon.objects.create(
            branch=self.branch_a,
            title="Published Sermon A",
            description="Description A",
            speaker="Pastor A",
            category="Faith",
            status="Published",
            featured=True
        )
        self.sermon_draft_a = Sermon.objects.create(
            branch=self.branch_a,
            title="Draft Sermon A",
            description="Draft Description",
            speaker="Pastor A",
            category="Grace",
            status="Draft"
        )
        self.sermon_arch_a = Sermon.objects.create(
            branch=self.branch_a,
            title="Archived Sermon A",
            description="Archived Description",
            speaker="Pastor A",
            category="Hope",
            status="Archived"
        )

        # Test Sermons in Branch B
        self.sermon_pub_b = Sermon.objects.create(
            branch=self.branch_b,
            title="Published Sermon B",
            description="Description B",
            speaker="Pastor B",
            category="Love",
            status="Published"
        )

    # --- P0: Anonymous Catalog Isolation ---

    def test_anonymous_without_branch_returns_empty(self):
        """Anonymous requests without branch param must return zero results."""
        url = reverse('sermon-list')
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        results = response.data.get('results', response.data)
        if isinstance(results, list):
            assert len(results) == 0
        else:
            assert results == []

    def test_anonymous_with_branch_returns_correct_sermons(self):
        """Anonymous requests with branch param return only that branch's published sermons."""
        url = reverse('sermon-list')
        response = self.client.get(url, {'branch': self.branch_a.id})
        assert response.status_code == status.HTTP_200_OK
        results = response.data.get('results', response.data)
        titles = [item['title'] for item in results]
        assert "Published Sermon A" in titles
        assert "Published Sermon B" not in titles
        assert "Draft Sermon A" not in titles
        assert "Archived Sermon A" not in titles

    def test_anonymous_cannot_see_cross_branch_data(self):
        """Anonymous requests with branch A should not reveal branch B sermons."""
        url = reverse('sermon-list')
        response = self.client.get(url, {'branch': self.branch_a.id})
        assert response.status_code == status.HTTP_200_OK
        results = response.data.get('results', response.data)
        for item in results:
            assert item['branch'] == str(self.branch_a.id)

    def test_anonymous_detail_published_ok(self):
        """Anonymous user can access detail of a published sermon."""
        detail_url = reverse('sermon-detail', kwargs={'pk': self.sermon_pub_a.id})
        response = self.client.get(detail_url)
        assert response.status_code == status.HTTP_200_OK

    def test_anonymous_detail_draft_blocked(self):
        """Anonymous user cannot access detail of a draft sermon."""
        detail_url = reverse('sermon-detail', kwargs={'pk': self.sermon_draft_a.id})
        response = self.client.get(detail_url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    # --- P0: Cross-Branch Mutation Protection ---

    def test_pastor_cannot_change_branch_on_update(self):
        """A pastor should not be able to reassign a sermon to another branch."""
        self.client.force_authenticate(user=self.pastor_a)
        detail_url = reverse('sermon-detail', kwargs={'pk': self.sermon_draft_a.id})
        response = self.client.patch(detail_url, {"branch": str(self.branch_b.id)})
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_super_admin_can_change_branch(self):
        """Super admins should be able to reassign sermons across branches."""
        self.client.force_authenticate(user=self.super_admin)
        detail_url = reverse('sermon-detail', kwargs={'pk': self.sermon_draft_a.id})
        response = self.client.patch(detail_url, {"branch": str(self.branch_b.id)})
        assert response.status_code == status.HTTP_200_OK
        self.sermon_draft_a.refresh_from_db()
        assert self.sermon_draft_a.branch == self.branch_b

    # --- P0: Upload Security (Validator-level tests) ---

    def test_thumbnail_size_validator_rejects_oversized(self):
        """Thumbnail validator rejects files over 5MB."""
        from sermons.validators import validate_thumbnail
        from django.core.exceptions import ValidationError as DjangoValidationError
        big_file = SimpleUploadedFile(
            "big_thumb.jpg",
            b"x" * (6 * 1024 * 1024),
            content_type="image/jpeg"
        )
        with pytest.raises(DjangoValidationError):
            validate_thumbnail(big_file)

    def test_thumbnail_size_validator_accepts_small(self):
        """Thumbnail validator accepts files under 5MB."""
        from sermons.validators import validate_thumbnail
        small_file = SimpleUploadedFile(
            "small_thumb.jpg",
            b"x" * (1 * 1024 * 1024),
            content_type="image/jpeg"
        )
        # Should not raise
        validate_thumbnail(small_file)

    def test_audio_size_validator_rejects_oversized(self):
        """Audio validator rejects files over 50MB."""
        from sermons.validators import validate_audio
        from django.core.exceptions import ValidationError as DjangoValidationError
        big_file = SimpleUploadedFile(
            "big_audio.mp3",
            b"x" * (51 * 1024 * 1024),
            content_type="audio/mpeg"
        )
        with pytest.raises(DjangoValidationError):
            validate_audio(big_file)

    def test_video_mime_validator_rejects_executable(self):
        """Video validator rejects non-video MIME types."""
        from sermons.validators import validate_video
        from django.core.exceptions import ValidationError as DjangoValidationError
        exe_file = SimpleUploadedFile(
            "malware.exe",
            b"MZ" + b"\x00" * 1024,
            content_type="application/x-msdownload"
        )
        with pytest.raises(DjangoValidationError):
            validate_video(exe_file)

    def test_valid_thumbnail_upload_via_api(self):
        """Uploading a valid small image via API should succeed."""
        import io
        from PIL import Image as PILImage

        self.client.force_authenticate(user=self.pastor_a)

        # Generate a real 1x1 JPEG in memory
        img = PILImage.new('RGB', (1, 1), color='red')
        buf = io.BytesIO()
        img.save(buf, format='JPEG')
        buf.seek(0)

        thumb = SimpleUploadedFile(
            "thumb.jpg",
            buf.read(),
            content_type="image/jpeg"
        )
        url = reverse('sermon-list')
        data = {
            "title": "Test Valid Thumb",
            "description": "Desc",
            "speaker": "Speaker",
            "category": "Faith",
            "status": "Draft",
            "thumbnail": thumb
        }
        response = self.client.post(url, data, format='multipart')
        assert response.status_code == status.HTTP_201_CREATED

    # --- P1: Pagination ---

    def test_list_endpoint_is_paginated(self):
        """List endpoint returns paginated response with count, next, previous, results."""
        self.client.force_authenticate(user=self.pastor_a)
        url = reverse('sermon-list')
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert 'results' in response.data
        assert 'count' in response.data

    def test_pagination_respects_page_size(self):
        """Pagination page_size query param controls results per page."""
        self.client.force_authenticate(user=self.pastor_a)
        url = reverse('sermon-list')
        response = self.client.get(url, {'page_size': 1})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['count'] == 3  # 3 sermons in branch A

    # --- P1: Serializer Optimization ---

    def test_list_serializer_excludes_notes_and_description(self):
        """List responses should not include notes or description fields."""
        self.client.force_authenticate(user=self.pastor_a)
        url = reverse('sermon-list')
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        for item in response.data['results']:
            assert 'notes' not in item
            assert 'description' not in item

    def test_detail_serializer_includes_all_fields(self):
        """Detail responses should include notes and description."""
        self.client.force_authenticate(user=self.pastor_a)
        detail_url = reverse('sermon-detail', kwargs={'pk': self.sermon_pub_a.id})
        response = self.client.get(detail_url)
        assert response.status_code == status.HTTP_200_OK
        assert 'notes' in response.data
        assert 'description' in response.data

    # --- Existing Behavior Preservation ---

    def test_member_can_read_published_only_and_branch_isolated(self):
        self.client.force_authenticate(user=self.member_a)
        url = reverse('sermon-list')

        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        results = response.data.get('results', response.data)
        titles = [item['title'] for item in results]
        assert "Published Sermon A" in titles
        assert "Published Sermon B" not in titles
        assert "Draft Sermon A" not in titles

        # Attempt to access Published Sermon B (different branch) directly
        detail_url_b = reverse('sermon-detail', kwargs={'pk': self.sermon_pub_b.id})
        response_b = self.client.get(detail_url_b)
        assert response_b.status_code == status.HTTP_404_NOT_FOUND

    def test_anonymous_and_member_blocked_from_writes(self):
        url = reverse('sermon-list')
        data = {
            "title": "New Sermon",
            "description": "Desc",
            "speaker": "Speaker",
            "category": "Faith",
            "status": "Published"
        }

        # Anonymous Write blocked
        response_anon = self.client.post(url, data)
        assert response_anon.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN
        ]

        # Member Write blocked
        self.client.force_authenticate(user=self.member_a)
        response_member = self.client.post(url, data)
        assert response_member.status_code == status.HTTP_403_FORBIDDEN

    def test_branch_staff_can_manage_sermons_in_their_branch(self):
        self.client.force_authenticate(user=self.pastor_a)

        # Pastor A can list all status sermons in Branch A
        list_url = reverse('sermon-list')
        response = self.client.get(list_url)
        assert response.status_code == status.HTTP_200_OK
        results = response.data.get('results', response.data)
        titles = [item['title'] for item in results]
        assert "Published Sermon A" in titles
        assert "Draft Sermon A" in titles
        assert "Archived Sermon A" in titles
        assert "Published Sermon B" not in titles  # Isolated to Branch A

        # Create sermon in Branch A (branch auto-assigned from Pastor A's branch)
        data = {
            "title": "Created by Pastor A",
            "description": "Notes",
            "speaker": "Speaker",
            "category": "Faith",
            "status": "Draft"
        }
        response_create = self.client.post(list_url, data)
        assert response_create.status_code == status.HTTP_201_CREATED
        assert response_create.data['branch'] == str(self.branch_a.id)

        # Update Draft Sermon A
        detail_url = reverse('sermon-detail', kwargs={'pk': self.sermon_draft_a.id})
        response_update = self.client.patch(detail_url, {"title": "Updated Draft Title"})
        assert response_update.status_code == status.HTTP_200_OK
        assert response_update.data['title'] == "Updated Draft Title"

        # Delete Draft Sermon
        response_delete = self.client.delete(detail_url)
        assert response_delete.status_code == status.HTTP_204_NO_CONTENT
        assert not Sermon.objects.filter(pk=self.sermon_draft_a.id).exists()

    def test_super_admin_bypasses_branch_restrictions(self):
        self.client.force_authenticate(user=self.super_admin)

        # List all sermons across all branches
        list_url = reverse('sermon-list')
        response = self.client.get(list_url)
        assert response.status_code == status.HTTP_200_OK
        results = response.data.get('results', response.data)
        titles = [item['title'] for item in results]
        assert "Published Sermon A" in titles
        assert "Published Sermon B" in titles
        assert "Draft Sermon A" in titles

        # Creating without branch should fail for Super Admin
        data = {
            "title": "Super Admin Sermon",
            "description": "Desc",
            "speaker": "Speaker",
            "category": "Faith"
        }
        response_create_fail = self.client.post(list_url, data)
        assert response_create_fail.status_code == status.HTTP_400_BAD_REQUEST

        # Creating with branch should succeed for Super Admin
        data["branch"] = str(self.branch_b.id)
        response_create_success = self.client.post(list_url, data)
        assert response_create_success.status_code == status.HTTP_201_CREATED
        assert response_create_success.data['branch'] == str(self.branch_b.id)

    def test_query_filtering_and_sorting(self):
        self.client.force_authenticate(user=self.pastor_a)
        list_url = reverse('sermon-list')

        # Filter by Category
        res_cat = self.client.get(list_url, {'category': 'Grace'})
        results_cat = res_cat.data.get('results', res_cat.data)
        assert len(results_cat) == 1
        assert results_cat[0]['title'] == "Draft Sermon A"

        # Filter by Speaker
        res_spk = self.client.get(list_url, {'speaker': 'Pastor A'})
        results_spk = res_spk.data.get('results', res_spk.data)
        assert len(results_spk) == 3

        # Filter by Featured
        res_feat = self.client.get(list_url, {'featured': 'true'})
        results_feat = res_feat.data.get('results', res_feat.data)
        assert len(results_feat) == 1
        assert results_feat[0]['title'] == "Published Sermon A"

        # Search Query
        res_search = self.client.get(list_url, {'search': 'Archived'})
        results_search = res_search.data.get('results', res_search.data)
        assert len(results_search) == 1
        assert results_search[0]['title'] == "Archived Sermon A"

        # Sorting
        res_sort = self.client.get(list_url, {'ordering': 'title'})
        results_sort = res_sort.data.get('results', res_sort.data)
        titles_sorted = [item['title'] for item in results_sort]
        assert titles_sorted == ["Archived Sermon A", "Draft Sermon A", "Published Sermon A"]

    def test_retrieve_sermon_increments_views_count(self):
        """Retrieving a sermon detail increments views_count."""
        assert self.sermon_pub_a.views_count == 0
        detail_url = reverse('sermon-detail', kwargs={'pk': self.sermon_pub_a.id})
        response = self.client.get(detail_url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['views_count'] == 1


@pytest.mark.django_db
class TestSermonSeriesAPI:
    @pytest.fixture(autouse=True)
    def setup_method(self):
        from .models import SermonSeries
        self.client = APIClient()
        self.branch_a = BranchFactory()
        self.branch_b = BranchFactory()

        self.pastor_a = UserFactory(role='pastor', branch=self.branch_a)
        self.pastor_b = UserFactory(role='pastor', branch=self.branch_b)
        self.member_a = UserFactory(role='member', branch=self.branch_a)

        self.series_a = SermonSeries.objects.create(
            branch=self.branch_a,
            title="Faith and Grace Series",
            description="Exploring grace."
        )

    def test_pastor_can_create_series_in_branch(self):
        """Pastor can create a new sermon series in their branch."""
        self.client.force_authenticate(user=self.pastor_a)
        url = reverse('sermon-series-list')
        data = {
            "title": "New Kingdom Series",
            "description": "Kingdom study."
        }
        response = self.client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['branch'] == str(self.branch_a.id)
        assert response.data['slug'] == "new-kingdom-series"

    def test_pastor_cannot_view_or_modify_other_branch_series(self):
        """Pastor B cannot access or edit series belonging to Branch A."""
        self.client.force_authenticate(user=self.pastor_b)
        detail_url = reverse(
            'sermon-series-detail', kwargs={'pk': self.series_a.id}
        )
        response = self.client.get(detail_url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_filter_sermons_by_series(self):
        """Filter sermons by series ID or slug."""
        self.client.force_authenticate(user=self.pastor_a)
        sermon_in_series = Sermon.objects.create(
            branch=self.branch_a,
            series=self.series_a,
            title="Part 1: Grace Unbound",
            description="Desc",
            speaker="Pastor A",
            category="Grace",
            status="Published"
        )
        url = reverse('sermon-list')
        response = self.client.get(url, {'series': str(self.series_a.id)})
        assert response.status_code == status.HTTP_200_OK
        results = response.data['results']
        assert len(results) == 1
        assert results[0]['id'] == str(sermon_in_series.id)


@pytest.mark.django_db
class TestStorageManager:
    def test_generate_storage_path(self):
        from .storage_manager import StorageManager
        path = StorageManager.generate_storage_path("branch-123", "test.mp4")
        assert "sermons" in path
        assert "branch-123" in path
        assert path.endswith("_test.mp4")

    def test_save_delete_and_exists(self):
        from django.core.files.base import ContentFile
        from .storage_manager import StorageManager

        path = "sermons/test/sample.txt"
        content = ContentFile(b"Hello Storage Manager")

        saved_path = StorageManager.save_file(path, content)
        assert StorageManager.exists(saved_path) is True

        url = StorageManager.get_file_url(saved_path)
        assert url != ""

        deleted = StorageManager.delete_file(saved_path)
        assert deleted is True
        assert StorageManager.exists(saved_path) is False


@pytest.mark.django_db
class TestMediaMetadataService:
    def test_extract_metadata_from_none(self):
        from .media_metadata import MediaMetadataService
        meta = MediaMetadataService.extract_metadata(None)
        assert meta["file_size"] == 0
        assert meta["mime_type"] == "application/octet-stream"

    def test_extract_image_metadata(self):
        import io
        from PIL import Image as PILImage
        from django.core.files.uploadedfile import SimpleUploadedFile
        from .media_metadata import MediaMetadataService

        img = PILImage.new('RGB', (100, 50), color='blue')
        buf = io.BytesIO()
        img.save(buf, format='JPEG')
        buf.seek(0)

        uploaded = SimpleUploadedFile(
            "sample.jpg", buf.read(), content_type="image/jpeg"
        )
        meta = MediaMetadataService.extract_metadata(uploaded)
        assert meta["mime_type"] == "image/jpeg"
        assert meta["width"] == 100
        assert meta["height"] == 50


@pytest.mark.django_db
class TestMediaProcessingPipeline:
    def test_ffmpeg_availability_check(self):
        from .media_processing import MediaProcessingService
        is_avail = MediaProcessingService.is_ffmpeg_available()
        assert isinstance(is_avail, bool)

    def test_missing_ffmpeg_graceful_fallback(self):
        from unittest.mock import patch
        from .media_processing import MediaProcessingService

        with patch.object(
            MediaProcessingService, 'is_ffmpeg_available', return_value=False
        ):
            res_thumb = MediaProcessingService.generate_thumbnail(
                "input.mp4", "out.jpg"
            )
            assert res_thumb["success"] is False
            assert "FFmpeg not available" in res_thumb["error"]

    def test_celery_tasks_nonexistent_sermon(self):
        from .tasks import generate_thumbnail_task, extract_audio_task
        res_thumb = generate_thumbnail_task(999999)
        assert res_thumb["status"] == "failed"
        assert res_thumb["reason"] == "Sermon not found"

        res_audio = extract_audio_task(999999)
        assert res_audio["status"] == "failed"
        assert res_audio["reason"] == "Sermon not found"


@pytest.mark.django_db
class TestMinIOIntegration:
    def test_default_storage_is_filesystem(self):
        from django.conf import settings
        assert settings.USE_CLOUD_STORAGE is False
        assert settings.STORAGES["default"]["BACKEND"] == (
            "django.core.files.storage.FileSystemStorage"
        )

    def test_minio_storage_url_generation(self):
        from unittest.mock import patch
        from django.core.files.storage import FileSystemStorage
        from .storage_manager import StorageManager

        mock_storage = FileSystemStorage()
        target_url = "http://localhost:9000/media/test.mp4"
        with patch.object(mock_storage, 'url', return_value=target_url):
            with patch(
                'django.core.files.storage.default_storage.url',
                side_effect=mock_storage.url
            ):
                url = StorageManager.get_file_url("sermons/test.mp4")
                assert "9000" in url or "test.mp4" in url


@pytest.mark.django_db
class TestUploadFoundationAPI:
    @pytest.fixture(autouse=True)
    def setup_method(self):
        self.client = APIClient()
        self.branch_a = BranchFactory()
        self.branch_b = BranchFactory()
        self.pastor_a = UserFactory(role='pastor', branch=self.branch_a)
        self.member_a = UserFactory(role='member', branch=self.branch_a)

    def test_upload_intent_success(self):
        self.client.force_authenticate(user=self.pastor_a)
        url = reverse('sermon-upload-intent')
        data = {
            "filename": "sermon.mp4",
            "file_size": 5000000,
            "asset_type": "video"
        }
        res = self.client.post(url, data)
        assert res.status_code == status.HTTP_200_OK
        assert "upload_id" in res.data
        assert "storage_key" in res.data
        assert str(self.branch_a.id) in res.data["storage_key"]

    def test_upload_intent_rejected_for_member(self):
        self.client.force_authenticate(user=self.member_a)
        url = reverse('sermon-upload-intent')
        data = {"filename": "sermon.mp4", "file_size": 5000}
        res = self.client.post(url, data)
        assert res.status_code == status.HTTP_403_FORBIDDEN

    def test_upload_intent_oversized_file(self):
        self.client.force_authenticate(user=self.pastor_a)
        url = reverse('sermon-upload-intent')
        data = {
            "filename": "huge.mp4",
            "file_size": 300 * 1024 * 1024,
            "asset_type": "video"
        }
        res = self.client.post(url, data)
        assert res.status_code == status.HTTP_400_BAD_REQUEST

    def test_upload_complete_cross_tenant_prohibited(self):
        self.client.force_authenticate(user=self.pastor_a)
        url = reverse('sermon-upload-complete')
        data = {
            "upload_id": "u_123",
            "storage_key": f"sermons/{self.branch_b.id}/video/other.mp4"
        }
        res = self.client.post(url, data)
        assert res.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestHLSGenerationPipeline:
    def test_hls_missing_ffmpeg_graceful_fallback(self):
        from unittest.mock import patch
        from .media_processing import MediaProcessingService

        with patch.object(
            MediaProcessingService, 'is_ffmpeg_available', return_value=False
        ):
            res = MediaProcessingService.generate_hls_stream(
                "input.mp4", "out_dir"
            )
            assert res["success"] is False
            assert "FFmpeg not available" in res["error"]

    def test_generate_hls_task_nonexistent_sermon(self):
        from .tasks import generate_hls_task
        res = generate_hls_task(999999)
        assert res["status"] == "failed"
        assert res["reason"] == "Sermon not found"

    def test_hls_url_serialization(self):
        from .models import Sermon
        from authentication.tests import BranchFactory
        from django.core.files.uploadedfile import SimpleUploadedFile
        branch = BranchFactory()
        video = SimpleUploadedFile(
            "test.mp4", b"fake_video_bytes", content_type="video/mp4"
        )
        sermon = Sermon.objects.create(
            branch=branch,
            title="HLS Test",
            description="A test sermon description.",
            speaker="Pastor John",
            category="Faith",
            video_file=video
        )
        from .serializers import SermonSerializer
        serializer = SermonSerializer(sermon)
        assert "hls_url" in serializer.data
        assert "master.m3u8" in serializer.data["hls_url"]


@pytest.mark.django_db
class TestPodcastFeedAPI:
    def test_podcast_feed_public_access(self):
        from rest_framework.test import APIClient
        from django.urls import reverse
        from authentication.tests import BranchFactory
        from django.core.files.uploadedfile import SimpleUploadedFile
        from .models import Sermon

        client = APIClient()
        branch = BranchFactory()
        audio = SimpleUploadedFile("s.mp3", b"audio", content_type="audio/mpeg")
        Sermon.objects.create(
            branch=branch,
            title="Podcast Sermon",
            description="Podcast Description",
            speaker="Pastor Grace",
            category="Grace",
            status="Published",
            audio_file=audio
        )

        url = reverse('sermon-podcast-feed')
        res = client.get(url)
        assert res.status_code == 200
        assert "application/xml" in res["Content-Type"]
        assert "<title>Podcast Sermon</title>" in res.content.decode("utf-8")
