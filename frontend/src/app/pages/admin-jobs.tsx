import React, { useState, useEffect } from "react";
import { useLocation } from "react-router";
import axios from "axios";

interface JobItem {
  _id: string;
  title: string;
  companyName: string;
  department: string;
  location: string;
  type: string;
  workMode: string;
  salary: string;
  skills: string[];
  description?: string;
  status: "Pending" | "Active" | "Paused" | "Closed" | "Draft" | "Rejected";
  applicationsCount: number;
  createdAt: string;
}

export function AdminJobs() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialStatus = searchParams.get("status") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [closedCount, setClosedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "All") params.append("status", statusFilter);

      const res = await axios.get(`http://localhost:5000/api/admin/jobs?${params.toString()}`);
      setJobs(res.data.jobs || []);
      setTotal(res.data.total || 0);
      setPendingCount(res.data.pendingCount || 0);
      setActiveCount(res.data.activeCount || 0);
      setClosedCount(res.data.closedCount || 0);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleUpdateStatus = async (jobId: string, newStatus: string) => {
    setActionLoadingId(jobId);
    try {
      await axios.put(`http://localhost:5000/api/admin/jobs/${jobId}/status`, { status: newStatus });
      setSelectedJob(null);
      await fetchJobs();
    } catch (err) {
      console.error("Error updating job status:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteJob = async (jobId: string, jobTitle: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete job post "${jobTitle}"?`)) return;
    setActionLoadingId(jobId);
    try {
      await axios.delete(`http://localhost:5000/api/admin/jobs/${jobId}`);
      setSelectedJob(null);
      await fetchJobs();
    } catch (err) {
      console.error("Error deleting job:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDate = (dStr: string) => {
    if (!dStr) return "N/A";
    return new Date(dStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black font-heading text-slate-900 tracking-tight">
            Job Management & Approval Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review recruiter-submitted vacancies, approve for student visibility, and moderate listings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-2xl">
            {pendingCount} Pending Approval
          </span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-2xl">
            {activeCount} Active Live
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by job title, company, or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
        </form>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
          {[
            { id: "All", label: "All Jobs", count: total },
            { id: "Pending", label: "Pending", count: pendingCount },
            { id: "Active", label: "Active", count: activeCount },
            { id: "Paused", label: "Paused" },
            { id: "Closed", label: "Closed", count: closedCount },
            { id: "Rejected", label: "Rejected" },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                statusFilter === st.id ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>{st.label}</span>
              {st.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === st.id ? "bg-slate-100 text-slate-700" : "bg-white/60 text-slate-500"
                  }`}
                >
                  {st.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined animate-spin text-indigo-600 text-[32px]">
              sync
            </span>
            <p className="text-xs font-semibold text-slate-400 mt-2">Loading job directory...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2.5">
              <span className="material-symbols-outlined text-[24px]">work_outline</span>
            </div>
            <h3 className="text-sm font-bold text-slate-800">No job postings found</h3>
            <p className="text-xs text-slate-400 mt-0.5">No listings match the selected filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Job Title & Company</th>
                  <th className="py-3 px-4">Department & Mode</th>
                  <th className="py-3 px-4">Compensation</th>
                  <th className="py-3 px-4">Applications</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{job.title}</div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {job.companyName} • {job.location}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-700">{job.department || "Engineering"}</div>
                      <div className="text-[10.5px] text-slate-400">{job.workMode || "Hybrid"}</div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {job.salary || "Competitive"}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                        {job.applicationsCount || 0} applicants
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                          job.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : job.status === "Pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                            : job.status === "Rejected"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {formatDate(job.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedJob(job)}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Review
                        </button>

                        {job.status === "Pending" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(job._id, "Active")}
                            disabled={actionLoadingId === job._id}
                            className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                        )}

                        {job.status === "Active" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(job._id, "Paused")}
                            disabled={actionLoadingId === job._id}
                            className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Pause
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteJob(job._id, job.title)}
                          disabled={actionLoadingId === job._id}
                          className="p-1.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Job"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setSelectedJob(null)} />
          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Job Review</span>
                <h3 className="text-xl font-bold font-heading text-slate-900 mt-1">{selectedJob.title}</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  {selectedJob.companyName} • {selectedJob.location}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50">
                  <span className="text-[10.5px] text-slate-400 font-semibold">Department</span>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedJob.department}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50">
                  <span className="text-[10.5px] text-slate-400 font-semibold">Work Mode</span>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedJob.workMode}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50">
                  <span className="text-[10.5px] text-slate-400 font-semibold">Salary</span>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedJob.salary}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50">
                  <span className="text-[10.5px] text-slate-400 font-semibold">Status</span>
                  <div className="font-bold text-amber-600 mt-0.5">{selectedJob.status}</div>
                </div>
              </div>

              {selectedJob.description && (
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Description:</h4>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl whitespace-pre-line">
                    {selectedJob.description}
                  </p>
                </div>
              )}

              {selectedJob.skills && selectedJob.skills.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 mb-1.5">Required Skills:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.skills.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              {selectedJob.status !== "Rejected" && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedJob._id, "Rejected")}
                  disabled={actionLoadingId === selectedJob._id}
                  className="px-4 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-colors cursor-pointer"
                >
                  Reject
                </button>
              )}

              {selectedJob.status !== "Active" && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedJob._id, "Active")}
                  disabled={actionLoadingId === selectedJob._id}
                  className="px-5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Approve & Publish</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
