import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/auth-context";
import { COURSES } from "./coursesData";
import type { Course } from "./coursesData";

// Platform Logos
export function CourseraLogo() {
  return (
    <svg className="w-3.5 h-3.5 fill-[#0056D2]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.24 7.64c-3.14 0-5.7 2.56-5.7 5.7s2.56 5.7 5.7 5.7 5.7-2.56 5.7-5.7-2.56-5.7-5.7-5.7zm0 9.24c-1.95 0-3.54-1.59-3.54-3.54s1.59-3.54 3.54-3.54 3.54 1.59 3.54 3.54-1.59 3.54-3.54 3.54zM2.84 8.79C1.27 10.36.42 12.48.42 14.73c0 2.25.85 4.37 2.42 5.94l1.52-1.52c-1.16-1.16-1.8-2.7-1.8-4.42 0-1.72.64-3.26 1.8-4.42L2.84 8.79zm18.32 0l-1.52 1.52c1.16 1.16 1.8 2.7 1.8 4.42 0 1.72-.64 3.26-1.8 4.42l1.52 1.52c1.57-1.57 2.42-3.69 2.42-5.94 0-2.25-.85-4.37-2.42-5.94z"/>
    </svg>
  );
}

export function UdemyLogo() {
  return (
    <svg className="w-3.5 h-3.5 fill-[#A435F0]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.96 12.58l-1.96 1.96-1.96-1.96V10.1h3.92v4.48zm1.96-6.44v6.44c0 2.17-1.75 3.92-3.92 3.92s-3.92-1.75-3.92-3.92V8.14h1.96v6.44c0 1.08.88 1.96 1.96 1.96s1.96-.88 1.96-1.96V8.14h1.96z"/>
    </svg>
  );
}

export function EdxLogo() {
  return (
    <svg className="w-3.5 h-3.5 fill-[#0F1011]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 8h4.5v1h-3.5v2h3v1h-3v2h3.5v1H5V8zm9.5 0h1.5l1.5 3.5L19 8h1.5l-2.25 5L20.5 18H19l-1.5-3.5L16 18h-1.5l2.25-5-2.25-5zM11 8h1v10h-1V8z"/>
    </svg>
  );
}

export function UdacityLogo() {
  return (
    <svg className="w-3.5 h-3.5 fill-[#01B3E6]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 3v13c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V3h-3v13c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V3H2z"/>
    </svg>
  );
}

export function YouTubeLogo() {
  return (
    <svg className="w-3.5 h-3.5 fill-red-600" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.516 3.5 12 3.5 12 3.5s-7.516 0-9.388.555A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.484 20.5 12 20.5 12 20.5s7.516 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function PlatformBadge({ platform }: { platform: string }) {
  const p = platform.toLowerCase();
  if (p === "coursera") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#0056D2] text-white shadow-xs">
        <CourseraLogo />
        Coursera
      </span>
    );
  }
  if (p === "udemy") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#A435F0] text-white shadow-xs">
        <UdemyLogo />
        Udemy
      </span>
    );
  }
  if (p === "edx") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#111827] text-white shadow-xs">
        <span className="text-[11px] font-black tracking-tighter">edX</span>
      </span>
    );
  }
  if (p === "udacity") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#01B3E6] text-white shadow-xs">
        <UdacityLogo />
        Udacity
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-600 text-white shadow-xs">
      <YouTubeLogo />
      YouTube
    </span>
  );
}

// Tech Brand Icons for course header preview
function TechBrandIcon({ title, skill }: { title: string; skill?: string }) {
  const text = `${title} ${skill || ""}`.toLowerCase();

  if (text.includes("spark")) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-1.5 text-amber-500 font-black text-xl tracking-tight">
          <span className="material-symbols-outlined text-amber-500 text-[26px]">electric_bolt</span>
          <span className="text-white text-base font-extrabold tracking-wide">Spark</span>
        </div>
      </div>
    );
  }
  if (text.includes("sql")) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-black text-sm tracking-wider shadow-sm">
          SQL
        </div>
      </div>
    );
  }
  if (text.includes("aws") || text.includes("cloud")) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-1 text-amber-400 font-black text-2xl tracking-tighter">
          aws
        </div>
      </div>
    );
  }
  if (text.includes("python")) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 font-black text-2xl shadow-sm">
          🐍
        </div>
      </div>
    );
  }
  if (text.includes("react")) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <span className="material-symbols-outlined text-cyan-400 text-[32px] animate-spin-slow">
          cycle
        </span>
      </div>
    );
  }
  if (text.includes("node") || text.includes("backend")) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <span className="material-symbols-outlined text-emerald-400 text-[32px]">
          dns
        </span>
      </div>
    );
  }
  if (text.includes("cyber") || text.includes("security")) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <span className="material-symbols-outlined text-emerald-400 text-[32px]">
          shield
        </span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <span className="material-symbols-outlined text-indigo-300 text-[32px]">
        code_blocks
      </span>
    </div>
  );
}

interface RecommendedCourse extends Course {
  recommendationScore?: number;
  reason?: string;
  targetRole?: string;
  primarySkill?: string;
}

