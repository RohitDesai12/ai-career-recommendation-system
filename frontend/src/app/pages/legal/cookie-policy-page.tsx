import React from "react";
import { LegalTrustLayout } from "./legal-trust-layout";
import { openCookiePreferences } from "../../components/cookie-consent-banner";
import { Cookie, Settings, CheckCircle2, XCircle, Shield } from "lucide-react";

export function CookiePolicyPage() {
  return (
    <LegalTrustLayout
      title="Cookie Policy"
      subtitle="Clear and transparent documentation on how Career Compass uses cookies, local browser storage, and tracking technologies."
      lastUpdated="November 2026"
      badge="ePrivacy & Consent Aligned"
    >
      <div className="space-y-8">
        
        {/* Quick Action Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 not-prose">
          <div className="flex items-center gap-3">
            <Cookie className="w-6 h-6 text-indigo-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-900 block">Manage Your Cookie Preferences</span>
              <p className="text-xs text-slate-500">You can adjust or revoke your optional cookie permissions at any time.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={openCookiePreferences}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            Open Cookie Settings
          </button>
        </div>

        {/* 1. What Are Cookies? */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            1. What Are Cookies and Local Storage?
          </h2>
          <p>
            Cookies are small text files placed on your computer or mobile device when you browse websites. Local storage (such as HTML5 `localStorage`) provides similar client-side data persistence. These technologies help modern web applications authenticate users, maintain secure active sessions, and recall interface preferences.
          </p>
          <p>
            Career Compass uses these technologies responsibly. We do not use third-party cross-site advertising trackers, and we never sell your browsing history.
          </p>
        </section>

        {/* 2. Granular Categories */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            2. Categories of Cookies We Use
          </h2>
          <p>
            We classify all cookies and client storage mechanisms into four distinct tiers:
          </p>

          <div className="space-y-4 not-prose">
            {/* Category 1 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">1. Essential Cookies & Security Storage</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Always Active (Required)
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                These are strictly necessary to operate the platform securely. They maintain JWT authentication tokens, protect API requests from cross-site request forgery, and store your recorded consent choices. Without these cookies, the student dashboard and authenticated features cannot function.
              </p>
              <div className="text-[11px] text-slate-500 pt-1 font-mono">
                Tokens/Keys: `token`, `user`, `career_compass_cookie_consent`
              </div>
            </div>

            {/* Category 2 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">2. Functional Cookies</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                  Optional (Consent Required)
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                These cookies remember choices you make to improve your platform experience, such as your visual theme (dark or light mode) and collapsed/expanded sidebar states.
              </p>
              <div className="text-[11px] text-slate-500 pt-1 font-mono">
                Keys: `theme`, `career_compass_sidebar_state`
              </div>
            </div>

            {/* Category 3 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">3. Analytics & Performance Cookies</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                  Optional (Consent Required)
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                These cookies allow us to count page visits and analyze navigation flow within the platform in an aggregated, privacy-preserving manner. This telemetry helps us diagnose slow endpoints and improve the speed of our job matching and recommendation algorithms.
              </p>
            </div>

            {/* Category 4 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">4. Marketing & Communication Preferences</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                  Optional (Consent Required)
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Used strictly to store student job alert notifications and learning roadmap milestone reminder frequencies. We do not integrate with third-party retargeting pixels (such as Google AdSense or Meta Pixel).
              </p>
            </div>
          </div>
        </section>

        {/* 3. Consent Management */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            3. How We Collect & Manage Your Consent
          </h2>
          <p>
            When you first visit Career Compass, a consent banner appears allowing you to Accept All, Reject Optional, or Customize Preferences. We enforce strict compliance standards:
          </p>
          <ul className="space-y-1.5 text-sm text-slate-600 list-disc pl-5">
            <li>Optional cookie categories are <strong>never pre-checked</strong> or active by default.</li>
            <li>We honor Global Privacy Control (GPC) and Do Not Track (DNT) signals from browsers such as Brave and Firefox: if detected, optional cookies are automatically rejected.</li>
            <li>No optional cookies or telemetry scripts are executed until you submit your affirmative choice.</li>
            <li>Your preferences are timestamped and recorded locally and on our server for audit verification.</li>
            <li>You can modify your preferences at any time by clicking the "Cookie Settings" link in the footer of any page.</li>
          </ul>
        </section>

        {/* 4. Browser-Level Controls */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">
            4. Browser-Level Cookie Management
          </h2>
          <p>
            In addition to our on-site settings, you can manage or delete cookies directly through your web browser settings:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs text-center not-prose">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold block text-slate-800">Brave Browser</span>
              <span className="text-[11px] text-slate-500">Shields → Advanced Controls → Cookies</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold block text-slate-800">Google Chrome</span>
              <span className="text-[11px] text-slate-500">Settings → Privacy and security → Cookies</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold block text-slate-800">Mozilla Firefox</span>
              <span className="text-[11px] text-slate-500">Options → Privacy & Security → Cookies</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold block text-slate-800">Microsoft Edge</span>
              <span className="text-[11px] text-slate-500">Settings → Site permissions → Cookies</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold block text-slate-800">Apple Safari</span>
              <span className="text-[11px] text-slate-500">Preferences → Privacy → Block all cookies</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 pt-1">
            Note: Disabling all browser cookies may prevent you from signing in to your Career Compass student account.
          </p>
        </section>

      </div>
    </LegalTrustLayout>
  );
}

export default CookiePolicyPage;

