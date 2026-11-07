import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { useAuth } from "../context/auth-context";

interface JobItem {
  _id: string;
  title: string;
  department?: string;
  location?: string;
  type?: string;
  workMode?: string;
  experience?: string;
  salary?: string;
  skills?: string[];
  description?: string;
  responsibilities?: string[];
  benefits?: string[];
  openings?: number;
  applicationsCount: number;
  status: "Active" | "Paused" | "Closed";
  createdAt: string;
}

interface ApplicantItem {
  _id: string;
  candidateName: string;
  candidateEmail: string;
  role: string;
  matchScore: number;
  matchReason?: string;
  skills?: string[];
  avatar?: string;
  status: "Applied" | "Shortlisted" | "Interview" | "Hired" | "Rejected";
  appliedAt: string;
}

interface RecommendedCandidate {
  _id: string;
  candidateName: string;
  candidateEmail: string;
  role: string;
  skills: string[];
  matchScore: number;
  matchReason: string;
  avatar?: string;
}

interface ApplicationTrend {
  date: string;
  applications: number;
}

function getInitialsAvatar(name: string): string {
  const initial = (name ? name.charAt(0) : "U").toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="#4F46E5"/><text x="20" y="25" font-family="sans-serif" font-size="16" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${initial}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function EmployerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("Last 30 days");

  // Recruiter & Company Data State
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    contactPerson: user?.name || "Recruiter",
    workEmail: user?.email || "",
    hasProfile: false,
  });

  // KPI Counts directly from DB
  const [kpis, setKpis] = useState({
    activeJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    interviewsScheduled: 0,
    hired: 0,
    rejected: 0,
  });

  // Data Collections
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [applicants, setApplicants] = useState<ApplicantItem[]>([]);
  const [recommendedCandidates, setRecommendedCandidates] = useState<RecommendedCandidate[]>([]);
  const [applicationTrends, setApplicationTrends] = useState<ApplicationTrend[]>([]);
  const [applicationsByStatus, setApplicationsByStatus] = useState({
    total: 0,
    applied: { count: 0, percentage: 0 },
    shortlisted: { count: 0, percentage: 0 },
    interview: { count: 0, percentage: 0 },
    hired: { count: 0, percentage: 0 },
    rejected: { count: 0, percentage: 0 },
  });

  // Modals & Active Selections
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantItem | null>(null);
  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);
  const [selectedJobDetails, setSelectedJobDetails] = useState<JobItem | null>(null);
  const [editingJob, setEditingJob] = useState<JobItem | null>(null);
  const [deleteConfirmationJob, setDeleteConfirmationJob] = useState<JobItem | null>(null);
  const [isAiRecommendationsModalOpen, setIsAiRecommendationsModalOpen] = useState(false);

  // Fetch Live Dashboard Data directly from backend
  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/api/employer/dashboard", {
        headers: { "x-auth-token": token || "" },
      });

      if (res.data) {
        if (res.data.company) {
          setCompanyInfo({
            name: res.data.company.name || "",
            contactPerson: res.data.company.contactPerson || user?.name || "Recruiter",
            workEmail: res.data.company.workEmail || user?.email || "",
            hasProfile: Boolean(res.data.company.hasProfile && res.data.company.name),
          });
        }

        if (res.data.kpis) {
          setKpis(res.data.kpis);
        }

        setJobs(res.data.recentJobs || []);
        setApplicants(res.data.recentApplicants || []);
        setRecommendedCandidates(res.data.recommendedCandidates || []);
        setApplicationTrends(res.data.applicationTrends || []);
        if (res.data.applicationsByStatus) {
          setApplicationsByStatus(res.data.applicationsByStatus);
        }
      }
    } catch (err) {
      console.warn("Could not load backend dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format date helper
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // Handle Job Status Change (Active <-> Paused <-> Closed)
  const handleToggleJobStatus = async (jobId: string, newStatus: JobItem["status"]) => {
    setJobs((prev) =>
      prev.map((j) => (j._id === jobId ? { ...j, status: newStatus } : j))
    );

    if (selectedJobDetails && selectedJobDetails._id === jobId) {
      setSelectedJobDetails({ ...selectedJobDetails, status: newStatus });
    }

    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://localhost:5000/api/employer/jobs/${jobId}/status`,
        { status: newStatus },
        { headers: { "x-auth-token": token || "" } }
      );
      // Refresh KPIs
      fetchDashboardData();
    } catch (err) {
      console.warn("Error updating job status:", err);
    }
  };

  // Handle Job Edit Save
  const handleSaveJobEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://localhost:5000/api/employer/jobs/${editingJob._id}`,
        editingJob,
        { headers: { "x-auth-token": token || "" } }
      );
      setJobs((prev) => prev.map((j) => (j._id === editingJob._id ? editingJob : j)));
      setEditingJob(null);
      fetchDashboardData();
    } catch (err) {
      console.warn("Error updating job:", err);
    }
  };

  // Handle Job Delete
  const handleDeleteJob = async (jobId: string) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5000/api/employer/jobs/${jobId}`, {
        headers: { "x-auth-token": token || "" },
      });
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      setDeleteConfirmationJob(null);
      if (selectedJobDetails && selectedJobDetails._id === jobId) {
        setSelectedJobDetails(null);
      }
      fetchDashboardData();
    } catch (err) {
      console.warn("Error deleting job:", err);
    }
  };

  // Handle Candidate Stage Update (Applied -> Shortlisted -> Interview -> Hired -> Rejected)
  const handleUpdateApplicantStatus = async (applicantId: string, newStatus: ApplicantItem["status"]) => {
    setApplicants((prev) =>
      prev.map((app) => (app._id === applicantId ? { ...app, status: newStatus } : app))
    );
    if (selectedApplicant && selectedApplicant._id === applicantId) {
      setSelectedApplicant({ ...selectedApplicant, status: newStatus });
    }

    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://localhost:5000/api/employer/applicants/${applicantId}/status`,
        { status: newStatus },
        { headers: { "x-auth-token": token || "" } }
      );
      fetchDashboardData();
    } catch (err) {
      console.warn("Error updating applicant status:", err);
    }
  };

  // Dynamic Chart Calculations based on REAL DB DATA
  const getDynamicTrendChart = () => {
    if (applicationTrends.length === 0) {
      return null;
    }

    const maxVal = Math.max(...applicationTrends.map((t) => t.applications), 1);
    const count = applicationTrends.length;

    const points = applicationTrends.map((item, idx) => {
      const cx = count === 1 ? 200 : 30 + (idx / (count - 1)) * 340;
      const cy = 135 - (item.applications / maxVal) * 95;
      return { cx, cy, date: item.date, count: item.applications };
    });

    let path = "";
    let fill = "";
    if (points.length === 1) {
      path = `M 20,${points[0].cy} L 380,${points[0].cy}`;
      fill = `M 20,${points[0].cy} L 380,${points[0].cy} L 380,150 L 20,150 Z`;
    } else {
      path = points.reduce((acc, pt, i) => (i === 0 ? `M ${pt.cx},${pt.cy}` : `${acc} L ${pt.cx},${pt.cy}`), "");
      fill = `${path} L ${points[points.length - 1].cx},150 L ${points[0].cx},150 Z`;
    }

    return {
      labels: applicationTrends.map((t) => t.date),
      points,
      path,
      fill,
    };
  };

  const dynamicTrend = getDynamicTrendChart();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 min-w-0 font-sans pb-12">
      {/* ------------------------------------------------------------------ */}
      {/* 1. WELCOME HEADER (DYNAMIC RECRUITER & COMPANY IDENTITY)           */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-slate-900 flex items-center gap-2">
            Welcome back, {companyInfo.contactPerson} 👋
          </h1>
          {companyInfo.hasProfile && companyInfo.name ? (
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Here's what's happening at <strong className="text-slate-800">{companyInfo.name}</strong> today.
            </p>
          ) : (
            <p className="text-xs font-medium text-amber-600 mt-0.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">info</span>
              <span>Complete your company profile to showcase your brand to top talent.</span>
              <Link to="/employer/profile" className="font-bold underline text-purple-600 hover:text-purple-700 ml-1">
                Complete Profile
              </Link>
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/employer/post-job"
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/25 flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>Post a New Job</span>
          </Link>
          <div className="text-right hidden md:block">
            <span className="text-xs font-bold text-slate-800">
              {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
            <p className="text-[10.5px] text-slate-400 font-medium">Find the right talent. Build what's next.</p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. TOP 4 METRIC CARDS (STRICTLY CALCULATED FROM REAL DB DATA)      */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Active Jobs */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex flex-col">
            <span className="text-2xl font-black font-heading text-slate-900 leading-tight">
              {kpis.activeJobs}
            </span>
            <span className="text-xs font-semibold text-slate-500 mt-0.5">Active Jobs</span>
            {kpis.activeJobs > 0 ? (
              <span className="text-[11px] font-bold text-emerald-600 mt-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">work</span>
                <span>{kpis.activeJobs} open position{kpis.activeJobs === 1 ? "" : "s"}</span>
              </span>
            ) : (
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-medium">No active job postings yet.</span>
                <Link
                  to="/employer/post-job"
                  className="text-[11px] font-bold text-purple-600 hover:text-purple-700 underline"
                >
                  Post a Job
                </Link>
              </div>
            )}
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner shrink-0">
            <span className="material-symbols-outlined text-[22px]">work</span>
          </div>
        </div>

        {/* Card 2: Total Applications */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex flex-col">
            <span className="text-2xl font-black font-heading text-slate-900 leading-tight">
              {kpis.totalApplications}
            </span>
            <span className="text-xs font-semibold text-slate-500 mt-0.5">Total Applications</span>
            {kpis.totalApplications > 0 ? (
              <span className="text-[11px] font-bold text-indigo-600 mt-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">groups</span>
                <span>{kpis.totalApplications} candidate{kpis.totalApplications === 1 ? "" : "s"}</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium mt-1.5">
                Applications will appear here when candidates apply.
              </span>
            )}
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner shrink-0">
            <span className="material-symbols-outlined text-[22px]">groups</span>
          </div>
        </div>

        {/* Card 3: Shortlisted */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex flex-col">
            <span className="text-2xl font-black font-heading text-slate-900 leading-tight">
              {kpis.shortlisted}
            </span>
            <span className="text-xs font-semibold text-slate-500 mt-0.5">Shortlisted Candidates</span>
            {kpis.shortlisted > 0 ? (
              <span className="text-[11px] font-bold text-amber-600 mt-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">person_check</span>
                <span>{kpis.shortlisted} candidate{kpis.shortlisted === 1 ? "" : "s"} shortlisted</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium mt-1.5">
                No candidates shortlisted yet.
              </span>
            )}
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner shrink-0">
            <span className="material-symbols-outlined text-[22px]">person_check</span>
          </div>
        </div>

        {/* Card 4: Interviews Scheduled */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex flex-col">
            <span className="text-2xl font-black font-heading text-slate-900 leading-tight">
              {kpis.interviewsScheduled}
            </span>
            <span className="text-xs font-semibold text-slate-500 mt-0.5">Interviews Scheduled</span>
            {kpis.interviewsScheduled > 0 ? (
              <span className="text-[11px] font-bold text-rose-600 mt-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                <span>{kpis.interviewsScheduled} interview{kpis.interviewsScheduled === 1 ? "" : "s"} scheduled</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium mt-1.5">
                No interviews scheduled yet.
              </span>
            )}
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner shrink-0">
            <span className="material-symbols-outlined text-[22px]">calendar_month</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. MIDDLE SECTION: OVERVIEW CHART, DONUT STATUS, AI PROMO          */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5 items-stretch">
        {/* Applications Overview (Area Chart) */}
        <div className="xl:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Applications Overview</h3>
              <p className="text-[11px] text-slate-400">Total volume trend over {timeRange.toLowerCase()}</p>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="Last 7 days">Last 7 days</option>
              <option value="Last 30 days">Last 30 days</option>
              <option value="Last 90 days">Last 90 days</option>
            </select>
          </div>

          {/* Dynamic SVG Area Chart OR Clean Empty State */}
          {dynamicTrend && dynamicTrend.points.length > 0 ? (
            <>
              <div className="relative h-40 w-full flex items-end min-w-0">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 400 160">
                  <defs>
                    <linearGradient id="appGradientDynamic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="400" y2="20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="0" y1="60" x2="400" y2="60" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="0" y1="100" x2="400" y2="100" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="0" y1="140" x2="400" y2="140" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />

                  {/* Area fill */}
                  <path d={dynamicTrend.fill} fill="url(#appGradientDynamic)" />

                  {/* Glowing Line */}
                  <path d={dynamicTrend.path} fill="none" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />

                  {/* Real Data Points */}
                  {dynamicTrend.points.map((pt, i) => (
                    <circle
                      key={i}
                      cx={pt.cx}
                      cy={pt.cy}
                      r={5}
                      fill="#7C3AED"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  ))}
                </svg>
              </div>

              {/* X-Axis Date Labels */}
              <div className="flex justify-between text-[10.5px] font-semibold text-slate-400 mt-2 px-1">
                {dynamicTrend.labels.map((lbl, idx) => (
                  <span key={idx}>{lbl}</span>
                ))}
              </div>
            </>
          ) : (
            <div className="h-44 w-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[22px]">trending_up</span>
              </div>
              <h4 className="text-xs font-bold text-slate-700">Not enough application data yet</h4>
              <p className="text-[10.5px] text-slate-400 max-w-xs mt-0.5">
                Application trend metrics will appear once candidates start applying to your active job postings.
              </p>
            </div>
          )}
        </div>

        {/* Applications by Status (Donut Chart & Live Breakdown) */}
        <div className="xl:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900">Applications by Status</h3>
            <span className="text-[10px] font-bold text-slate-400">Live Funnel</span>
          </div>

          {kpis.totalApplications > 0 ? (
            <div className="flex items-center justify-between gap-3 my-auto">
              {/* SVG Donut Chart */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" stroke="#F1F5F9" strokeWidth="12" fill="transparent" />
                  {/* Applied */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#3B82F6"
                    strokeWidth="12"
                    strokeDasharray={`${(238 * applicationsByStatus.applied.percentage) / 100} 238`}
                    strokeDashoffset="0"
                    fill="transparent"
                  />
                  {/* Shortlisted */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#10B981"
                    strokeWidth="12"
                    strokeDasharray={`${(238 * applicationsByStatus.shortlisted.percentage) / 100} 238`}
                    strokeDashoffset={`${-(238 * applicationsByStatus.applied.percentage) / 100}`}
                    fill="transparent"
                  />
                  {/* Interview */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#F59E0B"
                    strokeWidth="12"
                    strokeDasharray={`${(238 * applicationsByStatus.interview.percentage) / 100} 238`}
                    strokeDashoffset={`${-(238 * (applicationsByStatus.applied.percentage + applicationsByStatus.shortlisted.percentage)) / 100}`}
                    fill="transparent"
                  />
                  {/* Hired */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#8B5CF6"
                    strokeWidth="12"
                    strokeDasharray={`${(238 * applicationsByStatus.hired.percentage) / 100} 238`}
                    strokeDashoffset={`${-(238 * (applicationsByStatus.applied.percentage + applicationsByStatus.shortlisted.percentage + applicationsByStatus.interview.percentage)) / 100}`}
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-base font-black font-heading text-slate-900 leading-none">
                    {kpis.totalApplications}
                  </span>
                  <span className="text-[9.5px] text-slate-400 font-bold">Total</span>
                </div>
              </div>

              {/* Status Legend */}
              <div className="flex flex-col gap-1 text-[11px] flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="flex items-center gap-1.5 text-slate-600 font-medium truncate">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    Applied
                  </span>
                  <span className="font-bold text-slate-900">{applicationsByStatus.applied.percentage}%</span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="flex items-center gap-1.5 text-slate-600 font-medium truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    Shortlisted
                  </span>
                  <span className="font-bold text-slate-900">{applicationsByStatus.shortlisted.percentage}%</span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="flex items-center gap-1.5 text-slate-600 font-medium truncate">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    Interview
                  </span>
                  <span className="font-bold text-slate-900">{applicationsByStatus.interview.percentage}%</span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="flex items-center gap-1.5 text-slate-600 font-medium truncate">
                    <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                    Hired
                  </span>
                  <span className="font-bold text-slate-900">{applicationsByStatus.hired.percentage}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-44 w-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 my-auto">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[22px]">donut_large</span>
              </div>
              <h4 className="text-xs font-bold text-slate-700">No application data yet</h4>
              <p className="text-[10.5px] text-slate-400 max-w-xs mt-0.5">
                Candidate status distribution across hiring stages will be shown here.
              </p>
            </div>
          )}
        </div>

        {/* AI Talent Spotlight Promo Card */}
        <div className="xl:col-span-3 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 rounded-3xl p-5 sm:p-6 border border-indigo-100/80 shadow-xs flex flex-col justify-between min-w-0">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
              <span className="material-symbols-outlined text-[20px]">emoji_events</span>
            </div>
            <span className="material-symbols-outlined text-indigo-400 text-[18px]">auto_awesome</span>
          </div>

          <div className="mt-3 mb-3">
            <h3 className="text-sm font-bold text-slate-900 font-heading leading-snug">
              Find Better Talent Faster with AI
            </h3>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              AI-powered candidate recommendations based on skills, experience, and role synergy.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAiRecommendationsModalOpen(true)}
            className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>View Recommendations</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 4. BOTTOM ROW: RECENT JOBS TABLE & RECENT APPLICANTS               */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* Your Recent Job Posts Table */}
        <div className="xl:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Your Recent Job Posts</h3>
              <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                {jobs.length} jobs
              </span>
            </div>
            <Link
              to="/employer/jobs"
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              Manage All <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Job Title</th>
                  <th className="pb-3 font-semibold text-center">Applications</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Posted On</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[20px]">work_outline</span>
                        </div>
                        <p className="text-xs font-bold text-slate-700">No jobs posted yet</p>
                        <p className="text-[11px] text-slate-400">Post your first opening to start receiving candidates.</p>
                        <Link
                          to="/employer/post-job"
                          className="mt-2 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">add</span>
                          <span>Post Your First Job</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job._id} className="hover:bg-slate-50/80 transition-colors">
                      <td
                        onClick={() => setSelectedJobDetails(job)}
                        className="py-3.5 font-bold text-purple-600 hover:text-purple-800 hover:underline cursor-pointer"
                      >
                        <div>{job.title}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {job.department || "Engineering"} • {job.type || "Full Time"}
                        </div>
                      </td>
                      <td className="py-3.5 text-center font-bold text-slate-900">
                        {job.applicationsCount || 0}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            job.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : job.status === "Paused"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              job.status === "Active"
                                ? "bg-emerald-500"
                                : job.status === "Paused"
                                ? "bg-amber-500"
                                : "bg-slate-400"
                            }`}
                          />
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-500">{formatDate(job.createdAt)}</td>
                      <td className="py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedJobDetails(job)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingJob(job)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleJobStatus(
                                job._id,
                                job.status === "Active" ? "Paused" : "Active"
                              )
                            }
                            title={job.status === "Active" ? "Pause job posting" : "Resume job posting"}
                            className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                              job.status === "Active"
                                ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {job.status === "Active" ? "Pause" : "Resume"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmationJob(job)}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Applicants Feed */}
        <div className="xl:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Recent Applicants</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                {applicants.length} candidates
              </span>
            </div>
            <Link
              to="/employer/applicants"
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
            >
              View All <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          <div className="flex flex-col divide-y divide-slate-100">
            {applicants.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">groups</span>
                </div>
                <p className="text-xs font-bold text-slate-700">No applicants yet</p>
                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                  When students apply to your job postings, their profiles will appear here.
                </p>
              </div>
            ) : (
              applicants.map((cand) => (
                <div
                  key={cand._id}
                  onClick={() => {
                    setSelectedApplicant(cand);
                    setIsApplicantModalOpen(true);
                  }}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-2xl transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={cand.avatar || getInitialsAvatar(cand.candidateName)}
                      alt={cand.candidateName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs"
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {cand.candidateName}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                            cand.status === "Shortlisted"
                              ? "bg-emerald-100 text-emerald-800"
                              : cand.status === "Interview"
                              ? "bg-amber-100 text-amber-800"
                              : cand.status === "Hired"
                              ? "bg-purple-100 text-purple-800"
                              : cand.status === "Rejected"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {cand.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 truncate">{cand.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] tracking-wide border border-emerald-200/60">
                      {cand.matchScore}% Match
                    </span>
                    <span className="text-[10px] text-slate-400">{formatDate(cand.appliedAt)}</span>
                    <span className="material-symbols-outlined text-slate-400 text-[16px]">
                      chevron_right
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 5. QUICK ACTIONS & MOTTO FOOTER                                    */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Quick Action Buttons */}
        <div className="lg:col-span-7 flex flex-wrap items-center gap-3">
          <Link
            to="/employer/post-job"
            className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Post a New Job
          </Link>

          <button
            type="button"
            onClick={() => setIsAiRecommendationsModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-all border border-slate-200 flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-emerald-600">groups</span>
            Browse Recommended Talent
          </button>

          <Link
            to="/employer/profile"
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-all border border-slate-200 flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-indigo-600">domain</span>
            Company Profile
          </Link>
        </div>

        {/* Motto / Slogan Card */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-purple-600 text-[20px]">verified</span>
            <div>
              <div className="text-xs font-bold text-slate-900">Career Compass Recruiter Suite</div>
              <div className="text-[10px] text-slate-500">Connecting ambition with opportunity</div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-purple-700 px-2 py-1 bg-white rounded-lg border border-purple-200">
            Active
          </span>
        </div>
      </div>

      {/* ================= MODAL: VIEW JOB DETAILS ================= */}
      <AnimatePresence>
        {selectedJobDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-4 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 uppercase">
                    {selectedJobDetails.department || "Engineering"}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">{selectedJobDetails.title}</h3>
                  <div className="text-xs text-slate-500">
                    {selectedJobDetails.location} • {selectedJobDetails.type}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedJobDetails(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block mb-1">Salary Range</span>
                  <span className="text-sm font-black text-purple-700">{selectedJobDetails.salary || "Competitive"}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block mb-1">Applications Received</span>
                  <span className="text-xs font-bold text-slate-900">{selectedJobDetails.applicationsCount} Candidates</span>
                </div>

                {selectedJobDetails.skills && selectedJobDetails.skills.length > 0 && (
                  <div>
                    <span className="text-slate-400 font-bold block mb-1.5">Required Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJobDetails.skills.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[11px] font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedJobDetails.description && (
                  <div>
                    <span className="text-slate-400 font-bold block mb-1">Description</span>
                    <p className="text-slate-600 leading-relaxed">{selectedJobDetails.description}</p>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500">Job Status: </span>
                    <span className="font-bold text-slate-900">{selectedJobDetails.status}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleToggleJobStatus(
                          selectedJobDetails._id,
                          selectedJobDetails.status === "Active" ? "Paused" : "Active"
                        );
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        selectedJobDetails.status === "Active"
                          ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                      }`}
                    >
                      {selectedJobDetails.status === "Active" ? "Pause Job" : "Activate Job"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const j = selectedJobDetails;
                        setSelectedJobDetails(null);
                        setEditingJob(j);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                    >
                      Edit Job
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: EDIT JOB ================= */}
      <AnimatePresence>
        {editingJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900">Edit Job Posting</h3>
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveJobEdit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={editingJob.title}
                    onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={editingJob.location || ""}
                      onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Salary Range</label>
                    <input
                      type="text"
                      value={editingJob.salary || ""}
                      onChange={(e) => setEditingJob({ ...editingJob, salary: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                    <select
                      value={editingJob.status}
                      onChange={(e) => setEditingJob({ ...editingJob, status: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-purple-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Paused">Paused</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Work Mode</label>
                    <select
                      value={editingJob.workMode || "Hybrid"}
                      onChange={(e) => setEditingJob({ ...editingJob, workMode: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-purple-500"
                    >
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-site">On-site</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingJob(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md shadow-purple-600/20 cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: DELETE JOB CONFIRMATION ================= */}
      <AnimatePresence>
        {deleteConfirmationJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-[24px]">delete</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Delete Job Posting?</h3>
              <p className="text-xs text-slate-500 mb-5">
                Are you sure you want to delete <strong>{deleteConfirmationJob.title}</strong>? This will permanently remove the job and all associated candidate applications.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmationJob(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteJob(deleteConfirmationJob._id)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 cursor-pointer"
                >
                  Delete Job
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: APPLICANT REVIEW & PIPELINE TRANSITIONS ================= */}
      <AnimatePresence>
        {isApplicantModalOpen && selectedApplicant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedApplicant.avatar || getInitialsAvatar(selectedApplicant.candidateName)}
                    alt={selectedApplicant.candidateName}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{selectedApplicant.candidateName}</h3>
                    <p className="text-xs text-slate-500">{selectedApplicant.role}</p>
                    <p className="text-[11px] text-slate-400">{selectedApplicant.candidateEmail}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsApplicantModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* AI Match Badge */}
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-purple-900">AI Match Synergy</span>
                  <span className="text-xs font-black text-purple-700">{selectedApplicant.matchScore}%</span>
                </div>
                <p className="text-[11px] text-purple-800/90 leading-snug">
                  {selectedApplicant.matchReason || "Demonstrated alignment with technical requirements and job stack."}
                </p>
              </div>

              {/* Skills */}
              {selectedApplicant.skills && selectedApplicant.skills.length > 0 && (
                <div className="mb-4">
                  <span className="text-xs font-bold text-slate-700 block mb-1.5">Verified Candidate Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedApplicant.skills.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Hiring Pipeline Actions */}
              <div className="pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Update Candidate Stage (Current: <strong className="text-purple-700">{selectedApplicant.status}</strong>)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateApplicantStatus(selectedApplicant._id, "Shortlisted")}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedApplicant.status === "Shortlisted"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    Shortlist
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateApplicantStatus(selectedApplicant._id, "Interview")}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedApplicant.status === "Interview"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                    }`}
                  >
                    Interview
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateApplicantStatus(selectedApplicant._id, "Hired")}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedApplicant.status === "Hired"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                    }`}
                  >
                    Hire
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateApplicantStatus(selectedApplicant._id, "Rejected")}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedApplicant.status === "Rejected"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                    }`}
                  >
                    Decline
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: AI CANDIDATE RECOMMENDATIONS ================= */}
      <AnimatePresence>
        {isAiRecommendationsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">AI Matched Candidate Sourcing</h3>
                    <p className="text-xs text-slate-400">Scored against your active job skill requirements</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAiRecommendationsModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {recommendedCandidates.length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center justify-center gap-2.5">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner">
                      <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">No candidates to recommend yet.</h4>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Post active jobs with required skills to generate AI candidate recommendations.
                    </p>
                  </div>
                ) : (
                  recommendedCandidates.map((cand) => (
                    <div key={cand._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={cand.avatar || getInitialsAvatar(cand.candidateName)}
                          alt={cand.candidateName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{cand.candidateName}</h4>
                          <p className="text-[11px] text-slate-500 truncate">{cand.role}</p>
                          <p className="text-[10px] text-purple-700 font-medium mt-0.5 leading-snug">
                            {cand.matchReason}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {(cand.skills || []).slice(0, 4).map((s, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded bg-white text-slate-700 text-[10px] font-medium border border-slate-200">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                          {cand.matchScore}% Match
                        </span>
                        <Link
                          to={`/employer/applicants`}
                          onClick={() => setIsAiRecommendationsModalOpen(false)}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Review</span>
                          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EmployerDashboard;
