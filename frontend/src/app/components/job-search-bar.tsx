import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  X,
  Briefcase,
  Building2,
  Award,
  ChevronRight,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface JobSuggestionItem {
  id?: string;
  title: string;
  companyName?: string;
  location?: string;
  skills?: string[];
  type?: string;
  workMode?: string;
  kind: "job" | "company" | "skill";
}

interface JobSearchBarProps {
  initialQuery?: string;
  initialLocation?: string;
  onSearch?: (query: string, location: string) => void;
  onOpenFilters?: () => void;
  activeFilterCount?: number;
  className?: string;
}

export function JobSearchBar({
  initialQuery = "",
  initialLocation = "",
  onSearch,
  onOpenFilters,
  activeFilterCount = 0,
  className = ""
}: JobSearchBarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [locationQuery, setLocationQuery] = useState(initialLocation);
  const [isQueryFocused, setIsQueryFocused] = useState(false);
  const [isLocFocused, setIsLocFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  // Suggestions state
  const [jobSuggestions, setJobSuggestions] = useState<{
    jobs: JobSuggestionItem[];
    companies: JobSuggestionItem[];
    skills: JobSuggestionItem[];
  }>({
    jobs: [],
    companies: [],
    skills: []
  });
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const queryInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<any>(null);
  const locDebounceRef = useRef<any>(null);

  // Sync initial props
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setLocationQuery(initialLocation);
  }, [initialLocation]);

  // Dismiss dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsQueryFocused(false);
        setIsLocFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Job Suggestions fetch
  const fetchJobSuggestions = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 1) {
      setJobSuggestions({ jobs: [], companies: [], skills: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/search/suggestions?q=${encodeURIComponent(trimmed)}`);
      if (res.data?.categories) {
        const cats = res.data.categories;
        setJobSuggestions({
          jobs: (cats.jobs || []).map((j: any) => ({ ...j, kind: "job" })),
          companies: (cats.companies || []).map((cp: any) => ({ title: cp.name, companyName: cp.name, kind: "company" })),
          skills: (cats.skills || []).map((sk: any) => ({ title: sk.name, kind: "skill" }))
        });
      }
    } catch (err) {
      console.error("Job search suggestions error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (query.trim().length >= 1) {
      setLoading(true);
      debounceTimerRef.current = setTimeout(() => {
        fetchJobSuggestions(query);
      }, 250);
    } else {
      setJobSuggestions({ jobs: [], companies: [], skills: [] });
      setLoading(false);
    }
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query, fetchJobSuggestions]);

  // Debounced Location Autocomplete fetch
  useEffect(() => {
    if (locDebounceRef.current) clearTimeout(locDebounceRef.current);
    locDebounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/search/locations?q=${encodeURIComponent(locationQuery.trim())}`);
        if (res.data?.locations) {
          setLocationSuggestions(res.data.locations);
        }
      } catch {}
    }, 200);
    return () => {
      if (locDebounceRef.current) clearTimeout(locDebounceRef.current);
    };
  }, [locationQuery]);

  const flatSuggestions: JobSuggestionItem[] = [
    ...jobSuggestions.jobs,
    ...jobSuggestions.companies,
    ...jobSuggestions.skills
  ];

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsQueryFocused(false);
    setIsLocFocused(false);

    if (selectedIndex >= 0 && selectedIndex < flatSuggestions.length) {
      handleItemSelect(flatSuggestions[selectedIndex]);
      return;
    }

    if (onSearch) {
      onSearch(query.trim(), locationQuery.trim());
    } else {
      const params = new URLSearchParams();
      if (query.trim()) params.set("search", query.trim());
      if (locationQuery.trim()) params.set("loc", locationQuery.trim());
      navigate(`/jobs?${params.toString()}`);
    }
  };

  const handleItemSelect = (item: JobSuggestionItem) => {
    setIsQueryFocused(false);
    setIsLocFocused(false);
    setQuery(item.title);
    if (onSearch) {
      onSearch(item.title, locationQuery.trim());
    } else {
      navigate(`/jobs?search=${encodeURIComponent(item.title)}&loc=${encodeURIComponent(locationQuery.trim())}`);
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
      setIsQueryFocused(false);
      setIsLocFocused(false);
      setSelectedIndex(-1);
    }
  };

  const hasSuggestions =
    jobSuggestions.jobs.length > 0 ||
    jobSuggestions.companies.length > 0 ||
    jobSuggestions.skills.length > 0;

  return (
    <div ref={containerRef} className={`relative w-full font-sans ${className}`}>
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-1.5 sm:p-2 flex flex-col md:flex-row items-stretch md:items-center gap-2"
      >
        {/* 1. Job Title / Skill / Keyword Search Input */}
        <div className="relative flex-1 flex items-center min-w-0">
          <Search className="w-4 h-4 text-[#8A96A8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={queryInputRef}
            type="text"
            placeholder="Search job title, skill, company or keywords..."
            value={query}
            onFocus={() => {
              setIsQueryFocused(true);
              setIsLocFocused(false);
            }}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-8 py-2.5 bg-transparent rounded-xl text-xs sm:text-sm font-medium text-[#1F2937] placeholder-[#8A96A8] outline-none transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setJobSuggestions({ jobs: [], companies: [], skills: [] });
                queryInputRef.current?.focus();
                if (onSearch) onSearch("", locationQuery);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A96A8] hover:text-[#1F2937] p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-7 bg-[#E2E8F0]" />

        {/* 2. Location Autocomplete Input */}
        <div className="relative w-full md:w-60 flex items-center">
          <MapPin className="w-4 h-4 text-[#8A96A8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="City, state or Remote"
            value={locationQuery}
            onFocus={() => {
              setIsLocFocused(true);
              setIsQueryFocused(false);
            }}
            onChange={(e) => setLocationQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 bg-transparent rounded-xl text-xs sm:text-sm font-medium text-[#1F2937] placeholder-[#8A96A8] outline-none transition-colors"
          />
          {locationQuery && (
            <button
              type="button"
              onClick={() => {
                setLocationQuery("");
                if (onSearch) onSearch(query, "");
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A96A8] hover:text-[#1F2937] p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 3. Filter Toggle Button & Search CTA */}
        <div className="flex items-center gap-2 pt-1 md:pt-0">
          {onOpenFilters && (
            <button
              type="button"
              onClick={onOpenFilters}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                activeFilterCount > 0
                  ? "bg-[#EEF6FF] text-[#356FD8] border-[#356FD8]/30 font-bold"
                  : "bg-white hover:bg-[#F7FAFC] text-[#5B6472] border-[#E2E8F0]"
              }`}
              title="Job Filters"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#356FD8] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}

          <button
            type="submit"
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#356FD8] hover:bg-[#2557B8] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-[#356FD8]/20 transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Find Jobs</span>
          </button>
        </div>
      </form>

      {/* ================================================================= */}
      {/* 4. JOB SEARCH SUGGESTIONS DROPDOWN                                */}
      {/* ================================================================= */}
      <AnimatePresence>
        {isQueryFocused && query.trim().length >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.99 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-[#E2E8F0] shadow-xl z-50 overflow-hidden text-xs text-[#1F2937]"
          >
            <div className="px-4 py-2 bg-[#F7FAFC] border-b border-[#E2E8F0] flex items-center justify-between text-[11px] font-bold text-[#8A96A8]">
              <span>Matching Jobs & Skills</span>
              {loading && <span className="text-[#356FD8] text-[10px]">Loading...</span>}
            </div>

            <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
              {!loading && !hasSuggestions && (
                <div className="py-6 text-center text-[#8A96A8] text-xs">
                  No direct job suggestions found for "{query}". Press Enter to search anyway.
                </div>
              )}

              {/* Jobs */}
              {jobSuggestions.jobs.length > 0 && (
                <div className="space-y-0.5">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-[#16A34A] uppercase tracking-wider flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Job Openings
                  </div>
                  {jobSuggestions.jobs.map((job) => (
                    <div
                      key={job.title}
                      onClick={() => handleItemSelect(job)}
                      className="px-3 py-2 rounded-xl hover:bg-[#F7FAFC] transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-[#356FD8]" />
                        <span className="font-semibold text-xs text-[#1F2937]">{job.title}</span>
                      </div>
                      <span className="text-[10.5px] text-[#8A96A8]">{job.companyName}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Companies */}
              {jobSuggestions.companies.length > 0 && (
                <div className="space-y-0.5 pt-1 border-t border-[#F1F5F9]">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-[#356FD8] uppercase tracking-wider flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Companies
                  </div>
                  {jobSuggestions.companies.map((comp) => (
                    <div
                      key={comp.title}
                      onClick={() => handleItemSelect(comp)}
                      className="px-3 py-2 rounded-xl hover:bg-[#F7FAFC] transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-[#356FD8]" />
                        <span className="font-semibold text-xs text-[#1F2937]">{comp.title}</span>
                      </div>
                      <span className="text-[10px] text-[#356FD8] font-bold">View Openings</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills */}
              {jobSuggestions.skills.length > 0 && (
                <div className="space-y-0.5 pt-1 border-t border-[#F1F5F9]">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-[#D97706] uppercase tracking-wider flex items-center gap-1">
                    <Award className="w-3 h-3" /> Relevant Skills
                  </div>
                  {jobSuggestions.skills.map((sk) => (
                    <div
                      key={sk.title}
                      onClick={() => handleItemSelect(sk)}
                      className="px-3 py-1.5 rounded-xl hover:bg-[#F7FAFC] transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Award className="w-3.5 h-3.5 text-[#D97706]" />
                      <span className="font-semibold text-xs text-[#1F2937]">{sk.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* 5. LOCATION AUTOCOMPLETE DROPDOWN                                 */}
      {/* ================================================================= */}
      <AnimatePresence>
        {isLocFocused && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute right-0 md:right-32 top-full mt-2 w-64 bg-white rounded-2xl border border-[#E2E8F0] shadow-xl z-50 p-2 text-xs font-semibold text-[#1F2937] space-y-1"
          >
            <div className="px-2.5 py-1 text-[10px] font-bold text-[#8A96A8] uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#356FD8]" /> Popular Locations
            </div>
            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {locationSuggestions.map((loc) => (
                <div
                  key={loc}
                  onMouseDown={() => {
                    setLocationQuery(loc);
                    setIsLocFocused(false);
                    if (onSearch) onSearch(query, loc);
                  }}
                  className="px-2.5 py-2 rounded-xl hover:bg-[#EEF6FF] hover:text-[#356FD8] transition-colors cursor-pointer flex items-center gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#8A96A8]" />
                  <span>{loc}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
