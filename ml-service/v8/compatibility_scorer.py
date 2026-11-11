"""
Career Compass V8 — Compatibility Scoring Engine
Calculates normalized multi-dimensional compatibility scores across 6 separate criteria:
  A. ML prediction compatibility (15%)
  B. Technical skill compatibility (30%)
  C. Interest compatibility (25%)
  D. Academic compatibility (10%)
  E. Career preference compatibility (15%)
  F. Career readiness (5%)

Total: 100%. Configurable, handles missing information with dynamic renormalization.
Never labels compatibility scores as probabilities.
"""

import os
import re
import logging
from typing import Dict, Any, List, Optional, Tuple
from .knowledge_base import (
    get_career_metadata,
    match_student_skills,
    is_skill_match,
    normalize_text
)

logger = logging.getLogger("v8.scorer")

# Default Configurable Weights (Initial heuristic weights, total = 1.00)
DEFAULT_WEIGHTS = {
    "ml_prediction": 0.15,
    "technical_skills": 0.30,
    "interest": 0.25,
    "academic": 0.10,
    "career_preference": 0.15,
    "career_readiness": 0.05
}


class CompatibilityScorer:
    """
    Computes explainable, multi-factor career compatibility scores.
    """

    def __init__(self, weights: Optional[Dict[str, float]] = None):
        self.weights = weights or DEFAULT_WEIGHTS.copy()
        # Ensure weights sum to 1.0
        total = sum(self.weights.values())
        if total > 0 and abs(total - 1.0) > 1e-4:
            self.weights = {k: v / total for k, v in self.weights.items()}

    def score_career_compatibility(
        self,
        career_name: str,
        student_profile: Dict[str, Any],
        ml_prediction_prob: float = 0.0
    ) -> Dict[str, Any]:
        """
        Calculates compatibility between a student profile and a specific career.
        Returns:
            - career_name
            - final_compatibility_score (0-100)
            - component_scores (dict with individual 0-100 metrics)
            - active_weights (renormalized weights used)
            - matched_skills (list)
            - missing_skills (list)
            - strongest_factors (list)
            - completeness_pct (float)
        """
        # Unpack nested profile if wrapped in 'profile' or 'student_profile'
        if isinstance(student_profile, dict):
            if "profile" in student_profile and isinstance(student_profile["profile"], dict):
                student_profile = student_profile["profile"]
            elif "student_profile" in student_profile and isinstance(student_profile["student_profile"], dict):
                student_profile = student_profile["student_profile"]

        career_meta = get_career_metadata(career_name)
        if not career_meta:
            logger.warning(f"No metadata found for career: {career_name}")
            return {
                "career_name": career_name,
                "final_compatibility_score": round(ml_prediction_prob, 2),
                "component_scores": {"ml_prediction": round(ml_prediction_prob, 2)},
                "active_weights": {"ml_prediction": 1.0},
                "matched_skills": [],
                "missing_skills": [],
                "strongest_factors": ["ML Model Prediction"],
                "completeness_pct": 0.0
            }

        # Track active components and scores
        raw_scores = {}
        active_status = {}

        # ---------------------------------------------------------
        # A. ML Prediction Compatibility (0-100)
        # ---------------------------------------------------------
        raw_scores["ml_prediction"] = min(100.0, max(0.0, float(ml_prediction_prob)))
        active_status["ml_prediction"] = True

        # ---------------------------------------------------------
        # B. Technical Skill Compatibility (0-100)
        # ---------------------------------------------------------
        student_skills = self._extract_student_skills(student_profile)
        req_skills = career_meta.get("required_technical_skills", [])
        rec_langs = career_meta.get("recommended_programming_languages", [])

        if student_skills:
            matched_skills, missing_skills = match_student_skills(student_skills, req_skills)
            matched_langs, _ = match_student_skills(student_skills, rec_langs)

            # Distinguish software-centric careers from core/hardware/process engineering
            is_software_career = any(term in career_name.lower() for term in ["developer", "software", "frontend", "backend", "full stack", "web"])

            if is_software_career:
                req_coverage = (len(matched_skills) / max(len(req_skills), 1)) * 60.0
                lang_coverage = (len(matched_langs) / max(len(rec_langs), 1)) * 40.0
                skill_score = min(100.0, req_coverage + lang_coverage)
            else:
                # Core engineering, robotics, hardware, civil, biotech, chemical:
                # Technical domain skills are primary (80%), programming is secondary bonus (20%)
                req_coverage = (len(matched_skills) / max(len(req_skills), 1)) * 80.0
                lang_coverage = (len(matched_langs) / max(len(rec_langs), 1)) * 20.0
                skill_score = min(100.0, req_coverage + lang_coverage)

            # Boost if primary skill matches required skills directly
            primary_skill = str(student_profile.get("Primary_Skill", "")).strip()
            if primary_skill and any(is_skill_match(primary_skill, s) for s in req_skills):
                skill_score = min(100.0, skill_score + 20.0)

            # Boost if secondary skill matches required skills directly
            secondary_skill = str(student_profile.get("Secondary_Skill", "")).strip()
            if secondary_skill and any(is_skill_match(secondary_skill, s) for s in req_skills):
                skill_score = min(100.0, skill_score + 10.0)

            raw_scores["technical_skills"] = round(skill_score, 2)
            active_status["technical_skills"] = True
        else:
            raw_scores["technical_skills"] = 50.0  # neutral placeholder
            active_status["technical_skills"] = False
            matched_skills, missing_skills = [], req_skills

        # ---------------------------------------------------------
        # C. Interest Compatibility (0-100)
        # ---------------------------------------------------------
        student_interest = str(student_profile.get("Interest_Area", "")).strip()
        career_goal = str(student_profile.get("Career_Goal", "")).strip()
        relevant_interests = career_meta.get("relevant_interest_areas", [])

        has_interest_data = bool(student_interest or career_goal)
        if has_interest_data:
            interest_score = 0.0
            if student_interest:
                s_int_norm = normalize_text(student_interest)
                s_tokens = set(s_int_norm.split()) - {"and", "or", "in", "of", "for", "the", "to", "systems", "engineering"}

                # 1. Exact phrase or substring match
                if any(s_int_norm in normalize_text(i) or normalize_text(i) in s_int_norm for i in relevant_interests):
                    interest_score += 65.0
                else:
                    # 2. Token overlap match
                    matched_interest = False
                    for ri in relevant_interests:
                        r_tokens = set(normalize_text(ri).split()) - {"and", "or", "in", "of", "for", "the", "to", "systems", "engineering"}
                        if s_tokens and r_tokens and (s_tokens.issubset(r_tokens) or r_tokens.issubset(s_tokens) or (s_tokens & r_tokens)):
                            interest_score += 55.0
                            matched_interest = True
                            break
                    if not matched_interest:
                        interest_score += 15.0  # general exploration baseline

            if career_goal:
                # Semantic alignment with career description / nature
                desc_norm = normalize_text(career_meta.get("career_description", ""))
                goal_norm = normalize_text(career_goal)
                if any(w in desc_norm for w in goal_norm.split() if len(w) > 3):
                    interest_score += 30.0
                else:
                    interest_score += 15.0

            # Special case alignment for Research / Startup / Higher Studies
            if "research" in normalize_text(career_name) and str(student_profile.get("Research_Interest", "")).lower() == "high":
                interest_score += 10.0
            if "startup" in normalize_text(career_name) and str(student_profile.get("Startup_Interest", "")).lower() in ("high", "moderate"):
                interest_score += 10.0

            raw_scores["interest"] = min(100.0, round(interest_score, 2))
            active_status["interest"] = True
        else:
            raw_scores["interest"] = 50.0
            active_status["interest"] = False

        # ---------------------------------------------------------
        # D. Academic Compatibility (0-100)
        # ---------------------------------------------------------
        student_branch = str(student_profile.get("Branch", "")).strip()
        student_spec = str(student_profile.get("Specialization", "")).strip()
        academic_perf = str(student_profile.get("Academic_Performance", "")).strip().lower()
        cgpa = student_profile.get("CGPA")

        rel_branches = career_meta.get("relevant_academic_backgrounds", [])
        rel_specs = career_meta.get("relevant_specializations", [])

        has_academic_data = bool(student_branch or student_spec or cgpa is not None)
        if has_academic_data:
            academic_score = 0.0
            if student_branch:
                b_norm = normalize_text(student_branch)
                if any(b_norm in normalize_text(b) or normalize_text(b) in b_norm for b in rel_branches):
                    academic_score += 55.0
                elif any(w in [normalize_text(b) for b in rel_branches] for w in b_norm.split() if len(w) > 3):
                    academic_score += 35.0
                else:
                    academic_score += 20.0  # Cross-disciplinary engineering baseline

            if student_spec:
                s_norm = normalize_text(student_spec)
                if any(s_norm in normalize_text(s) or normalize_text(s) in s_norm for s in rel_specs):
                    academic_score += 30.0
                else:
                    academic_score += 15.0

            # Academic standing bonus (max 15 pts)
            if cgpa:
                try:
                    c_val = float(cgpa)
                    if c_val >= 8.5: academic_score += 15.0
                    elif c_val >= 7.0: academic_score += 10.0
                    else: academic_score += 5.0
                except (ValueError, TypeError):
                    pass
            elif academic_perf in ("excellent", "good"):
                academic_score += 12.0

            raw_scores["academic"] = min(100.0, round(academic_score, 2))
            active_status["academic"] = True
        else:
            raw_scores["academic"] = 50.0
            active_status["academic"] = False

        # ---------------------------------------------------------
        # E. Career Preference Compatibility (0-100)
        # ---------------------------------------------------------
        pref_env = str(student_profile.get("Preferred_Environment", "")).strip()
        target_sector = str(student_profile.get("Target_Sector", "")).strip()

        has_pref_data = bool(pref_env or target_sector)
        if has_pref_data:
            pref_score = 40.0  # Baseline neutral
            desc_text = normalize_text(career_meta.get("career_description", "") + " " + " ".join(career_meta.get("relevant_specializations", [])))

            if pref_env:
                p_norm = normalize_text(pref_env)
                if p_norm in desc_text or any(w in desc_text for w in p_norm.split() if len(w) > 3):
                    pref_score += 30.0
                else:
                    pref_score += 15.0

            if target_sector:
                t_norm = normalize_text(target_sector)
                if t_norm in desc_text or any(w in desc_text for w in t_norm.split() if len(w) > 3):
                    pref_score += 30.0
                else:
                    pref_score += 15.0

            raw_scores["career_preference"] = min(100.0, round(pref_score, 2))
            active_status["career_preference"] = True
        else:
            raw_scores["career_preference"] = 50.0
            active_status["career_preference"] = False

        # ---------------------------------------------------------
        # F. Career Readiness (0-100)
        # ---------------------------------------------------------
        tech_prof = str(student_profile.get("Technical_Proficiency", "")).strip().lower()
        prob_solving = str(student_profile.get("Problem_Solving_Level", "")).strip().lower()
        comm_level = str(student_profile.get("Communication_Level", "")).strip().lower()

        has_readiness_data = bool(tech_prof or prob_solving or comm_level)
        if has_readiness_data:
            readiness_pts = 0.0

            # Technical proficiency (40 pts)
            if tech_prof == "expert": readiness_pts += 40.0
            elif tech_prof == "advanced": readiness_pts += 34.0
            elif tech_prof == "intermediate": readiness_pts += 26.0
            else: readiness_pts += 18.0

            # Problem solving (35 pts)
            if prob_solving in ("expert", "advanced"): readiness_pts += 35.0
            elif prob_solving in ("intermediate", "good"): readiness_pts += 26.0
            else: readiness_pts += 16.0

            # Communication (25 pts)
            if comm_level in ("excellent", "advanced"): readiness_pts += 25.0
            elif comm_level in ("good", "intermediate"): readiness_pts += 20.0
            else: readiness_pts += 12.0

            raw_scores["career_readiness"] = min(100.0, round(readiness_pts, 2))
            active_status["career_readiness"] = True
        else:
            raw_scores["career_readiness"] = 50.0
            active_status["career_readiness"] = False

        # ---------------------------------------------------------
        # Dynamic Weight Renormalization
        # ---------------------------------------------------------
        active_weights = {}
        total_active_weight = sum(self.weights[k] for k, is_active in active_status.items() if is_active)

        if total_active_weight > 0:
            for k in self.weights:
                if active_status.get(k, False):
                    active_weights[k] = round(self.weights[k] / total_active_weight, 4)
                else:
                    active_weights[k] = 0.0
        else:
            active_weights = {k: round(1.0 / len(self.weights), 4) for k in self.weights}

        # Calculate individual weighted contributions
        weighted_contributions = {
            k: round(raw_scores[k] * active_weights[k], 4)
            for k in self.weights
        }

        # Calculate final weighted compatibility score as the sum of weighted contributions
        final_score = round(min(100.0, max(0.0, sum(weighted_contributions.values()))), 2)

        # Identify strongest compatibility factors
        sorted_components = sorted(
            [(k, raw_scores[k]) for k in self.weights if active_status.get(k, False)],
            key=lambda x: x[1],
            reverse=True
        )

        factor_labels = {
            "ml_prediction": "ML Model Prediction",
            "technical_skills": "Technical Skill Alignment",
            "interest": "Domain Interest Alignment",
            "academic": "Academic Background Alignment",
            "career_preference": "Career Goals & Preference Fit",
            "career_readiness": "Execution & Problem-Solving Readiness"
        }
        strongest_factors = [factor_labels.get(k, k) for k, score in sorted_components if score >= 60.0][:3]
        if not strongest_factors and sorted_components:
            strongest_factors = [factor_labels.get(sorted_components[0][0], sorted_components[0][0])]

        # Assessment completeness percentage
        active_count = sum(1 for is_active in active_status.values() if is_active)
        completeness_pct = round((active_count / len(active_status)) * 100.0, 1)

        return {
            "career_name": career_name,
            "final_compatibility_score": final_score,
            "component_scores": raw_scores,
            "compatibility_breakdown": raw_scores,
            "active_weights": active_weights,
            "weighted_contributions": weighted_contributions,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "strongest_factors": strongest_factors,
            "completeness_pct": completeness_pct
        }

    def _extract_student_skills(self, profile: Dict[str, Any]) -> List[str]:
        """Gathers all skill mentions from student profile into a clean unique list."""
        skills = []
        for key in ("Primary_Skill", "Secondary_Skill", "Programming_Languages", "Certifications"):
            val = profile.get(key)
            if not val:
                val = profile.get(key.lower())
            if val:
                val_str = str(val).strip()
                if val_str and val_str.lower() != "none" and val_str.lower() != "nan":
                    # Split comma-separated values if present
                    if "," in val_str:
                        skills.extend([s.strip() for s in val_str.split(",") if s.strip()])
                    else:
                        skills.append(val_str)
        return list(dict.fromkeys(skills))

