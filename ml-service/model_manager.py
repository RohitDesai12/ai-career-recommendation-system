"""
Career Compass ML Service — Model Manager & Cloud Deployment Loader
Handles safe model discovery, on-demand cloud downloading, memory safety checks,
and transparent fallback telemetry.
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
SKIP_HEAVY_MODEL_LOAD = os.environ.get("SKIP_HEAVY_MODEL_LOAD", "false").lower() in ("true", "1", "yes")
CAREER_MODEL_URL = os.environ.get("CAREER_MODEL_URL", "").strip()
RESUME_MODEL_URL = os.environ.get("RESUME_MODEL_URL", "").strip()
MODEL_CACHE_DIR = os.environ.get("MODEL_CACHE_DIR", os.path.dirname(os.path.abspath(__file__)))
MODEL_DOWNLOAD_TIMEOUT = int(os.environ.get("MODEL_DOWNLOAD_TIMEOUT", "300"))


def download_file_streaming(url: str, dest_path: str, timeout: int = 300) -> bool:
    """
    Downloads a model file via HTTP/HTTPS stream directly to disk in 1 MB chunks.
    Uses atomic renaming (.tmp -> final) to avoid corrupt files on interrupted downloads.
    """
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
                    chunk = response.read(1024 * 1024) # 1 MB chunks
                    if not chunk:
                        break
                    f.write(chunk)
                    downloaded += len(chunk)
                    if downloaded % (50 * 1024 * 1024) == 0: # log every 50 MB
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


def generate_heuristic_recommendation(data: Dict[str, Any], career_classes: list, branch_alias: dict) -> Dict[str, Any]:
    """
    Intelligent domain heuristic fallback when the 1.88 GB ML model is not loaded.
    Maps student's branch, primary skill, and interest to the most suitable career class.
    """
    raw_branch = str(data.get("Branch", "")).strip()
    branch = branch_alias.get(raw_branch, raw_branch)
    primary_skill = str(data.get("Primary_Skill", "")).lower()
    hw_or_sw = str(data.get("Hardware_or_Software", "")).lower()

    branch_defaults = {
        "CSE": "Software Development Engineer",
        "IT": "Full Stack Web Developer",
        "Data Science": "Data Scientist",
        "ECE": "Embedded Systems Engineer" if "embedded" in primary_skill or "hardware" in hw_or_sw else "VLSI Design Engineer",
        "EEE": "Power Systems Engineer",
        "Mechanical": "Automotive Design Engineer" if "auto" in primary_skill else "CAD/CAM Design Engineer",
        "Aerospace": "Aerospace Structural Engineer",
        "Civil": "Structural Design Engineer",
    }

    # Skill overrides
    if "python" in primary_skill or "machine learning" in primary_skill or "ai" in primary_skill:
        rec = "ML Engineer / AI Researcher"
    elif "cloud" in primary_skill or "devops" in primary_skill or "docker" in primary_skill:
        rec = "Cloud Architect / DevOps Engineer"
    elif "cyber" in primary_skill or "security" in primary_skill:
        rec = "Cybersecurity Analyst"
    elif "web" in primary_skill or "react" in primary_skill:
        rec = "Full Stack Web Developer"
    else:
        rec = branch_defaults.get(branch, "Software Development Engineer")

    # Ensure recommended role exists in target career_classes
    if rec not in career_classes and career_classes:
        # Find closest substring match
        matched = [c for c in career_classes if rec.lower() in c.lower() or c.lower() in rec.lower()]
        rec = matched[0] if matched else career_classes[0]

    # Generate plausible alternatives from same domain
    alternatives = []
    if career_classes:
        candidates = [c for c in career_classes if c != rec and (branch.lower() in c.lower() or "engineer" in c.lower() or "developer" in c.lower())]
        for c in candidates[:5]:
            alternatives.append({"title": c, "confidence": 65.0})

    return {
        "recommendation": rec,
        "confidence": 75.0,
        "model_status": "heuristic_fallback",
        "warning": "Trained ML model is not loaded (running in lightweight fallback mode). Recommendation generated using branch-aligned domain rules.",
        "alternatives": alternatives
    }
