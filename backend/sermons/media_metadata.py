import os
import mimetypes
import subprocess
import json
from PIL import Image


class MediaMetadataService:
    """
    Lightweight media metadata extraction service.
    Safely probes technical attributes (mime type, file size, duration,
    resolution, codec) with graceful fallback for missing system tools.
    """

    @staticmethod
    def extract_metadata(file_obj_or_path):
        """
        Extract standardized technical metadata from a file object or path.
        Returns a dictionary containing technical properties.
        """
        metadata = {
            "mime_type": "application/octet-stream",
            "file_size": 0,
            "duration_seconds": None,
            "width": None,
            "height": None,
            "frame_rate": None,
            "codec": None,
        }

        if not file_obj_or_path:
            return metadata

        filepath = None
        # Handle file object vs path string
        if isinstance(file_obj_or_path, (str, bytes, os.PathLike)):
            filepath = str(file_obj_or_path)
            if os.path.exists(filepath):
                metadata["file_size"] = os.path.getsize(filepath)
        elif hasattr(file_obj_or_path, "size"):
            metadata["file_size"] = getattr(file_obj_or_path, "size", 0)
            content_type = getattr(file_obj_or_path, "content_type", None)
            if content_type:
                metadata["mime_type"] = content_type
            if hasattr(file_obj_or_path, "path"):
                filepath = file_obj_or_path.path

        filename = getattr(file_obj_or_path, "name", str(file_obj_or_path))
        guessed_type, _ = mimetypes.guess_type(filename)
        if (guessed_type and
                metadata["mime_type"] == "application/octet-stream"):
            metadata["mime_type"] = guessed_type

        # 1. Probe Image Metadata via PIL
        if metadata["mime_type"].startswith("image/"):
            try:
                if hasattr(file_obj_or_path, "open"):
                    file_obj_or_path.open()
                with Image.open(file_obj_or_path) as img:
                    metadata["width"] = img.width
                    metadata["height"] = img.height
                    if img.format:
                        metadata["codec"] = img.format.lower()
            except Exception:
                pass

        # 2. Probe Audio/Video Metadata via FFprobe (if ffprobe available)
        is_img = metadata["mime_type"].startswith("image/")
        if filepath and os.path.exists(filepath) and not is_img:
            ffprobe_meta = MediaMetadataService._probe_ffprobe(filepath)
            if ffprobe_meta:
                for k, v in ffprobe_meta.items():
                    if v is not None:
                        metadata[k] = v

        return metadata

    @staticmethod
    def _probe_ffprobe(filepath):
        """
        Probe media container streams via ffprobe JSON CLI.
        Fails gracefully without raising exceptions if ffprobe is absent.
        """
        try:
            cmd = [
                "ffprobe",
                "-v", "quiet",
                "-print_format", "json",
                "-show_format",
                "-show_streams",
                filepath
            ]
            result = subprocess.run(
                cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                text=True, timeout=5
            )
            if result.returncode != 0:
                return None

            data = json.loads(result.stdout)
            format_info = data.get("format", {})
            streams = data.get("streams", [])

            duration = None
            if "duration" in format_info:
                try:
                    duration = float(format_info["duration"])
                except ValueError:
                    pass

            width, height, frame_rate, codec = None, None, None, None
            for stream in streams:
                if stream.get("codec_type") == "video" and not width:
                    width = stream.get("width")
                    height = stream.get("height")
                    codec = stream.get("codec_name")
                    r_frame_rate = stream.get("r_frame_rate")
                    if r_frame_rate and "/" in r_frame_rate:
                        num, den = r_frame_rate.split("/")
                        if float(den) > 0:
                            frame_rate = round(float(num) / float(den), 2)
                elif stream.get("codec_type") == "audio" and not codec:
                    codec = stream.get("codec_name")

            return {
                "duration_seconds": duration,
                "width": width,
                "height": height,
                "frame_rate": frame_rate,
                "codec": codec,
            }
        except Exception:
            return None
