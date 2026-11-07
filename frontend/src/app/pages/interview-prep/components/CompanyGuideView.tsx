import React, { useState } from "react";
import { 
  ArrowLeft, 
  Building2, 
  Bookmark, 
  Play, 
  Code2, 
  Layers, 
  Brain, 
  MessageSquare, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  ChevronRight,
  ExternalLink,
  Sparkles,
  HelpCircle,
  FileText
} from "lucide-react";
import { CompanyData, CompanyRole, ReadinessBreakdown, UserInterviewTarget } from "../types";
import { 
  InterviewQuestionItem, 
  generateCompanyQuestions,
  TOPIC_CHEAT_SHEETS 
} from "../../interviewQuestionsData";
import { QuestionBankView } from "./QuestionBankView";
import { PreparationPlanView } from "./PreparationPlanView";
import { MockInterviewView } from "./MockInterviewView";
import { InterviewExperiencesView } from "./InterviewExperiencesView";

interface CompanyGuideViewProps {
  company: CompanyData;
  activeRole: CompanyRole;
  readiness: ReadinessBreakdown;
  solvedMap: Record<string, boolean>;
  bookmarkMap: Record<string, boolean>;
  isSavedGuide: boolean;
  onToggleSaveGuide: () => void;
  onBack: () => void;
  onSelectRole: (roleId: string) => void;
  onOpenQuestion: (question: InterviewQuestionItem) => void;
  onToggleBookmark: (questionId: string, e: React.MouseEvent) => void;
  onToggleSolved: (questionId: string, e: React.MouseEvent) => void;
  onStartMockForCompany: (company: string, role: string) => void;
}

