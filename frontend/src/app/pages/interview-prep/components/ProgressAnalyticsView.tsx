import React from "react";
import { 
  TrendingUp, 
  Code2, 
  Brain, 
  Layers, 
  MessageSquare, 
  Building2, 
  CheckCircle2, 
  Award, 
  Sparkles, 
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { ReadinessBreakdown } from "../types";
import { getStoredMockHistory } from "../interviewStorage";

interface ProgressAnalyticsViewProps {
  readiness: ReadinessBreakdown;
  onNavigateToCategory: (category: "dsa" | "fundamentals" | "system" | "hr") => void;
  onPracticeNextAction: () => void;
}

export function ProgressAnalyticsView({
  readiness,
  onNavigateToCategory,
  onPracticeNextAction
}: ProgressAnalyticsViewProps) {
  const mockHistory = getStoredMockHistory();
  const averageMockScore = mockHistory.length > 0 
    ? Math.round(mockHistory.reduce((acc, item) => acc + item.overallScore, 0) / mockHistory.length) 
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold font-heading text-on-surface">
            Readiness & Performance Analytics
          </h2>
          <p className="text-xs text-on-surface-variant">
            In-depth evaluation of your interview preparation across DSA, CS Fundamentals, System Design, and Behavioral rounds.
          </p>
        </div>
      </div>

      {/* Top KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-surface-1 border border-border shadow-xs space-y-2">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Overall Readiness
          </span>
          <div className="text-2xl sm:text-3xl font-black text-primary">
            {readiness.overall}%
          </div>
          <p className="text-xs text-on-surface-variant">
            {readiness.overall >= 75 ? "Well prepared for interviews" : readiness.overall >= 40 ? "Progressing steadily" : "Early stage preparation"}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-1 border border-border shadow-xs space-y-2">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Questions Mastered
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            {readiness.totalSolved} <span className="text-xs font-bold text-on-surface-variant">/ {readiness.totalAvailable}</span>
          </div>
          <p className="text-xs text-on-surface-variant">
            Canonical problems solved across all tracks
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-1 border border-border shadow-xs space-y-2">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Mock Interviews Taken
          </span>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600">
            {mockHistory.length}
          </div>
          <p className="text-xs text-on-surface-variant">
            Avg Diagnostic Score: <span className="font-bold text-on-surface">{averageMockScore || "N/A"} / 100</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-1 border border-border shadow-xs space-y-2">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Strongest Dimension
          </span>
          <div className="text-lg font-extrabold text-on-surface truncate">
            {readiness.strongestTopic.name}
          </div>
          <p className="text-xs text-emerald-600 font-bold">
            {readiness.strongestTopic.score}% Topic Mastery
          </p>
        </div>

      </div>

      {/* Your Next Best Action Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-surface-1 to-transparent border border-primary/30 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-[11px] font-extrabold uppercase tracking-wider">
            <Sparkles size={12} />
            <span>Your Next Best Action</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold font-heading text-on-surface">
            {readiness.nextBestAction.topic} → {readiness.nextBestAction.questionTitle}
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Based on your mastery metrics, solving this question will yield the highest readiness boost for your active target interview.
          </p>
        </div>

        <button
          onClick={onPracticeNextAction}
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 self-start md:self-auto"
        >
          <span>Practice Now</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {/* Category Mastery Progress Bars */}
      <div className="p-6 rounded-2xl bg-surface-1 border border-border shadow-xs space-y-5">
        <h3 className="text-sm font-bold font-heading text-on-surface">
          Category Mastery Breakdown
        </h3>

        <div className="space-y-4">
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-on-surface flex items-center gap-2">
                <Code2 size={14} className="text-indigo-600" />
                <span>Data Structures & Algorithms</span>
              </span>
              <span className="font-extrabold text-on-surface">{readiness.dsa}%</span>
            </div>
            <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${readiness.dsa}%` }} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-on-surface flex items-center gap-2">
                <Brain size={14} className="text-emerald-600" />
                <span>CS Fundamentals (OOP, DBMS, OS, Networks)</span>
              </span>
              <span className="font-extrabold text-on-surface">{readiness.fundamentals}%</span>
            </div>
            <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${readiness.fundamentals}%` }} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-on-surface flex items-center gap-2">
                <Layers size={14} className="text-blue-600" />
                <span>System Design & Architecture</span>
              </span>
              <span className="font-extrabold text-on-surface">{readiness.system}%</span>
            </div>
            <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${readiness.system}%` }} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-on-surface flex items-center gap-2">
                <MessageSquare size={14} className="text-rose-600" />
                <span>Behavioral & STAR Leadership</span>
              </span>
              <span className="font-extrabold text-on-surface">{readiness.behavioral}%</span>
            </div>
            <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
              <div className="h-full bg-rose-600 rounded-full transition-all duration-500" style={{ width: `${readiness.behavioral}%` }} />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
