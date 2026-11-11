"""
Career Compass V8 Intelligent Career Recommendation & Ranking System
"""
from .knowledge_base import (
    get_career_metadata,
    get_all_careers,
    get_all_career_metadata,
    match_student_skills
)
from .v8_engine import (
    predict_v8,
    is_v8_available,
    load_v8_model,
    load_v8_metadata
)
from .compatibility_scorer import CompatibilityScorer, DEFAULT_WEIGHTS
from .explanation_engine import generate_career_explanation
from .career_ranker import CareerRanker, rank_careers_v8
