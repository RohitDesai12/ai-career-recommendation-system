import React, { useState, useEffect } from "react";
import axios from "axios";

interface ApplicationItem {
  _id: string;
  candidateName: string;
  candidateEmail: string;
  role: string;
  matchScore: number;
  skills: string[];
  experienceYears: number;
  status: "Applied" | "Shortlisted" | "Interview" | "Hired" | "Rejected";
  appliedAt: string;
  job?: {
    _id: string;
    title: string;
    companyName: string;
    location: string;
    salary: string;
  };
  employer?: {
    companyName: string;
    workEmail: string;
  };
}

export function AdminApplications() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "All") params.append("status", statusFilter);

      const res = await axios.get(`http://localhost:5000/api/admin/applications?${params.toString()}`);
      setApplications(res.data.applications || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications();
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
            Application Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline monitoring of all student candidate submissions across companies
          </p>
        </div>
        <div className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          Total Submissions: <span className="text-indigo-600 font-black">{total}</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search candidate name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
        </form>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
          {["All", "Applied", "Shortlisted", "Interview", "Hired", "Rejected"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined animate-spin text-indigo-600 text-[32px]">
              sync
            </span>
            <p className="text-xs font-semibold text-slate-400 mt-2">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2.5">
              <span className="material-symbols-outlined text-[24px]">folder_off</span>
            </div>
            <h3 className="text-sm font-bold text-slate-800">No applications recorded</h3>
            <p className="text-xs text-slate-400 mt-0.5">No candidate applications match the selected criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Role & Company</th>
                  <th className="py-3 px-4">AI Synergy</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Applied Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{app.candidateName}</div>
                      <div className="text-[11px] text-slate-400">{app.candidateEmail}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{app.job?.title || app.role}</div>
                      <div className="text-[11px] text-indigo-600 font-semibold">
                        {app.job?.companyName || app.employer?.companyName || "Employer"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-black text-[11px] border border-emerald-200/60">
                        {app.matchScore || 85}% Match
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {app.experienceYears ? `${app.experienceYears} yrs` : "Entry Level"}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                          app.status === "Shortlisted"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : app.status === "Interview"
                            ? "bg-purple-50 text-purple-700 border border-purple-200 animate-pulse"
                            : app.status === "Hired"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : app.status === "Rejected"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {formatDate(app.appliedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
