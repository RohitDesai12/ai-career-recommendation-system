import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Briefcase,
  BookOpen,
  Award,
  Building2,
  Compass,
  ArrowRight,
  Clock,
  X,
  ChevronRight,
  Sparkles
} from "lucide-react";

interface SearchSuggestionItem {
  id?: string;
  title?: string;
  name?: string;
  companyName?: string;
  location?: string;
  salary?: string;
  type?: string;
  workMode?: string;
  skills?: string[];
  department?: string;
  provider?: string;
  resourceType?: string;
  duration?: string;
  category?: string;
  careerContext?: string;
  industry?: string;
  size?: string;
  url?: string;
  score?: number;
  kind: "career" | "job" | "skill" | "course" | "company";
}

interface GlobalSearchBarProps {
  initialQuery?: string;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

const RECENT_SEARCHES_KEY = "cc_recent_searches";

export function GlobalSearchBar({
  initialQuery = "",
  placeholder = "Search jobs, courses, skills, companies...",
  className = "",
  autoFocus = false
}: GlobalSearchBarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    careers: SearchSuggestionItem[];
    jobs: SearchSuggestionItem[];
    skills: SearchSuggestionItem[];
    courses: SearchSuggestionItem[];
    companies: SearchSuggestionItem[];
  }>({
    careers: [],
    jobs: [],
    skills: [],
    courses: [],
    companies: []
  });
  const [totalMatches, setTotalMatches] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<any>(null);

  // Load recent searches
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      setRecentSearches([]);
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    try {
      const updated = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {}
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  };

