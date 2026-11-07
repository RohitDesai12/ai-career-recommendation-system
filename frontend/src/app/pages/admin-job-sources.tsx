import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Cloud,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Filter,
  Check,
  X,
  Layers,
  Database,
  ArrowUpRight,
  Plus
} from "lucide-react";

interface SourceItem {
  _id: string;
  sourceId: string;
  sourceName: string;
  sourceType: string;
  companyName: string;
  boardToken?: string;
  feedUrl?: string;
  isActive: boolean;
  syncFrequencyMinutes: number;
  lastAttemptedSync?: string;
  lastSuccessfulSync?: string;
  nextScheduledSync?: string;
  failureCount: number;
  lastError?: string;
  totalJobsDiscovered: number;
  activeJobsCount: number;
}

interface IngestionLog {
  _id: string;
  sourceId: string;
  sourceName: string;
  sourceType: string;
  companyName: string;
  status: "SUCCESS" | "PARTIAL" | "FAILED";
  jobsFetched: number;
  jobsAccepted: number;
  jobsRejected: number;
  newJobsCreated: number;
  existingJobsUpdated: number;
  duplicateJobsDetected: number;
  jobsExpired: number;
  executionDurationMs: number;
  triggerType: "SCHEDULED" | "MANUAL";
  createdAt: string;
  errorLog?: { timestamp: string; message: string }[];
}

interface OverviewData {
  totalSources: number;
  activeSources: number;
  disabledSources: number;
  failedSources: number;
  healthySources: number;
  totalDiscovered: number;
  activeJobs: number;
  lastSyncTime?: string;
  lastSyncStatus: string;
}

