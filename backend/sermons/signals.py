from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Sermon
from .tasks import process_sermon_media


@receiver(post_save, sender=Sermon)
def trigger_sermon_media_processing(sender, instance, created, **kwargs):
    """
    Post-save signal listener automatically triggering background media
    processing tasks whenever a sermon with a video file is saved.
    """
    disable = getattr(instance, "_disable_processing", False)
    if instance.video_file and not disable:
        if created:
            import threading
            thread = threading.Thread(target=process_sermon_media, args=(instance.id,))
            thread.daemon = True
            thread.start()
        else:
            # For updates, only process if video_file itself has changed
            try:
                old_instance = Sermon.objects.get(pk=instance.id)
                if old_instance.video_file != instance.video_file:
                    import threading
                    thread = threading.Thread(target=process_sermon_media, args=(instance.id,))
                    thread.daemon = True
                    thread.start()
            except Sermon.DoesNotExist:
                pass
