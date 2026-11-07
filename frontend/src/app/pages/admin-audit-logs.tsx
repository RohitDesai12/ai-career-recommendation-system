import React, { useState, useEffect } from "react";
import axios from "axios";

interface AuditLogItem {
  _id: string;
  adminName: string;
  action: string;
  target: string;
  targetType: "Job" | "Company" | "User" | "Application" | "Report" | "Content" | "System";
  details: string;
  ip: string;
  createdAt: string;
}

export function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (typeFilter !== "All") params.append("targetType", typeFilter);

      const res = await axios.get(`http://localhost:5000/api/admin/audit-logs?${params.toString()}`);
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const formatDate = (dStr: string) => {
    if (!dStr) return "N/A";
    const d = new Date(dStr);
    return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black font-heading text-slate-900 tracking-tight">
            Administrative Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of all job approvals, company verifications, role suspensions, and moderation actions
          </p>
        </div>
        <div className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          Recorded Events: <span className="text-indigo-600 font-black">{total}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search action, target, actor, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
        </form>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
          {["All", "Job", "Company", "User", "Report", "Content", "System"].map((tp) => (
            <button
              key={tp}
              type="button"
              onClick={() => setTypeFilter(tp)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                typeFilter === tp ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tp}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined animate-spin text-indigo-600 text-[32px]">
              sync
            </span>
            <p className="text-xs font-semibold text-slate-400 mt-2">Loading audit events...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2.5">
              <span className="material-symbols-outlined text-[24px]">history</span>
            </div>
            <h3 className="text-sm font-bold text-slate-800">No audit logs recorded</h3>
            <p className="text-xs text-slate-400 mt-0.5">Admin actions will automatically appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Admin / Actor</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{l.action}</td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700">{l.target || "N/A"}</td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10.5px] ${
                          l.targetType === "Job"
                            ? "bg-blue-50 text-blue-700"
                            : l.targetType === "Company"
                            ? "bg-purple-50 text-purple-700"
                            : l.targetType === "User"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {l.targetType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-800">{l.adminName || "System"}</td>

                    <td className="py-3.5 px-4 text-slate-600 max-w-sm truncate">{l.details}</td>

                    <td className="py-3.5 px-4 text-right text-slate-400 font-medium">
                      {formatDate(l.createdAt)}
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
