import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/auth-context";
import axios from "axios";
import { COURSES, Course } from "./coursesData";
import {
  Sparkles,
  Target,
  Compass,
  Briefcase,
  Bookmark,
  FileText,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ChevronRight,
  Award,
  TrendingUp,
  Bot,
  Video,
  Layers,
  BookOpen,
  Building2,
  MapPin,
  DollarSign,
  Zap,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Calendar,
  Check,
  GraduationCap,
} from "lucide-react";
import { CircularProgress } from "../components/ui/circular-progress";

interface ProfileData {
  user?: {
    name: string;
    email: string;
    role: string;
  };
  department?: string;
  skills?: string[];
  targetCareer?: string;
  savedCourses?: number[];
  recommendedCareers?: Array<{
    title: string;
    confidence: number;
    description?: string;
    domain?: string;
  }>;
  resumeData?: {
    atsScore?: number;
    shortlistChance?: number;
    keywordScore?: number;
    role?: string;
    strengths?: string[];
    improvements?: string[];
    analyzedAt?: string;
  };
}

interface RoadmapStage {
  id?: number;
  title: string;
  status: "Completed" | "In progress" | "Upcoming" | "Locked";
  skills?: Array<{ name: string; completed?: boolean }>;
  duration?: string;
  description?: string;
}

interface RoadmapData {
  department?: string;
  field?: string;
  percentComplete?: number;
  stagesComplete?: number;
  totalStages?: number;
  stages?: RoadmapStage[];
}

interface JobItem {
  _id: string;
  title: string;
  companyName: string;
  location?: string;
  type?: string;
  workMode?: string;
  experience?: string;
  salary?: string;
  skills?: string[];
  description?: string;
  matchScore?: number;
  postedTime?: string;
}

interface ApplicationItem {
  _id: string;
  job?: any;
  role?: string;
  status: "Applied" | "Reviewing" | "Shortlisted" | "Interview" | "Interviewing" | "Hired" | "Rejected";
  appliedAt: string;
  matchScore?: number;
}

