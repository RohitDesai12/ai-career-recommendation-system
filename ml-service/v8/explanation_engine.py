"""
Career Compass V8 — Explanation and Skill Gap Engine
Generates transparent, personalized explanations and granular skill gap breakdowns
for every recommended career path based on the student's actual profile.
"""

import logging
from typing import Dict, Any, List, Optional
from .knowledge_base import get_career_metadata, normalize_text

logger = logging.getLogger("v8.explanation")


def generate_career_explanation(
    career_name: str,
    student_profile: Dict[str, Any],
    scoring_result: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Synthesizes personalized reasoning, skill classification, and actionable learning steps
    for a recommended career path.
    """
    career_meta = get_career_metadata(career_name) or {}
    matched_skills = scoring_result.get("matched_skills", [])
    missing_skills = scoring_result.get("missing_skills", [])
    strongest_factors = scoring_result.get("strongest_factors", ["Technical Skill Alignment"])
    component_scores = scoring_result.get("component_scores", {})

    branch = str(student_profile.get("Branch", "")).strip()
    primary_skill = str(student_profile.get("Primary_Skill", "")).strip()
    interest = str(student_profile.get("Interest_Area", "")).strip()
    career_goal = str(student_profile.get("Career_Goal", "")).strip()

    # -------------------------------------------------------------
    # 1. Why this career was recommended (Personalized Synthesis)
    # -------------------------------------------------------------
    reasons = []
    if primary_skill and primary_skill in matched_skills:
        reasons.append(f"Your primary proficiency in {primary_skill} strongly underpins the technical core of {career_name}.")
    elif matched_skills:
        top_matches_str = ", ".join(matched_skills[:3])
        reasons.append(f"Your hands-on skills in {top_matches_str} align directly with industry expectations for {career_name}.")

    if interest:
        reasons.append(f"Your focus on '{interest}' matches the core challenges and problem space tackled in this domain.")

    if branch:
        reasons.append(f"Your academic foundation in {branch} provides the requisite analytical and engineering principles for this trajectory.")

    if career_goal:
        reasons.append(f"Your professional aspiration to '{career_goal}' is well-served by career opportunities in {career_name}.")

    if not reasons:
        reasons.append(f"Your overall profile and assessment choices demonstrate solid multidimensional alignment with {career_name}.")

    why_recommended = " ".join(reasons)

    # -------------------------------------------------------------
    # 2. Skill Gap Classification
    # -------------------------------------------------------------
    # Already possessed: matched skills
    already_possessed = list(matched_skills)

    # Needs improvement: intermediate/secondary skills or foundational languages
    rec_langs = career_meta.get("recommended_programming_languages", [])
    secondary_skill = str(student_profile.get("Secondary_Skill", "")).strip()

    needs_improvement = []
    if secondary_skill and secondary_skill not in already_possessed:
        needs_improvement.append(secondary_skill)

    for lang in rec_langs[:2]:
        if lang not in already_possessed and lang not in needs_improvement:
            needs_improvement.append(f"{lang} (Advanced Proficiency)")

    # Missing skills: core required skills student has not yet acquired
    clean_missing = [s for s in missing_skills if s not in already_possessed and s not in needs_improvement][:6]

    # -------------------------------------------------------------
    # 3. Actionable Next Steps / Roadmap Milestones
    # -------------------------------------------------------------
    next_steps = []
    beginner_reqs = career_meta.get("beginner_learning_requirements", [])
    useful_certs = career_meta.get("useful_certifications", [])

    if clean_missing:
        next_steps.append(f"Master foundational tooling: Focus on learning {clean_missing[0]} and {clean_missing[1] if len(clean_missing) > 1 else 'related libraries'}.")
    elif beginner_reqs:
        next_steps.append(f"Strengthen foundations: Focus on {beginner_reqs[0]}.")

    if useful_certs:
        next_steps.append(f"Industry Credential: Work towards the {useful_certs[0]} to validate your competency.")

    next_steps.append(f"Practical Portfolio: Build an end-to-end project addressing real-world {career_name} challenges and publish your code with documentation.")
    next_steps.append("Interview Readiness: Complete targeted mock interview rounds and algorithm drills on Career Compass.")

    return {
        "why_recommended": why_recommended,
        "matching_skills": already_possessed,
        "matching_interests": [interest] if interest else [],
        "relevant_academic_background": branch or "Engineering Discipline",
        "strongest_compatibility_factors": strongest_factors,
        "skill_gaps": {
            "already_possessed": already_possessed,
            "needs_improvement": needs_improvement[:3],
            "missing_skills": clean_missing
        },
        "suggested_next_steps": next_steps,
        "recommended_certifications": useful_certs[:2]
    }

