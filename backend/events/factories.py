import factory
from django.utils import timezone
from events.models import Event, EventRegistration, EventCheckIn, EventResource, ResourceBooking
from authentication.factories import BranchFactory, UserFactory
from members.factories import MemberFactory

class EventFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Event

    branch = factory.SubFactory(BranchFactory)
    title = factory.Sequence(lambda n: f"Event {n}")
    description = "Church event description"
    event_type = "Sunday Service"
    start_date = timezone.now() + timezone.timedelta(days=1)
    end_date = timezone.now() + timezone.timedelta(days=1, hours=2)
    location = "Main Sanctuary"
    organizer = "Pastor Admin"
    capacity = 100
    waitlist_enabled = True
    status = "Draft"
    created_by = factory.SubFactory(UserFactory)

class EventRegistrationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = EventRegistration

    event = factory.SubFactory(EventFactory)
    user = factory.SubFactory(UserFactory)
    member = factory.SubFactory(MemberFactory, branch=factory.SelfAttribute('..event.branch'))
    visitor_name = None
    visitor_email = None
    visitor_phone = None
    status = "REGISTERED"
    registration_date = timezone.now()
    attendance_status = "registered"
    created_by = factory.SubFactory(UserFactory)

class EventCheckInFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = EventCheckIn

    registration = factory.SubFactory(EventRegistrationFactory)
    checked_in_at = timezone.now()
    checked_in_by = factory.SubFactory(UserFactory)
    check_in_method = "MANUAL"
    created_by = factory.SubFactory(UserFactory)

class EventResourceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = EventResource

    branch = factory.SubFactory(BranchFactory)
    name = factory.Sequence(lambda n: f"Venue Resource {n}")
    resource_type = "Venue"
    capacity = 50
    status = "Available"

class ResourceBookingFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ResourceBooking

    event = factory.SubFactory(EventFactory)
    resource = factory.SubFactory(EventResourceFactory, branch=factory.SelfAttribute('..event.branch'))
    start_time = timezone.now() + timezone.timedelta(days=1)
    end_time = timezone.now() + timezone.timedelta(days=1, hours=2)
    status = "Pending"
