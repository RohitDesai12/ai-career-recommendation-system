"""
Career Compass ML Service — Model Manager & Cloud Deployment Loader
Handles safe model discovery, on-demand cloud downloading, memory safety checks,
and model status reporting for the V8 Recommendation System and Resume Analyzer.
"""

import os
import sys
import json
import logging
import urllib.request
import urllib.error
from typing import Optional, Dict, Any, Tuple

logger = logging.getLogger("model_manager")
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter("[%(asctime)s] [%(levelname)s] [ModelManager]: %(message)s"))
    logger.addHandler(handler)
logger.setLevel(logging.INFO)

# Configurable environment settings
V8_MODEL_URL = os.environ.get("V8_MODEL_URL", os.environ.get("CAREER_MODEL_URL", "")).strip()
RESUME_MODEL_URL = os.environ.get("RESUME_MODEL_URL", "").strip()
MODEL_CACHE_DIR = os.environ.get("MODEL_CACHE_DIR", os.path.dirname(os.path.abspath(__file__)))
MODEL_DOWNLOAD_TIMEOUT = int(os.environ.get("MODEL_DOWNLOAD_TIMEOUT", "300"))


def download_file_streaming(url: str, dest_path: str, timeout: int = 300) -> bool:
    """
    Downloads a model file via HTTP/HTTPS stream directly to disk in 1 MB chunks.
    Uses atomic renaming (.tmp -> final) to avoid corrupt files on interrupted downloads.
    """
    dest_dir = os.path.dirname(dest_path)
    if dest_dir and not os.path.exists(dest_dir):
        os.makedirs(dest_dir, exist_ok=True)

    tmp_path = dest_path + ".tmp"
    logger.info(f"Starting model download from: {url}")
    logger.info(f"Destination: {dest_path}")
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "CareerCompass-ModelManager/1.0"}
        )
        with urllib.request.urlopen(req, timeout=timeout) as response:
            total_size = response.getheader("Content-Length")
            total_mb = f"{int(total_size) / (1024*1024):.1f} MB" if total_size else "unknown size"
            logger.info(f"Connected to model storage. Total size: {total_mb}")

            downloaded = 0
            with open(tmp_path, "wb") as f:
                while True:
                    chunk = response.read(1024 * 1024)  # 1 MB chunks
                    if not chunk:
                        break
                    f.write(chunk)
                    downloaded += len(chunk)
                    if downloaded % (50 * 1024 * 1024) == 0:
                        logger.info(f"Downloaded {downloaded / (1024*1024):.1f} MB...")

        # Atomic rename after full download
        if os.path.exists(dest_path):
            os.remove(dest_path)
        os.rename(tmp_path, dest_path)
        logger.info(f"Successfully downloaded and cached model to {dest_path} ({downloaded / (1024*1024):.1f} MB)")
        return True

    except Exception as e:
        logger.error(f"Failed to download model from {url}: {e}")
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass
        return False


def ensure_model_file(filename: str, remote_url: Optional[str] = None) -> Tuple[bool, str]:
    """
    Ensures the specified model file exists locally.
    If missing and a remote URL is provided, attempts an on-demand download.
    Returns (is_available, file_path).
    """
    local_path = os.path.join(MODEL_CACHE_DIR, filename)
    if os.path.exists(local_path) and os.path.getsize(local_path) > 0:
        return True, local_path

    # Try downloading if URL is provided
    if remote_url:
        logger.info(f"Model {filename} not found locally. Initiating download...")
        success = download_file_streaming(remote_url, local_path, timeout=MODEL_DOWNLOAD_TIMEOUT)
        if success:
            return True, local_path

    return False, local_path
