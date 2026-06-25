import pytest
from django.urls import reverse
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile  # noqa: F401
from rest_framework import status
from rest_framework.test import APIClient
from django.utils import timezone  # noqa: F401
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

    def test_anonymous_user_can_read_published_only(self):
        # List endpoint
        url = reverse('sermon-list')
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        # Anonymous user should see all Published sermons across branches if branch is not specified,
        # or filtered branch if specified.
        # Here we didn't specify branch, so they see Published sermons from all branches.
        titles = [item['title'] for item in response.data]
        assert "Published Sermon A" in titles
        assert "Published Sermon B" in titles
        assert "Draft Sermon A" not in titles
        assert "Archived Sermon A" not in titles

        # Query parameter branch filtering for Anonymous
        response_branch_a = self.client.get(url, {'branch': self.branch_a.id})
        assert response_branch_a.status_code == status.HTTP_200_OK
        titles_a = [item['title'] for item in response_branch_a.data]
        assert "Published Sermon A" in titles_a
        assert "Published Sermon B" not in titles_a

        # Detail endpoint for published should succeed
        detail_url_pub = reverse('sermon-detail', kwargs={'pk': self.sermon_pub_a.id})
        response_detail_pub = self.client.get(detail_url_pub)
        assert response_detail_pub.status_code == status.HTTP_200_OK

        # Detail endpoint for Draft should fail (not visible to anonymous/members)
        detail_url_draft = reverse('sermon-detail', kwargs={'pk': self.sermon_draft_a.id})
        response_detail_draft = self.client.get(detail_url_draft)
        assert response_detail_draft.status_code == status.HTTP_404_NOT_FOUND

    def test_member_can_read_published_only_and_branch_isolated(self):
        self.client.force_authenticate(user=self.member_a)
        url = reverse('sermon-list')
        
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        # Member A should only see Published sermons belonging to branch_a
        titles = [item['title'] for item in response.data]
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
        assert response_anon.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]

        # Member Write blocked
        self.client.force_authenticate(user=self.member_a)
        response_member = self.client.post(url, data)
        assert response_member.status_code == status.HTTP_403_FORBIDDEN

    def test_branch_staff_can_manage_sermons_in_their_branch(self):
        self.client.force_authenticate(user=self.pastor_a)
        
        # Pastor A can list all status sermons (Draft, Published, Archived) in Branch A
        list_url = reverse('sermon-list')
        response = self.client.get(list_url)
        assert response.status_code == status.HTTP_200_OK
        titles = [item['title'] for item in response.data]
        assert "Published Sermon A" in titles
        assert "Draft Sermon A" in titles
        assert "Archived Sermon A" in titles
        assert "Published Sermon B" not in titles # Isolated to Branch A

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
        titles = [item['title'] for item in response.data]
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
        assert "branch" in response_create_fail.data

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
        assert len(res_cat.data) == 1
        assert res_cat.data[0]['title'] == "Draft Sermon A"

        # Filter by Speaker
        res_spk = self.client.get(list_url, {'speaker': 'Pastor A'})
        assert len(res_spk.data) == 3

        # Filter by Featured
        res_feat = self.client.get(list_url, {'featured': 'true'})
        assert len(res_feat.data) == 1
        assert res_feat.data[0]['title'] == "Published Sermon A"

        # Search Query
        res_search = self.client.get(list_url, {'search': 'Archived'})
        assert len(res_search.data) == 1
        assert res_search.data[0]['title'] == "Archived Sermon A"

        # Sorting
        res_sort = self.client.get(list_url, {'sort_key': 'title', 'sort_dir': 'asc'})
        titles_sorted = [item['title'] for item in res_sort.data]
        assert titles_sorted == ["Archived Sermon A", "Draft Sermon A", "Published Sermon A"]