  // Keyboard shortcut Ctrl/Cmd + K to focus global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsFocused(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Dismiss dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced fetch for Global Query Suggestions
  const fetchSuggestions = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 1) {
      setSuggestions({ careers: [], jobs: [], skills: [], courses: [], companies: [] });
      setTotalMatches(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/search/suggestions?q=${encodeURIComponent(trimmed)}`);
      if (res.data) {
        const cats = res.data.categories || {};
        setSuggestions({
          careers: (cats.careers || []).map((c: any) => ({ ...c, kind: "career" })),
          jobs: (cats.jobs || []).map((j: any) => ({ ...j, kind: "job" })),
          skills: (cats.skills || []).map((s: any) => ({ ...s, kind: "skill" })),
          courses: (cats.courses || []).map((co: any) => ({ ...co, kind: "course" })),
          companies: (cats.companies || []).map((cp: any) => ({ ...cp, kind: "company" }))
        });
        setTotalMatches(res.data.totalResults || 0);
      }
    } catch (err) {
      console.error("Error fetching global search suggestions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (query.trim().length >= 1) {
      setLoading(true);
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(query);
      }, 250);
    } else {
      setSuggestions({ careers: [], jobs: [], skills: [], courses: [], companies: [] });
      setTotalMatches(0);
      setLoading(false);
    }
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query, fetchSuggestions]);

  // Flatten suggestions for keyboard navigation
  const flatSuggestions: SearchSuggestionItem[] = [
    ...suggestions.careers,
    ...suggestions.jobs,
    ...suggestions.skills,
    ...suggestions.courses,
    ...suggestions.companies
  ];

  // Submit search handler
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsFocused(false);

    if (selectedIndex >= 0 && selectedIndex < flatSuggestions.length) {
      handleItemSelect(flatSuggestions[selectedIndex]);
      return;
    }

    const trimmedQ = query.trim();
    if (trimmedQ) {
      saveRecentSearch(trimmedQ);
      navigate(`/search?q=${encodeURIComponent(trimmedQ)}`);
    } else {
      navigate("/search");
    }
  };

  const handleItemSelect = (item: SearchSuggestionItem) => {
    setIsFocused(false);
    const term = item.title || item.name || item.companyName || query;
    if (term) saveRecentSearch(term);

    if (item.kind === "job") {
      navigate(`/jobs?search=${encodeURIComponent(item.title || "")}`);
    } else if (item.kind === "course") {
      navigate(`/courses?search=${encodeURIComponent(item.title || "")}`);
    } else if (item.kind === "skill") {
      navigate(`/courses?skill=${encodeURIComponent(item.name || "")}`);
    } else if (item.kind === "company") {
      navigate(`/jobs?search=${encodeURIComponent(item.name || item.companyName || "")}`);
    } else if (item.kind === "career") {
      navigate(`/roadmap?field=${encodeURIComponent(item.title || "")}`);
    } else if (item.url) {
      navigate(item.url);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flatSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatSuggestions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit();
    } else if (e.key === "Escape") {
      setIsFocused(false);
      setSelectedIndex(-1);
    }
  };

  const hasSuggestions =
    suggestions.careers.length > 0 ||
    suggestions.jobs.length > 0 ||
    suggestions.skills.length > 0 ||
    suggestions.courses.length > 0 ||
    suggestions.companies.length > 0;

  return (
    <div ref={containerRef} className={`relative w-full max-w-2xl font-sans ${className}`}>
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        {/* Search Icon */}
        <Search className="w-4 h-4 text-[#8A96A8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

        {/* Search Input */}
        <input
          ref={searchInputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          autoFocus={autoFocus}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-16 py-2.5 bg-white border border-[#E2E8F0] focus:border-[#356FD8] focus:ring-2 focus:ring-[#356FD8]/10 rounded-full text-xs sm:text-sm font-medium text-[#1F2937] placeholder-[#8A96A8] outline-none transition-all shadow-xs"
        />

        {/* Right shortcut badge or clear button */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSuggestions({ careers: [], jobs: [], skills: [], courses: [], companies: [] });
                searchInputRef.current?.focus();
              }}
              className="text-[#8A96A8] hover:text-[#1F2937] p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block text-[10px] font-semibold text-[#8A96A8] bg-[#F7FAFC] px-1.5 py-0.5 rounded border border-[#E2E8F0]">
              Ctrl K
            </kbd>
          )}
        </div>
      </form>

      {/* ================================================================= */}
      {/* GLOBAL SEARCH AUTOCOMPLETE DROPDOWN PANEL                         */}
      {/* ================================================================= */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.99 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-[#E2E8F0] shadow-xl z-50 overflow-hidden text-xs text-[#1F2937]"
          >
            {/* Top Status Header */}
            <div className="px-4 py-2 bg-[#F7FAFC] border-b border-[#E2E8F0] flex items-center justify-between text-[11px] font-bold text-[#8A96A8]">
              <span>{query.trim().length >= 1 ? `Results for "${query}"` : "Global Career Compass Search"}</span>
              <div className="flex items-center gap-2">
                {loading && (
                  <span className="inline-flex items-center gap-1 text-[#356FD8]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#356FD8] animate-ping" />
                    Searching...
                  </span>
                )}
                <span className="hidden sm:inline-block font-medium text-[10px] text-[#8A96A8]">
                  <kbd>↑</kbd> <kbd>↓</kbd> navigate • <kbd>↵</kbd> select • <kbd>esc</kbd> close
                </span>
              </div>
            </div>

            <div className="max-h-[380px] overflow-y-auto p-2 space-y-3 divide-y divide-[#F1F5F9]">
              
              {/* 1. Recent Searches & Popular Tags (Shown when query is empty) */}
              {query.trim().length < 1 && (
                <div className="p-2 space-y-3">
                  <div className="flex items-center justify-between px-1 text-[10.5px] font-bold text-[#8A96A8] uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#356FD8]" /> Recent Searches
                    </span>
                    {recentSearches.length > 0 && (
                      <button
                        type="button"
                        onClick={clearRecentSearches}
                        className="text-[#356FD8] hover:underline cursor-pointer lowercase text-[10.5px]"
                      >
                        clear
                      </button>
                    )}
                  </div>

                  {recentSearches.length === 0 ? (
                    <div className="px-1 py-1 text-[#8A96A8] text-xs">
                      Type keywords like <span className="text-[#356FD8] font-semibold cursor-pointer" onClick={() => setQuery("Data Analyst")}>"Data Analyst"</span>, <span className="text-[#356FD8] font-semibold cursor-pointer" onClick={() => setQuery("React")}>"React"</span>, or <span className="text-[#356FD8] font-semibold cursor-pointer" onClick={() => setQuery("Python")}>"Python"</span>.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => {
                            setQuery(term);
                            fetchSuggestions(term);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#F7FAFC] hover:bg-[#EEF6FF] text-[#1F2937] hover:text-[#356FD8] border border-[#E2E8F0] font-semibold text-[11px] transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Clock className="w-3 h-3 text-[#8A96A8]" />
                          <span>{term}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Popular Quick Categories */}
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-[#8A96A8] uppercase tracking-wider block mb-1.5 px-1">
                      Explore Popular Categories
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[
                        { label: "Data Science", query: "Data", icon: Compass },
                        { label: "Full Stack", query: "Full Stack", icon: Briefcase },
                        { label: "Python & AI", query: "Python", icon: Award },
                        { label: "Cloud & DevOps", query: "Cloud", icon: Building2 }
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            setQuery(item.query);
                            fetchSuggestions(item.query);
                          }}
                          className="p-2 rounded-xl bg-[#F7FAFC] hover:bg-[#EEF6FF] border border-[#E2E8F0] hover:border-[#356FD8]/30 text-left transition-all cursor-pointer"
                        >
                          <item.icon className="w-3.5 h-3.5 text-[#356FD8] mb-1" />
                          <div className="text-[11px] font-bold text-[#1F2937] leading-tight">{item.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. No Results Empty State */}
              {query.trim().length >= 1 && !loading && !hasSuggestions && (
                <div className="py-8 px-4 text-center space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#F7FAFC] text-[#8A96A8] flex items-center justify-center mx-auto border border-[#E2E8F0]">
                    <Search className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#1F2937]">No results found for "{query}"</h4>
                  <p className="text-[11px] text-[#8A96A8] max-w-sm mx-auto">
                    Try searching for broader keywords like <span className="text-[#356FD8] font-semibold cursor-pointer" onClick={() => setQuery("Data")}>Data</span>, <span className="text-[#356FD8] font-semibold cursor-pointer" onClick={() => setQuery("Engineer")}>Engineer</span>, or <span className="text-[#356FD8] font-semibold cursor-pointer" onClick={() => setQuery("Developer")}>Developer</span>.
                  </p>
                </div>
              )}

              {/* 3. CAREER ROLES */}
              {suggestions.careers.length > 0 && (
                <div className="pt-2 space-y-1">
                  <div className="px-3 text-[10px] font-bold text-[#356FD8] uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-3 h-3" /> CAREER ROLES
                  </div>
                  <div className="space-y-0.5">
                    {suggestions.careers.map((career) => {
                      const overallIdx = flatSuggestions.findIndex((x) => x.title === career.title && x.kind === "career");
                      const isSelected = selectedIndex === overallIdx;
                      return (
                        <div
                          key={career.title}
                          onClick={() => handleItemSelect(career)}
                          onMouseEnter={() => setSelectedIndex(overallIdx)}
                          className={`px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                            isSelected ? "bg-[#EEF6FF] text-[#356FD8] font-bold" : "hover:bg-[#F7FAFC] text-[#1F2937]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[#EEF6FF] text-[#356FD8] flex items-center justify-center shrink-0">
                              <Compass className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-xs">{career.title}</div>
                              <div className="text-[10.5px] text-[#8A96A8]">{career.department}</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-[#356FD8] bg-white px-2 py-0.5 rounded-full border border-[#E2E8F0] flex items-center gap-1">
                            Roadmap <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. VERIFIED JOBS */}
              {suggestions.jobs.length > 0 && (
                <div className="pt-2 space-y-1">
                  <div className="px-3 text-[10px] font-bold text-[#16A34A] uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3 h-3" /> VERIFIED JOBS
                  </div>
                  <div className="space-y-0.5">
                    {suggestions.jobs.map((job) => {
                      const overallIdx = flatSuggestions.findIndex((x) => x.id === job.id && x.kind === "job");
                      const isSelected = selectedIndex === overallIdx;
                      return (
                        <div
                          key={job.id}
                          onClick={() => handleItemSelect(job)}
                          onMouseEnter={() => setSelectedIndex(overallIdx)}
                          className={`px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                            isSelected ? "bg-[#F0FDF4] text-[#16A34A] font-bold" : "hover:bg-[#F7FAFC] text-[#1F2937]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center shrink-0">
                              <Briefcase className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs truncate">{job.title}</div>
                              <div className="text-[10.5px] text-[#8A96A8] truncate">
                                {job.companyName} • {job.location} • {job.salary}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-[#16A34A] bg-white px-2 py-0.5 rounded-full border border-[#E2E8F0] shrink-0">
                            {job.workMode || "Active"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. SKILLS */}
              {suggestions.skills.length > 0 && (
                <div className="pt-2 space-y-1">
                  <div className="px-3 text-[10px] font-bold text-[#D97706] uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3 h-3" /> SKILLS & COMPETENCIES
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 px-1">
                    {suggestions.skills.map((skill) => {
                      const overallIdx = flatSuggestions.findIndex((x) => x.name === skill.name && x.kind === "skill");
                      const isSelected = selectedIndex === overallIdx;
                      return (
                        <div
                          key={skill.name}
                          onClick={() => handleItemSelect(skill)}
                          onMouseEnter={() => setSelectedIndex(overallIdx)}
                          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                            isSelected ? "bg-[#FFFBEB] text-[#D97706] font-bold" : "hover:bg-[#F7FAFC] text-[#1F2937]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Award className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                            <span className="font-bold text-xs">{skill.name}</span>
                          </div>
                          <span className="text-[9.5px] font-semibold text-[#8A96A8] bg-[#F7FAFC] px-1.5 py-0.5 rounded">
                            {skill.category}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 6. COURSES & GUIDES */}
              {suggestions.courses.length > 0 && (
                <div className="pt-2 space-y-1">
                  <div className="px-3 text-[10px] font-bold text-[#356FD8] uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3" /> COURSES & GUIDES
                  </div>
                  <div className="space-y-0.5">
                    {suggestions.courses.map((course) => {
                      const overallIdx = flatSuggestions.findIndex((x) => x.id === course.id && x.kind === "course");
                      const isSelected = selectedIndex === overallIdx;
                      return (
                        <div
                          key={course.id}
                          onClick={() => handleItemSelect(course)}
                          onMouseEnter={() => setSelectedIndex(overallIdx)}
                          className={`px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                            isSelected ? "bg-[#EEF6FF] text-[#356FD8] font-bold" : "hover:bg-[#F7FAFC] text-[#1F2937]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-[#EEF6FF] text-[#356FD8] flex items-center justify-center shrink-0">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs truncate">{course.title}</div>
                              <div className="text-[10.5px] text-[#8A96A8] truncate">
                                {course.provider} • {course.skill} • {course.duration || "Self-Paced"}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-[#356FD8] bg-white px-2 py-0.5 rounded-full border border-[#E2E8F0] shrink-0">
                            {course.isFree ? "Free" : "Certified"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 7. COMPANIES */}
              {suggestions.companies.length > 0 && (
                <div className="pt-2 space-y-1">
                  <div className="px-3 text-[10px] font-bold text-[#5B8FE3] uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3 h-3" /> HIRING COMPANIES
                  </div>
                  <div className="space-y-0.5">
                    {suggestions.companies.map((comp) => {
                      const overallIdx = flatSuggestions.findIndex((x) => x.name === comp.name && x.kind === "company");
                      const isSelected = selectedIndex === overallIdx;
                      return (
                        <div
                          key={comp.name}
                          onClick={() => handleItemSelect(comp)}
                          onMouseEnter={() => setSelectedIndex(overallIdx)}
                          className={`px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                            isSelected ? "bg-[#EEF6FF] text-[#356FD8] font-bold" : "hover:bg-[#F7FAFC] text-[#1F2937]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[#EEF6FF] text-[#356FD8] flex items-center justify-center shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-xs">{comp.name}</div>
                              <div className="text-[10.5px] text-[#8A96A8]">{comp.industry || "Technology"}</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-[#356FD8] bg-white px-2 py-0.5 rounded-full border border-[#E2E8F0]">
                            View Jobs
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Footer Action */}
            {query.trim().length >= 1 && (
              <div className="p-2.5 bg-[#F7FAFC] border-t border-[#E2E8F0] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleSearchSubmit()}
                  className="w-full py-2 px-4 rounded-xl bg-[#356FD8] hover:bg-[#2557B8] text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-[#356FD8]/20"
                >
                  <span>View all {totalMatches > 0 ? `${totalMatches} ` : ""}results for "{query}"</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
