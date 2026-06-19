import factory
from django.utils import timezone
from groups.models import ConnectGroup, GroupMember, GroupAttendance, GroupAttendanceAttendee, GroupPrayerRequest, StudyOutline
from authentication.factories import BranchFactory, UserFactory
from members.factories import MemberFactory

class ConnectGroupFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ConnectGroup

    branch = factory.SubFactory(BranchFactory)
    name = factory.Sequence(lambda n: f"Connect Group {n}")
    description = "Home fellowship group"
    category = "Connect Group"
    leader = factory.SubFactory(MemberFactory, branch=factory.SelfAttribute('..branch'))
    location_name = "Main Campus Hall"
    location_address = "123 Main St"
    frequency = "Weekly"
    status = "Active"
    created_by = factory.SubFactory(UserFactory)

class GroupMemberFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = GroupMember

    group = factory.SubFactory(ConnectGroupFactory)
    member = factory.SubFactory(MemberFactory, branch=factory.SelfAttribute('..group.branch'))
    name = factory.Sequence(lambda n: f"Group Member {n}")
    phone = "+1-555-0000"
    email = factory.Sequence(lambda n: f"groupmember-{n}@test.com")
    role = "Member"
    joined_at = timezone.now()
    status = "Active"
    created_by = factory.SubFactory(UserFactory)

class GroupAttendanceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = GroupAttendance

    group = factory.SubFactory(ConnectGroupFactory)
    meeting_date = timezone.now().date()
    submitted_by = factory.SubFactory(UserFactory)
    visitor_count = 0
    study_topic = "Faith and Action"
    created_by = factory.SubFactory(UserFactory)

class GroupAttendanceAttendeeFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = GroupAttendanceAttendee

    attendance = factory.SubFactory(GroupAttendanceFactory)
    member = factory.SubFactory(GroupMemberFactory, group=factory.SelfAttribute('..attendance.group'))
    attended = True
    status = "Present"

class GroupPrayerRequestFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = GroupPrayerRequest

    group = factory.SubFactory(ConnectGroupFactory)
    submitted_by_name = "John Doe"
    request_text = "Pray for health and strength"
    is_anonymous = False
    status = "Active"
    visibility_level = "PRIVATE"
    created_by = factory.SubFactory(UserFactory)

class StudyOutlineFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = StudyOutline

    title = factory.Sequence(lambda n: f"Study Outline {n}")
    theme = "Stewardship"
    scripture_references = factory.List(["Luke 12:13-21"])
    introduction = "Intro to outline"
    discussion_questions = factory.List(["Question 1", "Question 2"])
    application = "Application paragraph"
    version = 1
    is_active = True
    created_by = factory.SubFactory(UserFactory)
