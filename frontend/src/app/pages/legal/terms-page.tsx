import React from "react";
import { LegalTrustLayout } from "./legal-trust-layout";
import { Link } from "react-router";
import { Scale, AlertCircle, FileCheck, Shield, ExternalLink } from "lucide-react";

export function TermsPage() {
  return (
    <LegalTrustLayout
      title="Terms & Conditions"
      subtitle="The contractual terms and acceptable use guidelines governing your access to and use of Career Compass."
      lastUpdated="November 2026"
      badge="Platform Agreement"
    >
      <div className="space-y-8">
        
        {/* Notice Callout */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3.5 not-prose">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-950 space-y-1">
            <span className="font-bold block">Important Notice Regarding Employment & AI Outputs</span>
            <p className="leading-relaxed">
              Career Compass is an educational guidance and career intelligence platform. We do not act as an employer, recruiter, or placement agency. AI scores and recommendations are advisory estimates and do not guarantee interview calls or job offers.
            </p>
          </div>
        </div>

        {/* 1. Acceptance of Terms */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            1. Acceptance of Terms
          </h2>
          <p>
            By visiting our website, creating a student account, or using any feature of Career Compass ("the Service"), you enter into a legally binding agreement to be governed by these Terms & Conditions ("Terms"), alongside our <Link to="/privacy-policy" className="text-indigo-600 underline">Privacy Policy</Link> and <Link to="/cookie-policy" className="text-indigo-600 underline">Cookie Policy</Link>.
          </p>
          <p>
            If you do not agree with any part of these Terms, you must discontinue using the platform and may request immediate account closure via Student Settings.
          </p>
        </section>

        {/* 2. Eligibility & Account Registration */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            2. Eligibility & Account Security
          </h2>
          <p>
            The Service is intended for students and aspiring professionals seeking career orientation, skills training, and employment discovery. To register:
          </p>
          <ul className="space-y-1.5 text-sm text-slate-600 list-disc pl-5">
            <li>You must provide truthful, current, and accurate registration details.</li>
            <li>You may register only one active student account under your verified email.</li>
            <li>You are solely responsible for safeguarding your authentication credentials. You must notify us immediately if you suspect unauthorized access to your account.</li>
            <li>Individuals under 18 years of age must access the Service with parental or guardian consent.</li>
          </ul>
        </section>

        {/* 3. User Responsibilities & Accurate Information */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            3. Student Responsibilities & Academic Integrity
          </h2>
          <p>
            Career Compass recommendations and job eligibility assessments depend on the information you provide. You agree that:
          </p>
          <ul className="space-y-1.5 text-sm text-slate-600 list-disc pl-5">
            <li>All educational qualifications, degrees, institutions, grades, and skill certifications you enter are genuine and verifiable.</li>
            <li>You will not misrepresent work experience, employment histories, or project contributions on your profile or generated resumes.</li>
            <li>You will not impersonate any other individual or entity.</li>
          </ul>
        </section>

        {/* 4. Acceptable Use & Prohibited Activities */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            4. Acceptable Use & Prohibited Activities
          </h2>
          <p>You agree not to engage in any of the following prohibited behaviors:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs not-prose">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
              <span className="font-bold block text-slate-900 mb-1">Automated Scraping</span>
              Using web scrapers, spiders, or automated scripts to extract jobs, company portals, or curriculum data.
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
              <span className="font-bold block text-slate-900 mb-1">System Tampering & Pentesting</span>
              Probing, scanning, or testing vulnerabilities without express written authorization, or bypassing API auth checks.
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
              <span className="font-bold block text-slate-900 mb-1">Adversarial AI Injection</span>
              Submitting malicious or adversarial prompts designed to bypass model guardrails in the Mock Interview or Assistant.
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
              <span className="font-bold block text-slate-900 mb-1">Account Sharing / Selling</span>
              Transferring, renting, or selling access to your student account or using credentials for third-party commercial benefit.
            </div>
          </div>
        </section>

        {/* 5. Intellectual Property Rights */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            5. Intellectual Property Rights
          </h2>
          <p>
            <strong>Platform IP:</strong> All proprietary software, user interfaces, branding, domain names, scoring algorithms, and learning roadmap curricula remain the exclusive property of Career Compass.
          </p>
          <p>
            <strong>Your Content:</strong> You retain full ownership of the resumes, projects, and personal descriptions you create or upload. By uploading content to the platform, you grant Career Compass a non-exclusive, worldwide, royalty-free license strictly to process, parse, store, and present such content to you and to potential viewers of your public portfolio (in accordance with your privacy settings).
          </p>
        </section>

        {/* 6. AI-Generated Insights Disclaimer */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            6. Nature of AI Recommendations & Output
          </h2>
          <p>
            Career Compass leverages modern algorithmic matching, heuristics, and natural language models. You acknowledge and accept that:
          </p>
          <ul className="space-y-1.5 text-sm text-slate-600 list-disc pl-5">
            <li>AI-generated career path suggestions, suitability percentages, and skill gaps are educational recommendations, not infallible assessments.</li>
            <li>ATS compatibility scores reflect internal heuristic formatting benchmarks and do not guarantee that third-party employer applicant tracking systems will shortlist your application.</li>
            <li>Mock interview evaluations and feedback are simulated training outputs; actual employer evaluations may differ substantially.</li>
            <li>For comprehensive details on how our AI tools function, consult our <Link to="/ai-transparency" className="text-indigo-600 font-semibold underline">AI Transparency Page</Link>.</li>
          </ul>
        </section>

        {/* 7. External Job Links & Third Parties */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            7. External Job Listings & Third-Party Websites
          </h2>
          <p>
            Job listings presented on Career Compass are aggregated from publicly accessible employer career boards (including Greenhouse, Lever, and verified career portals). Career Compass is an independent discovery platform:
          </p>
          <ul className="space-y-1.5 text-sm text-slate-600 list-disc pl-5">
            <li>We do not control employer hiring processes, interview scheduling, compensation offers, or rejection decisions.</li>
            <li>Clicking "Apply on Company Site" takes you to the external third-party domain. We are not responsible for the privacy practices, content, or accuracy of external websites.</li>
            <li>We do not charge students for job applications, and employers must not demand fees from candidates. Report any suspicious listings via our Help Center.</li>
          </ul>
        </section>

        {/* 8. Limitation of Liability */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            8. Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by applicable law, Career Compass, its developers, operators, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of employment opportunities, data loss, or service interruptions.
          </p>
          <p>
            The Service is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or implied.
          </p>
        </section>

        {/* 9. Governing Law & Dispute Resolution */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            9. Governing Law & Dispute Resolution
          </h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any legal dispute, controversy, or claim arising out of or relating to these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the competent courts in India <em>[specific judicial jurisdiction flagged for corporate registration review]</em>.
          </p>
        </section>

        {/* 10. Modifications & Inquiries */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            10. Changes to Terms & Contact
          </h2>
          <p>
            We may revise these Terms periodically to reflect platform updates or legal amendments. Material updates will be communicated through the website or student notification channels. Continued use of the platform after updates indicates acceptance of revised terms.
          </p>
          <p>
            For legal inquiries regarding these Terms, contact our legal desk via our <Link to="/contact" className="text-indigo-600 font-semibold underline">Contact Portal</Link>.
          </p>
        </section>

      </div>
    </LegalTrustLayout>
  );
}

export default TermsPage;

