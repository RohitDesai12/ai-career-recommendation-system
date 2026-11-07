import React, { useState } from "react";
import { LegalTrustLayout } from "./legal-trust-layout";
import { Link } from "react-router";
import {
  BookOpen,
  Search,
  Compass,
  FileText,
  Briefcase,
  Mic,
  TrendingUp,
  Shield,
  Layers,
  ChevronRight,
  Sparkles
} from "lucide-react";

export function HelpCenterPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const helpGuides = [
    {
      category: "Getting Started",
      icon: Compass,
      articles: [
        {
          title: "How to register and verify your student account",
          desc: "Step-by-step instructions for creating an account with consent verification.",
          link: "/signup",
        },
        {
          title: "Completing your professional student profile",
          desc: "How to enter academics, categorized skills, work experience, and projects.",
          link: "/profile",
        },
        {
          title: "Managing public portfolio visibility",
          desc: "Configuring which profile sections (email, projects, skills) are publicly visible.",
          link: "/settings",
        },
      ],
    },
    {
      category: "Assessment & Roadmaps",
      icon: TrendingUp,
      articles: [
        {
          title: "How the Career Assessment calculates compatibility",
          desc: "Understanding scenario trade-offs, trait dimensions, and fit percentages.",
          link: "/assessment",
        },
        {
          title: "Generating and following technical learning roadmaps",
          desc: "Tracking milestones, skill benchmarks, and prerequisites for your target role.",
          link: "/roadmap",
        },
        {
          title: "Interpreting skill gap insights",
          desc: "Identifying missing skills compared to current industry benchmarks.",
          link: "/career-progress",
        },
      ],
    },
    {
      category: "Resume Studio & ATS Analyzer",
      icon: FileText,
      articles: [
        {
          title: "Uploading and parsing existing PDF/DOCX resumes",
          desc: "How our in-memory parser extracts sections without sharing data externally.",
          link: "/resume",
        },
        {
          title: "Understanding ATS compatibility scores",
          desc: "What keyword density, section headers, and formatting checks measure.",
          link: "/ai-transparency",
        },
        {
          title: "Tailoring your resume for specific job listings",
          desc: "Using the job tailor tool to compare your skills against company requirements.",
          link: "/resume-studio/tailor",
        },
      ],
    },
    {
      category: "Jobs & Applications",
      icon: Briefcase,
      articles: [
        {
          title: "How real-time ATS job discovery works",
          desc: "Navigating verified Greenhouse and Lever postings across India and international markets.",
          link: "/jobs",
        },
        {
          title: "Applying on official company career portals",
          desc: "Why Career Compass directs you to official employer domains to complete applications.",
          link: "/disclaimer",
        },
        {
          title: "Using the personal application tracker",
          desc: "Updating application statuses from Submitted to Interviewing, Offer, or Closed.",
          link: "/jobs?tab=applications",
        },
      ],
    },
    {
      category: "Practice & AI Coaching",
      icon: Mic,
      articles: [
        {
          title: "Preparing with the AI Mock Interview system",
          desc: "Answering adaptive technical questions and reviewing structured performance feedback.",
          link: "/mock-interview",
        },
        {
          title: "Enrolling in curated external courses",
          desc: "Tracking course progress and syncing completed skills with your profile.",
          link: "/courses",
        },
      ],
    },
    {
      category: "Privacy, Data & Account Rights",
      icon: Shield,
      articles: [
        {
          title: "Downloading your complete data export",
          desc: "How to export your profile, resumes, and assessment data in structured JSON.",
          link: "/settings",
        },
        {
          title: "Permanently deleting your student account",
          desc: "The multi-step confirmation process and timeline for data erasure.",
          link: "/data-deletion",
        },
        {
          title: "Configuring cookie and notification preferences",
          desc: "Adjusting functional, analytics, and marketing tracking permissions.",
          link: "/cookie-policy",
        },
      ],
    },
  ];

  const filteredGuides = helpGuides
    .map((section) => ({
      ...section,
      articles: section.articles.filter(
        (art) =>
          art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          art.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
          section.category.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((section) => section.articles.length > 0);

  return (
    <LegalTrustLayout
      title="Help Center & User Guides"
      subtitle="Comprehensive knowledge base and operational documentation to help you get the most out of Career Compass."
      lastUpdated="November 2026"
      badge="Student Knowledge Base"
    >
      <div className="space-y-8">
        
        {/* Search Bar */}
        <div className="p-4 sm:p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 not-prose">
          <label className="text-xs font-bold text-slate-700 block">
            Search Documentation & Tutorials
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by keyword (e.g., ATS score, delete account, roadmap, job alerts)..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Guides Grid */}
        <div className="space-y-8 not-prose">
          {filteredGuides.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No matching help articles found for "{searchTerm}". Try a different keyword or{" "}
              <Link to="/contact" className="text-indigo-600 underline font-semibold">
                submit an inquiry
              </Link>
              .
            </div>
          ) : (
            filteredGuides.map((section) => {
              const SectionIcon = section.icon;
              return (
                <div key={section.category} className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <SectionIcon className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-base font-bold text-slate-900">
                      {section.category}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {section.articles.map((art) => (
                      <Link
                        key={art.title}
                        to={art.link}
                        className="group p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {art.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 leading-snug">
                            {art.desc}
                          </p>
                        </div>
                        <div className="pt-3 flex items-center gap-1 text-[11px] font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                          <span>Open Guide</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Support Callout */}
        <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 not-prose">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-indigo-950 block">Still Have Questions?</span>
            <p className="text-xs text-indigo-800">Our support desk is available to assist with any technical or platform questions.</p>
          </div>
          <Link
            to="/contact"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
          >
            Contact Support Desk →
          </Link>
        </div>

      </div>
    </LegalTrustLayout>
  );
}

export default HelpCenterPage;

