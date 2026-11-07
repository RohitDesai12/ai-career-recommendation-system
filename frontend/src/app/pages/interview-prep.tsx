import React, { useState, useEffect, useMemo } from "react";
import { 
  Building2, 
  Calendar, 
  Code2, 
  Layers, 
  Brain, 
  MessageSquare, 
  Plus, 
  Play, 
  BookOpen, 
  FileText, 
  TrendingUp, 
  Search, 
  Sparkles,
  Bookmark,
  CheckCircle2
} from "lucide-react";
import axios from "axios";
import { 
  CURATED_COMPANIES, 
  getStoredInterviews, 
  saveInterviews, 
  getStoredSolvedMap, 
  saveSolvedMap, 
  getStoredBookmarks, 
  saveBookmarks, 
  calculateReadinessBreakdown,
  generatePersonalizedRecommendations 
} from "./interview-prep/interviewStorage";
import { 
  UserInterviewTarget, 
  CompanyData, 
  CompanyRole, 
  ReadinessBreakdown 
} from "./interview-prep/types";
import { 
  InterviewQuestionItem, 
  getAllMasterQuestions 
} from "./interviewQuestionsData";

// Subcomponents
import { InterviewHero } from "./interview-prep/components/InterviewHero";
import { ContinuePreparationSection } from "./interview-prep/components/ContinuePreparationSection";
import { PracticeByTypeSection } from "./interview-prep/components/PracticeByTypeSection";
import { RecommendedForYouSection } from "./interview-prep/components/RecommendedForYouSection";
import { CompanyGuidesSection } from "./interview-prep/components/CompanyGuidesSection";
import { MyInterviewsView } from "./interview-prep/components/MyInterviewsView";
import { CompanyGuideView } from "./interview-prep/components/CompanyGuideView";
import { QuestionBankView } from "./interview-prep/components/QuestionBankView";
import { MockInterviewView } from "./interview-prep/components/MockInterviewView";
import { InterviewExperiencesView } from "./interview-prep/components/InterviewExperiencesView";
import { ProgressAnalyticsView } from "./interview-prep/components/ProgressAnalyticsView";
import { AddInterviewModal } from "./interview-prep/components/AddInterviewModal";
import { QuestionPracticeModal } from "./interview-prep/components/QuestionPracticeModal";

