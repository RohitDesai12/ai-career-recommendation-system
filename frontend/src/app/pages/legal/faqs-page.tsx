import React, { useState } from "react";
import { LegalTrustLayout } from "./legal-trust-layout";
import { Link } from "react-router";
import { HelpCircle, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

export function FAQsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqItems = [
    {
      q: "Is Career Compass free for students to use?",
      a: "Yes. Career Compass is designed to empower students and aspiring software professionals. Access to career assessments, roadmaps, the resume studio, verified job discovery, and interview practice is completely free. We never charge students for applying to verified job opportunities."
    },
    {
      q: "How does the Career Assessment generate role recommendations?",
      a: "The assessment evaluates your responses to real-world scenarios, preferred collaboration styles, and technical trade-offs across four key dimensions: Analytical/Systemic, Creative/Design, Execution/Reliability, and Leadership/Strategy. These dimensions are matched against standard competency profiles for roles like Full Stack Developer, Data Engineer, and DevOps Engineer."
    },
    {
      q: "What does my Job Matching percentage mean?",
      a: "The matching score (e.g. 88%) is a mathematical calculation comparing the categorized technical skills on your student profile with the skills and keywords extracted from the employer's official job posting. It serves as an advisory indicator of how closely your technical background matches the written requirements."
    },
    {
      q: "Does a high Resume ATS score guarantee I will be shortlisted?",
      a: "No. Our ATS Analyzer benchmarks your resume against standard industry formatting rules, keyword density, and clear section segmentation. While a 90+ score confirms your resume is machine-readable and keyword-aligned, final shortlisting is performed by the hiring company's talent acquisition team."
    },
    {
      q: "Why does the 'Apply' button redirect me to an external company website?",
      a: "Career Compass indexes real-time jobs directly from official enterprise ATS boards (such as Greenhouse and Lever). To ensure full compliance with employer hiring pipelines and data privacy, you complete your actual application on the employer's official careers domain. Career Compass never acts as an intermediary or proxy applicant."
    },
    {
      q: "How does the Application Tracker work?",
      a: "When you apply for a job via external portals, you can track it in your private Application Tracker (under the Jobs tab). You can update your progress through stages such as 'Submitted', 'Interviewing', 'Offer Received', or 'Archived', and record notes for your preparation."
    },
    {
      q: "How does Career Compass use AI in Mock Interviews?",
      a: "Our Interactive Mock Interview generates adaptive technical questions tailored to your chosen role. When you respond, the system uses natural language models (via the Groq API) to evaluate your answer's clarity, technical completeness, and structure, returning constructive suggestions to improve your communication."
    },
    {
      q: "Are my uploaded resumes and profile details sold to recruiters?",
      a: "No. We never sell, rent, or trade student personal data to third-party recruiters or advertising brokers. The Recruiter Portal was completely eliminated in Phase 1; all candidate visibility is student-controlled through your privacy settings."
    },
    {
      q: "How can I download a copy of all my data (Data Portability)?",
      a: "You can download a complete, machine-readable JSON archive of your personal records at any time. Simply navigate to Settings → Data & Account Management → click 'Download JSON Archive'. The export includes your account details, profile, resumes, assessment results, and application records."
    },
    {
      q: "What happens if I request account deletion?",
      a: "Account deletion is permanent. When you confirm deletion with your password, our system permanently purges your profile, all uploaded and built resumes, assessment attempts, roadmaps, and course progress from our active database. Submitted application logs are anonymized so employers retain non-identifiable pipeline metrics."
    },
    {
      q: "Can I choose which parts of my profile are visible on my public portfolio?",
      a: "Yes. In Settings → Privacy & Visibility, you can choose whether your profile is publicly accessible via a shareable link. You can also individually toggle the visibility of your email, phone, education, work experience, projects, skills, and certifications."
    },
    {
      q: "How does Career Compass comply with India's DPDP Act, 2023?",
      a: "We implement purpose limitation, data minimization, unambiguous consent capture upon registration, granular cookie controls, verifiable rights to access, rectification, and erasure, and a dedicated Grievance Redressal mechanism."
    }
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <LegalTrustLayout
      title="Frequently Asked Questions (FAQs)"
      subtitle="Direct, factual answers to common questions about platform functionality, scoring algorithms, privacy rights, and employment policies."
      lastUpdated="November 2026"
      badge="Verified Answers"
    >
      <div className="space-y-8">
        
        <div className="space-y-4 not-prose">
          {faqItems.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200/90 rounded-2xl bg-white overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                    {item.q}
                  </span>
                  <span className="text-slate-400 shrink-0">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 border-t border-slate-100 bg-slate-50/50 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Support Prompt */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 not-prose">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900 block">Didn't Find What You Were Looking For?</span>
            <p className="text-xs text-slate-500">Submit a direct inquiry to our support and privacy desk.</p>
          </div>
          <Link
            to="/contact"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
          >
            Ask a Question →
          </Link>
        </div>

      </div>
    </LegalTrustLayout>
  );
}

export default FAQsPage;

