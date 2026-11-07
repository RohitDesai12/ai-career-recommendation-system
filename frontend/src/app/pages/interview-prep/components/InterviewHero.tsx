import React from "react";
import { 
  Building2, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  Plus, 
  CheckCircle2, 
  Code2, 
  Layers, 
  Brain, 
  MessageSquare,
  Play
} from "lucide-react";
import { UserInterviewTarget, ReadinessBreakdown } from "../types";

interface InterviewHeroProps {
  activeInterview: UserInterviewTarget | null;
  readiness: ReadinessBreakdown;
  onContinuePrep: () => void;
  onOpenGuide: (companyName: string, roleTitle: string) => void;
  onAddInterview: () => void;
  onQuickPractice: () => void;
}

export function InterviewHero({
  activeInterview,
  readiness,
  onContinuePrep,
  onOpenGuide,
  onAddInterview,
  onQuickPractice
}: InterviewHeroProps) {
  if (!activeInterview) {
    return (
      <div className="rounded-2xl border border-border bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide">
            <Sparkles size={13} />
            <span>Target Your Next Role</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-on-surface tracking-tight">
            Prepare for your next interview with a focused plan
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Set your target company and interview date to unlock an automated preparation roadmap, practice company-specific questions, and simulate real interview rounds.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={onAddInterview}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Interview</span>
          </button>
          <button
            onClick={onQuickPractice}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-surface-1 border border-border hover:bg-surface-2 text-on-surface text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Play size={14} />
            <span>Quick Practice</span>
          </button>
        </div>
      </div>
    );
  }

  // Calculate days remaining
  const today = new Date();
  const targetDate = new Date(activeInterview.interviewDate);
  const diffTime = targetDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const daysLabel = daysLeft > 0 
    ? `Interview in ${daysLeft} day${daysLeft === 1 ? "" : "s"}` 
    : daysLeft === 0 
    ? "Interview is Today!" 
    : "Interview concluded";

  return (
    <div className="rounded-2xl border border-border bg-surface-1 shadow-sm overflow-hidden">
      {/* Top Banner with Company Info & Countdown */}
      <div className="p-6 sm:p-7 border-b border-border bg-gradient-to-r from-primary/5 via-surface-1 to-transparent">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Company & Role Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
                <Building2 size={13} />
                <span>{activeInterview.company}</span>
              </span>
              <span className="text-on-surface-variant text-xs">•</span>
              <span className="text-xs font-bold text-on-surface">
                {activeInterview.role}
              </span>
              <span className="text-on-surface-variant text-xs">•</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                <Calendar size={12} />
                <span>{daysLabel}</span>
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-on-surface tracking-tight">
                {activeInterview.company} • {activeInterview.role}
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                Target stage: <span className="font-semibold text-on-surface">{activeInterview.stages[activeInterview.currentStageIndex]?.name || "Technical Round"}</span> • {activeInterview.interviewType} Track
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 flex-wrap flex-shrink-0">
            <button
              onClick={onContinuePrep}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
            >
              <span>Continue Preparation</span>
              <ArrowRight size={15} />
            </button>
            <button
              onClick={() => onOpenGuide(activeInterview.company, activeInterview.role)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 text-on-surface border border-border text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              <span>View Interview Guide</span>
            </button>
          </div>

        </div>
      </div>

      {/* Bottom Readiness Metric & Category Progress Breakdown */}
      <div className="p-6 sm:p-7 bg-surface-1">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Main Overall Readiness Metric */}
          <div className="md:col-span-4 flex items-center gap-4.5 border-b md:border-b-0 md:border-r border-border pb-5 md:pb-0 md:pr-6">
            <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-border/60"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-primary transition-all duration-700 ease-out"
                  strokeDasharray={`${readiness.overall}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-sm font-extrabold text-on-surface">
                {readiness.overall}%
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Interview Readiness
              </div>
              <div className="text-sm font-extrabold text-on-surface mt-0.5">
                {readiness.overall >= 75 ? "Ready for Interview" : readiness.overall >= 40 ? "On Track • Keep Practicing" : "Early Preparation Phase"}
              </div>
              <div className="text-[11px] text-on-surface-variant mt-0.5">
                {readiness.totalSolved} / {readiness.totalAvailable} questions mastered
              </div>
            </div>
          </div>

          {/* 4 Category Readiness Mini Progress Bars */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            <div className="space-y-1.5 p-3 rounded-xl bg-surface-2/60 border border-border/50">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-on-surface flex items-center gap-1.5">
                  <Code2 size={13} className="text-indigo-600 dark:text-indigo-400" />
                  <span>DSA</span>
                </span>
                <span className="font-extrabold text-on-surface">{readiness.dsa}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-border overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${readiness.dsa}%` }} />
              </div>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-surface-2/60 border border-border/50">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-on-surface flex items-center gap-1.5">
                  <Brain size={13} className="text-emerald-600 dark:text-emerald-400" />
                  <span>CS Fund.</span>
                </span>
                <span className="font-extrabold text-on-surface">{readiness.fundamentals}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-border overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${readiness.fundamentals}%` }} />
              </div>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-surface-2/60 border border-border/50">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-on-surface flex items-center gap-1.5">
                  <Layers size={13} className="text-blue-600 dark:text-blue-400" />
                  <span>System</span>
                </span>
                <span className="font-extrabold text-on-surface">{readiness.system}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-border overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${readiness.system}%` }} />
              </div>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-surface-2/60 border border-border/50">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-on-surface flex items-center gap-1.5">
                  <MessageSquare size={13} className="text-rose-600 dark:text-rose-400" />
                  <span>Behavioral</span>
                </span>
                <span className="font-extrabold text-on-surface">{readiness.behavioral}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-border overflow-hidden">
                <div className="h-full bg-rose-600 rounded-full transition-all duration-500" style={{ width: `${readiness.behavioral}%` }} />
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