export function InterviewPrepPage() {
  // Navigation tabs: 'overview' | 'my-interviews' | 'questions' | 'guides' | 'mock' | 'experiences' | 'progress'
  const [activeTab, setActiveTab] = useState<
    "overview" | "my-interviews" | "questions" | "guides" | "mock" | "experiences" | "progress"
  >("overview");

  // Active Target Interview & Storage
  const [interviews, setInterviews] = useState<UserInterviewTarget[]>(() => getStoredInterviews());
  const [activeInterviewId, setActiveInterviewId] = useState<string | null>(() => {
    const list = getStoredInterviews();
    return list.length > 0 ? list[0].id : null;
  });

  // Solved & Bookmarked Maps
  const [solvedMap, setSolvedMap] = useState<Record<string, boolean>>(() => getStoredSolvedMap());
  const [bookmarkMap, setBookmarkMap] = useState<Record<string, boolean>>(() => getStoredBookmarks());

  // Company Guide Detail View State
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [isSavedGuide, setIsSavedGuide] = useState(false);

  // Modals
  const [isAddInterviewModalOpen, setIsAddInterviewModalOpen] = useState(false);
  const [practiceQuestion, setPracticeQuestion] = useState<InterviewQuestionItem | null>(null);

  // Active Target Interview Object
  const activeInterview = useMemo(() => {
    return interviews.find(i => i.id === activeInterviewId) || (interviews.length > 0 ? interviews[0] : null);
  }, [interviews, activeInterviewId]);

  // Overall Readiness Metrics Calculation
  const readiness: ReadinessBreakdown = useMemo(() => {
    return calculateReadinessBreakdown(solvedMap, activeInterview?.company);
  }, [solvedMap, activeInterview]);

  // Dynamic Recommendations
  const recommendedQuestions = useMemo(() => {
    return generatePersonalizedRecommendations(activeInterview, solvedMap);
  }, [activeInterview, solvedMap]);

  // Auto-select company from URL query parameters on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const companyParam = params.get("company");
    const roleParam = params.get("role");
    const tabParam = params.get("tab");

    if (tabParam && ["overview", "my-interviews", "questions", "guides", "mock", "experiences", "progress"].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }

    if (companyParam) {
      const matched = CURATED_COMPANIES.find(c => 
        c.name.toLowerCase() === companyParam.toLowerCase() || 
        c.id === companyParam.toLowerCase()
      );
      if (matched) {
        setSelectedCompany(matched);
        if (roleParam) {
          const matchedRole = matched.roles.find(r => r.title.toLowerCase() === roleParam.toLowerCase() || r.id === roleParam.toLowerCase());
          setSelectedRoleId(matchedRole ? matchedRole.id : matched.roles[0].id);
        } else {
          setSelectedRoleId(matched.roles[0].id);
        }
      }
    }
  }, []);

  // Check saved guide status from backend
  useEffect(() => {
    if (selectedCompany && selectedRoleId) {
      const activeRole = selectedCompany.roles.find(r => r.id === selectedRoleId) || selectedCompany.roles[0];
      axios.get(`http://localhost:5000/api/interview-prep/saved-status?company=${encodeURIComponent(selectedCompany.name)}&role=${encodeURIComponent(activeRole.title)}`)
        .then(res => setIsSavedGuide(!!res.data?.saved))
        .catch(() => setIsSavedGuide(false));
    }
  }, [selectedCompany, selectedRoleId]);

  // Toggle Solved Question
  const handleToggleSolved = (questionId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSolvedMap(prev => {
      const next = { ...prev, [questionId]: !prev[questionId] };
      saveSolvedMap(next);
      return next;
    });
  };

  // Toggle Bookmark Question
  const handleToggleBookmark = (questionId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarkMap(prev => {
      const next = { ...prev, [questionId]: !prev[questionId] };
      saveBookmarks(next);
      return next;
    });
  };

  // Toggle Save Company Guide
  const handleToggleSaveGuide = async () => {
    if (!selectedCompany) return;
    const activeRole = selectedCompany.roles.find(r => r.id === selectedRoleId) || selectedCompany.roles[0];
    try {
      if (isSavedGuide) {
        await axios.delete(`http://localhost:5000/api/interview-prep/save?company=${encodeURIComponent(selectedCompany.name)}&role=${encodeURIComponent(activeRole.title)}`);
        setIsSavedGuide(false);
      } else {
        await axios.post("http://localhost:5000/api/interview-prep/save", {
          company: selectedCompany.name,
          role: activeRole.title
        });
        setIsSavedGuide(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Target Interview
  const handleAddInterview = (target: UserInterviewTarget) => {
    const updated = [target, ...interviews];
    setInterviews(updated);
    setActiveInterviewId(target.id);
    saveInterviews(updated);
  };

  // Delete Target Interview
  const handleDeleteInterview = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = interviews.filter(i => i.id !== id);
    setInterviews(updated);
    if (activeInterviewId === id) {
      setActiveInterviewId(updated.length > 0 ? updated[0].id : null);
    }
    saveInterviews(updated);
  };

  // Open Company Guide
  const handleOpenCompanyGuide = (company: CompanyData, roleId?: string) => {
    setSelectedCompany(company);
    setSelectedRoleId(roleId || company.roles[0].id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenGuideByName = (companyName: string, roleTitle: string) => {
    const matched = CURATED_COMPANIES.find(c => c.name.toLowerCase() === companyName.toLowerCase());
    if (matched) {
      const matchedRole = matched.roles.find(r => r.title.toLowerCase() === roleTitle.toLowerCase());
      handleOpenCompanyGuide(matched, matchedRole ? matchedRole.id : undefined);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground font-sans p-4 sm:p-6 md:p-8 select-none">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold shadow-xs">
                <Code2 size={20} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight text-on-surface">
                Interview Prep
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1 font-medium">
              Prepare smarter for your next interview with a focused, actionable plan.
            </p>
          </div>

          {/* Top Right Action CTAs */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={() => setIsAddInterviewModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>Add Interview</span>
            </button>
            <button
              onClick={() => {
                const all = getAllMasterQuestions();
                const randomQ = all[Math.floor(Math.random() * all.length)];
                setPracticeQuestion(randomQ);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-surface-1 hover:bg-surface-2 border border-border text-on-surface text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Play size={13} />
              <span>Quick Practice</span>
            </button>
          </div>
        </header>

        {/* If viewing a single company guide in-depth */}
        {selectedCompany ? (
          <CompanyGuideView
            company={selectedCompany}
            activeRole={selectedCompany.roles.find(r => r.id === selectedRoleId) || selectedCompany.roles[0]}
            readiness={readiness}
            solvedMap={solvedMap}
            bookmarkMap={bookmarkMap}
            isSavedGuide={isSavedGuide}
            onToggleSaveGuide={handleToggleSaveGuide}
            onBack={() => setSelectedCompany(null)}
            onSelectRole={(id) => setSelectedRoleId(id)}
            onOpenQuestion={(q) => setPracticeQuestion(q)}
            onToggleBookmark={handleToggleBookmark}
            onToggleSolved={handleToggleSolved}
            onStartMockForCompany={(comp, r) => {
              setSelectedCompany(null);
              setActiveTab("mock");
            }}
          />
        ) : (
          <>
            {/* Internal Secondary Navigation Tabs */}
            <nav className="flex items-center gap-1.5 border-b border-border overflow-x-auto pb-1">
              {[
                { id: "overview", label: "Overview", icon: Sparkles },
                { id: "my-interviews", label: `My Interviews (${interviews.length})`, icon: Calendar },
                { id: "questions", label: "Question Bank", icon: Code2 },
                { id: "guides", label: "Company Guides", icon: Building2 },
                { id: "mock", label: "Mock Interviews", icon: Play },
                { id: "experiences", label: "Experiences", icon: FileText },
                { id: "progress", label: "Progress", icon: TrendingUp }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActive 
                        ? "bg-surface-1 text-primary border border-border shadow-2xs font-extrabold" 
                        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-2"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                
                {/* 1. Active Interview Hero Section */}
                <InterviewHero
                  activeInterview={activeInterview}
                  readiness={readiness}
                  onContinuePrep={() => setActiveTab("questions")}
                  onOpenGuide={handleOpenGuideByName}
                  onAddInterview={() => setIsAddInterviewModalOpen(true)}
                  onQuickPractice={() => {
                    const all = getAllMasterQuestions();
                    setPracticeQuestion(all[0]);
                  }}
                />

                {/* 2. Continue Preparation Section */}
                <ContinuePreparationSection
                  solvedMap={solvedMap}
                  onSelectCategory={(cat) => {
                    setActiveTab("questions");
                  }}
                />

                {/* 3. Recommended for You Section */}
                <RecommendedForYouSection
                  questions={recommendedQuestions}
                  solvedMap={solvedMap}
                  bookmarkMap={bookmarkMap}
                  onOpenQuestion={(q) => setPracticeQuestion(q)}
                  onToggleBookmark={handleToggleBookmark}
                  onToggleSolved={handleToggleSolved}
                />

                {/* 4. Practice by Type Section */}
                <PracticeByTypeSection
                  solvedMap={solvedMap}
                  onSelectCategory={(cat) => {
                    setActiveTab("questions");
                  }}
                />

                {/* 5. Company Guides List Section */}
                <CompanyGuidesSection
                  companies={CURATED_COMPANIES}
                  solvedMap={solvedMap}
                  onSelectCompany={handleOpenCompanyGuide}
                />

              </div>
            )}

            {/* TAB 2: MY INTERVIEWS */}
            {activeTab === "my-interviews" && (
              <MyInterviewsView
                interviews={interviews}
                activeInterviewId={activeInterviewId}
                readiness={readiness}
                onSelectActiveInterview={(id) => {
                  setActiveInterviewId(id);
                  setActiveTab("overview");
                }}
                onDeleteInterview={handleDeleteInterview}
                onAddInterview={() => setIsAddInterviewModalOpen(true)}
                onOpenGuide={handleOpenGuideByName}
              />
            )}

            {/* TAB 3: QUESTION BANK */}
            {activeTab === "questions" && (
              <QuestionBankView
                solvedMap={solvedMap}
                bookmarkMap={bookmarkMap}
                onOpenQuestion={(q) => setPracticeQuestion(q)}
                onToggleBookmark={handleToggleBookmark}
                onToggleSolved={handleToggleSolved}
              />
            )}

            {/* TAB 4: COMPANY GUIDES */}
            {activeTab === "guides" && (
              <CompanyGuidesSection
                companies={CURATED_COMPANIES}
                solvedMap={solvedMap}
                onSelectCompany={handleOpenCompanyGuide}
              />
            )}

            {/* TAB 5: MOCK INTERVIEWS */}
            {activeTab === "mock" && (
              <MockInterviewView
                initialCompany={activeInterview?.company}
                initialRole={activeInterview?.role}
              />
            )}

            {/* TAB 6: EXPERIENCES */}
            {activeTab === "experiences" && (
              <InterviewExperiencesView />
            )}

            {/* TAB 7: PROGRESS & ANALYTICS */}
            {activeTab === "progress" && (
              <ProgressAnalyticsView
                readiness={readiness}
                onNavigateToCategory={(cat) => setActiveTab("questions")}
                onPracticeNextAction={() => {
                  const all = getAllMasterQuestions();
                  const targetQ = all.find(q => q.id === readiness.nextBestAction.questionId) || all[0];
                  setPracticeQuestion(targetQ);
                }}
              />
            )}
          </>
        )}

        {/* Add Interview Target Modal */}
        <AddInterviewModal
          isOpen={isAddInterviewModalOpen}
          onClose={() => setIsAddInterviewModalOpen(false)}
          onAddInterview={handleAddInterview}
        />

        {/* Question Practice Workspace Modal */}
        <QuestionPracticeModal
          question={practiceQuestion}
          isOpen={!!practiceQuestion}
          isSolved={practiceQuestion ? !!solvedMap[practiceQuestion.id] : false}
          isBookmarked={practiceQuestion ? !!bookmarkMap[practiceQuestion.id] : false}
          onClose={() => setPracticeQuestion(null)}
          onToggleSolved={(id) => handleToggleSolved(id)}
          onToggleBookmark={(id) => handleToggleBookmark(id)}
          onNextQuestion={() => {
            const all = getAllMasterQuestions();
            if (practiceQuestion) {
              const idx = all.findIndex(q => q.id === practiceQuestion.id);
              if (idx !== -1 && idx + 1 < all.length) {
                setPracticeQuestion(all[idx + 1]);
              } else {
                setPracticeQuestion(null);
              }
            }
          }}
        />

      </div>
    </div>
  );
}
