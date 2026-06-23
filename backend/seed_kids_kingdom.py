"""
Seed script for Kids Kingdom test data.
"""
from members.models import Member
from branches.models import Branch
from kids_kingdom.models import Child, Classroom
from datetime import date, timedelta

branch = Branch.objects.first()
if not branch:
    print("ERROR: No branch found.")
    exit(1)

print(f"Using branch: {branch.branch_name} (id={branch.id})")

# --- Create Members (Parents) ---
parents_data = [
    {"first_name": "John", "last_name": "Mwangi", "phone_number": "+254700111111", "email": "john.mwangi@test.com", "gender": "Male"},
    {"first_name": "Mary", "last_name": "Mwangi", "phone_number": "+254700222222", "email": "mary.mwangi@test.com", "gender": "Female"},
    {"first_name": "Peter", "last_name": "Ochieng", "phone_number": "+254700333333", "email": "peter.ochieng@test.com", "gender": "Male"},
    {"first_name": "Grace", "last_name": "Ochieng", "phone_number": "+254700444444", "email": "grace.ochieng@test.com", "gender": "Female"},
]

parents = []
for pd in parents_data:
    member, created = Member.objects.get_or_create(
        branch=branch,
        email=pd["email"],
        defaults={
            "first_name": pd["first_name"],
            "last_name": pd["last_name"],
            "phone_number": pd["phone_number"],
            "gender": pd["gender"],
            "status": "active",
            "member_type": "member",
            "join_date": date.today(),
        }
    )
    parents.append(member)
    tag = "CREATED" if created else "EXISTS"
    print(f"  [{tag}] Member: {member.first_name} {member.last_name} (id={member.id})")

# --- Create Classrooms ---
classrooms_data = [
    {"name": "Tiny Tots (0-2)", "min_age": 0, "max_age": 2, "capacity": 10},
    {"name": "Little Lambs (3-5)", "min_age": 3, "max_age": 5, "capacity": 15},
    {"name": "Kingdom Kids (6-9)", "min_age": 6, "max_age": 9, "capacity": 20},
    {"name": "Young Warriors (10-12)", "min_age": 10, "max_age": 12, "capacity": 20},
]

for cd in classrooms_data:
    room, created = Classroom.objects.get_or_create(
        branch=branch,
        name=cd["name"],
        defaults={
            "min_age": cd["min_age"],
            "max_age": cd["max_age"],
            "capacity": cd["capacity"],
        }
    )
    tag = "CREATED" if created else "EXISTS"
    print(f"  [{tag}] Classroom: {room.name} (ages {room.min_age}-{room.max_age})")

# --- Create Children ---
children_data = [
    {"first_name": "Daniel", "last_name": "Mwangi", "birth_date": date.today() - timedelta(days=365 * 4), "gender": "male", "parent_idxs": [0, 1], "allergy_alerts": "Peanuts", "special_needs": ""},
    {"first_name": "Faith", "last_name": "Mwangi", "birth_date": date.today() - timedelta(days=365 * 7), "gender": "female", "parent_idxs": [0, 1], "allergy_alerts": "", "special_needs": ""},
    {"first_name": "Samuel", "last_name": "Ochieng", "birth_date": date.today() - timedelta(days=int(365 * 1.5)), "gender": "male", "parent_idxs": [2, 3], "allergy_alerts": "", "special_needs": "Asthma inhaler needed"},
    {"first_name": "Joy", "last_name": "Ochieng", "birth_date": date.today() - timedelta(days=365 * 11), "gender": "female", "parent_idxs": [2, 3], "allergy_alerts": "Gluten", "special_needs": ""},
]

for cd in children_data:
    child, created = Child.objects.get_or_create(
        branch=branch,
        first_name=cd["first_name"],
        last_name=cd["last_name"],
        defaults={
            "birth_date": cd["birth_date"],
            "gender": cd["gender"],
            "allergy_alerts": cd["allergy_alerts"],
            "special_needs": cd["special_needs"],
            "status": "Active",
        }
    )
    if created:
        child.parents.set([parents[i] for i in cd["parent_idxs"]])
    tag = "CREATED" if created else "EXISTS"
    parent_names = [parents[i].first_name for i in cd["parent_idxs"]]
    print(f"  [{tag}] Child: {child.first_name} {child.last_name} (age ~{child.age} yrs, parents: {parent_names})")

print("\n=== SEED COMPLETE ===")
print(f"  Members: {Member.objects.filter(branch=branch).count()}")
print(f"  Classrooms: {Classroom.objects.filter(branch=branch).count()}")
print(f"  Children: {Child.objects.filter(branch=branch).count()}")
print("\nTest at: http://localhost:3000/dashboard/kids-kingdom")
print("Login as: churchadmin@churchnexus.com or pastor@churchnexus.com")
