import React from "react";
import { LegalTrustLayout } from "./legal-trust-layout";
import { Link } from "react-router";
import { AlertTriangle, Briefcase, GraduationCap, ExternalLink } from "lucide-react";

export function DisclaimerPage() {
  return (
    <LegalTrustLayout
      title="Platform Disclaimer"
      subtitle="Important legal disclaimers regarding educational advice, algorithmic career scoring, external job links, and third-party services."
      lastUpdated="November 2026"
      badge="Legal Disclosures"
    >
      <div className="space-y-8">
        
        {/* Callout */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3.5 not-prose">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-950 space-y-1">
            <span className="font-bold block">Advisory & Educational Purpose Only</span>
            <p className="leading-relaxed">
              All content, recommendations, test results, roadmaps, and matching scores provided by Career Compass are for educational and self-assessment guidance only. They do not constitute formal legal, career, or recruitment guarantees.
            </p>
          </div>
        </div>

        {/* 1. No Guarantee of Employment */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            1. No Guarantee of Employment or Hiring
          </h2>
          <p>
            Career Compass is an educational career intelligence and self-discovery platform. We are <strong>not</strong> an employment agency, staffing firm, job broker, or recruitment portal:
          </p>
          <ul className="space-y-1.5 text-sm text-slate-600 list-disc pl-5">
            <li>We do not interview, screen, select, hire, or place candidates on behalf of any employer.</li>
            <li>Completing assessments, building roadmaps, achieving high ATS scores, or practicing mock interviews does not guarantee you will receive an interview invitation, job offer, or placement.</li>
            <li>All hiring decisions, eligibility assessments, compensation negotiations, and onboarding procedures rest solely with the prospective hiring companies.</li>
          </ul>
        </section>

        {/* 2. External Job Links Disclaimer */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            2. External Job Links & ATS Portals
          </h2>
          <p>
            The Jobs module surfaces real-time and curated job openings aggregated from publicly accessible employer career boards (such as Greenhouse and Lever). Please note:
          </p>
          <ul className="space-y-1.5 text-sm text-slate-600 list-disc pl-5">
            <li>Job openings, eligibility criteria, application deadlines, and salary estimates are maintained and updated by the respective hiring companies.</li>
            <li>Clicking "Apply on Company Site" redirects you to an external third-party domain. Career Compass is not responsible for the availability, accuracy, or functionality of external career pages.</li>
            <li>Career Compass never charges students for applying to jobs. Beware of fraudulent parties posing as recruiters.</li>
          </ul>
        </section>

        {/* 3. External Courses & Educational Content */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            3. External Courses & Certification Links
          </h2>
          <p>
            Our Courses module indexes educational courses from third-party platforms (such as Coursera, Udemy, and edX). Career Compass does not produce, grade, or certify external courses:
          </p>
          <ul className="space-y-1.5 text-sm text-slate-600 list-disc pl-5">
            <li>Course pricing, subscription plans, free audits, and refund terms are subject to the third-party provider's policies.</li>
            <li>Any certificates of completion are issued directly by the provider or university partner, not by Career Compass.</li>
          </ul>
        </section>

        {/* 4. AI & Heuristic Scores Disclaimer */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            4. Nature of AI & Algorithmic Scores
          </h2>
          <p>
            All compatibility scores, ATS percentages, and mock interview grades represent mathematical heuristics and language model assessments based on entered information:
          </p>
          <ul className="space-y-1.5 text-sm text-slate-600 list-disc pl-5">
            <li>Scores should be treated as guidance to help identify strengths and missing skills.</li>
            <li>AI evaluations may fail to capture unique non-traditional backgrounds, domain nuances, or specific company preferences.</li>
            <li>For full information on how our AI systems operate, review our <Link to="/ai-transparency" className="text-indigo-600 underline font-semibold">AI Transparency Page</Link>.</li>
          </ul>
        </section>

        {/* 5. Contact */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            5. Inquiries & Corrections
          </h2>
          <p>
            If you identify outdated job links or incorrect information on the platform, please notify us through our <Link to="/contact?category=technical_issue" className="text-indigo-600 underline font-semibold">Contact Portal</Link> so we can review and correct our records.
          </p>
        </section>

      </div>
    </LegalTrustLayout>
  );
}

export default DisclaimerPage;

