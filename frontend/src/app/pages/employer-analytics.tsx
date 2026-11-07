import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import axios from "axios";
import {
  TrendingUp,
  Briefcase,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  PieChart,
  BarChart3,
  Filter
} from "lucide-react";

interface JobAnalyticsItem {
  _id: string;
  title: string;
  department?: string;
  applicationsCount: number;
  shortlistedCount: number;
  interviewCount: number;
  hiredCount: number;
  status: "Active" | "Paused" | "Closed";
  createdAt: string;
}

interface TrendPoint {
  date: string;
  label: string;
  applications: number;
}

interface FunnelStep {
  stage: string;
  count: number;
  percentage: number;
}

export function EmployerAnalytics() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "6m">("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [kpis, setKpis] = useState({
    activeJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    interviewsScheduled: 0,
    hired: 0,
    rejected: 0,
  });

  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [funnel, setFunnel] = useState<FunnelStep[]>([]);
  const [jobPerformance, setJobPerformance] = useState<JobAnalyticsItem[]>([]);
  const [sources, setSources] = useState<{ source: string; count: number; percentage: number }[]>([]);

  const fetchAnalyticsData = async (range = timeRange) => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");

    try {
      const res = await axios.get(`http://localhost:5000/api/employer/analytics?range=${range}`, {
        headers: { "x-auth-token": token || "" },
      });

      if (res.data) {
        setKpis(res.data.kpis || {
          activeJobs: 0,
          totalApplications: 0,
          shortlisted: 0,
          interviewsScheduled: 0,
          hired: 0,
          rejected: 0,
        });
        setTrends(res.data.trends || []);
        setFunnel(res.data.funnel || []);
        setJobPerformance(res.data.jobPerformance || []);
        setSources(res.data.sources || []);
      }
    } catch (err: any) {
      console.error("Failed to load recruiter analytics:", err);
      setError(err?.response?.data?.message || "Failed to load hiring analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData(timeRange);
  }, [timeRange]);

  // Compute SVG coordinates for trend chart
  const maxApplications = Math.max(...trends.map((t) => t.applications), 1);
  const chartHeight = 160;
  const chartWidth = 600;

  const points = trends.map((t, idx) => {
    const x = trends.length > 1 ? (idx / (trends.length - 1)) * (chartWidth - 40) + 20 : chartWidth / 2;
    const y = chartHeight - (t.applications / maxApplications) * (chartHeight - 40) - 20;
    return { x, y, ...t };
  });

  const pathD = points.length > 0
    ? points.reduce((acc, pt, idx) => `${acc} ${idx === 0 ? "M" : "L"} ${pt.x} ${pt.y}`, "")
    : "";

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`
    : "";

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hiring Analytics & Insights</h1>
          </div>
          <p className="text-sm text-slate-500">
            Real-time recruiting pipeline performance, application velocity, and hiring funnel conversion.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
          {(
            [
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "90d", label: "90 Days" },
              { id: "6m", label: "6 Months" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeRange(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeRange === t.id
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              {t.label}
            </button>
          ))}
          <button
            onClick={() => fetchAnalyticsData(timeRange)}
            title="Refresh Analytics"
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-purple-600" : ""}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-28 bg-white rounded-3xl border border-slate-200 p-5 animate-pulse" />
            ))}
          </div>
          <div className="h-80 bg-white rounded-3xl border border-slate-200 p-8 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        </div>
      ) : error ? (
        <div className="p-8 bg-white rounded-3xl border border-rose-200 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">Unable to load hiring analytics</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => fetchAnalyticsData(timeRange)}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* 1. Hiring Overview KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Jobs</p>
                <h3 className="text-2xl font-black text-slate-900">{kpis.activeJobs}</h3>
              </div>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Applications</p>
                <h3 className="text-2xl font-black text-purple-600">{kpis.totalApplications}</h3>
              </div>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shortlisted</p>
                <h3 className="text-2xl font-black text-indigo-600">{kpis.shortlisted}</h3>
              </div>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Interviews</p>
                <h3 className="text-2xl font-black text-amber-600">{kpis.interviewsScheduled}</h3>
              </div>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hired</p>
                <h3 className="text-2xl font-black text-emerald-600">{kpis.hired}</h3>
              </div>
            </div>
          </div>

          {/* 2. Charts Section: Application Trend & Conversion Funnel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Application Velocity Trend */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Application Velocity Trend</h3>
                  <p className="text-xs text-slate-500">Volume of candidate submissions over selected period</p>
                </div>
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  {kpis.totalApplications} total submissions
                </span>
              </div>

              {trends.length === 0 || kpis.totalApplications === 0 ? (
                <div className="h-48 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center p-6">
                  <BarChart3 className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-600">Not enough application data yet</p>
                  <p className="text-[11px] text-slate-400">Trend lines will render as candidates apply</p>
                </div>
              ) : (
                <div className="w-full overflow-hidden">
                  <div className="relative w-full h-48">
                    <svg
                      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                      className="w-full h-full overflow-visible"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#9333ea" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#9333ea" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Area Fill */}
                      <path d={areaD} fill="url(#purpleGradient)" />

                      {/* Line Stroke */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#9333ea"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Data Point Dots */}
                      {points.map((pt, idx) => (
                        <g key={idx} className="group">
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="4"
                            className="fill-white stroke-purple-600 stroke-2 hover:r-6 transition-all"
                          />
                        </g>
                      ))}
                    </svg>
                  </div>

                  {/* X-axis labels */}
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mt-2 px-2">
                    {trends.slice(0, 6).map((t, idx) => (
                      <span key={idx}>{t.label || t.date}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Col: Recruitment Funnel */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-900">Application Funnel</h3>
                <p className="text-xs text-slate-500">Candidate progression & stage conversion</p>
              </div>

              {funnel.length === 0 || kpis.totalApplications === 0 ? (
                <div className="h-48 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center p-6">
                  <Layers className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-600">No funnel data yet</p>
                  <p className="text-[11px] text-slate-400">Funnel steps will display when applications are reviewed</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {funnel.map((step, idx) => {
                    const colors = [
                      "bg-purple-600 text-purple-600",
                      "bg-blue-600 text-blue-600",
                      "bg-indigo-600 text-indigo-600",
                      "bg-amber-500 text-amber-500",
                      "bg-emerald-600 text-emerald-600",
                    ];
                    const colorClass = colors[idx % colors.length];

                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700">{step.stage}</span>
                          <span className="font-black text-slate-900">
                            {step.count} <span className="text-[10px] text-slate-400 font-semibold">({step.percentage}%)</span>
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${colorClass.split(" ")[0]}`}
                            style={{ width: `${Math.max(step.percentage, step.count > 0 ? 6 : 0)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 3. Job Performance Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">Job Performance Breakdown</h3>
                <p className="text-xs text-slate-500">Compare pipeline efficiency across all your active and closed roles</p>
              </div>
            </div>

            {jobPerformance.length === 0 ? (
              <div className="p-12 text-center">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No jobs posted yet</p>
                <p className="text-xs text-slate-400">Post a job to start gathering role-specific performance metrics.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-6">Job Title</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-center">Applications</th>
                      <th className="py-3.5 px-4 text-center">Shortlisted</th>
                      <th className="py-3.5 px-4 text-center">Interviews</th>
                      <th className="py-3.5 px-4 text-center">Hired</th>
                      <th className="py-3.5 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                    {jobPerformance.map((job) => (
                      <tr key={job._id} className="hover:bg-slate-50/80 transition-all">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">{job.title}</div>
                          <div className="text-[11px] text-slate-400 font-normal">
                            {job.department || "General"} • Posted {new Date(job.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              job.status === "Active"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : job.status === "Paused"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {job.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-slate-900">{job.applicationsCount}</td>
                        <td className="py-4 px-4 text-center text-indigo-600 font-bold">{job.shortlistedCount}</td>
                        <td className="py-4 px-4 text-center text-amber-600 font-bold">{job.interviewCount}</td>
                        <td className="py-4 px-4 text-center text-emerald-600 font-bold">{job.hiredCount}</td>
                        <td className="py-4 px-6 text-right">
                          <Link
                            to={`/employer/applicants`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700"
                          >
                            View Applicants
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default EmployerAnalytics;
