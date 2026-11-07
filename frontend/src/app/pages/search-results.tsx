import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  MapPin,
  Briefcase,
  BookOpen,
  Award,
  Building2,
  Compass,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
  Layers
} from "lucide-react";
import { GlobalSearchBar } from "../components/global-search-bar";

interface JobResult {
  _id: string;
  title: string;
  companyName: string;
  logo?: string;
  department?: string;
  location: string;
  type: string;
  workMode: string;
  experience: string;
  salary: string;
  skills: string[];
  description?: string;
  matchScore?: number;
}

interface CourseResult {
  id: number;
  title: string;
  provider: string;
  skill: string;
  category: string;
  url: string;
  description?: string;
  rating?: number;
  duration?: string;
  level?: string;
  isFree?: boolean;
}

interface SkillResult {
  name: string;
  category: string;
  careerContext?: string;
}

interface CompanyResult {
  name: string;
  industry: string;
  location?: string;
  roles?: string[];
  activeJobCount?: number;
}

interface CareerResult {
  title: string;
  department: string;
  description?: string;
  requiredSkills?: string[];
  startingSalary?: string;
  roadmapStages?: number;
}

export function SearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // URL search params
  const searchParams = new URLSearchParams(location.search);
  const qParam = searchParams.get("q") || "";
  const catParam = searchParams.get("category") || "all";

  // State
  const [query, setQuery] = useState(qParam);
  const [activeTab, setActiveTab] = useState(catParam);
  const [loading, setLoading] = useState(true);

  // Results State
  const [careers, setCareers] = useState<CareerResult[]>([]);
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [skills, setSkills] = useState<SkillResult[]>([]);
  const [courses, setCourses] = useState<CourseResult[]>([]);
  const [companies, setCompanies] = useState<CompanyResult[]>([]);
  const [counts, setCounts] = useState({
    all: 0,
    careers: 0,
    jobs: 0,
    skills: 0,
    courses: 0,
    companies: 0,
  });

  // Filter States
  const [selectedJobType, setSelectedJobType] = useState("all");
  const [selectedWorkMode, setSelectedWorkMode] = useState("all");
  const [selectedExperience, setSelectedExperience] = useState("all");
  const [selectedCourseLevel, setSelectedCourseLevel] = useState("all");
  const [selectedSkillCategory, setSelectedSkillCategory] = useState("all");

  // Synchronize when URL search parameters change
  useEffect(() => {
    const pQ = searchParams.get("q") || "";
    const pCat = searchParams.get("category") || "all";
    setQuery(pQ);
    setActiveTab(pCat);
    performSearch(pQ, pCat);
  }, [location.search]);

  const performSearch = async (searchTerm: string, category: string) => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/search", {
        params: {
          q: searchTerm,
          category: category !== "all" ? category : undefined,
        },
      });

      if (res.data) {
        setCareers(res.data.careers || []);
        setJobs(res.data.jobs || []);
        setSkills(res.data.skills || []);
        setCourses(res.data.courses || []);
        setCompanies(res.data.companies || []);
        setCounts(res.data.counts || {
          all: 0,
          careers: 0,
          jobs: 0,
          skills: 0,
          courses: 0,
          companies: 0,
        });
      }
    } catch (err) {
      console.error("Search API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(location.search);
    if (tabId === "all") {
      params.delete("category");
    } else {
      params.set("category", tabId);
    }
    navigate(`/search?${params.toString()}`, { replace: true });
  };

  const resetFilters = () => {
    setSelectedJobType("all");
    setSelectedWorkMode("all");
    setSelectedExperience("all");
    setSelectedCourseLevel("all");
    setSelectedSkillCategory("all");
  };

  // Filtered lists for client refinements
  const filteredJobs = jobs.filter((j) => {
    if (selectedJobType !== "all" && j.type !== selectedJobType) return false;
    if (selectedWorkMode !== "all" && j.workMode !== selectedWorkMode) return false;
    if (selectedExperience !== "all" && !j.experience.includes(selectedExperience)) return false;
    return true;
  });

  const filteredCourses = courses.filter((c) => {
    if (selectedCourseLevel !== "all" && c.level && !c.level.toLowerCase().includes(selectedCourseLevel.toLowerCase())) {
      return false;
    }
    return true;
  });

  const filteredSkills = skills.filter((s) => {
    if (selectedSkillCategory !== "all" && s.category !== selectedSkillCategory) {
      return false;
    }
    return true;
  });

  const totalFilteredCount =
    (activeTab === "all" || activeTab === "careers" ? careers.length : 0) +
    (activeTab === "all" || activeTab === "jobs" ? filteredJobs.length : 0) +
    (activeTab === "all" || activeTab === "skills" ? filteredSkills.length : 0) +
    (activeTab === "all" || activeTab === "courses" ? filteredCourses.length : 0) +
    (activeTab === "all" || activeTab === "companies" ? companies.length : 0);

  const TABS = [
    { id: "all", label: "All Results", count: counts.all, icon: Layers },
    { id: "jobs", label: "Jobs", count: counts.jobs, icon: Briefcase },
    { id: "courses", label: "Courses", count: counts.courses, icon: BookOpen },
    { id: "skills", label: "Skills", count: counts.skills, icon: Award },
    { id: "careers", label: "Career Roles", count: counts.careers, icon: Compass },
    { id: "companies", label: "Companies", count: counts.companies, icon: Building2 },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 font-sans pb-20">
      {/* ================================================================== */}
      {/* 1. TOP HERO SEARCH HEADER (Jobscan-Inspired Clean SaaS Style)       */}
      {/* ================================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF6FF] text-[#356FD8] text-xs font-bold border border-[#356FD8]/20">
            <Sparkles className="w-3.5 h-3.5 text-[#356FD8]" />
            <span>Unified Search Engine</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#172033] tracking-tight">
            {query.trim() ? (
              <>
                Search results for <span className="text-[#356FD8]">"{query}"</span>
              </>
            ) : (
              "Explore Career Compass Directory"
            )}
          </h1>

          <p className="text-xs sm:text-sm text-[#5B6472] leading-relaxed">
            Multi-domain intelligence across active jobs, learning courses, role roadmaps, and hiring companies.
          </p>

          {/* Embedded Pure Global Search Bar */}
          <div className="pt-2 max-w-2xl">
            <GlobalSearchBar
              initialQuery={query}
              placeholder="Search jobs, courses, skills, companies..."
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 2. CATEGORY TABS                                                   */}
      {/* ================================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E2E8F0] scrollbar-none">
        {TABS.map((tab) => {
          const isSelected = activeTab === tab.id;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                isSelected
                  ? "bg-[#356FD8] text-white border-[#356FD8] shadow-sm shadow-[#356FD8]/25"
                  : "bg-white hover:bg-[#F7FAFC] text-[#5B6472] border-[#E2E8F0]"
              }`}
            >
              <TabIcon className={`w-4 h-4 ${isSelected ? "text-white" : "text-[#356FD8]"}`} />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                  isSelected ? "bg-white/20 text-white" : "bg-[#F7FAFC] text-[#8A96A8]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ================================================================== */}
      {/* 3. MAIN CONTENT WITH REFINEMENT FILTERS                            */}
      {/* ================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 8-9 Cols: Search Results Feed */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Results Count & Quick Status */}
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-[#172033]">
              Showing <span className="text-[#356FD8]">{totalFilteredCount}</span> matching items
            </div>
            {activeTab !== "all" && (
              <button
                onClick={() => handleTabChange("all")}
                className="text-[11px] font-bold text-[#356FD8] hover:underline cursor-pointer"
              >
                View all categories
              </button>
            )}
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E2E8F0] shadow-xs space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#356FD8] border-t-transparent animate-spin mx-auto" />
              <p className="text-xs font-bold text-[#5B6472]">Searching Career Compass database...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && totalFilteredCount === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E2E8F0] shadow-xs space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#EEF6FF] text-[#356FD8] flex items-center justify-center mx-auto">
                <Search className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#172033]">No matching results found</h3>
                <p className="text-xs text-[#8A96A8] mt-1">
                  We couldn't find matches for <span className="font-semibold text-[#1F2937]">"{query}"</span>.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F7FAFC] border border-[#E2E8F0] text-left space-y-1.5 text-xs text-[#5B6472]">
                <span className="font-bold text-[#172033] text-[11px] uppercase tracking-wider block">Suggestions:</span>
                <p>• Check for spelling errors or try broader keywords (e.g. <em>Data</em>, <em>React</em>, <em>Python</em>).</p>
                <p>• Clear category filters to expand your search scope.</p>
                <p>• Browse available jobs or roadmaps from the navigation menu.</p>
              </div>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#356FD8] hover:bg-[#2557B8] text-white rounded-xl text-xs font-bold shadow-sm shadow-[#356FD8]/20 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}

          {/* RESULT SECTIONS */}
          {!loading && (
            <div className="space-y-6">

              {/* ----------------- SECTION 1: CAREER ROLES ----------------- */}
              {(activeTab === "all" || activeTab === "careers") && careers.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#356FD8] flex items-center gap-1.5">
                      <Compass className="w-4 h-4" />
                      <span>Career Roles & Paths ({careers.length})</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {careers.map((career) => (
                      <motion.div
                        key={career.title}
                        whileHover={{ y: -2 }}
                        className="bg-white rounded-2xl p-4 border border-[#E2E8F0] hover:border-[#356FD8]/30 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-[#EEF6FF] text-[#356FD8] text-[10px] font-bold border border-[#356FD8]/20">
                              {career.department}
                            </span>
                            <span className="text-[11px] font-extrabold text-[#16A34A]">
                              {career.startingSalary || "₹ 8-15 LPA"}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold font-heading text-[#172033] mt-2">
                            {career.title}
                          </h4>
                          <p className="text-[11px] text-[#5B6472] mt-1 line-clamp-2">
                            {career.description || `Specialized career trajectory in ${career.department} with curated milestones.`}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#8A96A8]">
                            {career.roadmapStages || 4} Learning Stages
                          </span>
                          <Link
                            to={`/roadmap?field=${encodeURIComponent(career.title)}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#356FD8] hover:text-[#2557B8]"
                          >
                            <span>Open Roadmap</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* ----------------- SECTION 2: VERIFIED JOBS ----------------- */}
              {(activeTab === "all" || activeTab === "jobs") && filteredJobs.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#16A34A] flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" />
                      <span>Verified Jobs ({filteredJobs.length})</span>
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {filteredJobs.map((job) => (
                      <motion.div
                        key={job._id}
                        whileHover={{ y: -1 }}
                        className="bg-white rounded-2xl p-5 border border-[#E2E8F0] hover:border-[#356FD8]/30 shadow-2xs hover:shadow-md transition-all space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex items-start gap-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-[#356FD8] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                              {job.companyName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-sm sm:text-base font-bold font-heading text-[#172033]">
                                {job.title}
                              </h4>
                              <p className="text-xs font-semibold text-[#5B6472] mt-0.5">{job.companyName}</p>
                            </div>
                          </div>

                          <div className="text-right sm:text-right">
                            <span className="text-sm font-extrabold text-[#172033] block">{job.salary}</span>
                            <span className="text-[10px] font-bold text-[#16A34A] bg-[#F0FDF4] px-2 py-0.5 rounded-md border border-[#16A34A]/20 inline-block mt-0.5">
                              {job.workMode}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] font-medium text-[#5B6472] flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#8A96A8]" />
                            {job.location}
                          </span>
                          <span>•</span>
                          <span>{job.type}</span>
                          <span>•</span>
                          <span>{job.experience}</span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#F1F5F9]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {job.skills.slice(0, 4).map((sk, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-lg bg-[#F7FAFC] text-[#5B6472] border border-[#E2E8F0] text-[10.5px] font-semibold"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              to={`/resume-studio/tailor?jobId=${job._id}`}
                              className="px-3 py-1.5 rounded-xl bg-[#F7FAFC] hover:bg-[#EEF6FF] text-[#5B6472] hover:text-[#356FD8] text-xs font-bold transition-colors border border-[#E2E8F0]"
                            >
                              Tailor Resume
                            </Link>
                            <Link
                              to={`/jobs?search=${encodeURIComponent(job.title)}`}
                              className="px-4 py-1.5 rounded-xl bg-[#356FD8] hover:bg-[#2557B8] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                            >
                              <span>View & Apply</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* ----------------- SECTION 3: SKILLS ----------------- */}
              {(activeTab === "all" || activeTab === "skills") && filteredSkills.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#D97706] flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      <span>Skills & Core Competencies ({filteredSkills.length})</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredSkills.map((sk) => (
                      <div
                        key={sk.name}
                        onClick={() => navigate(`/courses?skill=${encodeURIComponent(sk.name)}`)}
                        className="bg-white rounded-2xl p-3.5 border border-[#E2E8F0] hover:border-[#D97706]/30 hover:bg-[#FFFBEB]/40 transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center font-bold">
                            <Award className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-[#172033]">{sk.name}</div>
                            <div className="text-[10px] text-[#8A96A8]">{sk.category}</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#8A96A8]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ----------------- SECTION 4: COURSES ----------------- */}
              {(activeTab === "all" || activeTab === "courses") && filteredCourses.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#356FD8] flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      <span>Curated Learning Tracks ({filteredCourses.length})</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {filteredCourses.map((course) => (
                      <div
                        key={course.id}
                        className="bg-white rounded-2xl p-4 border border-[#E2E8F0] hover:border-[#356FD8]/30 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-[#EEF6FF] text-[#356FD8] text-[10px] font-bold border border-[#356FD8]/20">
                              {course.provider}
                            </span>
                            <span className="text-[10.5px] font-bold text-[#8A96A8]">
                              {course.level || "Beginner to Intermediate"}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-[#172033] mt-2 line-clamp-1">
                            {course.title}
                          </h4>
                          <p className="text-[11px] text-[#5B6472] mt-1 line-clamp-2">
                            {course.description || `Comprehensive skill development module focusing on ${course.skill}.`}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
                          <span className="text-[10.5px] font-semibold text-[#8A96A8]">
                            {course.duration || "Self-Paced"}
                          </span>
                          <a
                            href={course.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#356FD8] hover:text-[#2557B8]"
                          >
                            <span>Start Course</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ----------------- SECTION 5: COMPANIES ----------------- */}
              {(activeTab === "all" || activeTab === "companies") && companies.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#356FD8] flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" />
                      <span>Hiring Companies ({companies.length})</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {companies.map((comp) => (
                      <div
                        key={comp.name}
                        onClick={() => navigate(`/jobs?search=${encodeURIComponent(comp.name)}`)}
                        className="bg-white rounded-2xl p-4 border border-[#E2E8F0] hover:border-[#356FD8]/30 shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#EEF6FF] text-[#356FD8] flex items-center justify-center font-bold text-xs shrink-0">
                            {comp.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#172033]">{comp.name}</h4>
                            <p className="text-[11px] text-[#8A96A8]">{comp.industry} • {comp.location || "Multiple Locations"}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-[#356FD8] bg-[#EEF6FF] px-2.5 py-1 rounded-xl border border-[#356FD8]/20 flex items-center gap-1">
                          View Openings <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Right 4 Cols: Contextual Refinement Filters */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-xs space-y-4 sticky top-24">
            <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-[#356FD8]" />
                <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">Search Filters</h3>
              </div>
              <button
                onClick={resetFilters}
                className="text-[11px] font-bold text-[#356FD8] hover:underline cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Work Mode */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#5B6472]">Work Mode</label>
              <select
                value={selectedWorkMode}
                onChange={(e) => setSelectedWorkMode(e.target.value)}
                className="w-full text-xs font-semibold text-[#1F2937] bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 outline-none focus:border-[#356FD8] cursor-pointer"
              >
                <option value="all">All Work Modes</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            {/* Job Type */}
            <div className="space-y-1.5 pt-2 border-t border-[#F1F5F9]">
              <label className="text-[11px] font-bold text-[#5B6472]">Job Type</label>
              <select
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                className="w-full text-xs font-semibold text-[#1F2937] bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 outline-none focus:border-[#356FD8] cursor-pointer"
              >
                <option value="all">All Job Types</option>
                <option value="Full Time">Full Time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            {/* Experience */}
            <div className="space-y-1.5 pt-2 border-t border-[#F1F5F9]">
              <label className="text-[11px] font-bold text-[#5B6472]">Experience</label>
              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="w-full text-xs font-semibold text-[#1F2937] bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 outline-none focus:border-[#356FD8] cursor-pointer"
              >
                <option value="all">All Levels</option>
                <option value="0-2">Entry Level (0-2 years)</option>
                <option value="1-3">Mid-Junior (1-3 years)</option>
                <option value="3-5">Mid-Senior (3-5 years)</option>
              </select>
            </div>

            {/* Skill Category */}
            <div className="space-y-1.5 pt-2 border-t border-[#F1F5F9]">
              <label className="text-[11px] font-bold text-[#5B6472]">Skill Domain</label>
              <select
                value={selectedSkillCategory}
                onChange={(e) => setSelectedSkillCategory(e.target.value)}
                className="w-full text-xs font-semibold text-[#1F2937] bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 outline-none focus:border-[#356FD8] cursor-pointer"
              >
                <option value="all">All Domains</option>
                <option value="Data & AI">Data & AI</option>
                <option value="Frontend Development">Frontend Development</option>
                <option value="Backend Development">Backend Development</option>
                <option value="Cloud & DevOps">Cloud & DevOps</option>
                <option value="Design & UX">Design & UX</option>
              </select>
            </div>

            {/* Quick Links Card */}
            <div className="p-4 rounded-2xl bg-[#EEF6FF] border border-[#356FD8]/20 space-y-2 mt-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#172033]">
                <Sparkles className="w-4 h-4 text-[#356FD8]" />
                <span>Need Personalized Guidance?</span>
              </div>
              <p className="text-[11px] text-[#5B6472]">
                Take our comprehensive Career Assessment to unlock AI-customized job suggestions and tailored roadmaps.
              </p>
              <Link
                to="/assessment"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#356FD8] hover:text-[#2557B8] pt-1"
              >
                <span>Start Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
