import React from "react";
import { LegalTrustLayout } from "./legal-trust-layout";
import { Link } from "react-router";
import { ShieldCheck, Info, Database, Lock, UserCheck, AlertTriangle } from "lucide-react";

export function PrivacyPolicyPage() {
  return (
    <LegalTrustLayout
      title="Privacy Policy"
      subtitle="Comprehensive disclosure of how Career Compass collects, processes, protects, and handles personal data across all student and career intelligence services."
      lastUpdated="November 2026"
      badge="DPDP Act 2023 & GDPR Aligned"
    >
      <div className="space-y-8">
        
        {/* Important Notice Callout */}
        <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-start gap-3.5 not-prose">
          <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-indigo-950 space-y-1">
            <span className="font-bold block">Factual Architectural Disclosure</span>
            <p className="leading-relaxed">
              This Privacy Policy reflects the actual software architecture, database collections, and AI integrations operational on Career Compass. We do not sell student personal data to third parties or data brokers.
            </p>
          </div>
        </div>

        {/* 1. Introduction */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            1. Introduction & Scope
          </h2>
          <p>
            Career Compass ("we," "our," or "the Platform") provides personalized career intelligence, skills roadmapping, resume analysis, AI mock interviews, and verified job discovery for students and aspiring professionals. This Privacy Policy explains our practices regarding the collection, storage, processing, transfer, and deletion of personal data when you access our public website, register a student account, or utilize our career services.
          </p>
          <p>
            This policy is formulated in alignment with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> of India, the <strong>DPDP Rules, 2025</strong>, and international data protection principles (such as GDPR Regulation (EU) 2016/679).
          </p>
        </section>

        {/* 2. Actual Data Categories Collected */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            2. Personal Data We Collect
          </h2>
          <p>
            We adhere strictly to the principle of <em>Data Minimization</em>: we only collect information necessary to deliver student career intelligence, matching, and placement preparation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">
                A. Account & Identity Information
              </span>
              <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                <li>Full Name</li>
                <li>Email Address (Primary identifier)</li>
                <li>Contact Phone Number (Optional)</li>
                <li>Hashed Passwords (Salted with bcrypt; never stored in plaintext)</li>
                <li>Role Assignment (Student / Administrator)</li>
                <li>Registration and Legal Consent Records</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">
                B. Student Academic & Professional Profile
              </span>
              <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                <li>Education History (Degrees, institutions, GPA/grades, graduation years)</li>
                <li>Categorized Technical Skills and self-reported proficiencies</li>
                <li>Soft Skills & Spoken Languages</li>
                <li>Work Experience & Internships</li>
                <li>Projects, live demos, and GitHub repository links</li>
                <li>Certifications, issuing organizations, and credential links</li>
                <li>Professional links (LinkedIn, LeetCode, GitHub, Kaggle)</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">
                C. Resume & Document Information
              </span>
              <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                <li>Uploaded PDF and DOCX resume files (processed locally via in-memory parsers)</li>
                <li>Extracted text tokens, work experience bullet points, and skills</li>
                <li>ATS compatibility scores, keyword match percentages, and feedback histories</li>
                <li>Generated cover letters tailored for specific job titles</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">
                D. Career Activity & Job Discovery
              </span>
              <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                <li>Career assessment attempts, scenario trade-offs, and dimensions</li>
                <li>Personalized roadmaps and completed milestone checkpoints</li>
                <li>Enrolled courses and self-reported progress percentages</li>
                <li>Bookmarked/Saved jobs and personal application tracker statuses</li>
                <li>Job search preferences (locations, salary, remote/hybrid, roles)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. AI Processing & Third-Party Processors */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            3. AI Processing & Third-Party Processors
          </h2>
          <p>
            Career Compass utilizes machine learning and language models to assist students. We believe in complete transparency regarding which services process your data:
          </p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>
              <strong>Groq API (api.groq.com):</strong> When you use the AI Career Chatbot or the Interactive Mock Interview, your interview prompts and spoken/written answers are transmitted securely to Groq-hosted open-weights models (e.g. `llama-3.3-70b-versatile` / `gpt-oss`) to generate interview questions, feedback, and study guidance. <em>Student full resumes and contact records are NOT sent to Groq.</em>
            </li>
            <li>
              <strong>Local Deterministic Algorithms:</strong> Resume ATS scoring, keyword overlap calculation, and job matching percentages are computed internally on Career Compass servers without external LLM processing.
            </li>
            <li>
              <strong>External ATS Job Boards:</strong> When you click "Apply on Company Site" on a verified job card, you are directed to the employer's official ATS portal (e.g., Greenhouse, Lever, or company careers domain). Any data submitted on an external website is governed by that employer's privacy policy.
            </li>
            <li>
              <strong>External Course Providers:</strong> Course enrollments (Coursera, Udemy, edX) direct you to third-party platforms. Career Compass records only your local progress tracking on our platform.
            </li>
          </ul>
        </section>

        {/* 4. Purposes of Processing & Legal Basis */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            4. Purposes of Processing & Lawful Grounds
          </h2>
          <p>We process personal data under the following legal bases:</p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden">
              <thead className="bg-slate-100 font-bold text-slate-800">
                <tr>
                  <th className="p-3 border-b border-slate-200">Processing Purpose</th>
                  <th className="p-3 border-b border-slate-200">Data Categories</th>
                  <th className="p-3 border-b border-slate-200">Lawful Ground (DPDP / GDPR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="p-3 font-semibold text-slate-800">Account Authentication & Security</td>
                  <td className="p-3">Email, Name, Hashed Password, Sessions</td>
                  <td className="p-3">Contractual Necessity (Service Delivery)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-800">Personalized Career Recommendations & Roadmaps</td>
                  <td className="p-3">Academic records, Assessment responses, Skills</td>
                  <td className="p-3">Contractual Necessity & Explicit Consent</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-800">Resume ATS & Tailoring Analysis</td>
                  <td className="p-3">Uploaded Resume Content, Target Job Titles</td>
                  <td className="p-3">Explicit User Request (Contract Performance)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-800">AI Mock Interview Practice</td>
                  <td className="p-3">Candidate answers, Interview transcripts</td>
                  <td className="p-3">User Consent</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-800">Optional Job Alerts & Notifications</td>
                  <td className="p-3">Email, Job Preferences</td>
                  <td className="p-3">Revocable Consent</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. User Rights (Data Principal Rights) */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            5. Your Rights as a Data Principal
          </h2>
          <p>Under the DPDP Act 2023 and global privacy frameworks, you have specific enforceable rights:</p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>
              <strong>Right to Access & Portability (Download My Data):</strong> You can export a structured JSON archive of all your personal records anytime directly from your <Link to="/settings" className="text-indigo-600 font-semibold underline">Student Settings</Link>.
            </li>
            <li>
              <strong>Right to Correction & Rectification:</strong> You can edit and update your academic details, skills, contact numbers, and career preferences directly from your Student Profile.
            </li>
            <li>
              <strong>Right to Erasure (Account Deletion):</strong> You can initiate permanent deletion of your account and personal data at any time via Settings. All resumes, profiles, assessment results, and learning milestones will be permanently erased.
            </li>
            <li>
              <strong>Right to Withdraw Consent:</strong> You may adjust cookie preferences, revoke optional notification consents, or toggle profile visibility settings without impacting core service access.
            </li>
            <li>
              <strong>Right of Grievance Redressal:</strong> You have the right to register a privacy complaint with our designated Grievance Officer and receive resolution within statutory timelines.
            </li>
          </ul>
        </section>

        {/* 6. Data Storage & Retention Schedule */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            6. Data Storage & Retention Policy
          </h2>
          <p>
            Your information is stored in secured, access-restricted MongoDB instances. We enforce the following retention schedule:
          </p>
          <ul className="space-y-1 text-sm text-slate-600 list-disc pl-5">
            <li><strong>Active Student Accounts:</strong> Retained while your account remains active and in good standing.</li>
            <li><strong>Requested Account Deletions:</strong> Personal records, resumes, and assessment results are permanently purged immediately upon confirmation.</li>
            <li><strong>Security Audit Logs:</strong> Anonymized transaction identifiers and security event logs are retained for up to 180 days to fulfill regulatory and cybersecurity obligations, after which they are automatically purged.</li>
            <li><strong>Inactive Accounts:</strong> Accounts with no authentication activity for greater than 24 months are flagged for archival and subject to scheduled review.</li>
          </ul>
        </section>

        {/* 7. Children's Personal Data */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            7. Protection of Children's Personal Data
          </h2>
          <p>
            Career Compass is designed primarily for students in secondary school, higher secondary, diploma, undergraduate, and postgraduate programs. In accordance with Section 9 of the DPDP Act 2023:
          </p>
          <ul className="space-y-1 text-sm text-slate-600 list-disc pl-5">
            <li>We do not engage in targeted behavioral advertising directed at minors.</li>
            <li>We do not track, profile, or monitor students for commercial advertising.</li>
            <li>Users under the age of 18 must use the platform with the knowledge and consent of their parent or lawful guardian.</li>
          </ul>
        </section>

        {/* 8. Contact & Grievance Officer */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            8. Grievance Redressal & Privacy Contact
          </h2>
          <p>
            If you have questions regarding this Privacy Policy, wish to exercise your data principal rights, or wish to report a privacy concern, please contact our Grievance Officer:
          </p>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-1 not-prose">
            <span className="font-bold text-slate-900 block">Career Compass Privacy & Grievance Desk</span>
            <p>Channel: <Link to="/contact?category=privacy_request" className="text-indigo-600 font-semibold underline">Online Privacy Request Portal</Link></p>
            <p>Physical Entity & Address: <em>[Identified for legal entity review — submit tickets through our verified contact desk]</em></p>
            <p className="text-[11px] text-slate-500 pt-1">
              Response Commitment: Privacy inquiries and grievance complaints are acknowledged within 48 hours and investigated in accordance with statutory guidelines.
            </p>
          </div>
        </section>

      </div>
    </LegalTrustLayout>
  );
}

export default PrivacyPolicyPage;

