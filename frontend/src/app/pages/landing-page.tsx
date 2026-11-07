import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { CookieConsentBanner } from "../components/cookie-consent-banner";
import { ScrollReveal } from "../components/scroll-reveal";
import { useAuth } from "../context/auth-context";
import { getApiUrl } from "../config/api";
import {
  Compass,
  Briefcase,
  BookOpen,
  Award,
  Layers,
  TrendingUp,
  Target,
  BrainCircuit,
  FileText,
  Mic,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Globe2,
  ShieldCheck,
  Search,
  Sparkles,
  MapPin,
  Building2,
  Code2,
  GraduationCap,
  Play,
  Check,
  ExternalLink,
  Laptop
} from "lucide-react";

interface PublicJob {
  _id: string;
  title: string;
  companyName: string;
  location: string;
  workMode: string;
  type?: string;
  sourceType?: string;
  matchScore?: number;
  skills?: string[];
}

export function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [liveJobs, setLiveJobs] = useState<PublicJob[]>([]);
  const [heroMounted, setHeroMounted] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const getStartedRoute = isAuthenticated ? "/dashboard" : "/signup";

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (motionQuery.matches) {
        setPrefersReducedMotion(true);
      }
    }
  }, []);

  // Fetch real public jobs from backend if available
  useEffect(() => {
    let isMounted = true;
    async function fetchJobs() {
      try {
        const res = await fetch(getApiUrl("/api/employer/public-jobs"));
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.jobs) && data.jobs.length > 0) {
            setLiveJobs(data.jobs.slice(0, 3));
          }
        }
      } catch {
        // Fallback gracefully to verified curated listings
      }
    }
    fetchJobs();
    return () => {
      isMounted = false;
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
  };

  // Fallback curated jobs if API is loading
  const displayJobs: PublicJob[] = liveJobs.length > 0 ? liveJobs : [
    {
      _id: "job-1",
      title: "Data Platform Engineer",
      companyName: "Twitch",
      location: "San Francisco, CA (Hybrid)",
      workMode: "Hybrid",
      type: "Full-Time",
      sourceType: "Greenhouse",
      matchScore: 94,
      skills: ["Python", "Apache Spark", "SQL", "Kafka"]
    },
    {
      _id: "job-2",
      title: "Backend Infrastructure Engineer",
      companyName: "Spotify",
      location: "Stockholm, Sweden (Remote)",
      workMode: "Remote",
      type: "Full-Time",
      sourceType: "Lever",
      matchScore: 91,
      skills: ["Java", "Docker", "Kubernetes", "AWS"]
    },
    {
      _id: "job-3",
      title: "Full Stack Software Engineer",
      companyName: "Razorpay",
      location: "Bengaluru, India (Hybrid)",
      workMode: "Hybrid",
      type: "Full-Time",
      sourceType: "Greenhouse",
      matchScore: 89,
      skills: ["React", "TypeScript", "Node.js", "PostgreSQL"]
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#172033] font-sans antialiased overflow-x-hidden selection:bg-[#7DD3FC] selection:text-[#0A0F1D]">
      
      {/* ========================================================================= */}
      {/* HEADER (Preserves 100% existing navigation content, dropdowns and routes)  */}
      {/* ========================================================================= */}
      <Navbar variant="cinematic" />

      <main className="w-full">
        
        {/* ========================================================================= */}
        {/* SECTION 1 — HERO (Dark navy / charcoal with cinematic photograph)         */}
        {/* ========================================================================= */}
        <section className="relative w-full min-h-[94vh] lg:min-h-screen flex flex-col justify-between pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#080C16]">
          
          {/* Background Photograph Container with responsive cover and smooth initial entrance */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <img
              src="/images/hero-cinematic.jpg"
              alt="Professional engineer discovering opportunities with Career Compass"
              className={`w-full h-full object-cover object-[75%_center] lg:object-center transition-all ease-out duration-1000 ${
                heroMounted || prefersReducedMotion ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]"
              }`}
              style={{
                filter: "contrast(1.05) brightness(0.92)",
              }}
            />
            {/* Cinematic Charcoal / Deep Navy Gradient Overlay: Solid on left to cleanly occlude baked-in graphic text */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-[#080C16] via-[#080C16] via-[65%] sm:via-[48%] to-[#080C16]/20 to-[92%]"
              aria-hidden="true"
            />
            {/* Bottom gradient to cleanly mask bottom baked text while keeping laptop & person visible */}
            <div
              className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#080C16] via-[#080C16] via-[45%] to-transparent"
              aria-hidden="true"
            />
            {/* Subtle top vertical vignette for seamless header blending */}
            <div
              className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#080C16]/80 to-transparent"
              aria-hidden="true"
            />
          </div>

          {/* Hero Main Content Area */}
          <div className="relative z-10 w-full max-w-7xl mx-auto my-auto pt-6 sm:pt-14 md:pt-18 lg:pt-24">
            <div className="max-w-2xl lg:max-w-3xl">
              
              {/* Pure White Headline (Strictly NO purple/blue gradient text) */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[70px] font-extrabold tracking-tight leading-[1.06] text-white">
                Your Career.<br />
                Our Direction.
              </h1>

              {/* Platform Description */}
              <p className="mt-5 sm:mt-6 text-base sm:text-lg md:text-xl text-slate-300 font-normal leading-relaxed max-w-xl">
                An AI-powered career platform to discover your potential,
                build in-demand skills, prepare for opportunities,
                and find jobs that match your goals.
              </p>

              {/* Call to Action Buttons */}
              <div className="mt-7 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4">
                {/* Primary Button: Light Blue (#7DD3FC / #8DD8F5) with Dark Navy text */}
                <Link
                  to={getStartedRoute}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#7DD3FC] hover:bg-[#BAE6FD] text-[#0A0F1D] font-bold text-sm sm:text-base tracking-tight shadow-lg shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-center"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4 text-[#0A0F1D]" />
                </Link>

                {/* Secondary Button: Transparent with subtle white border & white text */}
                <button
                  type="button"
                  onClick={() => scrollToSection("how-it-works")}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/35 hover:border-white text-white font-medium text-sm sm:text-base tracking-tight backdrop-blur-xs hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer text-center"
                >
                  <Play className="w-3.5 h-3.5 text-white/80 fill-white/20" />
                  <span>See How It Works</span>
                </button>
              </div>

            </div>
          </div>

          {/* Hero Feature Highlights (4 Cards at Bottom of Hero) */}
          <div className="relative z-10 w-full max-w-7xl mx-auto pt-8 sm:pt-12 pb-2">
            <div className="rounded-2xl bg-[#080C16]/94 backdrop-blur-md border border-white/10 p-5 sm:p-7 shadow-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0">
              
              {/* Feature 1: Discover Your Path */}
              <div className="lg:pr-6 lg:border-r border-white/10">
                <div className="flex items-center gap-2.5 text-[#7DD3FC] mb-2">
                  <Target className="w-5 h-5 text-[#7DD3FC]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Discover Your Path
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
                  Identify the right career with AI-powered assessments and personalized insights.
                </p>
              </div>

              {/* Feature 2: Build In-Demand Skills */}
              <div className="lg:px-6 lg:border-r border-white/10">
                <div className="flex items-center gap-2.5 text-[#7DD3FC] mb-2">
                  <Layers className="w-5 h-5 text-[#7DD3FC]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Build In-Demand Skills
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
                  Learn with curated courses and role-based learning paths.
                </p>
              </div>

              {/* Feature 3: Find Verified Opportunities */}
              <div className="lg:px-6 lg:border-r border-white/10">
                <div className="flex items-center gap-2.5 text-[#7DD3FC] mb-2">
                  <Briefcase className="w-5 h-5 text-[#7DD3FC]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Find Verified Opportunities
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
                  Explore real jobs and internships from trusted company sources.
                </p>
              </div>

              {/* Feature 4: Stay Career Ready */}
              <div className="lg:pl-6">
                <div className="flex items-center gap-2.5 text-[#7DD3FC] mb-2">
                  <TrendingUp className="w-5 h-5 text-[#7DD3FC]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Stay Career Ready
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
                  Improve your resume, practice interviews, and track your progress in one place.
                </p>
              </div>

            </div>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* SECTION 2 — CAREER INTELLIGENCE (Pure White Background #FFFFFF)           */}
        {/* ========================================================================= */}
        <section id="features" className="py-24 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#FFFFFF] border-t border-[#E2E8F0]">
          <div className="max-w-7xl mx-auto">
            
            <ScrollReveal effect="fade-up">
              <div className="max-w-3xl mx-auto text-center">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF6FF] border border-[#356FD8]/25 text-[#356FD8] text-xs font-bold uppercase tracking-widest mb-4">
                  Career Intelligence
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#101827] tracking-tight leading-tight">
                  Everything You Need to Move Your Career Forward
                </h2>
                <p className="mt-4 text-base sm:text-lg text-[#64748B] leading-relaxed">
                  One platform to discover your strengths, develop industry-relevant skills,
                  prepare for opportunities and take control of your career journey.
                </p>
              </div>
            </ScrollReveal>

            {/* 4 Core Capability Cards (Bright White Cards on Pure White Section with clean borders & soft shadows) */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
              
              {/* Card 1: Career Discovery */}
              <ScrollReveal effect="fade-up" delay={0} className="h-full">
                <div className="h-full rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-[#356FD8]/50 transition-all group">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#EEF6FF] text-[#356FD8] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform shadow-xs">
                      <Target className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-[#356FD8] uppercase tracking-wider block mb-1">
                      Assessment Engine
                    </span>
                    <h3 className="text-xl font-bold text-[#101827] mb-2.5">
                      Career Discovery
                    </h3>
                    <p className="text-sm text-[#64748B] leading-relaxed">
                      AI diagnostic assessments evaluating cognitive strengths, coding aptitude, and role affinity to map your optimal career path.
                    </p>
                  </div>
                  <div className="mt-6 pt-5 border-t border-[#F1F5F9]">
                    <Link
                      to="/assessment"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#356FD8] hover:text-[#2557B8] transition-colors"
                    >
                      <span>Take Career Assessment</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>

              {/* Card 2: Personalized Learning */}
              <ScrollReveal effect="fade-up" delay={120} className="h-full">
                <div className="h-full rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-[#356FD8]/50 transition-all group">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#EEF6FF] text-[#356FD8] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform shadow-xs">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-[#356FD8] uppercase tracking-wider block mb-1">
                      Curated Tracks
                    </span>
                    <h3 className="text-xl font-bold text-[#101827] mb-2.5">
                      Personalized Learning
                    </h3>
                    <p className="text-sm text-[#64748B] leading-relaxed">
                      130+ verified courses and 10 industry career learning paths designed with 3 progression stages to bridge your exact skill gaps.
                    </p>
                  </div>
                  <div className="mt-6 pt-5 border-t border-[#F1F5F9]">
                    <Link
                      to="/courses"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#356FD8] hover:text-[#2557B8] transition-colors"
                    >
                      <span>Explore Learning Paths</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>

              {/* Card 3: Intelligent Job Discovery */}
              <ScrollReveal effect="fade-up" delay={240} className="h-full">
                <div className="h-full rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-[#356FD8]/50 transition-all group">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#EEF6FF] text-[#356FD8] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform shadow-xs">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-[#356FD8] uppercase tracking-wider block mb-1">
                      Live ATS Sync
                    </span>
                    <h3 className="text-xl font-bold text-[#101827] mb-2.5">
                      Intelligent Job Discovery
                    </h3>
                    <p className="text-sm text-[#64748B] leading-relaxed">
                      1,500+ real jobs from official Greenhouse and Lever company career boards across India 🇮🇳, International 🌎, and Remote 🌐 markets.
                    </p>
                  </div>
                  <div className="mt-6 pt-5 border-t border-[#F1F5F9]">
                    <Link
                      to="/jobs"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#356FD8] hover:text-[#2557B8] transition-colors"
                    >
                      <span>Discover Verified Jobs</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>

              {/* Card 4: Career Preparation */}
              <ScrollReveal effect="fade-up" delay={360} className="h-full">
                <div className="h-full rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-[#356FD8]/50 transition-all group">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#EEF6FF] text-[#356FD8] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform shadow-xs">
                      <Mic className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-[#356FD8] uppercase tracking-wider block mb-1">
                      ATS & Voice AI
                    </span>
                    <h3 className="text-xl font-bold text-[#101827] mb-2.5">
                      Career Preparation
                    </h3>
                    <p className="text-sm text-[#64748B] leading-relaxed">
                      Instant ATS resume optimization and real-time voice AI mock interview simulations with diagnostic rubrics and feedback.
                    </p>
                  </div>
                  <div className="mt-6 pt-5 border-t border-[#F1F5F9]">
                    <Link
                      to="/resume-studio"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#356FD8] hover:text-[#2557B8] transition-colors"
                    >
                      <span>Launch Resume Studio</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3 — DISCOVER YOUR CAREER (Deep Navy Background #101827)            */}
        {/* ========================================================================= */}
        <section className="py-24 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#101827] text-white border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left Column: Editorial Information */}
              <div className="lg:col-span-6">
                <ScrollReveal effect="slide-left">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/70 border border-sky-800/60 text-[#7DD3FC] text-xs font-bold uppercase tracking-wider mb-4">
                    Career Recommendation
                  </span>
                  
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-5">
                    Find the Career That Fits Your Potential
                  </h2>
                  
                  <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-6">
                    Our AI Career Assessment analyzes your technical strengths, interests, and problem-solving instincts to uncover the high-impact career paths where you are naturally positioned to succeed.
                  </p>

                  <ul className="space-y-3.5 mb-8">
                    {[
                      "Explore career interests across modern software and data industries",
                      "Assess technical aptitude, logic, and problem-solving strengths",
                      "Discover suitable job roles with market compensation benchmarks",
                      "Understand specific skill prerequisites and industry qualifications",
                      "Receive transparent, explainable recommendations tailored to you"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-slate-200">
                        <CheckCircle2 className="w-5 h-5 text-[#7DD3FC] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/assessment"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#7DD3FC] hover:bg-[#BAE6FD] text-[#0A0F1D] font-bold text-sm tracking-tight shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <span>Take Free Career Assessment</span>
                    <ArrowRight className="w-4 h-4 text-[#0A0F1D]" />
                  </Link>
                </ScrollReveal>
              </div>

              {/* Right Column: BRIGHT WHITE Card on Deep Navy Background (High Contrast Pop) */}
              <div className="lg:col-span-6">
                <ScrollReveal effect="slide-right" delay={150}>
                  <div className="rounded-3xl bg-[#FFFFFF] border border-[#E5EAF1] p-6 sm:p-8 shadow-2xl relative overflow-hidden text-[#101827]">
                    
                    {/* Top Status Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-[#E5EAF1] mb-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#EEF6FF] text-[#356FD8] flex items-center justify-center">
                          <Compass className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#101827] block">Diagnostic Assessment</span>
                          <span className="text-[11px] text-[#64748B]">15 Dimensions Evaluated</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        94% Role Fit
                      </span>
                    </div>

                    {/* Top Recommended Career */}
                    <div className="rounded-2xl bg-[#F8FAFC] border border-[#E5EAF1] p-5 mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#356FD8] uppercase tracking-wider">Top Recommendation</span>
                        <span className="text-xs text-[#64748B]">₹14 - ₹28 LPA • High Growth</span>
                      </div>
                      <h4 className="text-xl font-extrabold text-[#101827]">Data Engineer</h4>
                      <p className="text-xs text-[#526174] mt-1 leading-relaxed">
                        Strong alignment with distributed systems, SQL, Python, and big data architecture.
                      </p>
                    </div>

                    {/* Dimension Breakdown Gauges */}
                    <div className="space-y-3.5">
                      <div className="text-xs font-bold text-[#101827] uppercase tracking-wider">Strengths Profile</div>
                      
                      <div>
                        <div className="flex justify-between text-xs text-[#526174] mb-1">
                          <span className="font-medium text-[#172033]">Data Engineering & Pipelines</span>
                          <span className="font-bold text-[#101827]">92%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                          <div className="h-full bg-[#356FD8] rounded-full" style={{ width: "92%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-[#526174] mb-1">
                          <span className="font-medium text-[#172033]">Algorithmic Problem Solving</span>
                          <span className="font-bold text-[#101827]">88%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                          <div className="h-full bg-[#356FD8] rounded-full" style={{ width: "88%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-[#526174] mb-1">
                          <span className="font-medium text-[#172033]">Cloud & Infrastructure</span>
                          <span className="font-bold text-[#101827]">84%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                          <div className="h-full bg-[#356FD8] rounded-full" style={{ width: "84%" }} />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-6 pt-4 border-t border-[#E5EAF1] flex items-center justify-between text-xs text-[#64748B]">
                      <span>Personalized report generated in &lt; 5 minutes</span>
                      <Link to="/assessment" className="text-[#356FD8] font-bold hover:underline">
                        Start Assessment →
                      </Link>
                    </div>

                  </div>
                </ScrollReveal>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4 — BUILD YOUR SKILLS (Very Light Grey Background #F5F7FA)         */}
        {/* ========================================================================= */}
        <section className="py-24 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#F5F7FA] text-[#172033] border-t border-[#E2E8F0]">
          <div className="max-w-7xl mx-auto">
            
            <ScrollReveal effect="fade-up">
              <div className="max-w-3xl mx-auto text-center mb-16">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#CBD5E1] text-[#356FD8] text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
                  Curated Learning Hub
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#101827] tracking-tight leading-tight">
                  Turn Your Ambitions Into Skills
                </h2>
                <p className="mt-4 text-base sm:text-lg text-[#64748B] leading-relaxed">
                  Bridge the gap between where you are and where you want to be. Follow structured 3-stage learning paths with verified courses and hands-on milestones.
                </p>
              </div>
            </ScrollReveal>

            {/* Standardized Learning Paths Showcase (Bright White Cards with clean borders) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              
              {/* Path 1: Data Engineer */}
              <ScrollReveal effect="fade-up" delay={0} className="h-full">
                <div className="h-full rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-[#356FD8]/50 transition-all group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-2.5 py-1 rounded-md bg-[#EEF6FF] border border-[#356FD8]/25 text-[#356FD8] text-xs font-bold">
                        10 Courses • 8 Weeks
                      </span>
                      <span className="text-xs text-[#64748B]">3 Stages</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#101827] mb-2 group-hover:text-[#356FD8] transition-colors">
                      Data Engineer Learning Path
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mb-5">
                      Master modern batch and real-time data streaming architectures, ETL pipelines, and cloud warehouses.
                    </p>
                    <div className="space-y-2.5 mb-6">
                      <div className="flex items-center gap-2.5 text-xs text-[#475569]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#356FD8] shrink-0" />
                        <span>Stage 1: Python, Advanced SQL & Data Structures</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-[#475569]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#356FD8] shrink-0" />
                        <span>Stage 2: PySpark, Data Warehouses (Snowflake, BigQuery)</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-[#475569]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#356FD8] shrink-0" />
                        <span>Stage 3: Distributed Kafka Streaming & Cloud Deployment</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/courses"
                    className="w-full py-2.5 rounded-xl bg-[#F1F5F9] hover:bg-[#356FD8] hover:text-white text-[#172033] text-xs font-bold text-center border border-[#E2E8F0] transition-all block shadow-2xs"
                  >
                    View Data Engineer Track
                  </Link>
                </div>
              </ScrollReveal>

              {/* Path 2: Full Stack Developer */}
              <ScrollReveal effect="fade-up" delay={120} className="h-full">
                <div className="h-full rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-[#356FD8]/50 transition-all group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-2.5 py-1 rounded-md bg-[#EEF6FF] border border-[#356FD8]/25 text-[#356FD8] text-xs font-bold">
                        12 Courses • 10 Weeks
                      </span>
                      <span className="text-xs text-[#64748B]">3 Stages</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#101827] mb-2 group-hover:text-[#356FD8] transition-colors">
                      Full Stack Developer Path
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mb-5">
                      Build production-ready web applications from responsive modern frontends to robust microservices backends.
                    </p>
                    <div className="space-y-2.5 mb-6">
                      <div className="flex items-center gap-2.5 text-xs text-[#475569]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#356FD8] shrink-0" />
                        <span>Stage 1: TypeScript, Modern React, Tailwind CSS</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-[#475569]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#356FD8] shrink-0" />
                        <span>Stage 2: Node.js, Express, PostgreSQL, Redis</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-[#475569]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#356FD8] shrink-0" />
                        <span>Stage 3: Docker Containers, CI/CD, AWS Deployment</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/courses"
                    className="w-full py-2.5 rounded-xl bg-[#F1F5F9] hover:bg-[#356FD8] hover:text-white text-[#172033] text-xs font-bold text-center border border-[#E2E8F0] transition-all block shadow-2xs"
                  >
                    View Full Stack Track
                  </Link>
                </div>
              </ScrollReveal>

              {/* Path 3: AI / Machine Learning */}
              <ScrollReveal effect="fade-up" delay={240} className="h-full">
                <div className="h-full rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-[#356FD8]/50 transition-all group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-2.5 py-1 rounded-md bg-[#EEF6FF] border border-[#356FD8]/25 text-[#356FD8] text-xs font-bold">
                        14 Courses • 12 Weeks
                      </span>
                      <span className="text-xs text-[#64748B]">3 Stages</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#101827] mb-2 group-hover:text-[#356FD8] transition-colors">
                      AI & Machine Learning Path
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mb-5">
                      Master deep learning fundamentals, neural networks, LLM fine-tuning, and modern vector retrieval architectures.
                    </p>
                    <div className="space-y-2.5 mb-6">
                      <div className="flex items-center gap-2.5 text-xs text-[#475569]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#356FD8] shrink-0" />
                        <span>Stage 1: Python for Data Science, Math & Statistics</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-[#475569]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#356FD8] shrink-0" />
                        <span>Stage 2: PyTorch, Neural Networks, Scikit-learn</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-[#475569]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#356FD8] shrink-0" />
                        <span>Stage 3: LLM Embeddings, RAG Pipelines, Model Serving</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/courses"
                    className="w-full py-2.5 rounded-xl bg-[#F1F5F9] hover:bg-[#356FD8] hover:text-white text-[#172033] text-xs font-bold text-center border border-[#E2E8F0] transition-all block shadow-2xs"
                  >
                    View AI/ML Track
                  </Link>
                </div>
              </ScrollReveal>

            </div>

            {/* Bottom CTA Button */}
            <div className="mt-14 text-center">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#356FD8] hover:bg-[#2557B8] text-white font-bold text-sm tracking-tight shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Explore Learning Paths</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5 — FIND OPPORTUNITIES (Deep Navy Background #101827)              */}
        {/* ========================================================================= */}
        <section className="py-24 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#101827] text-white border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto">
            
            <ScrollReveal effect="fade-up">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/70 border border-sky-800/60 text-[#7DD3FC] text-xs font-bold uppercase tracking-wider mb-4">
                    Verified Job Ingestion
                  </span>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                    Find Opportunities That Match Your Ambitions
                  </h2>
                  <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
                    Explore real, verified job listings ingested directly from official Greenhouse and Lever career boards. Discover opportunities across India 🇮🇳, International 🌎, and Remote Worldwide 🌐 markets.
                  </p>
                </div>

                <div className="shrink-0">
                  <Link
                    to="/jobs"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#7DD3FC] hover:bg-[#BAE6FD] text-[#0A0F1D] font-bold text-sm tracking-tight shadow-md transition-all"
                  >
                    <span>Explore Opportunities</span>
                    <ArrowRight className="w-4 h-4 text-[#0A0F1D]" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>

            {/* 3 Real Job Cards (BRIGHT WHITE Cards on Deep Navy Background #101827) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {displayJobs.map((job, idx) => (
                <ScrollReveal key={job._id || idx} effect="fade-up" delay={idx * 120} className="h-full">
                  <div className="h-full rounded-2xl bg-[#FFFFFF] border border-[#E5EAF1] p-6 sm:p-7 flex flex-col justify-between shadow-xl text-[#101827] hover:border-sky-400 hover:shadow-2xl transition-all group">
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          {job.matchScore || 92}% Match
                        </span>
                        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                          {job.sourceType || "Official ATS"}
                        </span>
                      </div>

                      {/* Job Title & Company */}
                      <h3 className="text-lg font-bold text-[#101827] mb-1 group-hover:text-[#356FD8] transition-colors">
                        {job.title}
                      </h3>
                      <div className="text-xs text-[#526174] mb-4 flex items-center gap-2">
                        <span className="font-semibold text-[#101827]">{job.companyName}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location}
                        </span>
                      </div>

                      {/* Matching Skills */}
                      {job.skills && job.skills.length > 0 && (
                        <div className="space-y-1.5 mb-6">
                          <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                            Matching Skills
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {job.skills.map((skill, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2 py-0.5 rounded bg-[#F1F5F9] border border-[#E2E8F0] text-[#172033] text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-[#E5EAF1] flex items-center justify-between">
                      <span className="text-xs text-[#64748B] font-medium">
                        {job.workMode || "Hybrid"}
                      </span>
                      <Link
                        to="/jobs"
                        className="text-xs font-bold text-[#356FD8] hover:text-[#2557B8] hover:underline flex items-center gap-1"
                      >
                        <span>View Job Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Note on official verification without unrealistic guarantees */}
            <div className="mt-8 text-center text-xs text-slate-400 max-w-2xl mx-auto">
              <span>Verified through official ATS integrations (Greenhouse, Lever) with direct company career page links. Career Compass provides genuine market discovery and does not claim guaranteed job placements.</span>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 6 — PREPARE FOR SUCCESS (Pure White Background #FFFFFF)           */}
        {/* ========================================================================= */}
        <section className="py-24 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#FFFFFF] text-[#172033] border-t border-[#E2E8F0]">
          <div className="max-w-7xl mx-auto">
            
            <ScrollReveal effect="fade-up">
              <div className="max-w-3xl mx-auto text-center mb-16">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF6FF] border border-[#356FD8]/25 text-[#356FD8] text-xs font-bold uppercase tracking-wider mb-4">
                  Career Readiness
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#101827] tracking-tight leading-tight">
                  Prepare With Confidence. Stand Out With Your Skills.
                </h2>
                <p className="mt-4 text-base sm:text-lg text-[#64748B] leading-relaxed">
                  Turn your applications into interview invites. Optimize your resume for automated ATS parsers and rehearse real technical and behavioral interview scenarios with interactive voice AI.
                </p>
              </div>
            </ScrollReveal>

            {/* Professional Split Layout: 2 Bright White Cards on White Section with soft shadows */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
              
              {/* Left Card: Resume Studio */}
              <ScrollReveal effect="slide-left" delay={0} className="h-full">
                <div className="h-full rounded-3xl bg-[#FFFFFF] border border-[#E2E8F0] p-7 sm:p-9 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-[#356FD8]/40 transition-all">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#EEF6FF] text-[#356FD8] flex items-center justify-center mb-6 shadow-xs">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-[#356FD8] uppercase tracking-wider block mb-1">
                      Resume Studio & ATS Analyzer
                    </span>
                    <h3 className="text-2xl font-bold text-[#101827] mb-3">
                      AI Resume Optimization
                    </h3>
                    <p className="text-sm text-[#64748B] leading-relaxed mb-6">
                      Score your resume against targeted job descriptions in seconds. Identify missing keywords, formatting errors, and metric-driven improvements to pass corporate ATS screeners.
                    </p>

                    {/* Feature Micro List */}
                    <div className="space-y-3 mb-8">
                      <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                        <span className="text-[#475569] font-medium">ATS Score Benchmark</span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          88 / 100 • High Fit
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                        <span className="text-[#475569] font-medium">Keyword Extraction</span>
                        <span className="text-[#356FD8] font-bold">14 matched • 2 missing</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/resume-studio"
                    className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-[#356FD8] hover:bg-[#2557B8] text-white font-bold text-sm tracking-tight shadow-md transition-all text-center"
                  >
                    <span>Launch Resume Studio</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </Link>
                </div>
              </ScrollReveal>

              {/* Right Card: AI Mock Interview */}
              <ScrollReveal effect="slide-right" delay={150} className="h-full">
                <div className="h-full rounded-3xl bg-[#FFFFFF] border border-[#E2E8F0] p-7 sm:p-9 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-[#356FD8]/40 transition-all">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#EEF6FF] text-[#356FD8] flex items-center justify-center mb-6 shadow-xs">
                      <Mic className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-[#356FD8] uppercase tracking-wider block mb-1">
                      Voice Simulator
                    </span>
                    <h3 className="text-2xl font-bold text-[#101827] mb-3">
                      AI Mock Interviews
                    </h3>
                    <p className="text-sm text-[#64748B] leading-relaxed mb-6">
                      Simulate real technical, architectural, and behavioral interview questions with natural voice AI. Receive immediate diagnostic scorecards with feedback on clarity, accuracy, and structure.
                    </p>

                    {/* Feature Micro List */}
                    <div className="space-y-3 mb-8">
                      <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                        <span className="text-[#475569] font-medium">Interview Formats</span>
                        <span className="text-[#356FD8] font-bold">System Design • DSA • Behavioral</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                        <span className="text-[#475569] font-medium">Diagnostic Feedback</span>
                        <span className="text-emerald-700 font-bold">Live Voice Analysis</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/mock-interview"
                    className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-[#101827] hover:bg-[#1E293B] text-white font-bold text-sm tracking-tight transition-all text-center shadow-md"
                  >
                    <span>Practice Mock Interview</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </Link>
                </div>
              </ScrollReveal>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 7 — HOW CAREER COMPASS WORKS (Very Light Grey Background #F5F7FA)  */}
        {/* ========================================================================= */}
        <section id="how-it-works" className="py-24 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#F5F7FA] text-[#172033] border-t border-[#E2E8F0]">
          <div className="max-w-7xl mx-auto">
            
            <ScrollReveal effect="fade-up">
              <div className="max-w-3xl mx-auto text-center mb-16">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#CBD5E1] text-[#356FD8] text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
                  The Journey
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#101827] tracking-tight leading-tight">
                  How Career Compass Works
                </h2>
                <p className="mt-4 text-base sm:text-lg text-[#64748B] leading-relaxed">
                  A proven four-step system guiding you from initial self-discovery to verified employment.
                </p>
              </div>
            </ScrollReveal>

            {/* Desktop Horizontal Timeline / Mobile Vertical Timeline */}
            <div className="relative">
              
              {/* Horizontal connecting line on desktop */}
              <div
                className="hidden lg:block absolute top-7 left-12 right-12 h-0.5 bg-[#CBD5E1] z-0"
                aria-hidden="true"
              />

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-6 relative z-10">
                
                {/* Step 1 */}
                <ScrollReveal effect="fade-up" delay={0}>
                  <div className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-6 sm:p-7 flex flex-col items-start lg:items-center text-left lg:text-center shadow-xs hover:shadow-md hover:border-[#356FD8]/50 transition-all group">
                    <div className="w-14 h-14 rounded-2xl bg-[#EEF6FF] border-2 border-[#356FD8] text-[#356FD8] font-extrabold text-lg flex items-center justify-center mb-5 shadow-xs group-hover:scale-105 transition-transform">
                      01
                    </div>
                    <span className="text-xs font-bold text-[#356FD8] uppercase tracking-wider mb-1">
                      Step 1
                    </span>
                    <h3 className="text-xl font-bold text-[#101827] mb-2">
                      Discover Yourself
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                      Complete your career assessment and understand your cognitive strengths, interests, and target roles.
                    </p>
                  </div>
                </ScrollReveal>

                {/* Step 2 */}
                <ScrollReveal effect="fade-up" delay={120}>
                  <div className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-6 sm:p-7 flex flex-col items-start lg:items-center text-left lg:text-center shadow-xs hover:shadow-md hover:border-[#356FD8]/50 transition-all group">
                    <div className="w-14 h-14 rounded-2xl bg-[#EEF6FF] border-2 border-[#356FD8] text-[#356FD8] font-extrabold text-lg flex items-center justify-center mb-5 shadow-xs group-hover:scale-105 transition-transform">
                      02
                    </div>
                    <span className="text-xs font-bold text-[#356FD8] uppercase tracking-wider mb-1">
                      Step 2
                    </span>
                    <h3 className="text-xl font-bold text-[#101827] mb-2">
                      Build Your Skills
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                      Follow structured roadmaps, bridge identified skill gaps, and learn with curated high-impact courses.
                    </p>
                  </div>
                </ScrollReveal>

                {/* Step 3 */}
                <ScrollReveal effect="fade-up" delay={240}>
                  <div className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-6 sm:p-7 flex flex-col items-start lg:items-center text-left lg:text-center shadow-xs hover:shadow-md hover:border-[#356FD8]/50 transition-all group">
                    <div className="w-14 h-14 rounded-2xl bg-[#EEF6FF] border-2 border-[#356FD8] text-[#356FD8] font-extrabold text-lg flex items-center justify-center mb-5 shadow-xs group-hover:scale-105 transition-transform">
                      03
                    </div>
                    <span className="text-xs font-bold text-[#356FD8] uppercase tracking-wider mb-1">
                      Step 3
                    </span>
                    <h3 className="text-xl font-bold text-[#101827] mb-2">
                      Find Opportunities
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                      Explore verified Indian and international jobs synced directly from official ATS company boards.
                    </p>
                  </div>
                </ScrollReveal>

                {/* Step 4 */}
                <ScrollReveal effect="fade-up" delay={360}>
                  <div className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-6 sm:p-7 flex flex-col items-start lg:items-center text-left lg:text-center shadow-xs hover:shadow-md hover:border-[#356FD8]/50 transition-all group">
                    <div className="w-14 h-14 rounded-2xl bg-[#EEF6FF] border-2 border-[#356FD8] text-[#356FD8] font-extrabold text-lg flex items-center justify-center mb-5 shadow-xs group-hover:scale-105 transition-transform">
                      04
                    </div>
                    <span className="text-xs font-bold text-[#356FD8] uppercase tracking-wider mb-1">
                      Step 4
                    </span>
                    <h3 className="text-xl font-bold text-[#101827] mb-2">
                      Prepare and Progress
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                      Improve your resume with AI ATS analysis, practice voice interviews, and manage application pipelines.
                    </p>
                  </div>
                </ScrollReveal>

              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 8 — FINAL CALL TO ACTION (Dark Navy / Charcoal #101827)            */}
        {/* ========================================================================= */}
        <section className="py-24 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#101827] text-white border-t border-slate-800/80">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal effect="zoom-in">
              <div className="rounded-3xl bg-[#0B1120] border border-slate-800 p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl">
                
                {/* Subtle light-blue radial glow */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"
                  aria-hidden="true"
                />

                <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
                  
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-950/70 border border-sky-800/60 text-[#7DD3FC] text-xs font-bold uppercase tracking-wider mb-6">
                    Start Your Direction
                  </span>

                  {/* Headline: Pure White */}
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
                    Your Next Opportunity Starts Here.
                  </h2>

                  {/* Description */}
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-xl">
                    Take the next step toward building a career that matches your ambitions. Discover your potential, bridge your skill gaps, and apply with confidence.
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Link
                      to={getStartedRoute}
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#7DD3FC] hover:bg-[#BAE6FD] text-[#0A0F1D] font-extrabold text-sm sm:text-base tracking-tight shadow-lg shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-center"
                    >
                      <span>Get Started Free</span>
                      <ArrowRight className="w-4 h-4 text-[#0A0F1D]" />
                    </Link>

                    <Link
                      to="/assessment"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold text-sm sm:text-base tracking-tight transition-all text-center"
                    >
                      <span>Take Career Test</span>
                    </Link>
                  </div>

                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

      </main>

      {/* ========================================================================= */}
      {/* SECTION 9 — FOOTER (Dark Charcoal #070B14)                                */}
      {/* ========================================================================= */}
      <Footer />

    </div>
  );
}
