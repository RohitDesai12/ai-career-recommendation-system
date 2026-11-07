import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import {
  Sparkles,
  Search,
  Briefcase,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  UserCheck,
  UserX,
  MessageSquare,
  FileText,
  GraduationCap,
  Award,
  ChevronDown,
  RefreshCw,
  ExternalLink,
  Building,
  Mail,
  Filter,
  Check,
  X
} from "lucide-react";

interface JobOption {
  _id: string;
  title: string;
  department?: string;
  location?: string;
  type?: string;
  skills?: string[];
  status: "Active" | "Paused" | "Closed";
  openings?: number;
}

interface CandidateRecommendation {
  _id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  avatar?: string;
  role: string;
  experience?: string;
  education?: string;
  location?: string;
  matchScore: number;
  matchTier: "strong" | "potential" | "review";
  matchingSkills: string[];
  missingSkills: string[];
  projects?: Array<{ title: string; description?: string; link?: string }>;
  resumeUrl?: string;
  applicationId?: string;
  applicationStatus?: "Applied" | "Reviewed" | "Shortlisted" | "Interview" | "Hired" | "Rejected";
  matchReason?: string;
}

export function EmployerRecommendations() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [recommendations, setRecommendations] = useState<CandidateRecommendation[]>([]);
  const [summary, setSummary] = useState({
    analyzed: 0,
    strong: 0,
    potential: 0,
    review: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadingJob, setLoadingJob] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTier, setFilterTier] = useState<"all" | "strong" | "potential" | "review">("all");

  // Candidate Detail Modal
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRecommendation | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Quick Message Modal
  const [messageModalCandidate, setMessageModalCandidate] = useState<CandidateRecommendation | null>(null);
  const [quickMessageText, setQuickMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // Fetch Employer's Jobs first
  useEffect(() => {
    fetchJobsAndRecommendations();
  }, []);

  const fetchJobsAndRecommendations = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");

    try {
      // 1. Fetch employer jobs
      const jobsRes = await axios.get("http://localhost:5000/api/employer/jobs", {
        headers: { "x-auth-token": token || "" },
      });

      const fetchedJobs: JobOption[] = jobsRes.data?.jobs || [];
      setJobs(fetchedJobs);

      if (fetchedJobs.length > 0) {
        // Default to first active job, or the first job
        const activeJob = fetchedJobs.find((j) => j.status === "Active") || fetchedJobs[0];
        setSelectedJobId(activeJob._id);
        await loadRecommendationsForJob(activeJob._id, token);
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Failed to load recruiter recommendations:", err);
      setError(err?.response?.data?.message || "Failed to load candidate recommendations.");
      setLoading(false);
    }
  };

  const loadRecommendationsForJob = async (jobId: string, tokenParam?: string | null) => {
    setLoadingJob(true);
    setError(null);
    const token = tokenParam || localStorage.getItem("token");

    try {
      const res = await axios.get(`http://localhost:5000/api/employer/recommendations?jobId=${jobId}`, {
        headers: { "x-auth-token": token || "" },
      });

      if (res.data) {
        setRecommendations(res.data.candidates || []);
        setSummary({
          analyzed: res.data.analyzedCount || 0,
          strong: res.data.strongMatchesCount || 0,
          potential: res.data.potentialMatchesCount || 0,
          review: res.data.reviewNeededCount || 0,
        });
      }
    } catch (err: any) {
      console.error("Error loading job recommendations:", err);
      setError("Failed to calculate AI candidate match scores. Please try again.");
    } finally {
      setLoading(false);
      setLoadingJob(false);
    }
  };

  const handleSelectJob = (newJobId: string) => {
    setSelectedJobId(newJobId);
    loadRecommendationsForJob(newJobId);
  };

  // Handle Shortlist / Reject
  const handleStatusChange = async (candidate: CandidateRecommendation, newStatus: "Shortlisted" | "Rejected") => {
    if (!candidate.applicationId) {
      // If no application exists yet, we can notify or navigate
      setActionFeedback({
        message: `Candidate has not directly submitted an application for this specific posting yet. Message them directly to invite them!`,
        type: "error",
      });
      setTimeout(() => setActionFeedback(null), 4000);
      return;
    }

    setActionLoading(candidate._id);
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://localhost:5000/api/employer/applicants/${candidate.applicationId}/status`,
        { status: newStatus },
        { headers: { "x-auth-token": token || "" } }
      );

      setRecommendations((prev) =>
        prev.map((c) => (c._id === candidate._id ? { ...c, applicationStatus: newStatus } : c))
      );

      if (selectedCandidate && selectedCandidate._id === candidate._id) {
        setSelectedCandidate({ ...selectedCandidate, applicationStatus: newStatus });
      }

      setActionFeedback({
        message: `Candidate marked as ${newStatus} successfully!`,
        type: "success",
      });
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err: any) {
      setActionFeedback({
        message: err?.response?.data?.message || "Failed to update candidate status.",
        type: "error",
      });
      setTimeout(() => setActionFeedback(null), 3500);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Direct Message
  const handleSendQuickMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageModalCandidate || !quickMessageText.trim()) return;

    setSendingMessage(true);
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:5000/api/employer/messages",
        {
          recipientId: messageModalCandidate.candidateId,
          jobId: selectedJobId,
          applicationId: messageModalCandidate.applicationId || null,
          content: quickMessageText.trim(),
        },
        { headers: { "x-auth-token": token || "" } }
      );

      setMessageModalCandidate(null);
      setQuickMessageText("");
      setActionFeedback({
        message: `Message sent to ${messageModalCandidate.candidateName}!`,
        type: "success",
      });
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err: any) {
      setActionFeedback({
        message: err?.response?.data?.message || "Failed to send message.",
        type: "error",
      });
      setTimeout(() => setActionFeedback(null), 3500);
    } finally {
      setSendingMessage(false);
    }
  };

  const selectedJob = jobs.find((j) => j._id === selectedJobId);

  // Filter recommendations
  const filteredCandidates = recommendations.filter((cand) => {
    const matchesSearch =
      cand.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cand.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cand.matchingSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTier = filterTier === "all" ? true : cand.matchTier === filterTier;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Action Feedback Banner */}
      <AnimatePresence>
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl flex items-center justify-between text-sm font-semibold shadow-md ${
              actionFeedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-amber-50 text-amber-800 border border-amber-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {actionFeedback.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              <span>{actionFeedback.message}</span>
            </div>
            <button
              onClick={() => setActionFeedback(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">AI Candidate Recommendations</h1>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl">
            Find candidates who best match your open roles using verified skills, experience, and job requirements.
          </p>
        </div>

        {/* Job Selector Dropdown */}
        <div className="flex items-center gap-3">
          {jobs.length > 0 ? (
            <div className="relative min-w-[260px]">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Target Role
              </label>
              <div className="relative">
                <select
                  value={selectedJobId}
                  onChange={(e) => handleSelectJob(e.target.value)}
                  className="w-full appearance-none pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 cursor-pointer shadow-xs"
                >
                  {jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.title} ({job.status})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          ) : (
            <Link
              to="/employer/post-job"
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-2 transition-all"
            >
              <Briefcase className="w-4 h-4" />
              Post a Job First
            </Link>
          )}

          {selectedJobId && (
            <button
              onClick={() => loadRecommendationsForJob(selectedJobId)}
              disabled={loadingJob}
              title="Refresh AI Match Analysis"
              className="mt-5 p-2.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loadingJob ? "animate-spin text-purple-600" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-white rounded-3xl border border-slate-200 p-5 animate-pulse" />
            ))}
          </div>
          <div className="h-96 bg-white rounded-3xl border border-slate-200 p-8 flex flex-col items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-400 animate-spin" />
            <p className="text-sm font-bold text-slate-600">Analyzing candidates and computing AI match scores...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-8 bg-white rounded-3xl border border-rose-200 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">Something went wrong</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchJobsAndRecommendations}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto shadow-inner">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Job Postings Found</h3>
          <p className="text-sm text-slate-500">
            Create your first job posting so our AI matchmaking engine can score and recommend relevant candidates for your roles.
          </p>
          <Link
            to="/employer/post-job"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Post a Job Now
          </Link>
        </div>
      ) : (
        <>
          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidates Analyzed</p>
                <h3 className="text-2xl font-black text-slate-900">{summary.analyzed}</h3>
              </div>
            </div>

            <div
              onClick={() => setFilterTier("strong")}
              className={`p-5 bg-white rounded-3xl border transition-all cursor-pointer shadow-xs flex items-center gap-4 ${
                filterTier === "strong" ? "ring-2 ring-purple-600 border-purple-300 bg-purple-50/20" : "border-slate-200 hover:border-purple-200"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Strong Matches (≥75%)</p>
                <h3 className="text-2xl font-black text-emerald-600">{summary.strong}</h3>
              </div>
            </div>

            <div
              onClick={() => setFilterTier("potential")}
              className={`p-5 bg-white rounded-3xl border transition-all cursor-pointer shadow-xs flex items-center gap-4 ${
                filterTier === "potential" ? "ring-2 ring-purple-600 border-purple-300 bg-purple-50/20" : "border-slate-200 hover:border-purple-200"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Potential (50-74%)</p>
                <h3 className="text-2xl font-black text-indigo-600">{summary.potential}</h3>
              </div>
            </div>

            <div
              onClick={() => setFilterTier("review")}
              className={`p-5 bg-white rounded-3xl border transition-all cursor-pointer shadow-xs flex items-center gap-4 ${
                filterTier === "review" ? "ring-2 ring-purple-600 border-purple-300 bg-purple-50/20" : "border-slate-200 hover:border-purple-200"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Needs Review (&lt;50%)</p>
                <h3 className="text-2xl font-black text-amber-600">{summary.review}</h3>
              </div>
            </div>
          </div>

          {/* Search & Tier Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidates, skills, roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {(
                [
                  { id: "all", label: `All (${recommendations.length})` },
                  { id: "strong", label: `Strong Matches (${summary.strong})` },
                  { id: "potential", label: `Potential (${summary.potential})` },
                  { id: "review", label: `Needs Review (${summary.review})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterTier(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    filterTier === tab.id
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Candidates Grid */}
          {filteredCandidates.length === 0 ? (
            <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {recommendations.length === 0 ? "No applicants yet" : "No matching candidates"}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {recommendations.length === 0
                  ? "No applicants have applied to this job yet. Once candidates apply, AI recommendations will appear here."
                  : "No candidates match your current search and tier filters. Try selecting 'All' or clearing search."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredCandidates.map((cand) => {
                const scoreColor =
                  cand.matchScore >= 75
                    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                    : cand.matchScore >= 50
                    ? "text-indigo-700 bg-indigo-50 border-indigo-200"
                    : "text-amber-700 bg-amber-50 border-amber-200";

                const badgeText =
                  cand.matchScore >= 75
                    ? "Strong Match"
                    : cand.matchScore >= 50
                    ? "Potential Match"
                    : "Partial Match";

                return (
                  <div
                    key={cand._id}
                    className="bg-white rounded-3xl border border-slate-200/90 hover:border-purple-300 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Avatar, Name, Match Score */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                            {cand.candidateName
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-slate-900 leading-tight">
                              {cand.candidateName}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">{cand.role || "Candidate"}</p>
                            {cand.applicationStatus && (
                              <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                                Status: {cand.applicationStatus}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className={`px-3 py-1.5 rounded-2xl border flex items-center gap-1.5 ${scoreColor}`}>
                          <Sparkles className="w-4 h-4" />
                          <div className="text-right">
                            <span className="text-sm font-black">{cand.matchScore}%</span>
                            <span className="block text-[9px] font-bold uppercase tracking-wider">{badgeText}</span>
                          </div>
                        </div>
                      </div>

                      {/* Education & Experience Chips */}
                      <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 mb-3.5">
                        {cand.experience && (
                          <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 rounded-xl border border-slate-200">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            {cand.experience}
                          </span>
                        )}
                        {cand.education && (
                          <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 rounded-xl border border-slate-200">
                            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                            {cand.education}
                          </span>
                        )}
                        {cand.resumeUrl && (
                          <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-xl border border-blue-200 font-semibold">
                            <FileText className="w-3.5 h-3.5" />
                            Resume Available
                          </span>
                        )}
                      </div>

                      {/* Matching Skills */}
                      <div className="space-y-2 mb-4">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Matching Skills ({cand.matchingSkills.length})
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {cand.matchingSkills.slice(0, 6).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                              >
                                ✓ {skill}
                              </span>
                            ))}
                            {cand.matchingSkills.length > 6 && (
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600">
                                +{cand.matchingSkills.length - 6} more
                              </span>
                            )}
                            {cand.matchingSkills.length === 0 && (
                              <span className="text-[11px] text-slate-400 italic">No direct skill matches</span>
                            )}
                          </div>
                        </div>

                        {/* Missing / Gap Skills */}
                        {cand.missingSkills.length > 0 && (
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              Skill Gaps ({cand.missingSkills.length})
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {cand.missingSkills.slice(0, 4).map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200"
                                >
                                  {skill}
                                </span>
                              ))}
                              {cand.missingSkills.length > 4 && (
                                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-400">
                                  +{cand.missingSkills.length - 4}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedCandidate(cand)}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Profile
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setMessageModalCandidate(cand);
                            setQuickMessageText(
                              `Hi ${cand.candidateName.split(" ")[0]}, we reviewed your profile for our ${
                                selectedJob?.title || "role"
                              } opening and would like to discuss next steps!`
                            );
                          }}
                          className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          title="Message Candidate"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                          Message
                        </button>

                        <button
                          onClick={() => handleStatusChange(cand, "Shortlisted")}
                          disabled={actionLoading === cand._id || cand.applicationStatus === "Shortlisted"}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Shortlist
                        </button>

                        <button
                          onClick={() => handleStatusChange(cand, "Rejected")}
                          disabled={actionLoading === cand._id || cand.applicationStatus === "Rejected"}
                          className="px-2.5 py-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-500 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                          title="Reject"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Candidate Full Profile Modal */}
      <AnimatePresence>
        {selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 my-8 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                    {selectedCandidate.candidateName
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedCandidate.candidateName}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{selectedCandidate.role}</span>
                      <span>•</span>
                      <span>{selectedCandidate.candidateEmail}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto py-5 space-y-5">
                {/* AI Score Box */}
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black">
                      {selectedCandidate.matchScore}%
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-purple-900">AI Compatibility Score</h4>
                      <p className="text-[11px] text-purple-700">
                        {selectedCandidate.matchReason || "Scored against current job requirements"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Skills Grid */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Skill Assessment</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                      <span className="text-[11px] font-bold text-emerald-800 block mb-2">
                        ✓ Verified Match Skills ({selectedCandidate.matchingSkills.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCandidate.matchingSkills.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white text-emerald-700 border border-emerald-200 shadow-2xs"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100">
                      <span className="text-[11px] font-bold text-amber-800 block mb-2">
                        Missing Required Skills ({selectedCandidate.missingSkills.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCandidate.missingSkills.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white text-slate-600 border border-amber-200 shadow-2xs"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Experience & Education */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Experience
                    </span>
                    <p className="text-xs font-semibold text-slate-800">
                      {selectedCandidate.experience || "Not specified in profile"}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Education
                    </span>
                    <p className="text-xs font-semibold text-slate-800">
                      {selectedCandidate.education || "Not specified in profile"}
                    </p>
                  </div>
                </div>

                {/* Projects */}
                {selectedCandidate.projects && selectedCandidate.projects.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Relevant Projects</h4>
                    <div className="space-y-2">
                      {selectedCandidate.projects.map((proj, idx) => (
                        <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                          <h5 className="text-xs font-bold text-slate-900">{proj.title}</h5>
                          {proj.description && (
                            <p className="text-[11px] text-slate-500 mt-1">{proj.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedCandidate(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const cand = selectedCandidate;
                      setSelectedCandidate(null);
                      setMessageModalCandidate(cand);
                      setQuickMessageText(
                        `Hi ${cand.candidateName.split(" ")[0]}, we reviewed your profile for our ${
                          selectedJob?.title || "role"
                        } opening and would like to discuss next steps!`
                      );
                    }}
                    className="px-4 py-2 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Send Message
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedCandidate, "Shortlisted")}
                    disabled={actionLoading === selectedCandidate._id || selectedCandidate.applicationStatus === "Shortlisted"}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    Shortlist Candidate
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Message Modal */}
      <AnimatePresence>
        {messageModalCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Message {messageModalCandidate.candidateName}
                    </h3>
                    <p className="text-xs text-slate-500">Direct Recruiter Outreach</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMessageModalCandidate(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSendQuickMessage} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Message</label>
                  <textarea
                    rows={4}
                    required
                    value={quickMessageText}
                    onChange={(e) => setQuickMessageText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setMessageModalCandidate(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingMessage || !quickMessageText.trim()}
                    className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-md shadow-purple-600/20 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {sendingMessage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                    Send Message
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EmployerRecommendations;
