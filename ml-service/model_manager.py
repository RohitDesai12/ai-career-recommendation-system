"""
Career Compass ML Service — Model Manager & Hugging Face Deployment Loader
Handles secure model discovery, Hugging Face Hub authenticated downloading,
local development resolution, model integrity validation, singleton in-memory caching,
and model status reporting for the V8 Recommendation System and Resume Analyzer.
"""

import os
import sys
import json
import logging
import urllib.request
import urllib.error
from pathlib import Path
from typing import Optional, Dict, Any, Tuple
import joblib

# Suppress Hugging Face symlinks warning on Windows
os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")

# Logger setup
logger = logging.getLogger("model_manager")
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter("[%(asctime)s] [%(levelname)s] [ModelManager]: %(message)s"))
    logger.addHandler(handler)
logger.setLevel(logging.INFO)

# Base directory
BASE_DIR = Path(__file__).resolve().parent

# Automatically load environment variables from .env
def _load_env_file():
    env_paths = [
        BASE_DIR / ".env",
        Path.cwd() / ".env"
    ]
    for p in env_paths:
        if p.exists():
            try:
                with open(p, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            k = k.strip()
                            v = v.strip()
                            if k and k not in os.environ:
                                os.environ[k] = v
            except Exception as e:
                logger.warning(f"Could not parse .env file at {p}: {e}")
            break

_load_env_file()

# Hugging Face & V8 Configuration
HF_REPO_ID = os.environ.get("HF_REPO_ID", "rohitdesai205/compass").strip()
HF_MODEL_FILENAME = os.environ.get("HF_MODEL_FILENAME", "career_model_v8.pkl").strip()
HF_METADATA_FILENAME = os.environ.get("HF_METADATA_FILENAME", "career_model_v8_metadata.json").strip()
HF_TOKEN = os.environ.get("HF_TOKEN", "").strip() or None

# Resume Analyzer Hugging Face Configuration
HF_RESUME_MODEL_FILENAME = os.environ.get("HF_RESUME_MODEL_FILENAME", "resume_model.pkl").strip()
HF_RESUME_ENCODERS_FILENAME = os.environ.get("HF_RESUME_ENCODERS_FILENAME", "resume_encoders.pkl").strip()
HF_RESUME_META_FILENAME = os.environ.get("HF_RESUME_META_FILENAME", "resume_model_meta.json").strip()

# Local development override helper
def is_local_v8_mode() -> bool:
    """Checks whether local V8 model mode is requested via environment variable."""
    return os.environ.get("USE_LOCAL_V8_MODEL", "false").strip().lower() in ("true", "1", "yes")

USE_LOCAL_V8_MODEL = is_local_v8_mode()

# Resume model configuration
RESUME_MODEL_URL = os.environ.get("RESUME_MODEL_URL", "").strip()
V8_MODEL_URL = os.environ.get("V8_MODEL_URL", "").strip() # Retained for backward compat
MODEL_CACHE_DIR = os.environ.get("MODEL_CACHE_DIR", str(BASE_DIR))
MODEL_DOWNLOAD_TIMEOUT = int(os.environ.get("MODEL_DOWNLOAD_TIMEOUT", "300"))

# Expected canonical structure
EXPECTED_FEATURES_COUNT = 20
EXPECTED_CLASSES_COUNT = 35

EXPECTED_FEATURE_COLUMNS = [
    "Branch",
    "Specialization",
    "CGPA",
    "Academic_Performance",
    "Primary_Skill",
    "Secondary_Skill",
    "Programming_Languages",
    "Technical_Proficiency",
    "Certifications",
    "Interest_Area",
    "Career_Goal",
    "Preferred_Environment",
    "Target_Sector",
    "Expected_Salary",
    "Higher_Studies_Interest",
    "Research_Interest",
    "Problem_Solving_Level",
    "Communication_Level",
    "Preferred_Location",
    "Startup_Interest"
]

# In-memory singletons
_V8_MODEL = None
_V8_METADATA = None
_V8_SOURCE_INFO: Dict[str, Any] = {}


def _sanitize_message(message: str) -> str:
    """Masks secret tokens from error messages or logs to prevent token leakage."""
    if not message:
        return ""
    sanitized = str(message)
    if HF_TOKEN and HF_TOKEN in sanitized:
        sanitized = sanitized.replace(HF_TOKEN, "[REDACTED_HF_TOKEN]")
    import re
    sanitized = re.sub(r'hf_[A-Za-z0-9]{20,}', '[REDACTED_HF_TOKEN]', sanitized)
    return sanitized


def download_hf_artifact(repo_id: str, filename: str, token: Optional[str] = None, force_download: bool = False) -> str:
    """
    Downloads or retrieves from cache the specified file from a private Hugging Face repository.
    Uses official huggingface_hub library.
    Checks Hugging Face cache first to avoid repeated downloads and unnecessary network requests.
    """
    try:
        from huggingface_hub import hf_hub_download, try_to_load_from_cache
    except ImportError:
        err = "huggingface_hub is not installed. Please run: pip install huggingface_hub"
        logger.error(err)
        raise RuntimeError(err)

    # 1. Check local cache first if not forced download
    if not force_download:
        try:
            cached_path = try_to_load_from_cache(repo_id=repo_id, filename=filename)
            if cached_path is not None and isinstance(cached_path, str) and os.path.exists(cached_path):
                logger.info(f"Using cached file for '{filename}' from Hugging Face cache: {cached_path}")
                return cached_path
        except Exception as cache_err:
            logger.debug(f"Cache check error for {filename}: {cache_err}")

    logger.info(f"Resolving {filename} from Hugging Face repository: {repo_id}")
    try:
        # Online check + download / cache retrieval
        file_path = hf_hub_download(
            repo_id=repo_id,
            filename=filename,
            token=token,
            force_download=force_download
        )
        logger.info(f"Successfully resolved {filename} (path: {file_path})")
        return file_path
    except Exception as e:
        safe_err = _sanitize_message(str(e))
        logger.warning(f"Initial Hugging Face resolution for {filename} encountered: {safe_err}")

        # Check if local cached copy exists before failing completely
        try:
            cached_path = hf_hub_download(
                repo_id=repo_id,
                filename=filename,
                token=token,
                local_files_only=True
            )
            logger.info(f"Found cached local snapshot for {filename} at {cached_path}")
            return cached_path
        except Exception:
            pass

        if "401" in safe_err or "403" in safe_err or "Unauthorized" in safe_err:
            raise RuntimeError(
                f"Hugging Face authentication failed for repository '{repo_id}'. "
                "Ensure HF_TOKEN is valid, authenticated, and has read access to the private repository."
            ) from None
        elif "404" in safe_err or "not found" in safe_err.lower():
            raise RuntimeError(
                f"File '{filename}' or repository '{repo_id}' not found on Hugging Face."
            ) from None
        else:
            raise RuntimeError(
                f"Failed to download '{filename}' from Hugging Face repository '{repo_id}': {safe_err}"
            ) from None


# Backward-compatible alias for existing V8 code
download_v8_from_hf = download_hf_artifact


def ensure_v8_files() -> Tuple[str, str, str]:
    """
    Resolves the paths to the V8 model pickle and metadata JSON.
    Returns: (model_path, metadata_path, source_mode)

    Modes:
      - 'local': Uses local files at ml-service/models/v8/ (when USE_LOCAL_V8_MODEL=true)
      - 'huggingface': Downloads/caches from private Hugging Face repository
    """
    if is_local_v8_mode():
        local_model_path = BASE_DIR / "models" / "v8" / HF_MODEL_FILENAME
        local_meta_path = BASE_DIR / "models" / "v8" / HF_METADATA_FILENAME

        if not local_model_path.exists() or local_model_path.stat().st_size == 0:
            raise FileNotFoundError(
                f"Local V8 model requested (USE_LOCAL_V8_MODEL=true) but file not found at: {local_model_path}. "
                "Please ensure the file exists or set USE_LOCAL_V8_MODEL=false to load from Hugging Face."
            )
        if not local_meta_path.exists() or local_meta_path.stat().st_size == 0:
            raise FileNotFoundError(
                f"Local V8 metadata requested (USE_LOCAL_V8_MODEL=true) but file not found at: {local_meta_path}."
            )

        logger.info(f"Loaded local V8 model from: {local_model_path}")
        return str(local_model_path), str(local_meta_path), "local"

    # Production / Hugging Face Mode
    logger.info(f"Using Hugging Face Hub repository: {HF_REPO_ID}")
    meta_path = download_v8_from_hf(HF_REPO_ID, HF_METADATA_FILENAME, token=HF_TOKEN)
    model_path = download_v8_from_hf(HF_REPO_ID, HF_MODEL_FILENAME, token=HF_TOKEN)
    return str(model_path), str(meta_path), "huggingface"


def validate_v8_artifacts(model: Any, metadata: Dict[str, Any]) -> None:
    """
    Validates model and metadata integrity:
    1. Validates that metadata contains feature_columns (20 features)
    2. Validates that metadata contains classes (35 career classes)
    3. Validates model has predict_proba method
    4. Validates model has classes_ matching 35 classes
    5. Validates equivalence between model.classes_ and metadata['classes']
    """
    if not isinstance(metadata, dict) or not metadata:
        raise ValueError("V8 metadata is empty or not a valid dictionary.")

    features = metadata.get("feature_columns") or metadata.get("features", [])
    if len(features) != EXPECTED_FEATURES_COUNT:
        raise ValueError(
            f"V8 metadata feature count mismatch: expected {EXPECTED_FEATURES_COUNT}, got {len(features)}"
        )

    meta_classes = metadata.get("classes", [])
    if len(meta_classes) != EXPECTED_CLASSES_COUNT:
        raise ValueError(
            f"V8 metadata classes count mismatch: expected {EXPECTED_CLASSES_COUNT}, got {len(meta_classes)}"
        )

    if model is None:
        raise ValueError("V8 model object is None.")

    if not hasattr(model, "predict_proba") or not callable(model.predict_proba):
        raise ValueError("V8 model does not implement a callable predict_proba() method.")

    if not hasattr(model, "classes_"):
        raise ValueError("V8 model does not contain a classes_ attribute.")

    if len(model.classes_) != EXPECTED_CLASSES_COUNT:
        raise ValueError(
            f"V8 model classes_ count mismatch: expected {EXPECTED_CLASSES_COUNT}, got {len(model.classes_)}"
        )

    if set(model.classes_) != set(meta_classes):
        mismatched = set(model.classes_) ^ set(meta_classes)
        raise ValueError(
            f"V8 model classes do not match metadata classes. Discrepancies: {mismatched}"
        )

    logger.info(
        f"V8 Artifacts Validated Successfully: {len(model.classes_)} classes, "
        f"{len(features)} features, predict_proba available."
    )


def load_v8_metadata(force_reload: bool = False) -> Dict[str, Any]:
    """Loads and caches the V8 model metadata JSON singleton."""
    global _V8_METADATA
    if _V8_METADATA is not None and not force_reload:
        return _V8_METADATA

    _, meta_path, _ = ensure_v8_files()
    try:
        with open(meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)
        _V8_METADATA = meta
        return _V8_METADATA
    except Exception as e:
        safe_err = _sanitize_message(str(e))
        logger.error(f"Failed to load V8 metadata from {meta_path}: {safe_err}")
        raise RuntimeError(f"Failed to load V8 metadata: {safe_err}") from None


def load_v8_model(force_reload: bool = False):
    """
    Loads, validates, and caches the V8 scikit-learn Pipeline singleton.
    Executes once and reuses the in-memory instance for subsequent inference requests.
    """
    global _V8_MODEL, _V8_SOURCE_INFO
    if _V8_MODEL is not None and not force_reload:
        return _V8_MODEL

    model_path, meta_path, mode = ensure_v8_files()
    meta = load_v8_metadata(force_reload=force_reload)

    try:
        logger.info(f"Loading V8 model from: {model_path} (mode: {mode})")
        model = joblib.load(model_path)
        validate_v8_artifacts(model, meta)

        file_size = os.path.getsize(model_path) if os.path.exists(model_path) else 0
        _V8_SOURCE_INFO = {
            "mode": mode,
            "model_path": model_path,
            "metadata_path": meta_path,
            "size_bytes": file_size,
            "hf_repo_id": HF_REPO_ID if mode == "huggingface" else None
        }
        _V8_MODEL = model
        return _V8_MODEL
    except Exception as e:
        safe_err = _sanitize_message(str(e))
        logger.error(f"Failed to load V8 model from {model_path}: {safe_err}")
        _V8_MODEL = None
        raise RuntimeError(f"Failed to load V8 model: {safe_err}") from None


def is_v8_available() -> bool:
    """Checks whether the V8 model is successfully loaded and ready for predictions."""
    try:
        m = load_v8_model()
        return m is not None
    except Exception:
        return False


def get_v8_status() -> Dict[str, Any]:
    """Returns telemetry and health status for the V8 model without exposing secrets."""
    meta = _V8_METADATA or {}
    classes = meta.get("classes", [])
    features = meta.get("feature_columns") or meta.get("features", [])
    available = _V8_MODEL is not None

    return {
        "engine": "v8",
        "model_name": meta.get("model_name", "Career Compass V8 - HistGradientBoosting"),
        "available": available,
        "mode": _V8_SOURCE_INFO.get("mode", "local" if is_local_v8_mode() else "huggingface"),
        "hf_repo_id": HF_REPO_ID if not is_local_v8_mode() else None,
        "classes_count": len(classes) if classes else EXPECTED_CLASSES_COUNT,
        "features_count": len(features) if features else EXPECTED_FEATURES_COUNT,
        "model_size_bytes": _V8_SOURCE_INFO.get("size_bytes", 0),
        "predict_proba_available": hasattr(_V8_MODEL, "predict_proba") if _V8_MODEL else False
    }


def reset_v8_cache():
    """Resets the in-memory singleton cache (used primarily for automated testing)."""
    global _V8_MODEL, _V8_METADATA, _V8_SOURCE_INFO
    _V8_MODEL = None
    _V8_METADATA = None
    _V8_SOURCE_INFO = {}


# ==============================================================================
# Resume ML Model Streaming Loader (Preserved for Resume Analyzer)
# ==============================================================================

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
                    chunk = response.read(1024 * 1024)
                    if not chunk:
                        break
                    f.write(chunk)
                    downloaded += len(chunk)
                    if downloaded % (50 * 1024 * 1024) == 0:
                        logger.info(f"Downloaded {downloaded / (1024*1024):.1f} MB...")

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
    Ensures the specified model file exists locally for Resume Analyzer.
    If missing and a remote URL is provided, attempts an on-demand download.
    Returns (is_available, file_path).
    """
    local_path = os.path.join(MODEL_CACHE_DIR, filename)
    if os.path.exists(local_path) and os.path.getsize(local_path) > 0:
        return True, local_path

    if remote_url:
        logger.info(f"Model {filename} not found locally. Initiating download...")
        success = download_file_streaming(remote_url, local_path, timeout=MODEL_DOWNLOAD_TIMEOUT)
        if success:
            return True, local_path

    return False, local_path


# ==============================================================================
# Resume Analyzer Hugging Face & Artifact Management
# ==============================================================================

# In-memory singletons for Resume Analyzer
_RESUME_MODEL = None
_RESUME_ENCODERS = None
_RESUME_META = None
_RESUME_SOURCE_INFO: Dict[str, Any] = {}


def ensure_resume_analyzer_files() -> Tuple[str, str, str, str]:
    """
    Resolves the paths to the Resume Analyzer model, encoders, and metadata.
    Returns: (model_path, encoders_path, metadata_path, storage_mode)

    Modes:
      - 'local': Uses local files in ml-service/ (when USE_LOCAL_V8_MODEL=true)
      - 'huggingface': Resolves from private Hugging Face repository using caching and auth
    """
    local_model_path = BASE_DIR / HF_RESUME_MODEL_FILENAME
    local_enc_path = BASE_DIR / HF_RESUME_ENCODERS_FILENAME
    local_meta_path = BASE_DIR / HF_RESUME_META_FILENAME

    if is_local_v8_mode():
        if not local_model_path.exists() or local_model_path.stat().st_size == 0:
            raise FileNotFoundError(
                f"Local resume model requested (USE_LOCAL_V8_MODEL=true) but file not found at: {local_model_path}."
            )
        if not local_enc_path.exists() or local_enc_path.stat().st_size == 0:
            raise FileNotFoundError(
                f"Local resume encoders requested (USE_LOCAL_V8_MODEL=true) but file not found at: {local_enc_path}."
            )
        if not local_meta_path.exists() or local_meta_path.stat().st_size == 0:
            raise FileNotFoundError(
                f"Local resume metadata requested (USE_LOCAL_V8_MODEL=true) but file not found at: {local_meta_path}."
            )
        logger.info(f"Loaded local Resume Analyzer artifacts from: {BASE_DIR}")
        return str(local_model_path), str(local_enc_path), str(local_meta_path), "local"

    # Production / Hugging Face Mode
    logger.info(f"Resolving Resume Analyzer artifacts from Hugging Face Hub: {HF_REPO_ID}")
    try:
        model_path = download_hf_artifact(HF_REPO_ID, HF_RESUME_MODEL_FILENAME, token=HF_TOKEN)
        enc_path = download_hf_artifact(HF_REPO_ID, HF_RESUME_ENCODERS_FILENAME, token=HF_TOKEN)
        meta_path = download_hf_artifact(HF_REPO_ID, HF_RESUME_META_FILENAME, token=HF_TOKEN)
        return str(model_path), str(enc_path), str(meta_path), "huggingface"
    except Exception as e:
        # Fallback to local files if present in workspace and HF resolution fails
        if local_model_path.exists() and local_enc_path.exists() and local_meta_path.exists():
            safe_err = _sanitize_message(str(e))
            logger.warning(f"Hugging Face resolution failed ({safe_err}). Falling back to local resume artifacts in {BASE_DIR}.")
            return str(local_model_path), str(local_enc_path), str(local_meta_path), "local"
        raise


def load_resume_analyzer_artifacts(force_reload: bool = False) -> Tuple[Any, Any, Dict[str, Any], Dict[str, Any]]:
    """
    Loads, validates, and caches the Resume Analyzer artifacts:
      1. resume_model (scikit-learn classifier)
      2. resume_encoders (dict of label encoders)
      3. resume_meta (metadata dict containing 'features' and 'career_keywords')
      4. resume_source_info (dict containing storage, repository, file_size_bytes)

    Reuses the in-memory singletons across requests.
    """
    global _RESUME_MODEL, _RESUME_ENCODERS, _RESUME_META, _RESUME_SOURCE_INFO
    if _RESUME_MODEL is not None and _RESUME_ENCODERS is not None and _RESUME_META is not None and not force_reload:
        return _RESUME_MODEL, _RESUME_ENCODERS, _RESUME_META, _RESUME_SOURCE_INFO

    model_path, enc_path, meta_path, mode = ensure_resume_analyzer_files()

    try:
        logger.info(f"Loading Resume Analyzer artifacts (mode: {mode}, model: {model_path})")

        # Verify files exist and are non-empty
        for label, path_str in [("model", model_path), ("encoders", enc_path), ("metadata", meta_path)]:
            if not os.path.exists(path_str) or os.path.getsize(path_str) == 0:
                raise ValueError(f"Resume {label} file at '{path_str}' does not exist or is empty.")

        model = joblib.load(model_path)
        encoders = joblib.load(enc_path)
        with open(meta_path, "r", encoding="utf-8") as f:
            metadata = json.load(f)

        # Integrity validations
        if model is None:
            raise ValueError("Resume model object is None after loading.")
        if not isinstance(encoders, dict) or not encoders:
            raise ValueError("Resume encoders artifact is not a valid non-empty dictionary.")
        if not isinstance(metadata, dict) or not metadata:
            raise ValueError("Resume metadata artifact is not a valid non-empty dictionary.")
        if "features" not in metadata or "career_keywords" not in metadata:
            raise ValueError("Resume metadata missing required keys ('features' and/or 'career_keywords').")

        file_size = os.path.getsize(model_path) if os.path.exists(model_path) else 0

        _RESUME_SOURCE_INFO = {
            "mode": mode,
            "model_path": model_path,
            "encoders_path": enc_path,
            "metadata_path": meta_path,
            "size_bytes": file_size,
            "hf_repo_id": HF_REPO_ID if mode == "huggingface" else None
        }
        _RESUME_MODEL = model
        _RESUME_ENCODERS = encoders
        _RESUME_META = metadata

        logger.info(
            f"Resume Analyzer Artifacts Validated Successfully: mode={mode}, "
            f"size={file_size} bytes, features={len(metadata.get('features', []))}, "
            f"encoders={len(encoders)}"
        )
        return _RESUME_MODEL, _RESUME_ENCODERS, _RESUME_META, _RESUME_SOURCE_INFO
    except Exception as e:
        safe_err = _sanitize_message(str(e))
        logger.error(f"Failed to load Resume Analyzer artifacts: {safe_err}")
        _RESUME_MODEL = None
        _RESUME_ENCODERS = None
        _RESUME_META = None
        _RESUME_SOURCE_INFO = {}
        raise RuntimeError(f"Failed to load Resume Analyzer artifacts: {safe_err}") from None


def is_resume_model_available() -> bool:
    """Checks whether the Resume Analyzer artifacts are loaded and ready."""
    try:
        if _RESUME_MODEL is None:
            load_resume_analyzer_artifacts()
        return _RESUME_MODEL is not None
    except Exception:
        return False


def get_resume_model_status() -> Dict[str, Any]:
    """Returns telemetry and health status for the Resume Analyzer model."""
    is_loaded = _RESUME_MODEL is not None
    mode = _RESUME_SOURCE_INFO.get("mode")
    if not mode:
        mode = "local" if is_local_v8_mode() else "huggingface"

    return {
        "loaded": is_loaded,
        "file_present": is_loaded or bool(_RESUME_SOURCE_INFO.get("model_path") and os.path.exists(_RESUME_SOURCE_INFO.get("model_path", ""))),
        "file_size_bytes": _RESUME_SOURCE_INFO.get("size_bytes", 0),
        "storage": mode,
        "repository": HF_REPO_ID if mode == "huggingface" else None,
        "encoders_loaded": _RESUME_ENCODERS is not None,
        "metadata_loaded": _RESUME_META is not None
    }


def reset_resume_cache():
    """Resets the in-memory singleton cache for Resume Analyzer (used primarily in automated testing)."""
    global _RESUME_MODEL, _RESUME_ENCODERS, _RESUME_META, _RESUME_SOURCE_INFO
    _RESUME_MODEL = None
    _RESUME_ENCODERS = None
    _RESUME_META = None
    _RESUME_SOURCE_INFO = {}

