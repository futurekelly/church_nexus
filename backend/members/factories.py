import factory
from django.utils import timezone
from branches.models import Branch
from authentication.models import User
from members.models import Member, Family, FamilyRelationship, MemberLifecycleTimeline
from authentication.factories import BranchFactory, UserFactory

class FamilyFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Family

    branch = factory.SubFactory(BranchFactory)
    name = factory.Sequence(lambda n: f"Family {n}")
    created_by = factory.SubFactory(UserFactory)

class MemberFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Member

    branch = factory.SubFactory(BranchFactory)
    family = factory.SubFactory(FamilyFactory, branch=factory.SelfAttribute('..branch'))
    first_name = factory.Sequence(lambda n: f"First{n}")
    last_name = factory.Sequence(lambda n: f"Last{n}")
    gender = 'male'
    email = factory.Sequence(lambda n: f"member-{n}@test.com")
    phone_number = "+1-555-1234"
    status = 'Member'
    join_date = timezone.now().date()
    created_by = factory.SubFactory(UserFactory)

class FamilyRelationshipFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = FamilyRelationship

    from_member = factory.SubFactory(MemberFactory)
    to_member = factory.SubFactory(MemberFactory)
    relationship_type = 'Parent'
    created_by = factory.SubFactory(UserFactory)

class MemberLifecycleTimelineFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = MemberLifecycleTimeline

    member = factory.SubFactory(MemberFactory)
    previous_status = 'Visitor'
    new_status = 'Member'
    changed_by = factory.SubFactory(UserFactory)
    notes = 'Status change'
