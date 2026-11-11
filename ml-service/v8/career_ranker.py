"""
Career Compass V8 — Recommendation Ranking Engine
Combines V8 ML inferences with multi-dimensional compatibility scoring
to rank the top 3–5 career pathways for a student with transparent explanations.
"""

import logging
from typing import Dict, Any, List, Optional
from .v8_engine import predict_v8, is_v8_available
from .knowledge_base import get_all_careers, get_career_metadata
from .compatibility_scorer import CompatibilityScorer, DEFAULT_WEIGHTS
from .explanation_engine import generate_career_explanation

logger = logging.getLogger("v8.ranker")


class CareerRanker:
    """
    Ranks career options using a hybrid of trained V8 ML inference,
    domain compatibility analysis, and personalized explanation generation.
    """

    def __init__(self, weights: Optional[Dict[str, float]] = None):
        self.scorer = CompatibilityScorer(weights=weights)

    def rank_careers(
        self,
        student_profile: Dict[str, Any],
        top_n: int = 5,
        assessment_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes the full V8 ranking workflow:
          Student Profile -> V8 ML Prediction -> 35 Career Evaluations ->
          Compatibility Scoring -> Final Ranking -> Explanations & Skill Gaps.
        """
        # 0. Unpack nested profile if wrapped in 'profile' or 'student_profile'
        if isinstance(student_profile, dict):
            if not assessment_id:
                assessment_id = student_profile.get("assessment_id") or student_profile.get("assessmentId")
            if "top_n" in student_profile and top_n == 5:
                try:
                    top_n = int(student_profile["top_n"])
                except Exception:
                    pass
            if "profile" in student_profile and isinstance(student_profile["profile"], dict):
                student_profile = student_profile["profile"]
            elif "student_profile" in student_profile and isinstance(student_profile["student_profile"], dict):
                student_profile = student_profile["student_profile"]

        if not assessment_id:
            import uuid
            assessment_id = f"asmt_{uuid.uuid4().hex[:12]}"

        # 1. Obtain V8 ML Predictions
        v8_result = predict_v8(student_profile)
        class_probs = v8_result.get("class_probabilities", {})

        all_careers = get_all_careers()
        if not all_careers:
            logger.error("No careers found in knowledge base.")
            return {
                "status": "error",
                "message": "Career knowledge base is unavailable",
                "recommendations": []
            }

        # 2. Evaluate Compatibility across all 35 categories
        evaluated_careers = []
        for career_name in all_careers:
            # Model score (default to 0.0 if class not present in ML output)
            ml_prob = class_probs.get(career_name, 0.0)

            # Compatibility scoring
            scoring_res = self.scorer.score_career_compatibility(
                career_name=career_name,
                student_profile=student_profile,
                ml_prediction_prob=ml_prob
            )

            # Explanation and skill gap analysis
            explanation_res = generate_career_explanation(
                career_name=career_name,
                student_profile=student_profile,
                scoring_result=scoring_res
            )

            meta = get_career_metadata(career_name) or {}

            evaluated_careers.append({
                "career_title": career_name,
                "career_description": meta.get("career_description", ""),
                "compatibility_score": scoring_res["final_compatibility_score"],
                "v8_model_score": round(ml_prob, 2),
                "component_scores": scoring_res["component_scores"],
                "compatibility_breakdown": scoring_res["component_scores"],
                "active_weights": scoring_res["active_weights"],
                "weighted_contributions": scoring_res.get("weighted_contributions", {}),
                "strongest_factors": scoring_res["strongest_factors"],
                "why_recommended": explanation_res["why_recommended"],
                "matching_skills": explanation_res["matching_skills"],
                "missing_skills": explanation_res["skill_gaps"]["missing_skills"],
                "skill_gaps": explanation_res["skill_gaps"],
                "suggested_next_steps": explanation_res["suggested_next_steps"],
                "recommended_certifications": explanation_res.get("recommended_certifications", []),
                "growth_opportunities": meta.get("career_development_opportunities", []),
                "related_alternatives": meta.get("related_alternative_careers", []),
                "completeness_pct": scoring_res["completeness_pct"]
            })

        # 3. Rank careers in descending order of compatibility score
        # Tie-breaker: V8 model score, then technical skills score
        evaluated_careers.sort(
            key=lambda c: (
                c["compatibility_score"],
                c["v8_model_score"],
                c["component_scores"].get("technical_skills", 0.0)
            ),
            reverse=True
        )

        # 4. Assign rank numbers
        for idx, item in enumerate(evaluated_careers):
            item["rank"] = idx + 1

        top_candidates = evaluated_careers[:max(1, min(top_n, len(evaluated_careers)))]
        primary = top_candidates[0]
        alternatives = top_candidates[1:]

        return {
            "status": "success",
            "assessment_id": assessment_id,
            "engine": "v8",
            "model_name": "Career Compass V8 - HistGradientBoosting",
            "v8_ml_top_prediction": v8_result.get("predicted_career"),
            "v8_ml_top_probability": v8_result.get("predicted_probability"),
            "total_careers_evaluated": len(evaluated_careers),
            "assessment_completeness_pct": primary.get("completeness_pct", 100.0),
            "ranking_weights_used": self.scorer.weights,
            "primary_career": primary,
            "alternative_careers": alternatives,
            "top_recommendations": top_candidates,
            # Backward-compatible top-level keys for existing clients
            "recommendation": primary["career_title"],
            "confidence": primary["compatibility_score"],
            "model_status": "v8_trained_model",
            "alternatives": [
                {"title": c["career_title"], "confidence": c["compatibility_score"]}
                for c in alternatives
            ]
        }


# Global singleton instance
default_ranker = CareerRanker()


def rank_careers_v8(
    student_profile: Dict[str, Any],
    top_n: int = 5,
    assessment_id: Optional[str] = None
) -> Dict[str, Any]:
    """Convenience helper to rank careers using the default V8 ranker singleton."""
    return default_ranker.rank_careers(student_profile=student_profile, top_n=top_n, assessment_id=assessment_id)