interface SkillGapItem {
  skill: string;
  status: "Missing" | "In Progress" | "Proficient";
  level: string;
  relevantCourses: Array<{
    id: number;
    title: string;
    platform: string;
    cost: string;
    rating: number;
    duration: string;
    url: string;
  }>;
}

interface LearningPathStage {
  stageNumber: number;
  name: string;
  title: string;
  duration: string;
  description: string;
  skills: string[];
  courseIds: number[];
  practicalProjects: string[];
  courses?: Course[];
  isCompleted?: boolean;
}

interface LearningPath {
  id: string;
  title: string;
  role: string;
  overview: string;
  careerObjective: string;
  requiredSkills: string[];
  skillsSummary: string;
  icon: string;
  color: string;
  bgLight: string;
  estimatedDuration: string;
  totalCoursesCount: number;
  stages: LearningPathStage[];
  practicalProjects?: Array<{
    title: string;
    difficulty: string;
    description: string;
    techStack: string[];
  }>;
  isEnrolled?: boolean;
  status?: string;
  progressPercent?: number;
  completedStages?: string[];
}

interface EnrolledCourseProgress {
  _id: string;
  courseId: number;
  title: string;
  platform: string;
  url: string;
  image?: string;
  progressPercent: number;
  status: string;
  skillsCovered: string[];
  lastUpdated: string;
  duration?: string;
  rating?: number;
}

interface HubData {
  targetRole: string;
  overviewMetrics: {
    activeLearningPaths: number;
    completedLearningPaths: number;
    savedCourses: number;
    skillsToDevelop: number;
    learningProgress: number;
  };
  learningProgressStats: {
    totalEnrolled: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    percent: number;
  };
  recommendedForYou: RecommendedCourse[];
  skillGaps: SkillGapItem[];
  learningPaths: LearningPath[];
  continueLearning: EnrolledCourseProgress[];
  savedCourseIds: number[];
}

const DEPARTMENTS = [
  "All Departments",
  "Computer Science & IT",
  "Electronics & Communication",
  "Electrical & Power",
  "Mechanical & Manufacturing",
  "Civil & Infrastructure",
];

