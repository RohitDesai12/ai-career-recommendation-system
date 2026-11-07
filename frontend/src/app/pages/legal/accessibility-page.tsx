import React from "react";
import { LegalTrustLayout } from "./legal-trust-layout";
import { Link } from "react-router";
import { Eye, CheckCircle2, Sliders, MessageSquare } from "lucide-react";

export function AccessibilityPage() {
  return (
    <LegalTrustLayout
      title="Accessibility Statement"
      subtitle="Our commitment to digital accessibility, inclusive design, and WCAG 2.1 Level AA conformance for all students."
      lastUpdated="November 2026"
      badge="Digital Inclusion"
    >
      <div className="space-y-8">
        
        {/* 1. Commitment */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            1. Our Commitment to Accessibility
          </h2>
          <p>
            Career Compass is dedicated to ensuring that digital career intelligence and learning tools are accessible to all students, including those with visual, auditory, motor, or cognitive disabilities.
          </p>
          <p>
            We continually optimize our user interface in conformance with the <strong>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong> standards.
          </p>
        </section>

        {/* 2. Key Architectural Features */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            2. Implemented Accessibility Features
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Color Contrast & Typography
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                We maintain high-contrast ratios (minimum 4.5:1 for body text, 3:1 for large headings) across alternating dark (`#080C16`) and pure white (`#FFFFFF`) / light grey (`#F5F7FA`) sections.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Keyboard Navigability
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                All navigation links, interactive cards, form controls, and modal dialogs can be operated via standard keyboard navigation (`Tab`, `Shift+Tab`, `Enter`, `Escape`).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Screen Reader Compatibility
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                We utilize semantic HTML5 elements (&lt;header&gt;, &lt;main&gt;, &lt;nav&gt;, &lt;aside&gt;, &lt;footer&gt;), descriptive ARIA labels, and explicit form input labels.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Motion & Animation Controls
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our scroll animation engine honors user preferences for reduced motion (`prefers-reduced-motion: reduce`) by disabling transforms and parallax transitions automatically.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Feedback Channel */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            3. Accessibility Inquiries & Feedback
          </h2>
          <p>
            We welcome feedback on the accessibility of Career Compass. If you encounter barriers while using assistive technology on any page, please let us know:
          </p>
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs sm:text-sm text-indigo-950 space-y-1 not-prose">
            <span className="font-bold text-indigo-900 block">Accessibility Contact Channel</span>
            <p>Please submit details (page URL, assistive software used, and observed barrier) via our <Link to="/contact?category=technical_issue" className="text-indigo-600 font-semibold underline">Contact Form</Link>.</p>
            <p className="text-[11px] text-slate-500 pt-1">
              We investigate accessibility tickets with high priority to ensure equal access for all students.
            </p>
          </div>
        </section>

      </div>
    </LegalTrustLayout>
  );
}

export default AccessibilityPage;
