import React from "react";
import { LegalTrustLayout } from "./legal-trust-layout";
import { Link } from "react-router";
import { Trash2, AlertTriangle, ShieldCheck, CheckCircle2, Clock } from "lucide-react";

export function DataDeletionPolicyPage() {
  return (
    <LegalTrustLayout
      title="Data Deletion & Erasure Policy"
      subtitle="Complete documentation of our account deletion workflow, data purge mechanisms, retention exceptions, and user rights."
      lastUpdated="November 2026"
      badge="Right to Erasure"
    >
      <div className="space-y-8">
        
        {/* Quick Action */}
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/80 border border-rose-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 not-prose">
          <div className="flex items-center gap-3">
            <Trash2 className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-rose-950 block">Ready to Delete Your Account?</span>
              <p className="text-xs text-rose-800">You can initiate self-service account deletion directly in your student settings.</p>
            </div>
          </div>
          <Link
            to="/settings"
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
          >
            Go to Settings →
          </Link>
        </div>

        {/* 1. Commitment to Right to Erasure */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            1. Your Right to Erasure
          </h2>
          <p>
            Under Section 12 of the <strong>Digital Personal Data Protection Act, 2023 (India)</strong> and Article 17 of the GDPR, every student has the unconditional right to request erasure of their personal data when it is no longer necessary for the purpose for which it was collected, or upon withdrawal of consent.
          </p>
          <p>
            Career Compass provides an automated, self-service account deletion workflow directly accessible from the Student Settings dashboard.
          </p>
        </section>

        {/* 2. Deletion Process & Safeguards */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            2. The Account Deletion Workflow & Safeguards
          </h2>
          <p>
            To prevent accidental or malicious deletion by unauthorized parties, our system enforces a strict verification protocol:
          </p>
          <ol className="space-y-2 text-sm text-slate-600 list-decimal pl-5">
            <li><strong>Authentication & Authorization:</strong> You must be signed in to your active student account.</li>
            <li><strong>Explanation of Consequences:</strong> The interface displays all affected data categories and informs you that deletion is permanent.</li>
            <li><strong>Re-Authentication:</strong> You must enter your current password to verify account ownership.</li>
            <li><strong>Explicit Confirmation:</strong> You must type the word <code className="text-rose-600 font-bold">DELETE</code> into the confirmation field before the submission button activates.</li>
          </ol>
        </section>

        {/* 3. Affected Data Categories */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            3. Treatment of Different Data Categories Upon Deletion
          </h2>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden">
              <thead className="bg-slate-100 font-bold text-slate-800">
                <tr>
                  <th className="p-3 border-b border-slate-200">Data Category</th>
                  <th className="p-3 border-b border-slate-200">Action Taken Upon Deletion</th>
                  <th className="p-3 border-b border-slate-200">Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="p-3 font-semibold text-slate-800">Student Profile & Academics</td>
                  <td className="p-3">Permanently erased from MongoDB database</td>
                  <td className="p-3 text-emerald-700 font-semibold">Immediate</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-800">Resumes, Cover Letters & ATS Scores</td>
                  <td className="p-3">Permanently erased from database</td>
                  <td className="p-3 text-emerald-700 font-semibold">Immediate</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-800">Career Assessments & Roadmaps</td>
                  <td className="p-3">Permanently deleted</td>
                  <td className="p-3 text-emerald-700 font-semibold">Immediate</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-800">Course Progress & Saved Jobs</td>
                  <td className="p-3">Permanently deleted</td>
                  <td className="p-3 text-emerald-700 font-semibold">Immediate</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-800">Submitted Job Applications</td>
                  <td className="p-3">Dissociated and anonymized (Candidate name replaced with '[Deleted Student]' and email scrubbed)</td>
                  <td className="p-3 text-emerald-700 font-semibold">Immediate</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-800">Database Backup Archives</td>
                  <td className="p-3">Rotated and overwritten during standard backup lifecycle</td>
                  <td className="p-3 text-slate-500">Within 30 Days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Lawful Retention Exceptions */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            4. Lawful Retention Exceptions
          </h2>
          <p>
            Under Section 8(7) of the DPDP Act 2023, data may be retained if required to comply with applicable laws or regulations. The following exceptions apply:
          </p>
          <ul className="space-y-1.5 text-sm text-slate-600 list-disc pl-5">
            <li><strong>Audit Logs for Security & Anti-Fraud:</strong> Anonymized timestamps of the deletion event and system audit records are retained for up to 180 days to prove compliance with data subject erasure requests.</li>
            <li><strong>Dispute Resolution:</strong> If an account is subject to an active regulatory inquiry or legal notice prior to the deletion request, relevant records may be locked until resolution of the legal proceeding.</li>
          </ul>
        </section>

        {/* 5. Inquiries */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            5. Inability to Self-Serve or Assistance
          </h2>
          <p>
            If you are unable to access your student account to perform self-service deletion (e.g. lost password or locked account), you can submit an official request through our <Link to="/contact?category=data_deletion" className="text-indigo-600 underline font-semibold">Data Deletion Support Channel</Link>. You will be asked to verify identity ownership via your registered email address before manual deletion is executed.
          </p>
        </section>

      </div>
    </LegalTrustLayout>
  );
}

export default DataDeletionPolicyPage;