export function CompanyGuideView({
  company,
  activeRole,
  readiness,
  solvedMap,
  bookmarkMap,
  isSavedGuide,
  onToggleSaveGuide,
  onBack,
  onSelectRole,
  onOpenQuestion,
  onToggleBookmark,
  onToggleSolved,
  onStartMockForCompany
}: CompanyGuideViewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "questions" | "plan" | "mock" | "experiences">("overview");
  const [selectedStageFilter, setSelectedStageFilter] = useState<string | null>(null);

  // Derive questions for this company and active role
  const dsaQuestions = generateCompanyQuestions(company.name, activeRole.title, activeRole.level, "dsa");
  const sysQuestions = generateCompanyQuestions(company.name, activeRole.title, activeRole.level, "system");
  const fundQuestions = generateCompanyQuestions(company.name, activeRole.title, activeRole.level, "fundamentals");
  const hrQuestions = generateCompanyQuestions(company.name, activeRole.title, activeRole.level, "hr");
  const specificQuestions = generateCompanyQuestions(company.name, activeRole.title, activeRole.level, "specific");

  const totalQuestions = dsaQuestions.length + sysQuestions.length + fundQuestions.length + hrQuestions.length + specificQuestions.length;
  const allRoleQuestions = [...dsaQuestions, ...sysQuestions, ...fundQuestions, ...hrQuestions, ...specificQuestions];
  const solvedCount = allRoleQuestions.filter(q => !!solvedMap[q.id]).length;
  const companyRoleReadiness = totalQuestions > 0 ? Math.round((solvedCount / totalQuestions) * 100) : 0;

  // Visual Timeline Stages for Product vs Service
  const stages = company.type === "Product" ? [
    { name: "Online Assessment", roundTag: "Round 1", focus: "DSA, Arrays, Two Pointers", status: "Completed" },
    { name: "Technical — DSA", roundTag: "Round 2", focus: "Trees, Graphs, DP & Complexity", status: "Current" },
    { name: "Technical — System Design", roundTag: "Round 3", focus: "High Level Architecture, Caching, DB", status: "Upcoming" },
    { name: "Hiring Manager / HR", roundTag: "Round 4", focus: "Leadership Principles & STAR Fit", status: "Upcoming" }
  ] : [
    { name: "Aptitude & Logic", roundTag: "Round 1", focus: "Quant, Verbal, Logic Puzzles", status: "Completed" },
    { name: "Technical Interview", roundTag: "Round 2", focus: "CS Foundations, Java/Python, DBMS", status: "Current" },
    { name: "HR & Managerial", roundTag: "Round 3", focus: "Adaptability & Project Defense", status: "Upcoming" }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Back Navigation & Save Button */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Back to Interview Prep</span>
        </button>

        <button
          onClick={onToggleSaveGuide}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
            isSavedGuide 
              ? "bg-primary text-white border-primary shadow-2xs" 
              : "bg-surface-1 border-border text-on-surface hover:bg-surface-2"
          }`}
        >
          <Bookmark size={14} className={isSavedGuide ? "fill-white" : ""} />
          <span>{isSavedGuide ? "Saved Guide" : "Bookmark Guide"}</span>
        </button>
      </div>

      {/* Company Header Banner */}
      <div className="p-6 sm:p-7 rounded-2xl bg-surface-1 border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-xl flex-shrink-0 shadow-xs"
            style={{ backgroundColor: company.color }}
          >
            {company.initials}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-on-surface">
                {company.name}
              </h1>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                company.type === "Product" 
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800" 
                  : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
              }`}>
                {company.type} Company
              </span>
            </div>

            <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
              {company.blurb}
            </p>
          </div>
        </div>

        {/* Role Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              Target Role
            </label>
            <select
              value={activeRole.id}
              onChange={(e) => onSelectRole(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-surface-2 border border-border text-xs text-on-surface font-semibold focus:outline-hidden focus:border-primary"
            >
              {company.roles.map(r => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.level})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => onStartMockForCompany(company.name, activeRole.title)}
            className="self-end sm:self-auto mt-auto px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Play size={14} />
            <span>Mock Interview</span>
          </button>
        </div>
      </div>

      {/* Visual Interview Process Timeline */}
      <div className="p-5 sm:p-6 rounded-2xl bg-surface-1 border border-border space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold font-heading text-on-surface uppercase tracking-wider">
            Interview Process Loop
          </h3>
          <span className="text-xs text-on-surface-variant font-medium">
            {stages.length} Structured Evaluation Rounds
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stages.map((st, idx) => (
            <div
              key={st.name}
              className={`p-3.5 rounded-xl border transition-all ${
                st.status === "Current" 
                  ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20 shadow-2xs" 
                  : "bg-surface-2/60 border-border/60"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-extrabold text-primary">{st.roundTag}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  st.status === "Current" ? "bg-primary text-white" : st.status === "Completed" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700" : "text-on-surface-variant bg-surface-3"
                }`}>
                  {st.status}
                </span>
              </div>
              <h4 className="text-xs font-bold text-on-surface">{st.name}</h4>
              <p className="text-[11px] text-on-surface-variant mt-1 leading-snug">{st.focus}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-1">
        {[
          { id: "overview", label: "Overview", icon: BookOpen },
          { id: "questions", label: `Question Bank (${totalQuestions})`, icon: Code2 },
          { id: "plan", label: "Study Plan", icon: Calendar },
          { id: "mock", label: "Mock Interviews", icon: Play },
          { id: "experiences", label: "Interview Experiences", icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? "bg-surface-1 text-primary border border-border shadow-2xs" 
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-2"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: What to expect & key skills */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="p-6 rounded-2xl bg-surface-1 border border-border space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold font-heading text-on-surface flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <span>What to Expect in {company.name} Interviews</span>
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                {company.name}'s hiring committee looks for candidates who write clean, maintainable code under time pressure and communicate assumptions clearly. Expect an emphasis on trade-offs, space/time complexity proof, and practical edge cases.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border/60">
                  <div className="text-xs font-bold text-on-surface">Core DSA Focus</div>
                  <div className="text-[11px] text-on-surface-variant mt-0.5">
                    Binary Trees, Graphs (BFS/DFS), Dynamic Programming, Hash Maps
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border/60">
                  <div className="text-xs font-bold text-on-surface">System & Foundations</div>
                  <div className="text-[11px] text-on-surface-variant mt-0.5">
                    Caching (Redis), DB Indexing, Concurrency, REST / GraphQL APIs
                  </div>
                </div>
              </div>
            </div>

            {/* Preparation Strategy */}
            <div className="p-6 rounded-2xl bg-surface-1 border border-border space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold font-heading text-on-surface">
                Recommended Preparation Strategy
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-on-surface">Solve High-Frequency DSA Questions</h4>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Focus on the {dsaQuestions.length} curated master algorithmic problems with special attention to Two Pointers and Tree Traversals.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-on-surface">Master System Design Trade-Offs</h4>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Practice designing TinyURL, Rate Limiter, and Notification Services using the 10-step architectural framework.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-on-surface">Simulate Full Mock Interviews</h4>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Take 30-minute timed AI mock interviews to practice speaking your thought process clearly and handling follow-up cross-examination.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Statistics & Question Count Breakdown */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Question Breakdown Box */}
            <div className="p-6 rounded-2xl bg-surface-1 border border-border space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold font-heading text-on-surface">
                Question Distribution
              </h3>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant flex items-center gap-1.5">
                    <Code2 size={13} className="text-indigo-600" />
                    <span>DSA</span>
                  </span>
                  <span className="font-bold text-on-surface">{dsaQuestions.length} questions</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant flex items-center gap-1.5">
                    <Brain size={13} className="text-emerald-600" />
                    <span>CS Fundamentals</span>
                  </span>
                  <span className="font-bold text-on-surface">{fundQuestions.length} questions</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant flex items-center gap-1.5">
                    <Layers size={13} className="text-blue-600" />
                    <span>System Design</span>
                  </span>
                  <span className="font-bold text-on-surface">{sysQuestions.length} questions</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant flex items-center gap-1.5">
                    <MessageSquare size={13} className="text-rose-600" />
                    <span>Behavioral</span>
                  </span>
                  <span className="font-bold text-on-surface">{hrQuestions.length} questions</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant flex items-center gap-1.5">
                    <Building2 size={13} className="text-amber-600" />
                    <span>Company Specific</span>
                  </span>
                  <span className="font-bold text-on-surface">{specificQuestions.length} questions</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60">
                <button
                  onClick={() => setActiveTab("questions")}
                  className="w-full py-2 px-3 rounded-xl bg-primary text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>Open Full Question Bank</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {activeTab === "questions" && (
        <QuestionBankView
          companyFilter={company.name}
          solvedMap={solvedMap}
          bookmarkMap={bookmarkMap}
          onOpenQuestion={onOpenQuestion}
          onToggleBookmark={onToggleBookmark}
          onToggleSolved={onToggleSolved}
        />
      )}

      {activeTab === "plan" && (
        <PreparationPlanView
          company={company.name}
          role={activeRole.title}
          onOpenQuestion={onOpenQuestion}
        />
      )}

      {activeTab === "mock" && (
        <MockInterviewView
          initialCompany={company.name}
          initialRole={activeRole.title}
        />
      )}

      {activeTab === "experiences" && (
        <InterviewExperiencesView
          companyFilter={company.name}
        />
      )}

    </div>
  );
}
