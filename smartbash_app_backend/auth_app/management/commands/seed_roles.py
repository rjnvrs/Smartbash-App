from django.core.management.base import BaseCommand
from residents.models import Role


class Command(BaseCommand):
    help = "Seed default roles into the roles table."

    def handle(self, *args, **options):
        roles = [
            ("Resident", "Regular resident"),
            ("Services", "Service provider"),
            ("BrgyOfficials", "Barangay officials"),
            ("Admin", "System administrator"),
        ]

        created_count = 0
        for role_name, role_description in roles:
            _, created = Role.objects.get_or_create(
                role_name=role_name,
                defaults={"role_description": role_description},
            )
            if created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS(f"Seeded roles. New: {created_count}"))
