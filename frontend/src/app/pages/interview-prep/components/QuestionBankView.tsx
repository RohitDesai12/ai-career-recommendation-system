import React, { useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  Bookmark, 
  CheckCircle2, 
  Circle, 
  Code2, 
  Layers, 
  Brain, 
  MessageSquare, 
  Building2, 
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { InterviewQuestionItem, getAllMasterQuestions, getTopicsForCategory } from "../../interviewQuestionsData";
import { CURATED_COMPANIES } from "../interviewStorage";

interface QuestionBankViewProps {
  companyFilter?: string;
  solvedMap: Record<string, boolean>;
  bookmarkMap: Record<string, boolean>;
  onOpenQuestion: (question: InterviewQuestionItem) => void;
  onToggleBookmark: (questionId: string, e: React.MouseEvent) => void;
  onToggleSolved: (questionId: string, e: React.MouseEvent) => void;
}

const ITEMS_PER_PAGE = 12;

export function QuestionBankView({
  companyFilter,
  solvedMap,
  bookmarkMap,
  onOpenQuestion,
  onToggleBookmark,
  onToggleSolved
}: QuestionBankViewProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | "dsa" | "fundamentals" | "system" | "hr" | "specific">("All");
  const [selectedStatus, setSelectedStatus] = useState<"All" | "Unsolved" | "Solved" | "Bookmarked">("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"All" | "Easy" | "Medium" | "Hard">("All");
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [selectedCompany, setSelectedCompany] = useState<string>(companyFilter || "All");
  const [currentPage, setCurrentPage] = useState(1);

  const allQuestions = useMemo(() => {
    return getAllMasterQuestions();
  }, []);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(q => {
      const matchesSearch = search === "" ||
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        q.topic.toLowerCase().includes(search.toLowerCase()) ||
        q.solutionStrategy.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = selectedCategory === "All" || q.category === selectedCategory;
      
      const isSolved = !!solvedMap[q.id];
      const isBookmarked = !!bookmarkMap[q.id];
      const matchesStatus = selectedStatus === "All" ||
        (selectedStatus === "Solved" && isSolved) ||
        (selectedStatus === "Unsolved" && !isSolved) ||
        (selectedStatus === "Bookmarked" && isBookmarked);

      const matchesDifficulty = selectedDifficulty === "All" || q.difficulty === selectedDifficulty;
      const matchesTopic = selectedTopic === "All" || q.topic === selectedTopic;
      
      const targetComp = companyFilter || (selectedCompany !== "All" ? selectedCompany : null);
      const matchesCompany = !targetComp || (q.companies && q.companies.includes(targetComp));

      return matchesSearch && matchesCategory && matchesStatus && matchesDifficulty && matchesTopic && matchesCompany;
    });
  }, [allQuestions, search, selectedCategory, selectedStatus, selectedDifficulty, selectedTopic, selectedCompany, companyFilter, solvedMap, bookmarkMap]);

  // Topic Options
  const availableTopics = useMemo(() => {
    const topicsSet = new Set<string>();
    allQuestions.forEach(q => {
      if (selectedCategory === "All" || q.category === selectedCategory) {
        if (q.topic) topicsSet.add(q.topic);
      }
    });
    return Array.from(topicsSet);
  }, [allQuestions, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE));
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredQuestions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredQuestions, currentPage]);

  const solvedCount = filteredQuestions.filter(q => !!solvedMap[q.id]).length;

  return (
    <div className="space-y-4">
      
      {/* Header with Stats & Main Search */}
      <div className="p-5 rounded-2xl bg-surface-1 border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold font-heading text-on-surface">
              Question Bank
            </h2>
            <span className="text-xs font-bold text-on-surface-variant bg-surface-2 px-2.5 py-0.5 rounded-full">
              {filteredQuestions.length} questions • {solvedCount} solved
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Filter by topic, difficulty, company relevance, and tracking status.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search problems, topics, solutions..."
            className="w-full pl-8.5 pr-3 py-2 rounded-xl bg-surface-2 border border-border text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-hidden focus:border-primary"
          />
        </div>
      </div>

      {/* Category Pills & Sub-Filters Bar */}
      <div className="p-4 rounded-2xl bg-surface-1 border border-border space-y-3 shadow-2xs">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: "All", label: "All Questions", icon: Code2 },
            { id: "dsa", label: "DSA", icon: Code2 },
            { id: "fundamentals", label: "CS Fundamentals", icon: Brain },
            { id: "system", label: "System Design", icon: Layers },
            { id: "hr", label: "Behavioral", icon: MessageSquare },
            { id: "specific", label: "Company Specific", icon: Building2 },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setSelectedCategory(tab.id as any); setSelectedTopic("All"); setCurrentPage(1); }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? "bg-primary text-white shadow-2xs" 
                    : "bg-surface-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-3"
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dropdown Filters (Status, Difficulty, Topic, Company) */}
        <div className="flex items-center gap-2.5 flex-wrap pt-2 border-t border-border/50 text-xs">
          
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-on-surface-variant font-semibold text-[11px]">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value as any); setCurrentPage(1); }}
              className="px-2.5 py-1 rounded-lg bg-surface-2 border border-border text-on-surface font-medium focus:outline-hidden"
            >
              <option value="All">All</option>
              <option value="Unsolved">Unsolved</option>
              <option value="Solved">Solved</option>
              <option value="Bookmarked">Bookmarked</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-on-surface-variant font-semibold text-[11px]">Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => { setSelectedDifficulty(e.target.value as any); setCurrentPage(1); }}
              className="px-2.5 py-1 rounded-lg bg-surface-2 border border-border text-on-surface font-medium focus:outline-hidden"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Topic Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-on-surface-variant font-semibold text-[11px]">Topic:</span>
            <select
              value={selectedTopic}
              onChange={(e) => { setSelectedTopic(e.target.value); setCurrentPage(1); }}
              className="px-2.5 py-1 rounded-lg bg-surface-2 border border-border text-on-surface font-medium focus:outline-hidden max-w-[160px] truncate"
            >
              <option value="All">All Topics</option>
              {availableTopics.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Company Filter (if not locked by guide) */}
          {!companyFilter && (
            <div className="flex items-center gap-1.5">
              <span className="text-on-surface-variant font-semibold text-[11px]">Company:</span>
              <select
                value={selectedCompany}
                onChange={(e) => { setSelectedCompany(e.target.value); setCurrentPage(1); }}
                className="px-2.5 py-1 rounded-lg bg-surface-2 border border-border text-on-surface font-medium focus:outline-hidden"
              >
                <option value="All">All Companies</option>
                {CURATED_COMPANIES.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Reset Filters button */}
          {(selectedCategory !== "All" || selectedStatus !== "All" || selectedDifficulty !== "All" || selectedTopic !== "All" || (!companyFilter && selectedCompany !== "All") || search !== "") && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
                setSelectedStatus("All");
                setSelectedDifficulty("All");
                setSelectedTopic("All");
                if (!companyFilter) setSelectedCompany("All");
                setCurrentPage(1);
              }}
              className="ml-auto text-primary text-[11px] font-bold hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}

        </div>

      </div>

      {/* Dense LeetCode-style Question List Rows */}
      <div className="rounded-2xl border border-border bg-surface-1 overflow-hidden shadow-2xs">
        
        {/* Table Header */}
        <div className="px-4 py-2.5 bg-surface-2/60 border-b border-border grid grid-cols-12 gap-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-6 sm:col-span-5">Title & Topic</div>
          <div className="col-span-2 text-center">Difficulty</div>
          <div className="hidden sm:block sm:col-span-3">Companies</div>
          <div className="col-span-3 sm:col-span-1 text-right">Action</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/60">
          {paginatedQuestions.map((q, idx) => {
            const isSolved = !!solvedMap[q.id];
            const isBookmarked = !!bookmarkMap[q.id];

            let diffBadge = "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800";
            if (q.difficulty === "Medium") {
              diffBadge = "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800";
            } else if (q.difficulty === "Hard") {
              diffBadge = "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800";
            }

            return (
              <div
                key={q.id}
                onClick={() => onOpenQuestion(q)}
                className="px-4 py-3 grid grid-cols-12 gap-3 items-center hover:bg-surface-2/60 transition-colors cursor-pointer group"
              >
                
                {/* Solved Checkbox & Bookmark */}
                <div className="col-span-1 flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => onToggleSolved(q.id, e)}
                    className="text-on-surface-variant hover:text-emerald-600 transition-colors cursor-pointer"
                    title={isSolved ? "Mark as Unsolved" : "Mark as Solved"}
                  >
                    {isSolved ? (
                      <CheckCircle2 size={18} className="text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                    ) : (
                      <Circle size={18} className="text-on-surface-variant/50 hover:text-emerald-600" />
                    )}
                  </button>
                </div>

                {/* Title, Topic, Category */}
                <div className="col-span-6 sm:col-span-5 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                      {q.title}
                    </span>
                    {q.frequency === "Must Do" && (
                      <span className="hidden md:inline text-[9px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-1.5 py-0.2 rounded">
                        Must Do
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-on-surface-variant mt-0.5 flex items-center gap-1.5 truncate">
                    <span>{q.topic}</span>
                    <span>•</span>
                    <span className="capitalize">{q.category}</span>
                  </div>
                </div>

                {/* Difficulty */}
                <div className="col-span-2 text-center">
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${diffBadge}`}>
                    {q.difficulty}
                  </span>
                </div>

                {/* Companies Tags */}
                <div className="hidden sm:flex sm:col-span-3 items-center gap-1 flex-wrap overflow-hidden">
                  {q.companies && q.companies.length > 0 ? (
                    q.companies.slice(0, 3).map(comp => (
                      <span
                        key={comp}
                        className="text-[10px] font-medium px-2 py-0.5 rounded bg-surface-2 text-on-surface-variant border border-border/60"
                      >
                        {comp}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-on-surface-variant">General</span>
                  )}
                  {q.companies && q.companies.length > 3 && (
                    <span className="text-[10px] text-on-surface-variant">+{q.companies.length - 3}</span>
                  )}
                </div>

                {/* Action & Bookmark */}
                <div className="col-span-3 sm:col-span-1 flex items-center justify-end gap-1.5">
                  <button
                    onClick={(e) => onToggleBookmark(q.id, e)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isBookmarked ? "text-primary fill-primary" : "text-on-surface-variant/60 hover:text-primary"
                    }`}
                    title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
                  >
                    <Bookmark size={14} className={isBookmarked ? "fill-primary" : ""} />
                  </button>

                  <div className="hidden md:inline-flex items-center text-primary group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight size={14} />
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {paginatedQuestions.length === 0 && (
          <div className="text-center py-12 p-6 space-y-2">
            <Code2 size={26} className="mx-auto text-on-surface-variant opacity-60" />
            <h4 className="text-sm font-bold text-on-surface">No questions match your current filters</h4>
            <p className="text-xs text-on-surface-variant">Try resetting filters or search terms.</p>
          </div>
        )}

      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-1 border border-border text-xs">
          <span className="text-on-surface-variant font-medium">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredQuestions.length)} of {filteredQuestions.length}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-border bg-surface-2 text-on-surface disabled:opacity-40 hover:bg-surface-3 transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-3 font-bold text-on-surface">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-border bg-surface-2 text-on-surface disabled:opacity-40 hover:bg-surface-3 transition-colors cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