export function Courses() {
  const { user } = useAuth();

  // Navigation tab: 'recommended' | 'paths' | 'continue' | 'explore'
  const [activeTab, setActiveTab] = useState<"recommended" | "paths" | "continue" | "explore">("recommended");

  // Hub data state
  const [hubData, setHubData] = useState<HubData | null>(null);
  const [hubLoading, setHubLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>("Data Engineer");

  // Explore Tab State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("All Departments");
  const [costFilter, setCostFilter] = useState<"All" | "Free" | "Paid">("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [selectedSkillFilter, setSelectedSkillFilter] = useState("");
  const [exploreCourses, setExploreCourses] = useState<Course[]>(COURSES);
  const [exploreLoading, setExploreLoading] = useState(false);
  const [totalExploreCount, setTotalExploreCount] = useState(COURSES.length);
  const [page, setPage] = useState(1);

  // Modals & Drawers
  const [activeCourseDetails, setActiveCourseDetails] = useState<Course | null>(null);
  const [activePathDetails, setActivePathDetails] = useState<LearningPath | null>(null);
  const [activeSkillModal, setActiveSkillModal] = useState<SkillGapItem | null>(null);

  // Saved course IDs set for instant UI updates
  const [savedIds, setSavedIds] = useState<number[]>([]);

  // Fetch Hub Data
  const fetchHubData = async (roleOverride?: string) => {
    try {
      setHubLoading(true);
      const url = roleOverride 
        ? `http://localhost:5000/api/courses/hub?role=${encodeURIComponent(roleOverride)}`
        : `http://localhost:5000/api/courses/hub`;
      
      const res = await axios.get(url);
      setHubData(res.data);
      if (res.data.targetRole) {
        setSelectedRole(res.data.targetRole);
      }
      if (res.data.savedCourseIds) {
        setSavedIds(res.data.savedCourseIds);
      }
    } catch (err) {
      console.error("Error loading learning hub data:", err);
    } finally {
      setHubLoading(false);
    }
  };

  useEffect(() => {
    fetchHubData();
  }, []);

  // Fetch Explore Courses
  const fetchExploreCourses = async () => {
    try {
      setExploreLoading(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      if (selectedBranch !== "All Departments") params.append("branch", selectedBranch);
      if (costFilter !== "All") params.append("cost", costFilter);
      if (selectedDifficulty !== "All") params.append("difficulty", selectedDifficulty);
      if (selectedPlatform !== "All") params.append("platform", selectedPlatform);
      if (selectedSkillFilter.trim()) params.append("skill", selectedSkillFilter.trim());
      params.append("page", page.toString());
      params.append("limit", "16");

      const res = await axios.get(`http://localhost:5000/api/courses?${params.toString()}`);
      if (res.data && res.data.courses) {
        setExploreCourses(res.data.courses);
        setTotalExploreCount(res.data.totalCount || res.data.courses.length);
      }
    } catch (err) {
      console.error("Error fetching explore catalog:", err);
      // Fallback to local filter
      let filtered = COURSES.filter((course) => {
        const matchesBranch = selectedBranch === "All Departments" || course.branch === selectedBranch;
        const matchesCost = costFilter === "All" || course.cost === costFilter;
        const matchesSearch =
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.platform.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesBranch && matchesCost && matchesSearch;
      });
      setExploreCourses(filtered);
      setTotalExploreCount(filtered.length);
    } finally {
      setExploreLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "explore") {
      fetchExploreCourses();
    }
  }, [activeTab, searchQuery, selectedBranch, costFilter, selectedDifficulty, selectedPlatform, selectedSkillFilter, page]);

  // Toggle Save Course
  const handleToggleSave = async (courseId: number) => {
    try {
      const res = await axios.put("http://localhost:5000/api/courses/save", { courseId });
      if (res.data?.savedCourses) {
        setSavedIds(res.data.savedCourses);
      } else {
        setSavedIds((prev) =>
          prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
        );
      }
      // Sync hub overview count
      if (hubData) {
        setHubData({
          ...hubData,
          overviewMetrics: {
            ...hubData.overviewMetrics,
            savedCourses: res.data?.savedCoursesCount ?? (savedIds.includes(courseId) ? savedIds.length - 1 : savedIds.length + 1)
          }
        });
      }
    } catch (err) {
      console.error("Error toggling save course:", err);
    }
  };

  // Start Learning a course
  const handleStartLearning = async (course: Course) => {
    try {
      await axios.put("http://localhost:5000/api/courses/progress", {
        courseId: course.id,
        status: "Currently Learning",
        progressPercent: 15
      });
      // Open official course link in new tab
      window.open(course.url, "_blank", "noopener,noreferrer");
      // Refresh hub data
      fetchHubData(selectedRole);
    } catch (err) {
      console.error("Error starting course:", err);
      window.open(course.url, "_blank", "noopener,noreferrer");
    }
  };

  // Update Manual Progress on a Course
  const handleUpdateCourseProgress = async (courseId: number, progressPercent: number, status: string) => {
    try {
      await axios.put("http://localhost:5000/api/courses/progress", {
        courseId,
        progressPercent,
        status
      });
      fetchHubData(selectedRole);
    } catch (err) {
      console.error("Error updating course progress:", err);
    }
  };

  // Enroll in Learning Path
  const handleEnrollPath = async (pathId: string) => {
    try {
      await axios.post("http://localhost:5000/api/courses/learning-paths/enroll", { pathId });
      fetchHubData(selectedRole);
      if (activePathDetails && activePathDetails.id === pathId) {
        setActivePathDetails({ ...activePathDetails, isEnrolled: true, status: "Active" });
      }
    } catch (err) {
      console.error("Error enrolling in path:", err);
    }
  };

  // Toggle stage completion in Learning Path
  const handleToggleStageProgress = async (pathId: string, stageName: string, currentlyCompleted: boolean) => {
    try {
      await axios.put("http://localhost:5000/api/courses/learning-paths/progress", {
        pathId,
        stageName,
        isCompleted: !currentlyCompleted
      });
      fetchHubData(selectedRole);
      if (activePathDetails && activePathDetails.id === pathId) {
        const updatedStages = (activePathDetails.completedStages || []).includes(stageName)
          ? activePathDetails.completedStages.filter((s) => s !== stageName)
          : [...(activePathDetails.completedStages || []), stageName];
        setActivePathDetails({
          ...activePathDetails,
          completedStages: updatedStages,
          progressPercent: Math.round((updatedStages.length / 3) * 100)
        });
      }
    } catch (err) {
      console.error("Error updating stage progress:", err);
    }
  };

  // Mark skill as learning in profile
  const handleMarkSkillLearning = async (skill: string) => {
    try {
      await axios.post("http://localhost:5000/api/courses/skills/learning", { skill });
      fetchHubData(selectedRole);
      setActiveSkillModal(null);
    } catch (err) {
      console.error("Error marking skill as learning:", err);
    }
  };

  const metrics = hubData?.overviewMetrics || {
    activeLearningPaths: 2,
    completedLearningPaths: 1,
    savedCourses: savedIds.length || 8,
    skillsToDevelop: 6,
    learningProgress: 45
  };

  const stats = hubData?.learningProgressStats || {
    totalEnrolled: 9,
    completed: 4,
    inProgress: 2,
    notStarted: 3,
    percent: 45
  };

  const targetRole = hubData?.targetRole || selectedRole;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        
        {/* ======================================================== */}
        {/* 1. HERO BANNER                                           */}
        {/* ======================================================== */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white via-indigo-50/40 to-blue-50/50 border border-slate-200/80 shadow-xs p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl space-y-2.5 z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100/80 text-indigo-700 text-[10.5px] font-extrabold uppercase tracking-widest">
              <span className="material-symbols-outlined text-[15px]">school</span>
              LEARNING HUB
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Your Personalized Learning Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Build in-demand skills, follow structured learning paths, and get course recommendations based on your career goals and job market trends.
            </p>
          </div>

          {/* Right Vector Illustration */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="w-48 sm:w-56 h-36 relative flex items-center justify-center">
              {/* Illustration Art */}
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 to-blue-500 shadow-xl flex items-center justify-center text-white relative">
                <span className="material-symbols-outlined text-[44px]">laptop_mac</span>
                {/* Float tag </> */}
                <div className="absolute -top-3 -left-3 bg-white px-2.5 py-1 rounded-xl shadow-md border border-slate-100 flex items-center gap-1 text-[11px] font-black text-indigo-600">
                  <span className="material-symbols-outlined text-[15px]">code</span>
                  <span>&lt;/&gt;</span>
                </div>
                {/* Float certificate badge */}
                <div className="absolute -bottom-2 -right-3 bg-white px-2.5 py-1 rounded-xl shadow-md border border-slate-100 flex items-center gap-1 text-[11px] font-bold text-amber-600">
                  <span className="material-symbols-outlined text-amber-500 text-[15px]">verified</span>
                  <span>Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. OVERVIEW METRIC STAT CARDS (Grid of 4)                */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Learning Paths */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4 hover:border-indigo-200 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">menu_book</span>
            </div>
            <div>
              <div className="text-[11.5px] font-semibold text-slate-500">Learning Paths</div>
              <div className="text-xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">
                {metrics.activeLearningPaths} Active
              </div>
              <div className="text-[11px] font-bold text-emerald-600">
                +{metrics.completedLearningPaths} Completed
              </div>
            </div>
          </div>

          {/* Card 2: Courses Saved */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4 hover:border-amber-200 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">bookmark</span>
            </div>
            <div>
              <div className="text-[11.5px] font-semibold text-slate-500">Courses Saved</div>
              <div className="text-xl font-black text-slate-900 tracking-tight">
                {savedIds.length || metrics.savedCourses}
              </div>
              <div className="text-[11px] font-medium text-slate-400">
                In your library
              </div>
            </div>
          </div>

          {/* Card 3: Skills to Develop */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4 hover:border-rose-200 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">target</span>
            </div>
            <div>
              <div className="text-[11.5px] font-semibold text-slate-500">Skills to Develop</div>
              <div className="text-xl font-black text-slate-900 tracking-tight">
                {metrics.skillsToDevelop}
              </div>
              <div className="text-[11px] font-medium text-slate-400">
                Based on your job goals
              </div>
            </div>
          </div>

          {/* Card 4: Learning Progress */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-blue-200 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">bar_chart</span>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-500">Learning Progress</div>
                <div className="text-lg font-black text-slate-900">{metrics.learningProgress}%</div>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-3">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.learningProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. TAB NAVIGATION BAR                                    */}
        {/* ======================================================== */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/70 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("recommended")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "recommended"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200/70"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <span className="material-symbols-outlined text-[17px] text-amber-500">star</span>
            <span>Recommended For You</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("paths")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "paths"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200/70"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <span className="material-symbols-outlined text-[17px] text-indigo-600">layers</span>
            <span>My Learning Paths</span>
            <span className="px-1.5 py-0.2 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-black">
              10
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("continue")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "continue"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200/70"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <span className="material-symbols-outlined text-[17px] text-emerald-600">play_circle</span>
            <span>Continue Learning</span>
            {(hubData?.continueLearning?.length ?? 0) > 0 && (
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black">
                {hubData?.continueLearning?.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("explore")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "explore"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200/70"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <span className="material-symbols-outlined text-[17px] text-blue-600">grid_view</span>
            <span>Explore All Courses</span>
            <span className="px-1.5 py-0.2 rounded-md bg-slate-200/70 text-slate-700 text-[10px] font-black">
              132
            </span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* 4. MAIN CONTENT AREA (Grid 12: col-8 / col-4)             */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Main Views (Col 8) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* VIEW A: RECOMMENDED FOR YOU (Matches Reference Image) */}
            {activeTab === "recommended" && (
              <div className="space-y-8">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Recommended For You</h2>
                    <p className="text-xs text-slate-500 font-normal">
                      Personalized course recommendations based on your skills, career interests ({targetRole}), and job requirements.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("explore")}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>View All</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>

                {/* 4 Course Cards Grid (2x2) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {(hubData?.recommendedForYou || []).slice(0, 4).map((course) => {
                    const isSaved = savedIds.includes(course.id);
                    return (
                      <div
                        key={course.id}
                        className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all duration-200 group"
                      >
                        <div>
                          {/* Course Card Top Header Visual */}
                          <div className="h-32 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] p-3.5 flex flex-col justify-between relative overflow-hidden">
                            {/* Ambient circle glow */}
                            <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-indigo-500/20 blur-xl pointer-events-none" />
                            
                            <div className="flex items-center justify-between z-10">
                              <PlatformBadge platform={course.platform} />
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/10 text-white backdrop-blur-md border border-white/10">
                                {course.difficulty || "Intermediate"}
                              </span>
                            </div>

                            {/* Center Logo/Icon */}
                            <div className="z-10 py-1">
                              <TechBrandIcon title={course.title} skill={course.skills?.[0]} />
                            </div>

                            <div className="flex items-center justify-between text-white/70 text-[10.5px] z-10">
                              <span className="font-semibold text-white/90">{course.cost}</span>
                              <span>{course.duration || "20 hours"}</span>
                            </div>
                          </div>

                          {/* Card Content */}
                          <div className="p-4 sm:p-5 space-y-3">
                            <h3 
                              onClick={() => setActiveCourseDetails(course)}
                              className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 cursor-pointer leading-snug"
                              title={course.title}
                            >
                              {course.title}
                            </h3>

                            {/* Rating & Duration Meta */}
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <div className="flex items-center gap-1 font-bold text-slate-800">
                                <span className="material-symbols-outlined text-amber-500 text-[15px] fill-current">star</span>
                                <span>{course.rating || 4.8}</span>
                                <span className="text-slate-400 font-normal">({course.ratingCount || "32K"})</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-slate-400 text-[15px]">schedule</span>
                                <span>{course.duration || "20 hours"}</span>
                              </div>
                            </div>

                            {/* Skills Covered Pills */}
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {(course.skills || []).slice(0, 3).map((s) => (
                                <span
                                  key={s}
                                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10.5px] font-semibold"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>

                            {/* Recommendation Reason Box (Light Blue) */}
                            <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-100 text-[11px] text-blue-900 flex items-start gap-2 leading-relaxed">
                              <span className="material-symbols-outlined text-blue-600 text-[16px] shrink-0 mt-0.5">
                                target
                              </span>
                              <span className="font-medium">
                                {course.reason || `Recommended because it strengthens your skills for ${targetRole} roles.`}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Action Footer */}
                        <div className="p-4 sm:p-5 pt-0 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartLearning(course)}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>Start Learning</span>
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleSave(course.id)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                              isSaved
                                ? "bg-amber-50 border-amber-300 text-amber-600"
                                : "bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                            }`}
                            title={isSaved ? "Remove from bookmarks" : "Save course"}
                          >
                            <span
                              className="material-symbols-outlined text-[18px]"
                              style={{ fontVariationSettings: isSaved ? "'FILL' 1" : undefined }}
                            >
                              bookmark
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Popular Learning Paths Section */}
                <div className="space-y-4 pt-4 border-t border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-black text-slate-900 tracking-tight">Popular Learning Paths</h2>
                      <p className="text-xs text-slate-500 font-normal">
                        Structured, step-by-step learning paths to build job-ready skills for top career roles.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("paths")}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>View All Paths</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>

                  {/* 4 Featured Paths Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(hubData?.learningPaths || []).slice(0, 4).map((path) => (
                      <div
                        key={path.id}
                        onClick={() => setActivePathDetails(path)}
                        className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                              <span className="material-symbols-outlined text-[20px]">{path.icon || "layers"}</span>
                            </div>
                            {path.isEnrolled && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                                {path.status || "Active"}
                              </span>
                            )}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                              {path.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                              {path.skillsSummary}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10.5px] text-slate-400 font-semibold pt-3 border-t border-slate-100 mt-3">
                          <span>{path.totalCoursesCount} Courses • {path.estimatedDuration}</span>
                          <span className="material-symbols-outlined text-[16px] text-indigo-500 group-hover:translate-x-1 transition-transform">
                            arrow_forward
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW B: MY LEARNING PATHS (All 10 Standardized Paths) */}
            {activeTab === "paths" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Structured Learning Paths</h2>
                  <p className="text-xs text-slate-500 font-normal">
                    Industry curricula designed by engineering leads to take you from foundational syntax to cloud production readiness.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {(hubData?.learningPaths || []).map((path) => (
                    <div
                      key={path.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-[22px]">{path.icon}</span>
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-900">{path.title}</h3>
                              <span className="text-[11px] text-indigo-600 font-semibold">{path.role}</span>
                            </div>
                          </div>
                          {path.isEnrolled && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
                              {path.progressPercent}% Complete
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {path.overview}
                        </p>

                        {/* Stages Preview */}
                        <div className="space-y-1.5">
                          <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                            3 Milestone Stages
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center text-[10.5px]">
                            <div className="p-1.5 rounded-lg bg-slate-50 text-slate-700 font-bold border border-slate-100">
                              1. Beginner
                            </div>
                            <div className="p-1.5 rounded-lg bg-slate-50 text-slate-700 font-bold border border-slate-100">
                              2. Intermediate
                            </div>
                            <div className="p-1.5 rounded-lg bg-slate-50 text-slate-700 font-bold border border-slate-100">
                              3. Advanced
                            </div>
                          </div>
                        </div>

                        {/* Required Skills */}
                        <div className="flex flex-wrap gap-1">
                          {path.requiredSkills.slice(0, 5).map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
                              {s}
                            </span>
                          ))}
                          {path.requiredSkills.length > 5 && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px] font-medium">
                              +{path.requiredSkills.length - 5}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">
                          {path.totalCoursesCount} Courses • {path.estimatedDuration}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActivePathDetails(path)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            Curriculum
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEnrollPath(path.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              path.isEnrolled
                                ? "bg-emerald-600 text-white"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                            }`}
                          >
                            {path.isEnrolled ? "Enrolled" : "Start Path"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW C: CONTINUE LEARNING (Student's Started Courses & Manual Tracker) */}
            {activeTab === "continue" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Continue Learning</h2>
                  <p className="text-xs text-slate-500 font-normal">
                    Track your current courses on external providers. Update your progress manually as you complete modules.
                  </p>
                </div>

                {(hubData?.continueLearning || []).length > 0 ? (
                  <div className="space-y-4">
                    {hubData?.continueLearning.map((item) => (
                      <div
                        key={item._id}
                        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 overflow-hidden">
                            <TechBrandIcon title={item.title} skill={item.skillsCovered?.[0]} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <PlatformBadge platform={item.platform} />
                              <span className="text-[10.5px] font-bold text-slate-400">
                                Last updated: {new Date(item.lastUpdated).toLocaleDateString()}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {(item.skillsCovered || []).slice(0, 3).map((s) => (
                                <span key={s} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Interactive Manual Progress Controls */}
                        <div className="w-full sm:w-64 space-y-2 shrink-0">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700">Progress</span>
                            <span className="font-black text-indigo-600">{item.progressPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                              style={{ width: `${item.progressPercent}%` }}
                            />
                          </div>

                          {/* Quick Progress Buttons & Link */}
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateCourseProgress(item.courseId, Math.max(0, item.progressPercent - 20), "Currently Learning")}
                                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                                title="Decrease 20%"
                              >
                                -20%
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateCourseProgress(item.courseId, Math.min(100, item.progressPercent + 20), item.progressPercent + 20 >= 100 ? "Completed" : "Currently Learning")}
                                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                                title="Increase 20%"
                              >
                                +20%
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateCourseProgress(item.courseId, 100, "Completed")}
                                className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-black cursor-pointer"
                                title="Mark Completed"
                              >
                                Done ✓
                              </button>
                            </div>

                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                            >
                              <span>Continue</span>
                              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 space-y-3">
                    <span className="material-symbols-outlined text-slate-400 text-[48px]">school</span>
                    <h3 className="text-base font-bold text-slate-800">No active courses yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Start any recommended or catalog course by clicking &quot;Start Learning&quot; to track your progress here.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("recommended")}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Browse Recommendations
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* VIEW D: EXPLORE ALL COURSES (Full Catalog & Filters) */}
            {activeTab === "explore" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Explore Course Catalog</h2>
                  <p className="text-xs text-slate-500 font-normal">
                    Browse all 132 verified technical courses across global learning platforms.
                  </p>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                  {/* Top Search Input */}
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Search courses by title, skill (Python, React, Spark...), or platform..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                    />
                  </div>

                  {/* Dropdown Filters Row */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Branch */}
                    <select
                      value={selectedBranch}
                      onChange={(e) => { setSelectedBranch(e.target.value); setPage(1); }}
                      className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>

                    {/* Cost Filter */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      {(["All", "Free", "Paid"] as const).map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => { setCostFilter(filter); setPage(1); }}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            costFilter === filter
                              ? "bg-white text-indigo-700 shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {filter === "All" ? "All Costs" : filter}
                        </button>
                      ))}
                    </div>

                    {/* Difficulty Filter */}
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => { setSelectedDifficulty(e.target.value); setPage(1); }}
                      className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="All">All Difficulties</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>

                    {/* Platform Filter */}
                    <select
                      value={selectedPlatform}
                      onChange={(e) => { setSelectedPlatform(e.target.value); setPage(1); }}
                      className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="All">All Platforms</option>
                      <option value="Coursera">Coursera</option>
                      <option value="Udemy">Udemy</option>
                      <option value="edX">edX</option>
                      <option value="Udacity">Udacity</option>
                      <option value="YouTube">YouTube</option>
                    </select>
                  </div>
                </div>

                {/* Courses Grid */}
                {exploreCourses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {exploreCourses.map((course) => {
                      const isSaved = savedIds.includes(course.id);
                      return (
                        <div
                          key={course.id}
                          className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all group"
                        >
                          <div>
                            {/* Card Visual Header */}
                            <div className="h-28 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-3.5 flex flex-col justify-between relative overflow-hidden">
                              <div className="flex items-center justify-between z-10">
                                <PlatformBadge platform={course.platform} />
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  course.cost === "Free"
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                }`}>
                                  {course.cost}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-white/70 text-[10.5px] z-10">
                                <span className="font-semibold text-white/90">{course.branch}</span>
                                <span>★ {course.rating}</span>
                              </div>
                            </div>

                            <div className="p-4 space-y-2">
                              <h4
                                onClick={() => setActiveCourseDetails(course)}
                                className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 cursor-pointer leading-snug"
                              >
                                {course.title}
                              </h4>

                              <div className="flex flex-wrap gap-1">
                                {(course.skills || []).slice(0, 3).map((s) => (
                                  <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="p-4 pt-0 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleStartLearning(course)}
                              className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>Start Learning</span>
                              <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleSave(course.id)}
                              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                                isSaved
                                  ? "bg-amber-50 border-amber-300 text-amber-600"
                                  : "bg-white border-slate-200 text-slate-400 hover:text-slate-700"
                              }`}
                              title={isSaved ? "Saved" : "Save course"}
                            >
                              <span
                                className="material-symbols-outlined text-[16px]"
                                style={{ fontVariationSettings: isSaved ? "'FILL' 1" : undefined }}
                              >
                                bookmark
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
                    No courses match your filter criteria.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sidebar (Col 4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* CARD 1: YOUR SKILL GAP (Matches Reference Image) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">target</span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">Your Skill Gap</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Skills to learn for your target role:
                  </p>
                </div>
              </div>

              {/* Target Role Selector Tag */}
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
                <span>{targetRole}</span>
                <span className="material-symbols-outlined text-[16px] text-indigo-600">verified</span>
              </div>

              {/* Skills List with Status Pills */}
              <div className="space-y-2">
                {(hubData?.skillGaps || [
                  { skill: "Apache Spark", status: "Missing" },
                  { skill: "AWS", status: "Missing" },
                  { skill: "Data Warehousing", status: "Missing" },
                  { skill: "SQL", status: "In Progress" },
                  { skill: "Python", status: "Proficient" }
                ]).map((item) => {
                  const isMissing = item.status === "Missing";
                  const isInProgress = item.status === "In Progress";
                  const isProficient = item.status === "Proficient";

                  return (
                    <div
                      key={item.skill}
                      onClick={() => setActiveSkillModal(item as SkillGapItem)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-indigo-600 text-[18px] transition-colors">
                          database
                        </span>
                        <span className="text-xs font-semibold text-slate-800">
                          {item.skill}
                        </span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                          isMissing
                            ? "bg-rose-50 text-rose-600 border border-rose-200"
                            : isInProgress
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-emerald-100/80 text-emerald-800 border border-emerald-300"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Action Button: Get a Learning Plan */}
              <button
                type="button"
                onClick={() => setActiveTab("paths")}
                className="w-full py-2.5 px-4 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>Get a Learning Plan</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>

            {/* CARD 2: MY LEARNING PROGRESS (Circular Donut Chart) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">My Learning Progress</h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {stats.completed} of {stats.totalEnrolled} courses completed
                </p>
              </div>

              {/* Donut Chart Visualization */}
              <div className="flex items-center justify-center py-2">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    {/* Background Circle */}
                    <path
                      className="text-slate-100"
                      strokeWidth="3.8"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Active Progress Circle */}
                    <path
                      className="text-blue-600 transition-all duration-1000"
                      strokeDasharray={`${stats.percent}, 100`}
                      strokeWidth="3.8"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-slate-900">{stats.percent}%</span>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2 pt-1 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-slate-700">Completed</span>
                  </div>
                  <span className="font-black text-slate-900">{stats.completed}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span className="font-semibold text-slate-700">In Progress</span>
                  </div>
                  <span className="font-black text-slate-900">{stats.inProgress}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="font-semibold text-slate-700">Not Started</span>
                  </div>
                  <span className="font-black text-slate-900">{stats.notStarted}</span>
                </div>
              </div>
            </div>

            {/* Quick Switch Career Goal Widget */}
            <div className="bg-gradient-to-br from-indigo-50/60 to-purple-50/40 rounded-2xl p-4 border border-indigo-100 space-y-2.5">
              <div className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
                Explore Alternative Career Track
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Switching tracks recalculates your skill gaps and course recommendations instantly.
              </p>
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  fetchHubData(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl bg-white border border-indigo-200 text-xs font-bold text-indigo-950 focus:outline-none cursor-pointer"
              >
                <option value="Data Engineer">Data Engineer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="AI/ML Engineer">AI/ML Engineer</option>
                <option value="Cybersecurity Engineer">Cybersecurity Engineer</option>
                <option value="Cloud Engineer">Cloud Engineer</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
              </select>
            </div>

          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. COURSE DETAIL MODAL / DRAWER                          */}
      {/* ======================================================== */}
      {activeCourseDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="fixed inset-0"
            onClick={() => setActiveCourseDetails(null)}
          />
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <PlatformBadge platform={activeCourseDetails.platform} />
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10.5px] font-bold">
                    {activeCourseDetails.difficulty || "Intermediate"}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10.5px] font-bold">
                    {activeCourseDetails.cost}
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900 leading-snug">
                  {activeCourseDetails.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveCourseDetails(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {activeCourseDetails.description || "Comprehensive technical course designed to build job-ready proficiency through hands-on practice, labs, and expert instruction."}
            </p>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span className="text-[10.5px] font-bold text-slate-400 block uppercase">Rating</span>
                <span className="font-extrabold text-slate-800">★ {activeCourseDetails.rating}</span>
              </div>
              <div>
                <span className="text-[10.5px] font-bold text-slate-400 block uppercase">Duration</span>
                <span className="font-extrabold text-slate-800">{activeCourseDetails.duration || "20 hours"}</span>
              </div>
              <div>
                <span className="text-[10.5px] font-bold text-slate-400 block uppercase">Certificate</span>
                <span className="font-extrabold text-slate-800">{activeCourseDetails.certificate ? "Available" : "No certificate"}</span>
              </div>
              <div>
                <span className="text-[10.5px] font-bold text-slate-400 block uppercase">Language</span>
                <span className="font-extrabold text-slate-800">{activeCourseDetails.language || "English"}</span>
              </div>
            </div>

            {/* Learning Outcomes */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">What You Will Learn</h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {(activeCourseDetails.learningOutcomes || [
                  "Build practical fluency with core syntax and software architecture",
                  "Solve real-world engineering problems using verified industry patterns",
                  "Prepare for high-level technical interviews and coding rounds"
                ]).map((outcome, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[16px] shrink-0 mt-0.5">check_circle</span>
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Course Syllabus */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Curriculum & Syllabus</h4>
              <div className="space-y-1.5">
                {(activeCourseDetails.syllabus || [
                  "Module 1: Foundations, Tooling & Setup",
                  "Module 2: Core Concepts, Syntax & Architecture",
                  "Module 3: Practical Implementation & Project Building",
                  "Module 4: Advanced Best Practices & Optimization"
                ]).map((mod, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-800 flex items-center justify-between">
                    <span>{mod}</span>
                    <span className="material-symbols-outlined text-slate-400 text-[16px]">menu_book</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleToggleSave(activeCourseDetails.id)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[17px]">
                  {savedIds.includes(activeCourseDetails.id) ? "bookmark_added" : "bookmark"}
                </span>
                <span>{savedIds.includes(activeCourseDetails.id) ? "Saved in Library" : "Save Course"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleStartLearning(activeCourseDetails);
                  setActiveCourseDetails(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Start Learning on Official Provider</span>
                <span className="material-symbols-outlined text-[15px]">open_in_new</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. LEARNING PATH DETAIL MODAL                            */}
      {/* ======================================================== */}
      {activePathDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="fixed inset-0"
            onClick={() => setActivePathDetails(null)}
          />
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto z-10 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">{activePathDetails.icon}</span>
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">{activePathDetails.title}</h2>
                  <span className="text-xs text-indigo-600 font-bold">{activePathDetails.role} • {activePathDetails.estimatedDuration}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePathDetails(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {activePathDetails.overview}
            </p>

            {/* Stages Breakdown */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 tracking-tight">Structured Learning Stages</h3>
              
              <div className="space-y-3">
                {(activePathDetails.stages || []).map((stage) => {
                  const isCompleted = (activePathDetails.completedStages || []).includes(stage.name);

                  return (
                    <div
                      key={stage.stageNumber}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCompleted
                          ? "bg-emerald-50/50 border-emerald-200"
                          : "bg-slate-50/70 border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-white text-slate-800 text-[10px] font-black border border-slate-200">
                              Stage {stage.stageNumber}: {stage.name}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400">
                              {stage.duration}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 mt-1">{stage.title}</h4>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{stage.description}</p>
                        </div>

                        {activePathDetails.isEnrolled && (
                          <button
                            type="button"
                            onClick={() => handleToggleStageProgress(activePathDetails.id, stage.name, isCompleted)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isCompleted
                                ? "bg-emerald-600 text-white"
                                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {isCompleted ? "Completed ✓" : "Mark Complete"}
                          </button>
                        )}
                      </div>

                      {/* Practical Projects in stage */}
                      {stage.practicalProjects && stage.practicalProjects.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200/50 text-[11px]">
                          <span className="font-bold text-slate-700">Practical Projects: </span>
                          <span className="text-slate-600">{stage.practicalProjects.join(" • ")}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {activePathDetails.totalCoursesCount} Recommended Courses in this path
              </span>
              <button
                type="button"
                onClick={() => {
                  handleEnrollPath(activePathDetails.id);
                  setActivePathDetails(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {activePathDetails.isEnrolled ? "Continue Learning Path" : "Enroll in this Learning Path"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. SKILL GAP TO COURSE MODAL                             */}
      {/* ======================================================== */}
      {activeSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="fixed inset-0"
            onClick={() => setActiveSkillModal(null)}
          />
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden z-10 p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">target</span>
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{activeSkillModal.skill}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeSkillModal.status === "Missing"
                      ? "bg-rose-50 text-rose-700"
                      : "bg-emerald-50 text-emerald-700"
                  }`}>
                    Current Status: {activeSkillModal.status}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSkillModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Target role <strong className="text-slate-900">{targetRole}</strong> requires proficiency in {activeSkillModal.skill}. Below are verified courses to bridge this specific gap:
            </p>

            <div className="space-y-2.5">
              {(activeSkillModal.relevantCourses || []).map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{c.title}</h5>
                    <div className="text-[10.5px] text-slate-500 font-medium">
                      {c.platform} • {c.duration} • ★ {c.rating}
                    </div>
                  </div>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-[11px] font-bold shrink-0 hover:bg-indigo-700 transition-colors"
                  >
                    Enroll ↗
                  </a>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleMarkSkillLearning(activeSkillModal.skill)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                Mark as Currently Learning
              </button>
              <button
                type="button"
                onClick={() => setActiveSkillModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Courses;
