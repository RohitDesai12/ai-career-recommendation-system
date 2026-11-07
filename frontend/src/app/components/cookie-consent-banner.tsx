import React, { useState, useEffect } from "react";
import { Cookie, Shield, Check, X, Sliders, Info, ShieldCheck } from "lucide-react";
import axios from "axios";
import { getApiUrl } from "../config/api";

export interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

const STORAGE_KEY = "career_compass_cookie_consent";
const CONSENT_VERSION = "v1.0";

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [gpcDetected, setGpcDetected] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    functional: false,
    analytics: false,
    marketing: false,
  });

  // Global listener for opening preferences from footer, settings, or external links
  useEffect(() => {
    const handleOpenModal = () => {
      setShowModal(true);
    };
    window.addEventListener("open-cookie-preferences", handleOpenModal);
    return () => window.removeEventListener("open-cookie-preferences", handleOpenModal);
  }, []);

  useEffect(() => {
    // Detect Global Privacy Control (GPC) or Do Not Track (DNT) from browser (e.g., Brave, Firefox)
    const isGpc =
      typeof navigator !== "undefined" &&
      ((navigator as unknown as { globalPrivacyControl?: boolean }).globalPrivacyControl === true ||
        navigator.doNotTrack === "1");
    if (isGpc) {
      setGpcDetected(true);
    }

    // Check if consent already recorded
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.preferences) {
          setPreferences({
            essential: true,
            functional: Boolean(parsed.preferences.functional),
            analytics: Boolean(parsed.preferences.analytics),
            marketing: Boolean(parsed.preferences.marketing),
          });
          setShowBanner(false);
        }
      } else {
        // If GPC signal is active on a fresh visit, default to strict rejection of optional cookies
        if (isGpc) {
          const strictConsent = {
            version: CONSENT_VERSION,
            timestamp: new Date().toISOString(),
            preferences: {
              essential: true,
              functional: false,
              analytics: false,
              marketing: false,
            },
            gpcHonored: true,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(strictConsent));
          setPreferences(strictConsent.preferences);
          setShowBanner(false);
          return;
        }

        // Delay slightly for smooth page load
        const timer = setTimeout(() => setShowBanner(true), 800);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      setShowBanner(true);
    }
  }, []);

  const saveConsent = (updated: CookiePreferences) => {
    const consentPayload = {
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      preferences: updated,
      gpcHonored: gpcDetected,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consentPayload));
    setPreferences(updated);
    setShowBanner(false);
    setShowModal(false);

    // Asynchronously record on backend using centralized API URL
    const token = localStorage.getItem("token");
    axios
      .post(
        getApiUrl("/api/privacy/consent"),
        {
          consentType: "cookie_preferences",
          documentVersion: CONSENT_VERSION,
          preferences: updated,
        },
        {
          headers: token ? { "x-auth-token": token } : undefined,
        }
      )
      .catch((err) => {
        // Non-blocking log
        console.warn("Could not log cookie consent to server:", err.message);
      });
  };

  const handleAcceptAll = () => {
    saveConsent({
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    });
  };

  const handleRejectOptional = () => {
    saveConsent({
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    });
  };

  const handleSaveCustom = () => {
    saveConsent(preferences);
  };

  return (
    <>
      {/* 1. FLOATING BOTTOM BANNER */}
      {showBanner && !showModal && (
        <aside
          role="region"
          aria-label="Cookie consent banner"
          className="fixed bottom-3 sm:bottom-5 left-3 sm:left-6 right-3 sm:right-6 max-w-4xl mx-auto z-50 bg-[#0F172A]/98 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-4 sm:p-5 text-slate-200 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  Cookie & Privacy Preferences
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  We use essential cookies to provide secure access to Career Compass. With your permission, we may also use optional cookies to improve your experience.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0">
              <button
                type="button"
                onClick={handleRejectOptional}
                className="flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              >
                Reject Optional
              </button>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-300 hover:text-indigo-200 bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-800/60 transition-colors cursor-pointer"
              >
                Customize Preferences
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="w-full md:w-auto px-4 py-2 rounded-xl text-xs font-bold text-slate-900 bg-[#7DD3FC] hover:bg-[#38BDF8] shadow-sm transition-colors cursor-pointer"
              >
                Accept All
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. GRANULAR PREFERENCES MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Cookie & Tracking Settings
                  </h3>
                  <p className="text-xs text-slate-500">
                    Control which optional cookies and processing categories you allow.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cookie Categories */}
            <div className="space-y-4">
              {/* GPC Signal Indicator (e.g. Brave, Firefox, DuckDuckGo) */}
              {gpcDetected && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    <strong className="font-semibold">Global Privacy Control (GPC) Detected:</strong> Your browser privacy preferences were detected. Optional cookies and external analytics are disabled by default.
                  </p>
                </div>
              )}

              {/* Category 1: Essential Cookies */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      1. Essential Cookies & Sessions
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Always Active
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={true}
                    disabled={true}
                    className="w-4 h-4 accent-emerald-600 cursor-not-allowed opacity-75"
                  />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Required to authenticate students, secure active sessions, prevent cross-site request forgery, and support essential navigation. These cannot be disabled.
                </p>
              </div>

              {/* Category 2: Functional Cookies */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    2. Functional Cookies & Preferences
                  </span>
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={(e) =>
                      setPreferences({ ...preferences, functional: e.target.checked })
                    }
                    className="w-4 h-4 accent-indigo-600 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Remembers your interface settings, theme preferences (light/dark mode), geographical discovery filters, and dashboard layout configurations across visits.
                </p>
              </div>

              {/* Category 3: Analytics Cookies */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    3. Analytics & Performance Cookies
                  </span>
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) =>
                      setPreferences({ ...preferences, analytics: e.target.checked })
                    }
                    className="w-4 h-4 accent-indigo-600 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Helps us understand aggregated page traffic and platform interaction patterns to optimize career recommendation algorithms. No third-party tracking or profiling is performed.
                </p>
              </div>

              {/* Category 4: Advertising Cookies (Explicitly Disclosed as Unused) */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">
                      4. Advertising & Tracking Cookies
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                      Not Used
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={false}
                    disabled={true}
                    className="w-4 h-4 opacity-40 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Career Compass is an educational platform and does not sell user data or run commercial third-party advertising networks. This category is permanently disabled.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <a
                href="/cookie-policy"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <Info className="w-3.5 h-3.5" />
                Read our full Cookie Policy
              </a>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRejectOptional}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                >
                  Reject All Optional
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors cursor-pointer"
                >
                  Save My Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Global helper to trigger the cookie modal from any link/button
export function openCookiePreferences() {
  window.dispatchEvent(new CustomEvent("open-cookie-preferences"));
}