interface StudentActivityItem {
  _id: string;
  action?: string;
  title?: string;
  category?: string;
  type?: string;
  details?: string;
  description?: string;
  createdAt?: string;
  timestamp?: string;
  link?: string;
}

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [myRoadmapsData, setMyRoadmapsData] = useState<any>(null);
  const [publicJobs, setPublicJobs] = useState<JobItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [activities, setActivities] = useState<StudentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Saved Jobs state from localStorage
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("student_saved_jobs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const courseContainerRef = useRef<HTMLDivElement>(null);

  // Fetch all live data on mount
  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      setLoading(true);
      const token = localStorage.getItem("token");

      try {
        // 1. Fetch Profile
        const profileRes = await axios.get("http://localhost:5000/api/profile/me");
        if (isMounted && profileRes.data) {
          setProfileData(profileRes.data);
        }
      } catch (err) {
        console.warn("Could not fetch student profile:", err);
      }

      try {
        // 2. Fetch Roadmap & Multi-Roadmaps Summary
        const [roadmapRes, myRoadmapsRes] = await Promise.allSettled([
          axios.get("http://localhost:5000/api/roadmap"),
          axios.get("http://localhost:5000/api/roadmap/my-roadmaps")
        ]);

        if (isMounted && roadmapRes.status === "fulfilled" && roadmapRes.value.data) {
          setRoadmapData(roadmapRes.value.data);
        }
        if (isMounted && myRoadmapsRes.status === "fulfilled" && myRoadmapsRes.value.data) {
          setMyRoadmapsData(myRoadmapsRes.value.data);
        }
      } catch (err) {
        console.warn("No active roadmap found:", err);
      }

      try {
        // 3. Fetch Public Jobs from Employer DB
        const jobsRes = await axios.get("http://localhost:5000/api/employer/public-jobs");
        if (isMounted && jobsRes.data?.jobs) {
          const mappedJobs: JobItem[] = jobsRes.data.jobs.map((j: any) => ({
            _id: j._id,
            title: j.title,
            companyName: j.companyName || "Technology Partner",
            location: j.location || "Remote / Hybrid",
            type: j.type || "Full Time",
            workMode: j.workMode || "Hybrid",
            experience: j.experience || "0-2 years",
            salary: j.salary || "Competitive",
            skills: Array.isArray(j.skills) && j.skills.length > 0 ? j.skills : ["React", "TypeScript", "Node.js"],
            description: j.description || "",
            matchScore: 92,
            postedTime: j.createdAt || new Date().toISOString(),
          }));
          setPublicJobs(mappedJobs);
        }
      } catch (err) {
        console.warn("Could not load employer jobs:", err);
      }

      if (token) {
        try {
          // 4. Fetch Student Applications
          const appRes = await axios.get("http://localhost:5000/api/employer/my-applications", {
            headers: { "x-auth-token": token },
          });
          if (isMounted && appRes.data?.applications) {
            setApplications(appRes.data.applications);
          }
        } catch (err) {
          console.warn("Could not load student applications:", err);
        }

        try {
          // 5. Fetch Student Activities
          const actRes = await axios.get("http://localhost:5000/api/profile/activities", {
            headers: { "x-auth-token": token },
          });
          if (isMounted && actRes.data?.activities) {
            setActivities(actRes.data.activities);
          }
        } catch (err) {
          console.warn("Could not load student activities:", err);
        }
      }

      if (isMounted) setLoading(false);
    }

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Dynamic Profile Completion Calculation
  const calculateProfileCompletion = () => {
    let score = 0;
    if (user?.name || profileData?.user?.name) score += 15;
    if (user?.email || profileData?.user?.email) score += 15;
    if (profileData?.department || roadmapData?.department) score += 15;
    if (profileData?.skills && profileData.skills.length > 0) score += 20;
    if (profileData?.recommendedCareers && profileData.recommendedCareers.length > 0) score += 20;
    if (profileData?.resumeData?.atsScore) score += 15;
    return Math.min(100, Math.max(20, score));
  };

  const profileCompletionPct = calculateProfileCompletion();

  // Metrics Data
  const targetCareer = profileData?.targetCareer || profileData?.recommendedCareers?.[0]?.title || null;
  const topMatch = profileData?.recommendedCareers?.[0] || null;
  const skillsCount = profileData?.skills?.length || 0;
  const atsScore = profileData?.resumeData?.atsScore ?? null;
  const resumeRole = profileData?.resumeData?.role ?? null;
  const resumeStrengths = profileData?.resumeData?.strengths || [];
  const resumeImprovements = profileData?.resumeData?.improvements || [];

  // Applications Breakdown
  const totalApplications = applications.length;
  const inReviewApplications = applications.filter(
    (a) => a.status === "Applied" || a.status === "Reviewing"
  ).length;
  const shortlistedApplications = applications.filter(
    (a) => a.status === "Shortlisted" || a.status === "Interview" || a.status === "Interviewing" || a.status === "Hired"
  ).length;

  // Saved Items Count
  const savedCoursesCount = profileData?.savedCourses?.length || 0;
  const savedJobsCount = savedJobIds.length;
  const totalSavedCount = savedJobsCount + savedCoursesCount;

  // Toggle Save Job Bookmark
  const handleToggleSaveJob = (jobId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = savedJobIds.includes(jobId)
      ? savedJobIds.filter((id) => id !== jobId)
      : [...savedJobIds, jobId];
    setSavedJobIds(updated);
    try {
      localStorage.setItem("student_saved_jobs", JSON.stringify(updated));
    } catch (err) {
      console.warn("Could not save to localStorage:", err);
    }
  };

  // Toggle Save Course
  const handleToggleSaveCourse = async (courseId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await axios.put("http://localhost:5000/api/profile/save-course", { courseId });
      if (res.data) {
        setProfileData(res.data);
      }
    } catch (err) {
      console.error("Error toggling course bookmark:", err);
    }
  };

  // Recommended Courses tailored to Branch
  const userBranch = profileData?.department || roadmapData?.department || "Computer Science & IT";
  const branchCourses = COURSES.filter((c) => c.branch === userBranch || c.branch === "Computer Science & IT");
  const displayCourses = branchCourses.length > 0 ? branchCourses.slice(0, 3) : COURSES.slice(0, 3);

  // Recommended Jobs filtered & sorted
  const displayJobs = publicJobs.slice(0, 3);

  // Roadmap Stage breakdown
  const currentStages = roadmapData?.stages || [];
  const activeStage =
    currentStages.find((s) => s.status === "In progress") ||
    (currentStages.length > 0 ? currentStages[0] : null);

  // Format Relative Time
  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return "Recently";
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / (1000 * 60));
      if (mins < 1) return "Just now";
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return "Recently";
    }
  };

  const scrollCourses = (direction: "left" | "right") => {
    if (courseContainerRef.current) {
      const scrollAmount = 320;
      courseContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background text-foreground pb-16">
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* 1. WELCOME HEADER & PROFILE COMPLETION BANNER */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-card p-6 sm:p-8 rounded-3xl border border-border/80 shadow-xs">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Welcome back, {user?.name || "Student"}! 👋
              </h1>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
              Track your career roadmap, real-time job applications, resume health, and AI recommendations.
            </p>
          </div>

          {/* Profile Completeness Pill Card */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-muted/40 p-4 rounded-2xl border border-border/60 self-start md:self-auto min-w-[260px]">
            <CircularProgress
              value={profileCompletionPct}
              size="sm"
              variant="primary"
            />

            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                Profile Status
                {profileCompletionPct === 100 && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                )}
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5">
                {profileCompletionPct === 100
                  ? "All systems fully optimized"
                  : `${100 - profileCompletionPct}% to complete profile`}
              </span>
              <Link
                to="/profile"
                className="text-[11px] font-semibold text-primary hover:underline mt-1 inline-flex items-center gap-0.5"
              >
                Complete Profile <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TOP 4 METRIC SUMMARY CARDS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Card 1: Target Career */}
          <div className="bg-white dark:bg-card p-5 rounded-2xl border border-border/80 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all">
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Target className="w-5 h-5" />
              </div>
              {targetCareer ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                  {topMatch?.confidence ? `${topMatch.confidence}% Fit` : "Goal Active"}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-200 dark:border-amber-800">
                  Pending
                </span>
              )}
            </div>

            <div className="mt-4">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Career Goal
              </span>
              <h3 className="text-base font-bold text-foreground truncate mt-0.5" title={targetCareer || "Set Your Career Goal"}>
                {targetCareer || "Set Your Career Goal"}
              </h3>
            </div>

            <div className="pt-3 mt-3 border-t border-border/50 flex items-center justify-between text-xs">
              <span className="text-muted-foreground text-[11px]">
                {topMatch ? "Identified via AI" : "Find ideal path"}
              </span>
              <Link
                to="/assessment"
                className="font-semibold text-primary hover:underline flex items-center gap-0.5"
              >
                {targetCareer ? "Change" : "Take Test"} <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Skills Mastered */}
          <div className="bg-white dark:bg-card p-5 rounded-2xl border border-border/80 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all">
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                <Award className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800">
                Verified
              </span>
            </div>

            <div className="mt-4">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Skills In Profile
              </span>
              <h3 className="text-xl font-bold text-foreground mt-0.5">
                {skillsCount} <span className="text-xs font-normal text-muted-foreground">Skills Added</span>
              </h3>
            </div>

            <div className="pt-3 mt-3 border-t border-border/50 flex items-center justify-between text-xs">
              <span className="text-muted-foreground text-[11px] truncate max-w-[120px]">
                {profileData?.skills?.[0] ? `e.g. ${profileData.skills[0]}` : "No skills added"}
              </span>
              <Link
                to="/profile"
                className="font-semibold text-primary hover:underline flex items-center gap-0.5"
              >
                +Add Skills <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: Application Tracker */}
          <div className="bg-white dark:bg-card p-5 rounded-2xl border border-border/80 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all">
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold border border-blue-200 dark:border-blue-800">
                {inReviewApplications} In Review
              </span>
            </div>

            <div className="mt-4">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Job Applications
              </span>
              <h3 className="text-xl font-bold text-foreground mt-0.5">
                {totalApplications} <span className="text-xs font-normal text-muted-foreground">Submitted</span>
              </h3>
            </div>

            <div className="pt-3 mt-3 border-t border-border/50 flex items-center justify-between text-xs">
              <span className="text-muted-foreground text-[11px]">
                {shortlistedApplications > 0 ? `${shortlistedApplications} Shortlisted` : "Track status"}
              </span>
              <Link
                to="/jobs?tab=applications"
                className="font-semibold text-primary hover:underline flex items-center gap-0.5"
              >
                View Tracker <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 4: Saved Opportunities */}
          <div className="bg-white dark:bg-card p-5 rounded-2xl border border-border/80 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all">
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                <Bookmark className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 text-[10px] font-bold border border-purple-200 dark:border-purple-800">
                Saved
              </span>
            </div>

            <div className="mt-4">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Saved Opportunities
              </span>
              <h3 className="text-xl font-bold text-foreground mt-0.5">
                {totalSavedCount} <span className="text-xs font-normal text-muted-foreground">Items</span>
              </h3>
            </div>

            <div className="pt-3 mt-3 border-t border-border/50 flex items-center justify-between text-xs">
              <span className="text-muted-foreground text-[11px]">
                {savedJobsCount} Jobs · {savedCoursesCount} Courses
              </span>
              <Link
                to="/jobs?tab=saved"
                className="font-semibold text-primary hover:underline flex items-center gap-0.5"
              >
                View Saved <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 3. MAIN DASHBOARD CONTENT (2 COLUMN GRID) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ======================================================================= */}
          {/* LEFT COLUMN (7 / 12) - PRIMARY MILESTONES & FEEDS */}
          {/* ======================================================================= */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* --------------------------------------------------------------------- */}
            {/* A. CAREER ROADMAP CARD */}
            {/* --------------------------------------------------------------------- */}
            <div className="bg-white dark:bg-card p-6 sm:p-7 rounded-3xl border border-border/80 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                      {roadmapData?.department || "Engineering Roadmap"}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      Step-by-step
                    </span>
                    {myRoadmapsData?.totalRoadmaps > 1 && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {myRoadmapsData.totalRoadmaps} Active Roadmaps
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-foreground">
                    Career Roadmap: {roadmapData?.field || targetCareer || "Personalized Engineering Path"}
                  </h2>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Link
                    to="/roadmap?tab=my-roadmaps"
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-muted transition-colors"
                  >
                    All Roadmaps
                  </Link>
                  <Link
                    to="/roadmap"
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    Open Workspace <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {roadmapData && roadmapData.stages && roadmapData.stages.length > 0 ? (
                <div className="space-y-6">
                  {/* Overall Progress Bar */}
                  <div className="bg-slate-50 dark:bg-muted/30 p-4 rounded-2xl border border-border/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">Overall Path Completion</span>
                      <span className="font-bold text-primary">{roadmapData.percentComplete || 0}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 dark:bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-1000"
                        style={{ width: `${roadmapData.percentComplete || 0}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                      <span>{roadmapData.stagesComplete || 0} of {roadmapData.totalStages || roadmapData.stages.length} Milestones Complete</span>
                      <span className="text-foreground font-medium">
                        {roadmapData.percentComplete === 100 ? "Ready for Placements! 🎉" : "In Active Progress"}
                      </span>
                    </div>
                  </div>

                  {/* Milestones Preview List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Milestone Stages
                    </h4>
                    <div className="space-y-2.5">
                      {roadmapData.stages.slice(0, 3).map((stage, idx) => {
                        const isCompleted = stage.status === "Completed";
                        const isInProgress = stage.status === "In progress" || stage.status === "In Progress";

                        return (
                          <div
                            key={idx}
                            onClick={() => navigate("/roadmap")}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                              isInProgress
                                ? "bg-primary/5 border-primary/30 shadow-xs"
                                : isCompleted
                                ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                                : "bg-white dark:bg-card border-border/70 hover:border-border"
                            }`}
                          >
                            <div
                              className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${
                                isCompleted
                                  ? "bg-emerald-500 text-white"
                                  : isInProgress
                                  ? "bg-primary text-white"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-sm font-bold text-foreground truncate">
                                  {stage.title}
                                </h4>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${
                                    isCompleted
                                      ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                                      : isInProgress
                                      ? "bg-primary/20 text-primary"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {stage.status}
                                </span>
                              </div>

                              {stage.skills && stage.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {stage.skills.slice(0, 4).map((sk, sIdx) => (
                                    <span
                                      key={sIdx}
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                                        sk.completed
                                          ? "bg-emerald-100/60 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                          : "bg-slate-100 dark:bg-muted text-muted-foreground"
                                      }`}
                                    >
                                      {sk.name} {sk.completed && "✓"}
                                    </span>
                                  ))}
                                  {stage.skills.length > 4 && (
                                    <span className="text-[10px] text-muted-foreground self-center">
                                      +{stage.skills.length - 4} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Multi-Roadmaps Quick Switcher Strip */}
                  {myRoadmapsData?.active && myRoadmapsData.active.length > 1 && (
                    <div className="pt-2 border-t border-border/60 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Your Other Active Roadmaps
                        </span>
                        <Link
                          to="/roadmap?tab=my-roadmaps"
                          className="text-[11px] font-bold text-primary hover:underline"
                        >
                          View All ({myRoadmapsData.totalRoadmaps}) →
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {myRoadmapsData.active
                          .filter((r: any) => r.careerTitle !== (roadmapData?.field || targetCareer))
                          .slice(0, 2)
                          .map((r: any, rIdx: number) => (
                            <div
                              key={rIdx}
                              onClick={() => navigate(`/roadmap?id=${r._id}`)}
                              className="p-3 rounded-2xl bg-slate-50 dark:bg-muted/40 border border-border/70 hover:border-primary/40 transition-all cursor-pointer flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-foreground truncate">{r.careerTitle}</h5>
                                <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground mt-0.5">
                                  <span>v{r.version || 1}</span>
                                  <span>•</span>
                                  <span className="text-primary font-semibold">{r.progress || 0}% Complete</span>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-50 dark:bg-muted/30 border border-dashed border-border text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-foreground">No Roadmap Generated Yet</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Generate your customized step-by-step engineering milestone roadmap aligned with industry hiring benchmarks.
                    </p>
                  </div>
                  <Link
                    to="/assessment"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-xs font-bold shadow-sm hover:bg-primary/90 transition-all mt-2"
                  >
                    Generate Roadmap in 60s <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* B. RECOMMENDED JOBS FOR YOU (LIVE EMPLOYER DB) */}
            {/* --------------------------------------------------------------------- */}
            <div className="bg-white dark:bg-card p-6 sm:p-7 rounded-3xl border border-border/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <h2 className="text-lg font-bold text-foreground">Recommended Jobs for You</h2>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Live positions curated for your skills and career direction.
                  </p>
                </div>

                <Link
                  to="/jobs"
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  View All ({publicJobs.length}) <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {displayJobs.length > 0 ? (
                <div className="space-y-3.5">
                  {displayJobs.map((job) => {
                    const isSaved = savedJobIds.includes(job._id);
                    return (
                      <div
                        key={job._id}
                        onClick={() => navigate(`/jobs?search=${encodeURIComponent(job.title)}`)}
                        className="p-5 rounded-2xl bg-slate-50/70 dark:bg-muted/20 border border-border/70 hover:border-primary/40 hover:bg-white dark:hover:bg-card transition-all cursor-pointer group space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                              {job.companyName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                {job.title}
                              </h4>
                              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                                <span>{job.companyName}</span>
                                <span>•</span>
                                <span className="flex items-center gap-0.5">
                                  <MapPin className="w-3 h-3" />
                                  {job.location}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleToggleSaveJob(job._id, e)}
                              className={`p-2 rounded-xl border transition-colors ${
                                isSaved
                                  ? "bg-primary/10 border-primary/30 text-primary"
                                  : "bg-white dark:bg-card border-border/60 text-muted-foreground hover:text-foreground"
                              }`}
                              title={isSaved ? "Remove from saved" : "Save job"}
                            >
                              <Bookmark className="w-4 h-4" style={{ fill: isSaved ? "currentColor" : "none" }} />
                            </button>
                          </div>
                        </div>

                        {/* Badges & Meta */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs">
                          <div className="flex flex-wrap gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-muted text-muted-foreground text-[10px] font-semibold">
                              {job.type}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-muted text-muted-foreground text-[10px] font-semibold">
                              {job.workMode}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                              {job.salary}
                            </span>
                          </div>

                          <span className="text-[11px] font-semibold text-primary group-hover:underline inline-flex items-center gap-1">
                            Apply Now <ArrowUpRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-50 dark:bg-muted/30 border border-dashed border-border text-center space-y-2">
                  <Briefcase className="w-8 h-8 text-muted-foreground mx-auto" />
                  <h4 className="text-sm font-bold text-foreground">No Live Job Openings Yet</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    When active positions become available, they will automatically appear here matched to your skill profile.
                  </p>
                </div>
              )}
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* C. RECOMMENDED UPSKILLING COURSES */}
            {/* --------------------------------------------------------------------- */}
            <div className="bg-white dark:bg-card p-6 sm:p-7 rounded-3xl border border-border/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    <h2 className="text-lg font-bold text-foreground">Curated Courses for {userBranch}</h2>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    High-impact certifications and tutorials to accelerate your technical skills.
                  </p>
                </div>

                <Link
                  to="/courses"
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  Explore All <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {displayCourses.map((course) => {
                  const isSaved = profileData?.savedCourses?.includes(course.id);
                  return (
                    <div
                      key={course.id}
                      onClick={() => window.open(course.url, "_blank", "noopener,noreferrer")}
                      className="rounded-2xl border border-border/70 overflow-hidden bg-white dark:bg-card flex flex-col justify-between hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer group"
                    >
                      <div>
                        <div
                          className="h-28 w-full bg-cover bg-center relative"
                          style={{ backgroundImage: `url('${course.image}')` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/90 dark:bg-card/90 text-foreground backdrop-blur-xs">
                            {course.platform}
                          </span>
                          <button
                            onClick={(e) => handleToggleSaveCourse(course.id, e)}
                            className="absolute bottom-2 right-2 p-1.5 rounded-full bg-white/90 dark:bg-card/90 text-foreground hover:text-primary transition-colors shadow-xs"
                            title={isSaved ? "Saved" : "Save Course"}
                          >
                            <Bookmark className="w-3.5 h-3.5" style={{ fill: isSaved ? "currentColor" : "none" }} />
                          </button>
                        </div>

                        <div className="p-3.5 space-y-1">
                          <h4 className="text-xs font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                            {course.title}
                          </h4>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <span className="text-amber-500 font-bold">★ {course.rating}</span>
                            <span>•</span>
                            <span>{course.cost}</span>
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 pt-0 border-t border-border/40 flex items-center justify-between text-[11px] mt-2">
                        <span className="text-muted-foreground truncate">{course.difficulty || "Beginner"}</span>
                        <span className="font-semibold text-primary group-hover:underline inline-flex items-center gap-0.5">
                          Start <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ======================================================================= */}
          {/* RIGHT COLUMN (5 / 12) - AI INSIGHTS & UTILITY SIDEBAR */}
          {/* ======================================================================= */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* --------------------------------------------------------------------- */}
            {/* D. AI CAREER INSIGHTS CARD */}
            {/* --------------------------------------------------------------------- */}
            <div className="bg-gradient-to-br from-primary/5 via-white to-purple-500/5 dark:from-primary/10 dark:via-card dark:to-purple-950/10 p-6 rounded-3xl border border-primary/20 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    AI Career Match
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Neural Analysis
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-xl font-bold text-foreground">
                    {topMatch?.title || targetCareer || "Career Exploration"}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">
                  {topMatch?.description ||
                    (targetCareer
                      ? `Your skills and interests indicate a strong trajectory for high-growth ${targetCareer} roles.`
                      : "Complete your diagnostic career assessment to calculate your top career domain matches.")}
                </p>
              </div>

              {topMatch?.confidence && (
                <div className="p-3.5 rounded-2xl bg-white dark:bg-card border border-border/60 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                      Match Confidence
                    </span>
                    <h4 className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {topMatch.confidence}% Compatibility
                    </h4>
                  </div>
                  <Link
                    to="/assessment"
                    className="px-3.5 py-1.5 rounded-full bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary/90 transition-all"
                  >
                    Explore Path
                  </Link>
                </div>
              )}
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* E. RESUME HEALTH & ATS CARD */}
            {/* --------------------------------------------------------------------- */}
            <div className="bg-white dark:bg-card p-6 rounded-3xl border border-border/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <h3 className="text-base font-bold text-foreground">Resume ATS Health</h3>
                </div>
                <Link
                  to="/resume"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {atsScore ? "Re-scan" : "Analyze"}
                </Link>
              </div>

              {atsScore !== null ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-muted/30 p-4 rounded-2xl border border-border/60">
                    <CircularProgress
                      value={atsScore}
                      size="md"
                      variant={atsScore >= 75 ? "success" : atsScore >= 50 ? "warning" : "danger"}
                    />

                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-foreground">
                        {atsScore >= 75 ? "Strong ATS Readiness" : atsScore >= 50 ? "Moderate ATS Score" : "Needs Optimization"}
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Target Role: <strong className="text-foreground">{resumeRole || targetCareer || "General Tech"}</strong>
                      </p>
                    </div>
                  </div>

                  {resumeStrengths.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Detected Strengths
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {resumeStrengths.map((str, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold"
                          >
                            ✓ {str}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {resumeImprovements.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Suggested Improvements
                      </span>
                      <div className="space-y-1 text-[11px] text-muted-foreground">
                        {resumeImprovements.map((imp, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-500 font-bold">•</span>
                            <span className="line-clamp-1">{imp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-muted/30 border border-dashed border-border text-center space-y-2">
                  <FileText className="w-8 h-8 text-muted-foreground mx-auto" />
                  <h4 className="text-xs font-bold text-foreground">No Resume Scanned Yet</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Upload your PDF resume to check ATS keyword score, role alignment, and missing skills.
                  </p>
                  <Link
                    to="/resume"
                    className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-primary text-white text-xs font-semibold shadow-xs hover:bg-primary/90 transition-all mt-1"
                  >
                    Upload Resume <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* F. QUICK AI ACTIONS */}
            {/* --------------------------------------------------------------------- */}
            <div className="bg-white dark:bg-card p-6 rounded-3xl border border-border/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <Zap className="w-4 h-4 text-primary" />
                <h3 className="text-base font-bold text-foreground">AI Career Suite</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => window.dispatchEvent(new CustomEvent("open-career-assistant"))}
                  className="p-3.5 rounded-2xl bg-gradient-to-br from-primary/5 to-purple-500/10 border border-primary/20 hover:border-primary/50 transition-all flex flex-col justify-between gap-3 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      Career Compass AI
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      24/7 Strategy & Guidance
                    </p>
                  </div>
                </div>

                <Link
                  to="/mock-interview"
                  className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/10 border border-emerald-500/20 hover:border-emerald-500/50 transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                      Mock Interview
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Real-time AI Simulation
                    </p>
                  </div>
                </Link>

                <Link
                  to="/interview-prep"
                  className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500/5 to-indigo-500/10 border border-blue-500/20 hover:border-blue-500/50 transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground group-hover:text-blue-600 transition-colors">
                      Company Prep
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Top Hiring Questions
                    </p>
                  </div>
                </Link>

                <Link
                  to="/assessment"
                  className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/5 to-orange-500/10 border border-amber-500/20 hover:border-amber-500/50 transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground group-hover:text-amber-600 transition-colors">
                      Skill Assessment
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Diagnostic Test
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* G. RECENT ACTIVITY STREAM */}
            {/* --------------------------------------------------------------------- */}
            <div className="bg-white dark:bg-card p-6 rounded-3xl border border-border/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <h3 className="text-base font-bold text-foreground">Recent Activity</h3>
                </div>
                <span className="text-[11px] text-muted-foreground font-semibold">Live Logs</span>
              </div>

              {activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.slice(0, 5).map((act) => (
                    <div
                      key={act._id}
                      onClick={() => act.link && navigate(act.link)}
                      className={`flex items-start gap-3 p-3 rounded-2xl border border-border/40 hover:bg-slate-50 dark:hover:bg-muted/30 transition-colors ${
                        act.link ? "cursor-pointer" : ""
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-foreground truncate">
                          {act.title || act.action || "Student Activity"}
                        </h5>
                        {(act.details || act.description) && (
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {act.details || act.description}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatTimeAgo(act.createdAt || act.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 p-3 rounded-2xl border border-border/40 bg-slate-50 dark:bg-muted/20">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-foreground">
                        Career Compass Account Active
                      </h5>
                      <p className="text-[11px] text-muted-foreground">
                        Welcome to your personalized career growth portal.
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Now</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-2xl border border-border/40 bg-slate-50 dark:bg-muted/20">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-foreground">
                        AI Recommendation Engine Ready
                      </h5>
                      <p className="text-[11px] text-muted-foreground">
                        Explore roadmaps and test your career domain fit.
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Now</span>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
