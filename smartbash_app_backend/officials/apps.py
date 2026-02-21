from django.apps import AppConfig


class OfficialsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "officials"

    def ready(self):
        # Register signal handlers for official -> resident cleanup rules.
        from . import signals  # noqa: F401
