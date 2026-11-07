import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import {
  Briefcase,
  Search,
  Plus,
  MoreVertical,
  MapPin,
  Clock,
  Eye,
  Edit,
  PauseCircle,
  PlayCircle,
  XCircle,
  Trash2,
  Users,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  X,
  Building,
  DollarSign
} from "lucide-react";

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

export function EmployerJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | "Active" | "Paused" | "Closed">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Modals
  const [selectedJobDetails, setSelectedJobDetails] = useState<JobItem | null>(null);
  const [editingJob, setEditingJob] = useState<JobItem | null>(null);
  const [deleteConfirmationJob, setDeleteConfirmationJob] = useState<JobItem | null>(null);

  const ITEMS_PER_PAGE = 8;

  // Load jobs from Backend & Local Storage
  const loadJobs = async () => {
    let localJobs: JobItem[] = [];
    try {
      const stored = localStorage.getItem("recent_employer_jobs");
      if (stored) {
        localJobs = JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Could not parse local jobs:", e);
    }

    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/api/employer/jobs", {
        headers: { "x-auth-token": token || "" },
      });
      if (res.data?.jobs) {
        const serverJobs: JobItem[] = res.data.jobs;
        const mergedMap = new Map<string, JobItem>();
        localJobs.forEach((j) => mergedMap.set(j._id || j.title, j));
        serverJobs.forEach((j) => {
          if (!mergedMap.has(j._id) && !mergedMap.has(j.title)) {
            mergedMap.set(j._id, j);
          }
        });
        setJobs(Array.from(mergedMap.values()));
        return;
      }
    } catch (err) {
      console.warn("Using local cache for jobs.");
    }

    setJobs(localJobs);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  // Close actions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setOpenActionMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update Status
  const handleUpdateStatus = async (jobId: string, newStatus: JobItem["status"]) => {
    setJobs((prev) => {
      const updated = prev.map((j) => (j._id === jobId ? { ...j, status: newStatus } : j));
      try {
        localStorage.setItem("recent_employer_jobs", JSON.stringify(updated));
      } catch (e) {
        console.warn("Local storage write error:", e);
      }
      return updated;
    });

    if (selectedJobDetails && selectedJobDetails._id === jobId) {
      setSelectedJobDetails({ ...selectedJobDetails, status: newStatus });
    }
    setOpenActionMenuId(null);

    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://localhost:5000/api/employer/jobs/${jobId}/status`,
        { status: newStatus },
        { headers: { "x-auth-token": token || "" } }
      );
    } catch (e) {
      console.warn("Job status updated locally.");
    }
  };

  // Delete Job
  const handleDeleteJob = async (jobId: string) => {
    setJobs((prev) => {
      const updated = prev.filter((j) => j._id !== jobId);
      try {
        localStorage.setItem("recent_employer_jobs", JSON.stringify(updated));
      } catch (e) {
        console.warn("Local storage write error:", e);
      }
      return updated;
    });
    setDeleteConfirmationJob(null);
    setOpenActionMenuId(null);

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5000/api/employer/jobs/${jobId}`, {
        headers: { "x-auth-token": token || "" },
      });
    } catch (e) {
      console.warn("Delete job API error:", e);
    }
  };

  // Save Edit Job
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    const toSave = editingJob;
    setJobs((prev) => {
      const updated = prev.map((j) => (j._id === toSave._id ? toSave : j));
      try {
        localStorage.setItem("recent_employer_jobs", JSON.stringify(updated));
      } catch (err) {
        console.warn("Local storage write error:", err);
      }
      return updated;
    });
    setEditingJob(null);

    const token = localStorage.getItem("token");
    try {
      await axios.put(`http://localhost:5000/api/employer/jobs/${toSave._id}`, toSave, {
        headers: { "x-auth-token": token || "" },
      });
    } catch (err) {
      console.warn("Edit job API error:", err);
    }
  };

  // Filter Jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.location || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.department || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = activeTab === "All" ? true : job.status === activeTab;
    return matchesSearch && matchesTab;
  });

  // Dynamic Counts
  const countAll = jobs.length;
  const countActive = jobs.filter((j) => j.status === "Active").length;
  const countPaused = jobs.filter((j) => j.status === "Paused").length;
  const countClosed = jobs.filter((j) => j.status === "Closed").length;

  // Pagination Slice
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE) || 1;
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 font-sans pb-12">
      {/* ================= 1. HEADER SECTION ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-slate-900">
            Manage Jobs
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
            View, edit, and manage all your job postings.
          </p>
        </div>

        <Link
          to="/employer/post-job"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/25 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Post a New Job</span>
        </Link>
      </div>

      {/* ================= 2. SEARCH & FILTER CONTROLS ================= */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        {/* Search Bar */}
        <div className="relative">
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
            placeholder="Search by job title or location..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          {[
            { id: "All", label: "All", count: countAll },
            { id: "Active", label: "Active", count: countActive },
            { id: "Paused", label: "Paused", count: countPaused },
            { id: "Closed", label: "Closed", count: countClosed },
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
      </div>

      {/* ================= 3. JOBS TABLE ================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden" ref={actionMenuRef}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6 font-semibold">Job Title</th>
                <th className="py-3.5 px-4 font-semibold">Location</th>
                <th className="py-3.5 px-4 font-semibold text-center">Applications</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Posted On</th>
                <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {paginatedJobs.length > 0 ? (
                paginatedJobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Job Title */}
                    <td className="py-4 px-6">
                      <button
                        type="button"
                        onClick={() => setSelectedJobDetails(job)}
                        className="text-left font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors block cursor-pointer"
                      >
                        {job.title}
                      </button>
                      <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                        {job.department || "Engineering"} • {job.type || "Full Time"}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-4 px-4 text-slate-600">
                      <span className="font-semibold text-slate-800">{job.location || "Bangalore"}</span>
                      <span className="text-[10px] text-slate-400 block font-normal">{job.workMode || "Hybrid"}</span>
                    </td>

                    {/* Applications Count */}
                    <td className="py-4 px-4 text-center">
                      <Link
                        to={`/employer/applicants?jobId=${job._id}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-900 font-black text-xs transition-colors"
                      >
                        <span>{job.applicationsCount || 0}</span>
                        <Users className="w-3 h-3 text-slate-400" />
                      </Link>
                    </td>

                    {/* Status with Colored Dot */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                          job.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : job.status === "Paused"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            job.status === "Active"
                              ? "bg-emerald-500"
                              : job.status === "Paused"
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                        />
                        {job.status}
                      </span>
                    </td>

                    {/* Posted On Date */}
                    <td className="py-4 px-4 text-slate-500 font-medium">
                      {formatDate(job.createdAt)}
                    </td>

                    {/* Actions Menu */}
                    <td className="py-4 px-6 text-right relative">
                      <div className="inline-block text-left">
                        <button
                          type="button"
                          onClick={() => setOpenActionMenuId(openActionMenuId === job._id ? null : job._id)}
                          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 flex items-center justify-center transition-all cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Popover */}
                        <AnimatePresence>
                          {openActionMenuId === job._id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -5 }}
                              className="absolute right-6 mt-1 w-48 bg-white rounded-2xl p-1.5 shadow-xl border border-slate-200 z-30 text-left flex flex-col gap-0.5"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedJobDetails(job);
                                  setOpenActionMenuId(null);
                                }}
                                className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-600" />
                                <span>View Details</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setEditingJob(job);
                                  setOpenActionMenuId(null);
                                }}
                                className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Edit Posting</span>
                              </button>

                              <Link
                                to={`/employer/applicants?jobId=${job._id}`}
                                className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors"
                              >
                                <Users className="w-3.5 h-3.5 text-purple-600" />
                                <span>View Applicants ({job.applicationsCount})</span>
                              </Link>

                              <div className="h-[1px] bg-slate-100 my-1" />

                              {job.status === "Active" ? (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(job._id, "Paused")}
                                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-amber-700 hover:bg-amber-50 flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                  <PauseCircle className="w-3.5 h-3.5" />
                                  <span>Pause Job</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(job._id, "Active")}
                                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                  <PlayCircle className="w-3.5 h-3.5" />
                                  <span>Activate Job</span>
                                </button>
                              )}

                              {job.status !== "Closed" && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(job._id, "Closed")}
                                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Close Job</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteConfirmationJob(job);
                                  setOpenActionMenuId(null);
                                }}
                                className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Job</span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No jobs match your search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================= 4. PAGINATION FOOTER ================= */}
        <div className="p-4 px-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div>
            Showing{" "}
            <strong className="text-slate-900">
              {filteredJobs.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}
            </strong>{" "}
            -{" "}
            <strong className="text-slate-900">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredJobs.length)}
            </strong>{" "}
            of <strong className="text-slate-900">{filteredJobs.length}</strong>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200/80 disabled:opacity-40 disabled:hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-all cursor-pointer"
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
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200/80 disabled:opacity-40 disabled:hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
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
                    {selectedJobDetails.location} • {selectedJobDetails.type} • {selectedJobDetails.workMode}
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
                  <span className="text-sm font-black text-purple-700">
                    {selectedJobDetails.salary || "₹12,00,000 - ₹18,00,000"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block mb-1">Applications Received</span>
                  <span className="text-xs font-bold text-slate-900">
                    {selectedJobDetails.applicationsCount} Candidates
                  </span>
                </div>

                {selectedJobDetails.description && (
                  <div>
                    <span className="text-slate-400 font-bold block mb-1">Job Summary</span>
                    <p className="text-slate-700 leading-relaxed">{selectedJobDetails.description}</p>
                  </div>
                )}

                {selectedJobDetails.skills && selectedJobDetails.skills.length > 0 && (
                  <div>
                    <span className="text-slate-400 font-bold block mb-1.5">Required Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJobDetails.skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedJobDetails.responsibilities && selectedJobDetails.responsibilities.length > 0 && (
                  <div>
                    <span className="text-slate-400 font-bold block mb-1.5">Key Responsibilities</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {selectedJobDetails.responsibilities.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
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
                      onClick={() =>
                        handleUpdateStatus(
                          selectedJobDetails._id,
                          selectedJobDetails.status === "Active" ? "Paused" : "Active"
                        )
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        selectedJobDetails.status === "Active"
                          ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                      }`}
                    >
                      {selectedJobDetails.status === "Active" ? "Pause Job" : "Activate Job"}
                    </button>

                    <Link
                      to={`/employer/applicants?jobId=${selectedJobDetails._id}`}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-all"
                    >
                      View Candidates
                    </Link>
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

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
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

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
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
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Delete Job Posting?</h3>
              <p className="text-xs text-slate-500 mb-5">
                Are you sure you want to remove <strong>{deleteConfirmationJob.title}</strong>? This action cannot be undone.
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
    </div>
  );
}

export default EmployerJobs;
