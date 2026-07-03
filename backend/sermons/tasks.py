import os
import tempfile
import logging
from celery import shared_task
from django.core.files import File
from .models import Sermon
from .media_processing import MediaProcessingService

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def generate_thumbnail_task(self, sermon_id):
    """
    Asynchronous Celery task to generate a thumbnail from a sermon video file.
    """
    try:
        sermon = Sermon.objects.get(pk=sermon_id)
        if not sermon.video_file or sermon.thumbnail:
            reason = "No video or thumbnail exists"
            return {"status": "skipped", "reason": reason}

        video_path = sermon.video_file.path
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
            tmp_path = tmp.name

        res = MediaProcessingService.generate_thumbnail(video_path, tmp_path)
        if res.get("success") and os.path.exists(tmp_path):
            with open(tmp_path, "rb") as f:
                name = f"thumb_{sermon.id}.jpg"
                sermon._disable_processing = True
                sermon.thumbnail.save(name, File(f), save=True)
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
            return {"status": "success", "sermon_id": str(sermon_id)}
        else:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
            return {"status": "failed", "reason": res.get("error")}
    except Sermon.DoesNotExist:
        return {"status": "failed", "reason": "Sermon not found"}
    except Exception as exc:
        logger.error(f"Thumbnail generation task error: {exc}")
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def extract_audio_task(self, sermon_id):
    """
    Asynchronous Celery task to extract MP3 audio from a sermon video file.
    """
    try:
        sermon = Sermon.objects.get(pk=sermon_id)
        if not sermon.video_file or sermon.audio_file:
            return {"status": "skipped", "reason": "No video or audio exists"}

        video_path = sermon.video_file.path
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
            tmp_path = tmp.name

        res = MediaProcessingService.extract_audio(video_path, tmp_path)
        if res.get("success") and os.path.exists(tmp_path):
            with open(tmp_path, "rb") as f:
                name = f"audio_{sermon.id}.mp3"
                sermon._disable_processing = True
                sermon.audio_file.save(name, File(f), save=True)
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
            return {"status": "success", "sermon_id": str(sermon_id)}
        else:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
            return {"status": "failed", "reason": res.get("error")}
    except Sermon.DoesNotExist:
        return {"status": "failed", "reason": "Sermon not found"}
    except Exception as exc:
        logger.error(f"Audio extraction task error: {exc}")
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def optimize_video_task(self, sermon_id):
    """
    Asynchronous Celery task to apply FastStart optimization to an MP4 video.
    """
    try:
        sermon = Sermon.objects.get(pk=sermon_id)
        if not sermon.video_file:
            return {"status": "skipped", "reason": "No video file"}

        video_path = sermon.video_file.path
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
            tmp_path = tmp.name

        res = MediaProcessingService.optimize_mp4(video_path, tmp_path)
        if res.get("success") and os.path.exists(tmp_path):
            with open(tmp_path, "rb") as f:
                name = os.path.basename(video_path)
                sermon._disable_processing = True
                sermon.video_file.save(name, File(f), save=True)
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
            return {"status": "success", "sermon_id": str(sermon_id)}
        else:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
            return {"status": "failed", "reason": res.get("error")}
    except Sermon.DoesNotExist:
        return {"status": "failed", "reason": "Sermon not found"}
    except Exception as exc:
        logger.error(f"Video optimization task error: {exc}")
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def generate_hls_task(self, sermon_id):
    """
    Asynchronous Celery task to generate adaptive HLS streaming variants.
    """
    try:
        sermon = Sermon.objects.get(pk=sermon_id)
        if not sermon.video_file:
            return {"status": "skipped", "reason": "No video file"}

        video_path = sermon.video_file.path
        b_str = str(sermon.branch.id) if sermon.branch else "global"
        hls_dir_key = os.path.join("sermons", b_str, "hls", str(sermon.id))

        with tempfile.TemporaryDirectory() as tmp_dir:
            res = MediaProcessingService.generate_hls_stream(
                video_path, tmp_dir
            )
            if res.get("success"):
                from .storage_manager import StorageManager
                saved_files = []
                for root, _, files in os.walk(tmp_dir):
                    for filename in files:
                        local_file = os.path.join(root, filename)
                        rel_path = os.path.relpath(local_file, tmp_dir)
                        target_key = os.path.join(
                            hls_dir_key, rel_path
                        ).replace("\\", "/")
                        with open(local_file, "rb") as f:
                            StorageManager.save_file(target_key, f)
                        saved_files.append(target_key)
                return {
                    "status": "success",
                    "sermon_id": str(sermon_id),
                    "master_playlist": f"{hls_dir_key}/master.m3u8",
                    "file_count": len(saved_files)
                }
            else:
                return {"status": "failed", "reason": res.get("error")}
    except Sermon.DoesNotExist:
        return {"status": "failed", "reason": "Sermon not found"}
    except Exception as exc:
        logger.error(f"HLS generation task error: {exc}")
        raise self.retry(exc=exc)


@shared_task
def process_sermon_media(sermon_id):
    """
    Master pipeline coordinator task dispatching individual processing steps.
    """
    res_thumb = generate_thumbnail_task(sermon_id)
    res_audio = extract_audio_task(sermon_id)
    res_opt = optimize_video_task(sermon_id)
    res_hls = generate_hls_task(sermon_id)
    return {
        "sermon_id": str(sermon_id),
        "thumbnail": res_thumb,
        "audio": res_audio,
        "optimization": res_opt,
        "hls": res_hls,
    }
