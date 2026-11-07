import React from "react";
import { Link } from "react-router";
import { Compass, ShieldCheck } from "lucide-react";
import { openCookiePreferences } from "./cookie-consent-banner";

export function Footer() {
  return (
    <footer id="about" className="w-full bg-[#070B14] text-slate-400 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Brand & Mission Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-10 border-b border-slate-800/80 gap-6">
          <Link to="/" className="flex items-center gap-3 select-none group">
            <div className="w-10 h-10 rounded-xl bg-[#356FD8] text-white flex items-center justify-center shadow-sm shadow-[#356FD8]/25 group-hover:bg-[#2557B8] transition-colors">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-xl font-black text-white tracking-tight">Career</span>
              <span className="text-xl font-black text-[#7DD3FC] tracking-tight">Compass</span>
            </div>
          </Link>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
            AI-powered career intelligence platform guiding students from career self-discovery and skills mastery to verified job opportunities.
          </p>
        </div>

        {/* 5 Organized Columns Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10 py-12 border-b border-slate-800/80">
          
          {/* COLUMN 1 — COMPANY */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Company
            </span>
            <Link to="/#about" className="text-xs hover:text-[#7DD3FC] transition-colors">
              About Us
            </Link>
            <Link to="/contact" className="text-xs hover:text-[#7DD3FC] transition-colors">
              Contact Us
            </Link>
          </div>

          {/* COLUMN 2 — PLATFORM */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Platform
            </span>
            <Link to="/assessment" className="text-xs hover:text-[#7DD3FC] transition-colors">
              Career Test
            </Link>
            <Link to="/roadmap" className="text-xs hover:text-[#7DD3FC] transition-colors">
              Roadmaps
            </Link>
            <Link to="/courses" className="text-xs hover:text-[#7DD3FC] transition-colors">
              Courses
            </Link>
            <Link to="/jobs" className="text-xs hover:text-[#7DD3FC] transition-colors">
              Jobs
            </Link>
          </div>

          {/* COLUMN 3 — RESOURCES */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Resources
            </span>
            <Link to="/help" className="text-xs hover:text-[#7DD3FC] transition-colors">
              Help Center
            </Link>
            <Link to="/faqs" className="text-xs hover:text-[#7DD3FC] transition-colors">
              FAQs
            </Link>
            <Link to="/ai-transparency" className="text-xs hover:text-[#7DD3FC] transition-colors">
              AI Transparency
            </Link>
            <Link to="/contact?category=feedback" className="text-xs hover:text-[#7DD3FC] transition-colors">
              Feedback
            </Link>
          </div>

          {/* COLUMN 4 — LEGAL */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Legal
            </span>
            <Link to="/privacy-policy" className="text-xs hover:text-[#7DD3FC] transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-xs hover:text-[#7DD3FC] transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/cookie-policy" className="text-xs hover:text-[#7DD3FC] transition-colors">
              Cookie Policy
            </Link>
            <Link to="/disclaimer" className="text-xs hover:text-[#7DD3FC] transition-colors">
              Disclaimer
            </Link>
          </div>

          {/* COLUMN 5 — TRUST & SECURITY */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Trust & Security
            </span>
            <Link to="/security" className="text-xs hover:text-[#7DD3FC] transition-colors">
              Security Policy
            </Link>
            <Link to="/data-deletion" className="text-xs hover:text-[#7DD3FC] transition-colors">
              Data Deletion Policy
            </Link>
            <Link to="/accessibility" className="text-xs hover:text-[#7DD3FC] transition-colors">
              Accessibility Statement
            </Link>
            <Link to="/copyright" className="text-xs hover:text-[#7DD3FC] transition-colors">
              Copyright Policy
            </Link>
          </div>

        </div>

        {/* BOTTOM FOOTER */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 Career Compass. All rights reserved.
          </div>
          
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link to="/privacy-policy" className="hover:text-[#7DD3FC] transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-[#7DD3FC] transition-colors">
              Terms & Conditions
            </Link>
            <span>•</span>
            <button
              type="button"
              onClick={openCookiePreferences}
              className="hover:text-[#7DD3FC] transition-colors cursor-pointer text-left"
            >
              Cookie Settings
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}