export function AdminJobSources() {
  const [activeSubTab, setActiveSubTab] = useState<"sources" | "quality">("sources");
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [logs, setLogs] = useState<IngestionLog[]>([]);
  const [quality, setQuality] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncingSourceId, setSyncingSourceId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Review Jobs State
  const [reviewJobs, setReviewJobs] = useState<any[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [qualityFilter, setQualityFilter] = useState("Needs Review");

  // New source modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSourceId, setNewSourceId] = useState("");
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceType, setNewSourceType] = useState("ATS_GREENHOUSE");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newBoardToken, setNewBoardToken] = useState("");
  const [newFeedUrl, setNewFeedUrl] = useState("");

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadReviewJobs = async (status = qualityFilter) => {
    setReviewLoading(true);
    try {
      const headers = getAuthHeader();
      const res = await axios.get(`http://localhost:5000/api/admin/job-sources/review-jobs?status=${encodeURIComponent(status)}&limit=25`, { headers });
      setReviewJobs(res.data.jobs || []);
    } catch (err) {
      console.error("Error loading review jobs:", err);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleOverrideQuality = async (jobId: string, newQuality: string) => {
    try {
      const headers = getAuthHeader();
      await axios.patch(`http://localhost:5000/api/admin/job-sources/jobs/${jobId}/quality-status`, { status: newQuality }, { headers });
      setActionMessage(`Job marked as ${newQuality}`);
      setTimeout(() => setActionMessage(null), 3000);
      loadReviewJobs(qualityFilter);
      loadData();
    } catch (err: any) {
      alert(`Error updating quality: ${err.response?.data?.msg || err.message}`);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeader();

      const [overviewRes, sourcesRes, logsRes, qualityRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/job-sources/overview", { headers }).catch(() => null),
        axios.get("http://localhost:5000/api/admin/job-sources", { headers }).catch(() => null),
        axios.get("http://localhost:5000/api/admin/job-sources/logs?limit=15", { headers }).catch(() => null),
        axios.get("http://localhost:5000/api/admin/job-sources/quality", { headers }).catch(() => null)
      ]);

      if (overviewRes?.data) setOverview(overviewRes.data);
      if (sourcesRes?.data?.sources) setSources(sourcesRes.data.sources);
      if (logsRes?.data?.logs) setLogs(logsRes.data.logs);
      if (qualityRes?.data) setQuality(qualityRes.data);
    } catch (err) {
      console.error("Error loading job sources telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeSubTab === "quality") {
      loadReviewJobs(qualityFilter);
    }
  }, [activeSubTab, qualityFilter]);

  const handleToggle = async (sourceId: string) => {
    try {
      const headers = getAuthHeader();
      const res = await axios.patch(`http://localhost:5000/api/admin/job-sources/${sourceId}/toggle`, {}, { headers });
      setActionMessage(res.data.msg);
      setTimeout(() => setActionMessage(null), 4000);
      loadData();
    } catch (err: any) {
      setActionMessage(`Error toggling source: ${err.response?.data?.msg || err.message}`);
    }
  };

  const handleManualSync = async (sourceId: string) => {
    try {
      setSyncingSourceId(sourceId);
      const headers = getAuthHeader();
      const res = await axios.post(`http://localhost:5000/api/admin/job-sources/${sourceId}/sync`, {}, { headers });
      const t = res.data.telemetry;
      setActionMessage(`Sync Completed: ${t.jobsFetched} fetched, ${t.newJobsCreated} created, ${t.existingJobsUpdated} updated, ${t.duplicateJobsDetected} duplicates.`);
      loadData();
    } catch (err: any) {
      setActionMessage(`Sync error: ${err.response?.data?.msg || err.message}`);
    } finally {
      setSyncingSourceId(null);
    }
  };

  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = getAuthHeader();
      await axios.post(
        "http://localhost:5000/api/admin/job-sources",
        {
          sourceId: newSourceId,
          sourceName: newSourceName,
          sourceType: newSourceType,
          companyName: newCompanyName,
          boardToken: newBoardToken,
          feedUrl: newFeedUrl
        },
        { headers }
      );
      setIsAddModalOpen(false);
      setNewSourceId("");
      setNewSourceName("");
      setNewCompanyName("");
      setNewBoardToken("");
      setNewFeedUrl("");
      setActionMessage("Source created successfully");
      loadData();
    } catch (err: any) {
      alert(`Error creating source: ${err.response?.data?.msg || err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Cloud className="w-7 h-7 text-indigo-600" />
            <span>Job Data Ingestion Infrastructure</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated discovery, normalization, and quality telemetry from authorized public ATS endpoints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Source</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Configured Sources</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{overview?.totalSources || 0}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {overview?.activeSources || 0} Active • {overview?.disabledSources || 0} Disabled
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Source Health</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {overview?.healthySources || 0} Healthy
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {overview?.failedSources || 0} sources with sync errors
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Discovered Jobs</span>
            <Database className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {overview?.totalDiscovered || quality?.statusCounts?.active || 0}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {quality?.statusCounts?.active || 0} currently Active
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Last Sync</span>
            <RefreshCw className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-sm font-bold text-slate-900 truncate">
            {overview?.lastSyncTime
              ? new Date(overview.lastSyncTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Never"}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Status: <span className="font-bold text-indigo-600">{overview?.lastSyncStatus || "IDLE"}</span>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveSubTab("sources")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeSubTab === "sources"
              ? "border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Configured Sources & Logs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("quality")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeSubTab === "quality"
              ? "border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Data Quality Intelligence & Audit</span>
        </button>
      </div>

      {activeSubTab === "sources" ? (
        <>
          {/* Configured Sources Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Configured ATS & Feed Endpoints</h2>
                <p className="text-xs text-slate-500 mt-0.5">Legitimately verified sources with independent scheduling</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Source & Company</th>
                    <th className="py-3 px-4">Adapter Type</th>
                    <th className="py-3 px-4">Board Token</th>
                    <th className="py-3 px-4">Discovered Jobs</th>
                    <th className="py-3 px-4">Last Sync</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sources.map((src) => (
                    <tr key={src.sourceId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div>{src.sourceName}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{src.companyName}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {src.sourceType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                        {src.boardToken || src.feedUrl || "—"}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {src.totalJobsDiscovered} jobs
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {src.lastSuccessfulSync
                          ? new Date(src.lastSuccessfulSync).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                          : "Never"}
                      </td>
                      <td className="py-3.5 px-4">
                        {src.failureCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Failed ({src.failureCount})</span>
                          </span>
                        ) : src.isActive ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 font-semibold text-[11px]">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Disabled</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggle(src.sourceId)}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                            title={src.isActive ? "Disable Source" : "Enable Source"}
                          >
                            {src.isActive ? (
                              <ToggleRight className="w-5 h-5 text-indigo-600" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-slate-400" />
                            )}
                          </button>

                          <button
                            type="button"
                            disabled={syncingSourceId === src.sourceId || !src.isActive}
                            onClick={() => handleManualSync(src.sourceId)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                          >
                            <Play className={`w-3 h-3 ${syncingSourceId === src.sourceId ? "animate-spin" : ""}`} />
                            <span>{syncingSourceId === src.sourceId ? "Syncing..." : "Sync Now"}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ingestion Audit Logs */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Recent Ingestion Audit Trail</h2>
              <p className="text-xs text-slate-500 mt-0.5">Execution logs showing jobs fetched, upserted, and duration</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Trigger</th>
                    <th className="py-3 px-4">Fetched</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4">Updated</th>
                    <th className="py-3 px-4">Duplicates</th>
                    <th className="py-3 px-4">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400 font-medium text-xs">
                        No ingestion logs recorded yet. Trigger a sync above to create an audit record.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 text-slate-500 text-[11px] font-mono">
                          {new Date(log.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {log.sourceName}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              log.status === "SUCCESS"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : log.status === "PARTIAL"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-[11px]">
                          {log.triggerType}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{log.jobsFetched}</td>
                        <td className="py-3 px-4 text-emerald-600 font-semibold">{log.newJobsCreated}</td>
                        <td className="py-3 px-4 text-indigo-600 font-semibold">{log.existingJobsUpdated}</td>
                        <td className="py-3 px-4 text-slate-500">{log.duplicateJobsDetected}</td>
                        <td className="py-3 px-4 text-slate-500 text-[11px] font-mono">
                          {log.executionDurationMs}ms
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Data Quality Intelligence & Review View */
        <div className="space-y-6">
          {/* Quality Breakdown KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">High Quality</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-600">
                {quality?.dataQualityCounts?.HighQuality || 0}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                Complete metadata, verified URLs & skills
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Acceptable</span>
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-600">
                {quality?.dataQualityCounts?.Acceptable || 0}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                Usable description, valid application portal
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Needs Review</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-600">
                {quality?.dataQualityCounts?.NeedsReview || 0}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                Short description or missing skill tags
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Invalid / Rejected</span>
                <XCircle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-600">
                {quality?.dataQualityCounts?.Invalid || 0}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                Broken URLs or insufficient data
              </div>
            </div>
          </div>

          {/* Distribution Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Top Sourced Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {(quality?.topCategories || []).slice(0, 8).map((cat: any) => (
                  <span
                    key={cat._id || "Other"}
                    className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                  >
                    <span>{cat._id || "General Engineering"}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                      {cat.count}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Top Active Sourced Companies
              </h3>
              <div className="flex flex-wrap gap-2">
                {(quality?.topCompanies || []).slice(0, 8).map((comp: any) => (
                  <span
                    key={comp._id || "Company"}
                    className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                  >
                    <span>{comp._id}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                      {comp.count}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Job Quality Audit Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Job Quality Inspection & Manual Override</h2>
                <p className="text-xs text-slate-500 mt-0.5">Audit deterministic quality evaluation and apply administrative overrides</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Status:</span>
                <select
                  value={qualityFilter}
                  onChange={(e) => setQualityFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
                >
                  <option value="Needs Review">Needs Review</option>
                  <option value="Invalid">Invalid</option>
                  <option value="Acceptable">Acceptable</option>
                  <option value="High Quality">High Quality</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Job Role & Company</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4">Quality Score</th>
                    <th className="py-3 px-4">Evaluation Details</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reviewLoading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-medium text-xs">
                        <RefreshCw className="w-4 h-4 animate-spin mx-auto text-indigo-600 mb-1" />
                        <span>Loading jobs for audit...</span>
                      </td>
                    </tr>
                  ) : reviewJobs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-medium text-xs">
                        No jobs currently flagged under "{qualityFilter}".
                      </td>
                    </tr>
                  ) : (
                    reviewJobs.map((job) => (
                      <tr key={job._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          <div>{job.title}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{job.companyName}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{job.category || "General"}</td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{job.sourceType}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900">
                            {job.qualityDetails?.qualityScore ?? 80}/100
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[11px] text-slate-500">
                          {job.validationErrors && job.validationErrors.length > 0 ? (
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              {job.validationErrors.join("; ")}
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-semibold">Passed standard criteria</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOverrideQuality(job._id, "High Quality")}
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] transition-all cursor-pointer"
                              title="Mark as High Quality"
                            >
                              High Quality
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOverrideQuality(job._id, "Acceptable")}
                              className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] transition-all cursor-pointer"
                              title="Mark as Acceptable"
                            >
                              Acceptable
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOverrideQuality(job._id, "Invalid")}
                              className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] transition-all cursor-pointer"
                              title="Mark as Invalid"
                            >
                              Invalid
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
        </div>
      )}

      {/* Add Source Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Configure New Job Source</h3>
            <p className="text-xs text-slate-500 mb-4">Add a verified public ATS board identifier or authorized feed</p>

            <form onSubmit={handleCreateSource} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Source ID (slug)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. gh_docker"
                  value={newSourceId}
                  onChange={(e) => setNewSourceId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Source Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Docker Greenhouse ATS"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Adapter Type</label>
                  <select
                    value={newSourceType}
                    onChange={(e) => setNewSourceType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="ATS_GREENHOUSE">Greenhouse ATS</option>
                    <option value="ATS_LEVER">Lever ATS</option>
                    <option value="JSON_FEED">JSON Feed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Docker"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {newSourceType !== "JSON_FEED" ? (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Verified Board Token</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. docker (from boards.greenhouse.io/docker)"
                    value={newBoardToken}
                    onChange={(e) => setNewBoardToken(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Authorized Feed URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/jobs.json"
                    value={newFeedUrl}
                    onChange={(e) => setNewFeedUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Save Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

