import React from "react";
import { LegalTrustLayout } from "./legal-trust-layout";
import { Link } from "react-router";
import { Lock, Shield, Server, Key, EyeOff, AlertTriangle, Bug } from "lucide-react";

export function SecurityPolicyPage() {
  return (
    <LegalTrustLayout
      title="Security Policy & Architecture"
      subtitle="Factual documentation of our security controls, authentication safeguards, access governance, and vulnerability disclosure process."
      lastUpdated="November 2026"
      badge="Verified Security Controls"
    >
      <div className="space-y-8">
        
        {/* Compliance Integrity Callout */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-100 border border-slate-200 flex items-start gap-3.5 not-prose">
          <Shield className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-slate-800 space-y-1">
            <span className="font-bold block">Factual Standards & Non-Misleading Disclosure</span>
            <p className="leading-relaxed">
              We do not claim SOC 2 Type II or ISO/IEC 27001 third-party certifications, as our platform has not yet undergone external commercial audits. This document reflects verified technical and architectural safeguards currently implemented in production code.
            </p>
          </div>
        </div>

        {/* 1. Authentication & Credential Security */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            1. Authentication & Credential Protection
          </h2>
          <p>
            User authentication on Career Compass is engineered using industry-standard cryptographic techniques:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-indigo-600" />
                Password Hashing (bcrypt)
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Passwords are cryptographically salted and hashed using `bcrypt` (10 salt rounds) before persistence in MongoDB. Plaintext passwords are never logged, transmitted, or accessible to system administrators.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-indigo-600" />
                Stateless JWT Tokens
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Authentication relies on digitally signed JSON Web Tokens (JWT) containing encoded user IDs and roles. Tokens expire automatically after 7 days and are verified on every private API route.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Access Control & Authorization */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            2. Authorization & Data Isolation (IDOR Prevention)
          </h2>
          <p>
            To prevent Insecure Direct Object References (IDOR) and unauthorized data leakage:
          </p>
          <ul className="space-y-1.5 text-sm text-slate-600 list-disc pl-5">
            <li><strong>Server-Side Ownership Verification:</strong> All endpoints retrieving or modifying student resumes, profiles, roadmaps, course progress, or job applications check that `document.user.equals(req.user.id)`. Requests targeting other students' data are rejected with HTTP 403 / 404.</li>
            <li><strong>Strict Role-Based Access Control (RBAC):</strong> Administrative endpoints (`/api/admin/*`) require dedicated `adminAuth` middleware that verifies the user record in MongoDB has `role === 'admin'`. Students cannot access administrative controls or sensitive telemetry.</li>
            <li><strong>Discontinued Recruiter Roles:</strong> Recruiter access was retired in Phase 1; all candidate and profile discovery is student-controlled.</li>
          </ul>
        </section>

        {/* 3. File Upload & Processing Security */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            3. Secure Document & File Handling
          </h2>
          <p>
            When students upload resumes for parsing and ATS analysis:
          </p>
          <ul className="space-y-1.5 text-sm text-slate-600 list-disc pl-5">
            <li>Uploads are restricted to verified document MIME types (`application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`).</li>
            <li>File size is capped at 10 MB via Multer middleware.</li>
            <li>Files are parsed in memory using `pdf-parse` without executing untrusted shell binaries or external macros.</li>
            <li>Parsed resumes are stored as structured database documents owned by the student.</li>
          </ul>
        </section>

        {/* 4. API & Database Hardening */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            4. API Hardening & Injection Defenses
          </h2>
          <ul className="space-y-1.5 text-sm text-slate-600 list-disc pl-5">
            <li><strong>Parameterized Mongoose Queries:</strong> MongoDB queries utilize object-based schema casting to defend against NoSQL injection attacks.</li>
            <li><strong>CORS Policy:</strong> Cross-Origin Resource Sharing is configured to enforce legitimate origin headers.</li>
            <li><strong>Sanitized Errors:</strong> Production API error responses return sanitized messages rather than raw stack traces.</li>
          </ul>
        </section>

        {/* 5. Vulnerability Disclosure */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            5. Vulnerability Disclosure & Bug Reporting
          </h2>
          <p>
            We welcome responsible vulnerability reports from security researchers and developers. If you discover a potential security flaw in Career Compass:
          </p>
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs sm:text-sm text-indigo-950 space-y-2 not-prose">
            <span className="font-bold flex items-center gap-1.5 text-indigo-900">
              <Bug className="w-4 h-4 text-indigo-600" />
              Responsible Disclosure Guidelines
            </span>
            <p>1. Submit your findings through our <Link to="/contact?category=security_concern" className="font-semibold text-indigo-700 underline">Security Incident & Vulnerability Portal</Link>.</p>
            <p>2. Provide sufficient reproduction steps (POC requests or screenshots) without exploiting vulnerabilities or accessing other users' personal data.</p>
            <p>3. Allow our engineering team reasonable time to investigate and patch the issue before public disclosure.</p>
          </div>
        </section>

      </div>
    </LegalTrustLayout>
  );
}

export default SecurityPolicyPage;

