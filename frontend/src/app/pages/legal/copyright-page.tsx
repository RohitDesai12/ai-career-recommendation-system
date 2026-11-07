import React from "react";
import { LegalTrustLayout } from "./legal-trust-layout";
import { Link } from "react-router";
import { FileText, Shield, AlertCircle } from "lucide-react";

export function CopyrightPolicyPage() {
  return (
    <LegalTrustLayout
      title="Copyright & Intellectual Property Policy"
      subtitle="Documentation of copyright ownership, student content rights, trademark notices, and the DMCA / Copyright Notice procedure."
      lastUpdated="November 2026"
      badge="IP Governance"
    >
      <div className="space-y-8">
        
        {/* 1. Ownership Overview */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            1. Intellectual Property Ownership
          </h2>
          <p>
            <strong>Platform Content:</strong> All software code, graphical assets, brand elements, user interface designs, curriculum roadmaps, assessment scenarios, and algorithms available on Career Compass are protected by copyright, trademark, and other applicable intellectual property laws. All rights not expressly granted to users are reserved.
          </p>
          <p>
            <strong>Student Ownership:</strong> You retain complete ownership and intellectual property rights in the original resume text, project descriptions, code repository links, and academic details you upload to Career Compass. You may export or delete your content at any time.
          </p>
        </section>

        {/* 2. Third-Party Trademarks */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            2. Third-Party Trademarks & Portals
          </h2>
          <p>
            All third-party company names, logos, course provider trademarks (including Coursera, Udemy, edX), and applicant tracking systems (such as Greenhouse and Lever) referenced on the platform are the property of their respective owners.
          </p>
          <p>
            Their inclusion on Career Compass is strictly for factual identification and referral purposes and does not imply endorsement, affiliation, or sponsorship.
          </p>
        </section>

        {/* 3. Copyright Notice & Takedown Procedure */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            3. Copyright Notice & Takedown Procedure (DMCA / Indian Copyright Act)
          </h2>
          <p>
            Career Compass respects the intellectual property rights of others. If you believe that your copyrighted work has been reproduced or made accessible on the platform in a way that constitutes infringement:
          </p>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-2 not-prose">
            <span className="font-bold text-slate-900 block">Required Information for Copyright Notices:</span>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
              <li>Identification of the copyrighted work claimed to have been infringed.</li>
              <li>Identification of the material claimed to be infringing, including the specific URL on Career Compass.</li>
              <li>Your contact information (name, address, telephone number, and email address).</li>
              <li>A statement that you have a good-faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law.</li>
              <li>A statement, under penalty of perjury, that the information in your notification is accurate and that you are authorized to act on behalf of the copyright owner.</li>
            </ul>
            <p className="pt-2 text-xs">
              Submit formal notices through our <Link to="/contact?category=general_enquiry" className="text-indigo-600 font-semibold underline">Copyright & Legal Inquiries Portal</Link>.
            </p>
          </div>
        </section>

      </div>
    </LegalTrustLayout>
  );
}

export default CopyrightPolicyPage;

