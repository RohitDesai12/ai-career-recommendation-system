import React, { useState, useEffect } from "react";
import axios from "axios";

interface ReportItem {
  _id: string;
  reporterName: string;
  reporterEmail: string;
  reportedItem: string;
  itemType: "Job" | "Company" | "User" | "Content";
  reason: string;
  details: string;
  status: "Pending" | "Under Review" | "Resolved" | "Dismissed";
  resolutionNotes?: string;
  resolvedBy?: string;
  createdAt: string;
}

export function AdminModeration() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "All") params.append("status", statusFilter);

      const res = await axios.get(`http://localhost:5000/api/admin/reports?${params.toString()}`);
      setReports(res.data.reports || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Error fetching moderation reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleResolveReport = async (reportId: string, status: "Resolved" | "Dismissed") => {
    setActionLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/admin/reports/${reportId}`, {
        status,
        resolutionNotes,
      });
      setSelectedReport(null);
      setResolutionNotes("");
      await fetchReports();
    } catch (err) {
      console.error("Error resolving report:", err);
    } finally {
      setActionLoading(false);
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
            Moderation & Safety Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review user-flagged listings, verify reported company accounts, and enforce platform trust
          </p>
        </div>
        <div className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          Open Reports: <span className="text-rose-600 font-black">{reports.filter((r) => r.status === "Pending").length}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl w-fit">
        {["All", "Pending", "Under Review", "Resolved", "Dismissed"].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === st ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined animate-spin text-indigo-600 text-[32px]">
              sync
            </span>
            <p className="text-xs font-semibold text-slate-400 mt-2">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2.5">
              <span className="material-symbols-outlined text-[24px]">verified_user</span>
            </div>
            <h3 className="text-sm font-bold text-slate-800">All clear! No reports found</h3>
            <p className="text-xs text-slate-400 mt-0.5">There are currently no active moderation issues.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Reported Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Reporter</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((rep) => (
                  <tr key={rep._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{rep.reportedItem}</td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10.5px] ${
                          rep.itemType === "Job"
                            ? "bg-blue-50 text-blue-700"
                            : rep.itemType === "Company"
                            ? "bg-purple-50 text-purple-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {rep.itemType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700 max-w-xs truncate">
                      {rep.reason}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{rep.reporterName || "Anonymous"}</div>
                      {rep.reporterEmail && <div className="text-[10.5px] text-slate-400">{rep.reporterEmail}</div>}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                          rep.status === "Pending"
                            ? "bg-rose-50 text-rose-700 border border-rose-200 animate-pulse"
                            : rep.status === "Resolved"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {rep.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {formatDate(rep.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedReport(rep)}
                        className="px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review & Resolution Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setSelectedReport(null)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 z-10">
            <h3 className="text-lg font-bold font-heading text-slate-900 mb-1">
              Review Moderation Report
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Investigate the flagged item and specify the administrative action taken.
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-50 space-y-2 text-xs mb-4">
              <div>
                <span className="text-slate-400 font-bold">Reported Item:</span>{" "}
                <span className="font-bold text-slate-800">{selectedReport.reportedItem}</span> ({selectedReport.itemType})
              </div>
              <div>
                <span className="text-slate-400 font-bold">Reason:</span>{" "}
                <span className="font-semibold text-rose-600">{selectedReport.reason}</span>
              </div>
              {selectedReport.details && (
                <div>
                  <span className="text-slate-400 font-bold">Details:</span>{" "}
                  <span className="text-slate-700">{selectedReport.details}</span>
                </div>
              )}
            </div>

            <div className="space-y-3 text-xs mb-4">
              <label className="block font-bold text-slate-700">Resolution Notes</label>
              <textarea
                rows={3}
                placeholder="Detail resolution outcome (e.g. Job listing reviewed and approved, or employer notified)..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => handleResolveReport(selectedReport._id, "Dismissed")}
                disabled={actionLoading}
                className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
              >
                Dismiss Report
              </button>
              <button
                type="button"
                onClick={() => handleResolveReport(selectedReport._id, "Resolved")}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-sm"
              >
                {actionLoading ? "Resolving..." : "Mark Resolved"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
