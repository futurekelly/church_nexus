import os
import shutil
import subprocess
import logging

logger = logging.getLogger(__name__)


class MediaProcessingService:
    """
    Local media processing service wrapping FFmpeg CLI commands safely.
    Handles keyframe thumbnail generation, audio extraction, and FastStart
    web optimization with graceful fallback for missing system utilities.
    """

    @staticmethod
    def is_ffmpeg_available():
        """
        Check if the FFmpeg executable is available on the system PATH.
        """
        return shutil.which("ffmpeg") is not None

    @staticmethod
    def generate_thumbnail(input_path, output_path, timestamp="00:00:05"):
        """
        Extract a JPEG thumbnail keyframe from video at specified timestamp.
        """
        if not MediaProcessingService.is_ffmpeg_available():
            logger.warning("FFmpeg unavailable. Skipping thumbnail.")
            return {"success": False, "error": "FFmpeg not available"}

        if not os.path.exists(input_path):
            err = f"Input file not found: {input_path}"
            return {"success": False, "error": err}

        try:
            cmd = [
                "ffmpeg", "-y", "-ss", timestamp, "-i", input_path,
                "-vframes", "1", "-q:v", "2", output_path
            ]
            res = subprocess.run(
                cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                text=True, timeout=30
            )
            if res.returncode == 0 and os.path.exists(output_path):
                return {
                    "success": True, "output_path": output_path, "error": None
                }
            return {"success": False, "error": res.stderr}
        except Exception as e:
            logger.error(f"Error generating thumbnail: {e}")
            return {"success": False, "error": str(e)}

    @staticmethod
    def extract_audio(input_path, output_path, bitrate="128k"):
        """
        Extract stereo MP3 audio track from a video file.
        """
        if not MediaProcessingService.is_ffmpeg_available():
            logger.warning("FFmpeg unavailable. Skipping audio extraction.")
            return {"success": False, "error": "FFmpeg not available"}

        if not os.path.exists(input_path):
            err = f"Input file not found: {input_path}"
            return {"success": False, "error": err}

        try:
            cmd = [
                "ffmpeg", "-y", "-i", input_path, "-vn",
                "-c:a", "libmp3lame", "-b:a", bitrate, output_path
            ]
            res = subprocess.run(
                cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                text=True, timeout=120
            )
            if res.returncode == 0 and os.path.exists(output_path):
                return {
                    "success": True, "output_path": output_path, "error": None
                }
            return {"success": False, "error": res.stderr}
        except Exception as e:
            logger.error(f"Error extracting audio: {e}")
            return {"success": False, "error": str(e)}

    @staticmethod
    def optimize_mp4(input_path, output_path):
        """
        Relocate moov atom header to beginning of MP4 container (+faststart)
        for instant progressive web buffering.
        """
        if not MediaProcessingService.is_ffmpeg_available():
            logger.warning("FFmpeg unavailable. Skipping MP4 optimization.")
            return {"success": False, "error": "FFmpeg not available"}

        if not os.path.exists(input_path):
            err = f"Input file not found: {input_path}"
            return {"success": False, "error": err}

        try:
            cmd = [
                "ffmpeg", "-y", "-i", input_path, "-c", "copy",
                "-movflags", "+faststart", output_path
            ]
            res = subprocess.run(
                cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                text=True, timeout=120
            )
            if res.returncode == 0 and os.path.exists(output_path):
                return {
                    "success": True, "output_path": output_path, "error": None
                }
            return {"success": False, "error": res.stderr}
        except Exception as e:
            logger.error(f"Error optimizing MP4: {e}")
            return {"success": False, "error": str(e)}

    @staticmethod
    def generate_hls_stream(input_path, output_dir):
        """
        Generate HLS adaptive streaming variants (720p, 480p, 360p)
        and master.m3u8 playlist inside output_dir.
        """
        if not MediaProcessingService.is_ffmpeg_available():
            logger.warning("FFmpeg unavailable. Skipping HLS generation.")
            return {"success": False, "error": "FFmpeg not available"}

        if not os.path.exists(input_path):
            err = f"Input file not found: {input_path}"
            return {"success": False, "error": err}

        os.makedirs(output_dir, exist_ok=True)

        variants = [
            {
                "name": "720p", "vf": "scale=w=-2:h=720",
                "bitrate": "2500k", "band": "2800000", "res": "1280x720"
            },
            {
                "name": "480p", "vf": "scale=w=-2:h=480",
                "bitrate": "1200k", "band": "1400000", "res": "854x480"
            },
            {
                "name": "360p", "vf": "scale=w=-2:h=360",
                "bitrate": "800k", "band": "950000", "res": "640x360"
            },
        ]

        try:
            for v in variants:
                playlist_path = os.path.join(output_dir, f"{v['name']}.m3u8")
                segment_template = os.path.join(
                    output_dir, f"{v['name']}_%03d.ts"
                )
                cmd = [
                    "ffmpeg", "-y", "-i", input_path,
                    "-vf", v["vf"],
                    "-c:v", "libx264", "-b:v", v["bitrate"],
                    "-c:a", "aac", "-b:a", "128k",
                    "-hls_time", "6", "-hls_playlist_type", "vod",
                    "-hls_segment_filename", segment_template,
                    playlist_path
                ]
                res = subprocess.run(
                    cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                    text=True, timeout=300
                )
                if res.returncode != 0:
                    logger.error(
                        f"FFmpeg failed for variant {v['name']}: {res.stderr}"
                    )
                    return {"success": False, "error": res.stderr}

            master_path = os.path.join(output_dir, "master.m3u8")
            with open(master_path, "w", encoding="utf-8") as f:
                f.write("#EXTM3U\n#EXT-X-VERSION:3\n\n")
                for v in variants:
                    f.write(
                        f"#EXT-X-STREAM-INF:BANDWIDTH={v['band']},"
                        f"RESOLUTION={v['res']}\n"
                    )
                    f.write(f"{v['name']}.m3u8\n\n")

            return {"success": True, "output_dir": output_dir, "error": None}
        except Exception as e:
            logger.error(f"Error generating HLS stream: {e}")
            return {"success": False, "error": str(e)}
