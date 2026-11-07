import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { useAuth } from "../context/auth-context";
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Download,
  Calendar,
  CheckCircle2,
  XCircle,
  Share2,
  BookmarkPlus,
  Mail,
  MapPin,
  Linkedin,
  Github,
  Globe,
  GraduationCap,
  Sparkles,
  FileText,
  Clock,
  Send,
  UserCheck,
  ChevronDown
} from "lucide-react";

interface ApplicantItem {
  _id: string;
  jobId?: string;
  jobTitle?: string;
  candidateName: string;
  candidateEmail: string;
  role: string;
  matchScore: number;
  matchReason?: string;
  skills: string[];
  avatar?: string;
  location?: string;
  education?: string;
  cgpa?: string;
  about?: string;
  status: "Applied" | "Shortlisted" | "Interview" | "Hired" | "Rejected";
  appliedAt: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  recentActivity?: { title: string; time: string; icon: string }[];
  projects?: { title: string; desc: string; tags: string[]; link?: string }[];
  assessments?: { title: string; score: number; status: string }[];
  notes?: { id: string; author: string; text: string; date: string }[];
}

export function EmployerApplicants() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [applicants, setApplicants] = useState<ApplicantItem[]>([]);
  const [jobOptions, setJobOptions] = useState<string[]>(["All Jobs"]);
  const [selectedJobFilter, setSelectedJobFilter] = useState("All Jobs");
  const [activeTab, setActiveTab] = useState<"All" | "Applied" | "Shortlisted" | "Interview" | "Hired" | "Rejected">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<ApplicantItem | null>(null);
  const [activeCandidateTab, setActiveCandidateTab] = useState<"Overview" | "Resume" | "Skills" | "Projects" | "Assessments" | "Notes">("Overview");

  // Selection & Pagination
  const [selectedApplicantIds, setSelectedApplicantIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Candidate Details Note State
  const [newNoteText, setNewNoteText] = useState("");
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [interviewDate, setInterviewDate] = useState("2026-09-15T14:00");
  const [interviewType, setInterviewType] = useState("Technical Panel (Round 1)");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load jobs and applicants from backend
  const fetchData = async () => {
    const token = localStorage.getItem("token");

    // Fetch jobs to populate filter
    let jobList: string[] = [];
    try {
      const jobsRes = await axios.get("http://localhost:5000/api/employer/jobs", {
        headers: { "x-auth-token": token || "" },
      });
      if (jobsRes.data?.jobs) {
        jobList = jobsRes.data.jobs.map((j: any) => j.title);
      }
    } catch (e) {
      console.warn("Could not fetch employer jobs for filter:", e);
    }

    try {
      const stored = localStorage.getItem("recent_employer_jobs");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.forEach((j: any) => {
          if (j.title && !jobList.includes(j.title)) {
            jobList.push(j.title);
          }
        });
      }
    } catch (e) {
      console.warn("Could not read local jobs:", e);
    }

    const uniqueJobTitles = Array.from(new Set(jobList));
    setJobOptions(["All Jobs", ...uniqueJobTitles]);

    // Fetch real applicants
    try {
      const res = await axios.get("http://localhost:5000/api/employer/applicants", {
        headers: { "x-auth-token": token || "" },
      });
      if (res.data?.applicants && res.data.applicants.length > 0) {
        const mapped: ApplicantItem[] = res.data.applicants.map((app: any) => ({
          _id: app._id,
          jobId: app.job?._id || app.job,
          jobTitle: app.job?.title || app.role || "Software Engineer",
          candidateName: app.candidateName,
          candidateEmail: app.candidateEmail,
          role: app.role || app.job?.title || "Candidate",
          matchScore: app.matchScore || 85,
          matchReason: app.matchReason,
          skills: app.skills || [],
          avatar: app.avatar,
          location: app.location || "India",
          education: app.education || "B.Tech in Computer Engineering",
          cgpa: app.cgpa || "",
          about: app.about || "",
          status: app.status || "Applied",
          appliedAt: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently",
          linkedinUrl: app.linkedinUrl,
          githubUrl: app.githubUrl,
          recentActivity: app.recentActivity || [],
          projects: app.projects || [],
          assessments: app.assessments || [],
          notes: app.notes || []
        }));
        setApplicants(mapped);
      } else {
        setApplicants([]);
      }
    } catch (err) {
      console.warn("No server applicants found. Starting clean.");
      setApplicants([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Check query params for candidate ID or job filter on load
  useEffect(() => {
    const candParam = searchParams.get("candidateId");
    if (candParam && applicants.length > 0) {
      const found = applicants.find((a) => a._id === candParam);
      if (found) setSelectedCandidate(found);
    }

    const jobParam = searchParams.get("jobTitle");
    if (jobParam) {
      setSelectedJobFilter(jobParam);
    }
  }, [searchParams, applicants]);

  // Update status for a candidate
  const handleUpdateStatus = async (candidateId: string, newStatus: ApplicantItem["status"]) => {
    setApplicants((prev) =>
      prev.map((app) => (app._id === candidateId ? { ...app, status: newStatus } : app))
    );

    if (selectedCandidate && selectedCandidate._id === candidateId) {
      setSelectedCandidate({ ...selectedCandidate, status: newStatus });
    }

    showToast(`Candidate status changed to ${newStatus}`);

    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://localhost:5000/api/employer/applicants/${candidateId}/status`,
        { status: newStatus },
        { headers: { "x-auth-token": token || "" } }
      );
    } catch (err) {
      console.warn("Status updated locally.");
    }
  };

  // Add Note
  const handleAddNote = () => {
    if (!newNoteText.trim() || !selectedCandidate) return;
    const newNote = {
      id: "n_" + Date.now(),
      author: `${user?.name || "Recruiter"} (Recruiter)`,
      text: newNoteText.trim(),
      date: "Just now",
    };

    const updated = {
      ...selectedCandidate,
      notes: [newNote, ...(selectedCandidate.notes || [])],
    };

    setSelectedCandidate(updated);
    setApplicants((prev) => prev.map((a) => (a._id === selectedCandidate._id ? updated : a)));
    setNewNoteText("");
    showToast("Note saved successfully!");
  };

  // Select All
  const handleToggleSelectAll = () => {
    if (selectedApplicantIds.length === paginatedApplicants.length) {
      setSelectedApplicantIds([]);
    } else {
      setSelectedApplicantIds(paginatedApplicants.map((a) => a._id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedApplicantIds.includes(id)) {
      setSelectedApplicantIds(selectedApplicantIds.filter((i) => i !== id));
    } else {
      setSelectedApplicantIds([...selectedApplicantIds, id]);
    }
  };

  // Filter Applicants
  const filteredApplicants = applicants.filter((app) => {
    const matchesJob =
      selectedJobFilter === "All Jobs" ||
      app.jobTitle?.toLowerCase().includes(selectedJobFilter.toLowerCase()) ||
      app.role.toLowerCase().includes(selectedJobFilter.toLowerCase());

    const matchesTab = activeTab === "All" ? true : app.status === activeTab;

    const matchesSearch =
      app.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.candidateEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.location || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.skills || []).some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesJob && matchesTab && matchesSearch;
  });

  // Dynamic Counts for tabs
  const countAll = applicants.length;
  const countApplied = applicants.filter((a) => a.status === "Applied").length;
  const countShortlisted = applicants.filter((a) => a.status === "Shortlisted").length;
  const countInterview = applicants.filter((a) => a.status === "Interview").length;
  const countHired = applicants.filter((a) => a.status === "Hired").length;
  const countRejected = applicants.filter((a) => a.status === "Rejected").length;

  const totalPages = Math.ceil(filteredApplicants.length / ITEMS_PER_PAGE) || 1;
  const paginatedApplicants = filteredApplicants.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto space-y-5 font-sans pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold border border-slate-700"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* VIEW A: APPLICANTS LIST (SCREEN 5)                              */}
      {/* ============================================================== */}
      {!selectedCandidate ? (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-slate-900">
                Applicants
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                View and manage candidates for your job postings.
              </p>
            </div>

            {/* Job Filter Dropdown */}
            <div className="relative">
              <select
                value={selectedJobFilter}
                onChange={(e) => {
                  setSelectedJobFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 pr-10 text-xs font-bold text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-purple-500/30 cursor-pointer min-w-[200px]"
              >
                {jobOptions.map((job) => (
                  <option key={job} value={job}>
                    {job}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Controls & Filter Pills Box */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "All", label: "All", count: countAll },
                { id: "Applied", label: "Applied", count: countApplied },
                { id: "Shortlisted", label: "Shortlisted", count: countShortlisted },
                { id: "Interview", label: "Interview", count: countInterview },
                { id: "Hired", label: "Hired", count: countHired },
                { id: "Rejected", label: "Rejected", count: countRejected },
              ].map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-purple-600 text-white shadow-sm shadow-purple-600/30"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? "bg-white/20 text-white" : "bg-white text-slate-600 border border-slate-200"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search, Filter & Sort Row */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-100">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search candidates by name, skills, or location..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <span>Filter</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setApplicants((prev) => [...prev].reverse());
                    showToast("Sorted candidates");
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sort</span>
                </button>
              </div>
            </div>
          </div>

          {/* Applicants Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={
                          paginatedApplicants.length > 0 &&
                          selectedApplicantIds.length === paginatedApplicants.length
                        }
                        onChange={handleToggleSelectAll}
                        className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3.5 px-4 font-semibold">Candidate</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Match</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold">Applied On</th>
                    <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {paginatedApplicants.length > 0 ? (
                    paginatedApplicants.map((app) => (
                      <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Checkbox */}
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedApplicantIds.includes(app._id)}
                            onChange={() => handleToggleSelectOne(app._id)}
                            className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                        </td>

                        {/* Candidate Info */}
                        <td className="py-3.5 px-4">
                          <div
                            onClick={() => setSelectedCandidate(app)}
                            className="flex items-center gap-3 cursor-pointer group"
                          >
                            <img
                              src={
                                app.avatar ||
                                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                              }
                              alt={app.candidateName}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <span className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors block">
                                {app.candidateName}
                              </span>
                              <span className="text-[11px] text-slate-400 font-normal">
                                {app.role}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Match Score Badge */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-xl text-xs font-bold ${
                              app.matchScore >= 90
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : app.matchScore >= 80
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {app.matchScore}%
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-xl text-[11px] font-bold ${
                              app.status === "Shortlisted"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : app.status === "Interview"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : app.status === "Applied"
                                ? "bg-slate-100 text-slate-700 border border-slate-200"
                                : app.status === "Hired"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>

                        {/* Applied On */}
                        <td className="py-3.5 px-4 text-slate-500 font-medium">{app.appliedAt}</td>

                        {/* Actions Button */}
                        <td className="py-3.5 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedCandidate(app)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-purple-600 hover:text-white text-slate-700 font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>View</span>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-2.5 max-w-sm mx-auto">
                          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner">
                            <Users className="w-6 h-6 text-purple-600" />
                          </div>
                          <h3 className="text-sm font-bold text-slate-800">No applicants yet</h3>
                          <p className="text-xs text-slate-400 text-center leading-relaxed">
                            {applicants.length === 0
                              ? "When candidates apply to your job postings, their profiles, resumes, and AI match scores will appear here."
                              : "No candidates match the current filter criteria."}
                          </p>
                          {applicants.length === 0 && (
                            <Link
                              to="/employer/post-job"
                              className="mt-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-purple-600/20 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Post a New Job</span>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 px-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
              <div>
                Showing{" "}
                <strong className="text-slate-900">
                  {filteredApplicants.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}
                </strong>{" "}
                -{" "}
                <strong className="text-slate-900">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredApplicants.length)}
                </strong>{" "}
                of <strong className="text-slate-900">{filteredApplicants.length}</strong>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200/80 disabled:opacity-40 text-slate-700 flex items-center justify-center transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setCurrentPage(pg)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pg
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                    }`}
                  >
                    {pg}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200/80 disabled:opacity-40 text-slate-700 flex items-center justify-center transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* VIEW B: CANDIDATE DETAILS (SCREEN 6)                           */
        /* ============================================================== */
        <div className="space-y-5">
          {/* Back button & Breadcrumb */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedCandidate(null)}
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Applicants</span>
            </button>
          </div>

          {/* Top Tabs (Overview, Resume, Skills, Projects, Assessments, Notes) */}
          <div className="bg-white rounded-2xl p-1.5 px-3 border border-slate-200/80 shadow-xs flex items-center gap-1 overflow-x-auto">
            {[
              { id: "Overview", label: "Overview" },
              { id: "Resume", label: "Resume" },
              { id: "Skills", label: "Skills" },
              { id: "Projects", label: "Projects" },
              { id: "Assessments", label: "Assessments" },
              { id: "Notes", label: "Notes" },
            ].map((t) => {
              const isSelected = activeCandidateTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveCandidateTab(t.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "text-purple-700 bg-purple-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <span>{t.label}</span>
                  {isSelected && (
                    <motion.div
                      layoutId="tab-underline"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-purple-600 rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* 3-Column Split Content */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5 items-start">
            {/* LEFT PROFILE CARD (3 cols) */}
            <div className="xl:col-span-3 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col items-center text-center min-w-0">
              <img
                src={selectedCandidate.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                alt={selectedCandidate.candidateName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-slate-100 shadow-md mb-3"
              />
              <h2 className="text-base font-black text-slate-900 font-heading">
                {selectedCandidate.candidateName}
              </h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                {selectedCandidate.jobTitle || "Software Development Engineer"}
              </p>

              {/* Match Badge */}
              <div className="mt-3 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black">
                {selectedCandidate.matchScore}% Match Score
              </div>

              {/* Contact / Links */}
              <div className="w-full space-y-2 mt-5 text-left text-xs border-t border-slate-100 pt-4 text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{selectedCandidate.location || "Vadodara, Gujarat"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{selectedCandidate.candidateEmail}</span>
                </div>
                {selectedCandidate.linkedinUrl && (
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <a
                      href={`https://${selectedCandidate.linkedinUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline truncate"
                    >
                      {selectedCandidate.linkedinUrl}
                    </a>
                  </div>
                )}
                {selectedCandidate.githubUrl && (
                  <div className="flex items-center gap-2">
                    <Github className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                    <a
                      href={`https://${selectedCandidate.githubUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-800 hover:underline truncate"
                    >
                      {selectedCandidate.githubUrl}
                    </a>
                  </div>
                )}
              </div>

              {/* Download Resume Button */}
              <button
                type="button"
                onClick={() => showToast("Resume PDF downloaded.")}
                className="w-full mt-6 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Resume</span>
              </button>
            </div>

            {/* CENTER MAIN CONTENT (6 cols) */}
            <div className="xl:col-span-6 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5 min-w-0">
              {/* TAB 1: OVERVIEW */}
              {activeCandidateTab === "Overview" && (
                <div className="space-y-6">
                  {/* About Section */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                      About
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {selectedCandidate.about ||
                        "Motivated and detail-oriented Computer Science student with a strong foundation in Data Structures, Web Development, and Machine Learning."}
                    </p>
                  </div>

                  {/* Education Section */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                      Education
                    </h3>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {selectedCandidate.education || "B.Tech in Computer Engineering (2022–2026)"}
                        </div>
                        <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                          {selectedCandidate.cgpa || "CGPA: 8.8 / 10.0"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Skills */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                      Top Skills
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedCandidate.skills || []).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200/80"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity Timeline */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                      Recent Activity
                    </h3>
                    <div className="space-y-3">
                      {(
                        selectedCandidate.recentActivity || [
                          { title: "Applied for SDE", time: "2 days ago", icon: "description" },
                          { title: "Completed Online Assessment", time: "3 days ago", icon: "check_circle" },
                          { title: "Profile updated", time: "5 days ago", icon: "person" },
                        ]
                      ).map((act, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                              <span className="material-symbols-outlined text-[16px]">{act.icon}</span>
                            </div>
                            <span className="font-semibold text-slate-800">{act.title}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium">{act.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: RESUME PREVIEW */}
              {activeCandidateTab === "Resume" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Interactive Resume Viewer
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Verified Credentials
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{selectedCandidate.candidateName}</h4>
                      <p className="text-slate-500">{selectedCandidate.candidateEmail} • {selectedCandidate.location}</p>
                    </div>

                    <div className="border-t border-slate-200 pt-2">
                      <strong className="block text-slate-800 mb-1">Executive Summary</strong>
                      <p className="text-slate-600 leading-relaxed">{selectedCandidate.about}</p>
                    </div>

                    <div className="border-t border-slate-200 pt-2">
                      <strong className="block text-slate-800 mb-1">Education</strong>
                      <p className="text-slate-700">{selectedCandidate.education} • {selectedCandidate.cgpa}</p>
                    </div>

                    <div className="border-t border-slate-200 pt-2">
                      <strong className="block text-slate-800 mb-1.5">Technical Stack</strong>
                      <div className="flex flex-wrap gap-1">
                        {selectedCandidate.skills.map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-white text-slate-700 rounded-md border border-slate-200 text-[11px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SKILLS RADAR */}
              {activeCandidateTab === "Skills" && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Verified Skill Competencies
                  </h3>
                  <div className="space-y-3">
                    {selectedCandidate.skills.map((s, idx) => {
                      const pct = 85 + (idx % 4) * 4;
                      return (
                        <div key={s} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-800">{s}</span>
                            <span className="text-purple-700">{pct}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: PROJECTS */}
              {activeCandidateTab === "Projects" && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Featured Portfolio Projects
                  </h3>
                  {(selectedCandidate.projects && selectedCandidate.projects.length > 0
                    ? selectedCandidate.projects
                    : [
                        {
                          title: "Scalable Full Stack Cloud Application",
                          desc: "Engineered microservices architecture with real-time sockets and automated CI/CD.",
                          tags: ["React", "Node.js", "Docker", "PostgreSQL"],
                        },
                      ]
                  ).map((p, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-slate-900">{p.title}</h4>
                        {p.link && (
                          <a
                            href={p.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-purple-600 hover:underline"
                          >
                            View Repo ↗
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">{p.desc}</p>
                      <div className="flex flex-wrap gap-1">
                        {p.tags.map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded bg-white text-slate-700 text-[10px] font-bold border border-slate-200">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 5: ASSESSMENTS */}
              {activeCandidateTab === "Assessments" && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Verified Test Scorecards
                  </h3>
                  {(selectedCandidate.assessments || []).map((a, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900">{a.title}</div>
                        <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Status: {a.status}</div>
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black">
                        {a.score} / 100
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 6: NOTES */}
              {activeCandidateTab === "Notes" && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Recruiter Collaborative Notes
                  </h3>
                  {(selectedCandidate.notes && selectedCandidate.notes.length > 0 ? (
                    selectedCandidate.notes.map((n) => (
                      <div key={n.id} className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200/60 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-purple-900">{n.author}</span>
                          <span className="text-slate-400">{n.date}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">{n.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No notes logged yet. Use the sidebar to add a note.</p>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR (STATUS & ACTIONS) (3 cols) */}
            <div className="xl:col-span-3 space-y-4 min-w-0">
              {/* Status Selector Box */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Candidate Status
                </label>
                <select
                  value={selectedCandidate.status}
                  onChange={(e) => handleUpdateStatus(selectedCandidate._id, e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 cursor-pointer"
                >
                  <option value="Applied">Applied</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview">Interview</option>
                  <option value="Hired">Hired</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Add Note Box */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Add Note
                </label>
                <textarea
                  rows={3}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Add a note about this candidate..."
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none leading-relaxed"
                />
                <button
                  type="button"
                  onClick={handleAddNote}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all cursor-pointer"
                >
                  Save Note
                </button>
              </div>

              {/* Quick Pipeline Actions */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Actions
                </label>

                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-800 hover:text-purple-700 border border-slate-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span>Schedule Interview</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedCandidate._id, "Hired")}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 border border-slate-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Move to Hired</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedCandidate._id, "Rejected")}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-800 hover:text-rose-700 border border-slate-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Move to Rejected</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    showToast("Candidate profile link copied!");
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-slate-600" />
                  <span>Share Candidate</span>
                </button>

                <button
                  type="button"
                  onClick={() => showToast("Added candidate to talent pool!")}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <BookmarkPlus className="w-4 h-4 text-slate-600" />
                  <span>Add to Talent Pool</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: SCHEDULE INTERVIEW ================= */}
      <AnimatePresence>
        {isScheduleModalOpen && selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <h3 className="text-base font-black text-slate-900">Schedule Interview</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">Candidate</span>
                  <span className="text-sm font-black text-slate-900">{selectedCandidate.candidateName}</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Interview Round</label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Technical Panel (Round 1)">Technical Panel (Round 1)</option>
                    <option value="System Architecture (Round 2)">System Architecture (Round 2)</option>
                    <option value="Culture & Leadership Fit">Culture & Leadership Fit</option>
                    <option value="HR Discussion & Offer Rollout">HR Discussion & Offer Rollout</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateStatus(selectedCandidate._id, "Interview");
                      setIsScheduleModalOpen(false);
                      showToast(`Interview invite sent for ${interviewType}!`);
                    }}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md shadow-purple-600/20 cursor-pointer"
                  >
                    Send Calendar Invite
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EmployerApplicants;
