"""
Career Compass V8 — Career Metadata Knowledge Base Interface
Provides structured access, fast lookup, and semantic skill matching for all 35 careers.
"""

import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple, Set

logger = logging.getLogger("v8.knowledge_base")

# Load knowledge base once and cache in memory
_KB_CACHE: Optional[Dict[str, Any]] = None
_KB_PATH = Path(__file__).resolve().parent / "career_knowledge_base.json"


def _load_kb() -> Dict[str, Any]:
    global _KB_CACHE
    if _KB_CACHE is not None:
        return _KB_CACHE
    
    if not _KB_PATH.exists():
        logger.error(f"Career knowledge base file not found at: {_KB_PATH}")
        return {}
    
    try:
        with open(_KB_PATH, "r", encoding="utf-8") as f:
            _KB_CACHE = json.load(f)
            logger.info(f"Loaded knowledge base for {len(_KB_CACHE)} careers.")
            return _KB_CACHE
    except Exception as e:
        logger.error(f"Failed to load career knowledge base: {e}")
        return {}


def get_all_careers() -> List[str]:
    """Returns a list of all 35 career names available in the knowledge base."""
    kb = _load_kb()
    return list(kb.keys())


def get_career_metadata(career_name: str) -> Optional[Dict[str, Any]]:
    """Fetches metadata dictionary for a specific career."""
    kb = _load_kb()
    if career_name in kb:
        return kb[career_name]
    
    # Case-insensitive / substring fallback
    c_lower = career_name.lower().strip()
    for name, data in kb.items():
        if name.lower().strip() == c_lower or c_lower in name.lower() or name.lower() in c_lower:
            return data
    return None


def get_all_career_metadata() -> Dict[str, Any]:
    """Returns the entire dictionary of all 35 careers."""
    return _load_kb()


def normalize_text(text: str) -> str:
    """Normalizes text for fuzzy matching by converting & to and, lowercasing, and removing punctuation."""
    if not text:
        return ""
    import re
    cleaned = str(text).lower().replace("&", " and ").replace("/", " ").replace("-", " ")
    cleaned = re.sub(r"[^a-z0-9\s]", "", cleaned)
    return " ".join(cleaned.split())


def is_skill_match(student_skill: str, target_skill: str) -> bool:
    """Checks whether a student skill matches a target career skill semantically or textually."""
    s_norm = normalize_text(student_skill)
    t_norm = normalize_text(target_skill)
    if not s_norm or not t_norm:
        return False
    if s_norm == t_norm:
        return True

    # Exact substring match
    if s_norm in t_norm or t_norm in s_norm:
        return True

    s_tokens = set(s_norm.split())
    t_tokens = set(t_norm.split())

    stop_words = {"and", "or", "in", "of", "for", "with", "the", "to", "systems", "engineering", "design", "development"}
    meaningful_s = s_tokens - stop_words
    meaningful_t = t_tokens - stop_words

    if meaningful_s and meaningful_t:
        # If meaningful tokens of student skill appear in target skill
        if meaningful_s.issubset(t_tokens) or meaningful_t.issubset(s_tokens):
            return True

        # Domain acronyms & synonyms
        synonyms = [
            ({"ros", "ros2", "robotics"}, {"robotics", "ros", "ros 2", "autonomous systems"}),
            ({"cad"}, {"autocad", "solidworks", "catia", "cad"}),
            ({"embedded", "embedded c", "microcontrollers"}, {"embedded systems", "microcontrollers", "firmware", "device drivers"}),
            ({"plc", "scada"}, {"industrial automation", "plc and scada", "plc", "scada"}),
            ({"matlab"}, {"matlab", "simulink", "matlab simulink"}),
            ({"solidworks"}, {"mechanical design", "cad", "solidworks", "3d modeling"}),
            ({"catia"}, {"mechanical design", "cad", "catia"}),
            ({"ansys"}, {"finite element analysis", "fea", "ansys", "simulation"}),
            ({"verilog", "vhdl"}, {"vlsi", "fpga", "verilog", "digital electronics", "circuit design"}),
            ({"ai", "artificial intelligence"}, {"machine learning", "deep learning", "ai", "artificial intelligence"}),
            ({"ml", "machine learning"}, {"artificial intelligence", "data science", "machine learning"}),
            ({"ui", "ux", "ui ux"}, {"user experience", "product design", "ui ux"})
        ]
        for syn_a, syn_b in synonyms:
            if (any(a in s_norm for a in syn_a) and any(b in t_norm for b in syn_b)) or \
               (any(a in t_norm for a in syn_a) and any(b in s_norm for b in syn_b)):
                return True

    return False


def match_student_skills(
    student_skills: List[str],
    career_skills: List[str]
) -> Tuple[List[str], List[str]]:
    """
    Compares student's possessed skills with career required skills.
    Returns: (matched_skills, missing_skills).
    """
    matched = []
    missing = []

    for c_skill in career_skills:
        found = False
        for s_skill in student_skills:
            if is_skill_match(s_skill, c_skill):
                matched.append(c_skill)
                found = True
                break
        if not found:
            missing.append(c_skill)

    return matched, missing

