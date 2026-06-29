from django.apps import AppConfig


class SermonsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'sermons'

    def ready(self):
        import sermons.signals  # noqa: F401
