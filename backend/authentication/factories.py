import factory
from branches.models import Branch
from authentication.models import User

class BranchFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Branch

    id = factory.Sequence(lambda n: f"branch-{n}")
    branch_code = factory.Sequence(lambda n: f"BR-{n:03d}")
    branch_name = factory.Sequence(lambda n: f"Branch {n}")
    branch_type = 'satellite'
    email = factory.LazyAttribute(lambda o: f"{o.id}@churchnexus.com")
    phone = "+1-555-9999"
    address = "123 Test St"
    is_active = True

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    email = factory.Sequence(lambda n: f"user-{n}@churchnexus.com")
    role = 'member'
    branch = factory.SubFactory(BranchFactory)
    member_id = factory.Sequence(lambda n: f"MEM-{n}")
    is_active = True

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        # Hash password if provided
        password = kwargs.pop('password', 'Password123!')
        obj = model_class(*args, **kwargs)
        obj.set_password(password)
        obj.save()
        return obj
