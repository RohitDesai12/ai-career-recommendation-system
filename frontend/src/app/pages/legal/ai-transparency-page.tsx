import React from "react";
import { LegalTrustLayout } from "./legal-trust-layout";
import { Link } from "react-router";
import { Sparkles, BrainCircuit, AlertCircle, CheckCircle2, Shield, HelpCircle } from "lucide-react";

export function AITransparencyPage() {
  const aiModules = [
    {
      title: "1. Career Recommendations & Compatibility Scores",
      usedData: "Student branch, self-reported skills, academic level, and answers to interactive situational/scenario questions in the Career Assessment.",
      calculates: "A percentage compatibility score (e.g., 85% Fit for Data Engineer) matching your strengths against occupational demand benchmarks.",
      outputMeaning: "An advisory indication of roles where your interests, preferred work styles, and existing skills show strong alignment.",
      limitations: "Career assessments cannot capture personal resilience, geographic constraints, or dynamic economic shifts. Scores reflect entered data.",
      verification: "Students should explore day-to-day job realities, shadow professionals, and review job postings before choosing a specialization."
    },
    {
      title: "2. Job Matching Percentages",
      usedData: "Categorized skills in your student profile compared against extracted technical keywords and requirements from ingested ATS job postings.",
      calculates: "A mathematical overlap score: (Matching Skills ÷ Total Required Skills) × 100, bounded between realistic thresholds.",
      outputMeaning: "A quick metric to help you prioritize job applications where your current skill stack matches the core job description.",
      limitations: "Cannot evaluate your portfolio code quality, soft skills, culture fit, or unlisted employer preferences.",
      verification: "Read the complete job description on the company's official career portal before applying."
    },
    {
      title: "3. Resume ATS Compatibility Score",
      usedData: "Uploaded resume document (PDF/DOCX) or resumes built in the Resume Studio, analyzed for section headers, keyword density, and contact formats.",
      calculates: "A 0-100 score estimating how cleanly traditional Applicant Tracking Systems (ATS) can parse and index your resume text.",
      outputMeaning: "Higher scores indicate clean typography, recognized standard headers (e.g. 'Work Experience', 'Education'), and high technical keyword match.",
      limitations: "ATS algorithms vary widely across enterprises (Workday, Greenhouse, Taleo, iCIMS). A 90+ score does not guarantee you will be shortlisted by human recruiters.",
      verification: "Ensure all statements on your resume are 100% factual, and tailor achievements for specific company job descriptions."
    },
    {
      title: "4. Resume-to-Role Tailoring Engine",
      usedData: "Your selected resume and a target job listing's description or custom skill list.",
      calculates: "A list of matched keywords, missing keywords, and structured recommendations to improve bullet points and summary statements.",
      outputMeaning: "Practical guidance on technical competencies you may have omitted that the hiring company specifically requested.",
      limitations: "The engine suggests keywords based on text extraction. It cannot verify whether you actually possess the skills suggested.",
      verification: "Never add skills or tools to your resume that you cannot confidently explain and demonstrate during technical interviews."
    },
    {
      title: "5. Skill-Gap Insights",
      usedData: "Your verified profile skills compared with standard industry requirements for target roles (e.g., Full Stack Developer, DevOps Engineer).",
      calculates: "Categorization of skills into 'Proficient', 'In Progress', and 'Missing / High Demand'.",
      outputMeaning: "A strategic roadmap of what technologies to learn next to bridge the gap between academic study and industry readiness.",
      limitations: "Industry standards evolve rapidly. Emergent frameworks may take time to reflect in standardized taxonomies.",
      verification: "Review current job openings in your target geographical market to validate high-demand technologies."
    },
    {
      title: "6. Course & Learning Path Recommendations",
      usedData: "Identified skill gaps, student department, target career role, and course difficulty ratings.",
      calculates: "Curated course matches from verified providers (Coursera, Udemy, edX) that directly address identified missing skills.",
      outputMeaning: "Structured educational resources designed to build missing competencies efficiently.",
      limitations: "Career Compass does not host or grade external courses. We do not certify completion; verified certificates are issued by the respective provider.",
      verification: "Check the course syllabus, prerequisites, cost, and reviews on the provider platform before enrolling."
    },
    {
      title: "7. AI Mock Interview Practice & Feedback",
      usedData: "Target role, seniority level (Fresher/Junior), and candidate answers submitted in text or speech.",
      calculates: "Adaptive follow-up questions and a structured evaluation of clarity, technical accuracy, and completeness using large language models (Groq API).",
      outputMeaning: "Simulated practice feedback with strengths, identified improvement areas, and suggested answer structures.",
      limitations: "Language models can occasionally hallucinate, misinterpret nuanced answers, or produce overly optimistic or critical scores.",
      verification: "Use AI interview practice for confidence building and articulation practice; human interviewers assess non-verbal communication, depth, and team fit."
    }
  ];

  return (
    <LegalTrustLayout
      title="AI Transparency & Algorithmic Accountability"
      subtitle="Clear, honest disclosure of the algorithms, scoring heuristics, limitations, and human responsibilities governing AI across Career Compass."
      lastUpdated="November 2026"
      badge="Ethical AI Framework"
    >
      <div className="space-y-8">
        
        {/* Core Ethical Commitment Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-start gap-3.5 not-prose">
          <BrainCircuit className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-indigo-950 space-y-1">
            <span className="font-bold block">Human-in-the-Loop Philosophy</span>
            <p className="leading-relaxed">
              At Career Compass, AI is designed strictly to assist, guide, and empower students — never to make autonomous decisions that restrict opportunity. Career Compass does not make hiring decisions, and our scores are advisory estimates.
            </p>
          </div>
        </div>

        {/* 1. Principles of AI Transparency */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            1. Our Algorithmic Transparency Principles
          </h2>
          <p>
            Students deserve to know how educational recommendations and job matching scores are generated. We uphold three core commitments:
          </p>
          <ul className="space-y-1.5 text-sm text-slate-600 list-disc pl-5">
            <li><strong>Explainable Outputs:</strong> Every percentage, score, or match is accompanied by the underlying rationale (such as matched keywords or dimension overlap).</li>
            <li><strong>No Black-Box Hiring:</strong> We do not conduct automated candidate screening or ranking for recruiters. The recruiter portal was completely removed in Phase 1.</li>
            <li><strong>Privacy-Preserving Execution:</strong> Sensitive resume data is parsed locally on our servers. When external LLMs (Groq API) are used for interview simulation, they process only the prompt context necessary for coaching.</li>
          </ul>
        </section>

        {/* 2. Detailed Breakdown of AI Modules */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            2. Detailed Module Documentation
          </h2>
          <p className="text-sm text-slate-600">
            Below is the comprehensive technical and operational breakdown of each intelligent feature on Career Compass:
          </p>

          <div className="space-y-6 not-prose">
            {aiModules.map((module, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-3"
              >
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  {module.title}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
                    <span className="font-bold text-slate-800 block">Information Used:</span>
                    <p className="text-slate-600">{module.usedData}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
                    <span className="font-bold text-slate-800 block">Calculation Objective:</span>
                    <p className="text-slate-600">{module.calculates}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
                    <span className="font-bold text-slate-800 block">What the Output Means:</span>
                    <p className="text-slate-600">{module.outputMeaning}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                    <span className="font-bold text-amber-900 block">Inherent Limitations:</span>
                    <p className="text-amber-800">{module.limitations}</p>
                  </div>
                </div>

                <div className="pt-2 flex items-start gap-2 text-xs text-indigo-900 bg-indigo-50/60 p-3 rounded-xl border border-indigo-100">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>What You Should Independently Verify:</strong> {module.verification}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Explicit Disclaimers */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            3. Summary of Core Platform Disclaimers
          </h2>
          <div className="p-5 rounded-2xl bg-slate-900 text-slate-300 space-y-2 text-xs not-prose leading-relaxed">
            <span className="font-bold text-white text-sm block mb-1">
              Please review these binding disclaimers:
            </span>
            <p>• <strong>Career Compass does NOT guarantee employment:</strong> Platform scores and recommendations do not guarantee that you will receive job offers, interview calls, or admission to educational programs.</p>
            <p>• <strong>Matching scores are estimates:</strong> A 95% job match means high keyword and profile synergy based on entered data; it does not mean an employer will deem you eligible.</p>
            <p>• <strong>Resume ATS scores do not override human judgment:</strong> Corporate ATS filters and human talent acquisition teams evaluate candidates on criteria beyond keyword density.</p>
            <p>• <strong>AI interview feedback may contain inaccuracies:</strong> Always cross-reference AI technical explanations with textbooks, official documentation, and academic instructors.</p>
          </div>
        </section>

      </div>
    </LegalTrustLayout>
  );
}

export default AITransparencyPage;

