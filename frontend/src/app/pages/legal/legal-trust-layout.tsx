import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";
import { CookieConsentBanner } from "../../components/cookie-consent-banner";
import {
  ShieldCheck,
  FileText,
  Lock,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  Mail,
  Scale,
  Trash2,
  Eye,
  CheckCircle2,
  ChevronRight,
  ArrowUp,
  Layers,
  BookOpen
} from "lucide-react";

interface LegalTrustLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated?: string;
  badge?: string;
  children: React.ReactNode;
}

export function LegalTrustLayout({
  title,
  subtitle,
  lastUpdated = "November 2026",
  badge = "Trust & Transparency",
  children,
}: LegalTrustLayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentPath]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navGroups = [
    {
      group: "Legal Policies",
      items: [
        { label: "Privacy Policy", to: "/privacy-policy", icon: ShieldCheck },
        { label: "Terms & Conditions", to: "/terms", icon: Scale },
        { label: "Cookie Policy", to: "/cookie-policy", icon: Layers },
        { label: "Platform Disclaimer", to: "/disclaimer", icon: AlertTriangle },
        { label: "Copyright Policy", to: "/copyright", icon: FileText },
      ],
    },
    {
      group: "Trust, AI & Security",
      items: [
        { label: "AI Transparency", to: "/ai-transparency", icon: Sparkles },
        { label: "Security Policy", to: "/security", icon: Lock },
        { label: "Data Deletion Policy", to: "/data-deletion", icon: Trash2 },
        { label: "Accessibility Statement", to: "/accessibility", icon: Eye },
      ],
    },
    {
      group: "Help & Inquiries",
      items: [
        { label: "Help Center", to: "/help", icon: BookOpen },
        { label: "Platform FAQs", to: "/faqs", icon: HelpCircle },
        { label: "Contact Us & Inquiries", to: "/contact", icon: Mail },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar */}
      <Navbar variant="default" />

      {/* Hero Header Banner */}
      <header className="pt-28 pb-12 sm:pb-16 bg-[#0B1120] text-white border-b border-slate-800 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-300 font-medium">Trust Center</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#7DD3FC] font-semibold">{title}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-[#7DD3FC] text-xs font-bold tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5 text-[#7DD3FC]" />
                <span>{badge}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {title}
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {subtitle}
              </p>
            </div>

            <div className="shrink-0 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Officially Documented</span>
              </div>
              <p className="text-[11px]">Last Updated: {lastUpdated}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container with 2-Column Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Navigation Sidebar */}
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-5">
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Trust Center Index
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                    12 Modules
                  </span>
                </div>

                <div className="space-y-4">
                  {navGroups.map((group) => (
                    <div key={group.group} className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-1">
                        {group.group}
                      </span>
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPath === item.to;
                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                              isActive
                                ? "bg-indigo-600 text-white shadow-xs font-bold"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                          >
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Quick Assistance Card */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                    <span className="text-xs font-bold text-indigo-900 block">
                      Need Legal or Privacy Clarification?
                    </span>
                    <p className="text-[11px] text-indigo-800 leading-snug">
                      Submit an inquiry directly through our dedicated Privacy and Grievance channel.
                    </p>
                    <Link
                      to="/contact?category=privacy_request"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline"
                    >
                      Contact Grievance Officer →
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </aside>

          {/* Right Main Content Pane */}
          <section className="lg:col-span-9 min-w-0">
            <article className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs prose prose-slate max-w-none text-slate-700 leading-relaxed">
              {children}
            </article>
          </section>

        </div>
      </main>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-40 p-3 rounded-2xl bg-indigo-600 text-white shadow-xl hover:bg-indigo-700 transition-all cursor-pointer hover:scale-105"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

