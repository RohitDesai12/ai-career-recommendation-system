import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import axios from "axios";
import { useAuth } from "../context/auth-context";

interface DashboardData {
  metrics: {
    totalUsers: number;
    totalStudents: number;
    activeJobs: number;
    totalApplications: number;
    userGrowthPct: string;
    jobGrowthPct: string;
    appGrowthPct: string;
  };
  pendingApprovals: {
    reportedContent: number;
    userVerifications: number;
  };
  platformGrowth: Array<{
    month: string;
    users: number;
    jobs: number;
    applications: number;
  }>;
  userDistribution: {
    total: number;
    students: number;
    admins: number;
  };
  recentActivities: Array<{
    _id: string;
    adminName: string;
    action: string;
    target: string;
    targetType: string;
    details: string;
    createdAt: string;
  }>;
}

export function AdminDashboard() {
  const { user } = useAuth();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [growthMetric, setGrowthMetric] = useState<"users" | "jobs" | "applications">("users");

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/dashboard");
      setData(res.data);
    } catch (err) {
      console.error("Error loading admin dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formattedToday = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return "Just now";
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading || !data) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-indigo-600 text-[36px]">
            sync
          </span>
          <p className="text-xs font-semibold text-slate-500">Loading platform metrics...</p>
        </div>
      </div>
    );
  }

  const { metrics, pendingApprovals, platformGrowth, userDistribution, recentActivities } = data;

  // Max value for SVG area chart scaling
  const maxGrowthValue = Math.max(
    ...platformGrowth.map((p) => (growthMetric === "users" ? p.users : growthMetric === "jobs" ? p.jobs : p.applications)),
    10
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* 1. Top Greeting & Date Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight flex items-center gap-2">
            <span>Welcome back, {user?.name || "Admin"}</span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Here's what's happening on Career Compass today.
          </p>
        </div>

        <div className="text-left md:text-right">
          <div className="text-xs sm:text-sm font-bold text-slate-800">{formattedToday}</div>
          <p className="text-[11px] text-indigo-600 font-bold uppercase tracking-wider mt-0.5">
            Manage. Monitor. Grow.
          </p>
        </div>
      </div>

      {/* 2. Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Users */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">group</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              <span>{metrics.userGrowthPct || "0%"}</span>
              <span className="text-slate-400 font-normal">vs last mo</span>
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
              {(metrics.totalUsers || 0).toLocaleString()}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Total Platform Users</p>
          </div>
        </div>

        {/* Card 2: Enrolled Students */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">school</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              <span>Verified</span>
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
              {(metrics.totalStudents || 0).toLocaleString()}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Enrolled Students</p>
          </div>
        </div>

        {/* Card 3: Total Applications */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">description</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              <span>{metrics.appGrowthPct || "0%"}</span>
              <span className="text-slate-400 font-normal">vs last mo</span>
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
              {(metrics.totalApplications || 0).toLocaleString()}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Student Submissions</p>
          </div>
        </div>

        {/* Card 4: Active Career Opportunities */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">work</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              <span>{metrics.jobGrowthPct || "0%"}</span>
              <span className="text-slate-400 font-normal">vs last mo</span>
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
              {(metrics.activeJobs || 0).toLocaleString()}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Active Career Opportunities</p>
          </div>
        </div>
      </div>

      {/* 3. Middle Row: Platform Growth Area Chart & User Distribution Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Platform Growth Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-bold font-heading text-slate-900">Platform Growth</h2>
              <p className="text-xs text-slate-400 mt-0.5">Real verified student and activity registration volume</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGrowthMetric("users")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  growthMetric === "users" ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Users
              </button>
              <button
                type="button"
                onClick={() => setGrowthMetric("jobs")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  growthMetric === "jobs" ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Jobs
              </button>
              <button
                type="button"
                onClick={() => setGrowthMetric("applications")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  growthMetric === "applications" ? "bg-amber-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Applications
              </button>
            </div>
          </div>

          {/* Dynamic SVG Area Chart */}
          <div className="w-full h-56 relative pt-4 pb-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={growthMetric === "users" ? "#4f46e5" : growthMetric === "jobs" ? "#10b981" : "#f59e0b"}
                    stopOpacity="0.3"
                  />
                  <stop
                    offset="100%"
                    stopColor={growthMetric === "users" ? "#4f46e5" : growthMetric === "jobs" ? "#10b981" : "#f59e0b"}
                    stopOpacity="0.0"
                  />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 40, 80, 120, 160].map((y) => (
                <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
              ))}

              {/* Calculate Points */}
              {(() => {
                const points = platformGrowth.map((p, idx) => {
                  const val = growthMetric === "users" ? p.users : growthMetric === "jobs" ? p.jobs : p.applications;
                  const x = (idx / (platformGrowth.length - 1)) * 480 + 10;
                  const y = 150 - (val / (maxGrowthValue || 1)) * 130;
                  return { x, y, val, month: p.month };
                });

                const dPath = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x},${pt.y}`, "");
                const areaPath = `${dPath} L ${points[points.length - 1].x},160 L ${points[0].x},160 Z`;
                const strokeColor = growthMetric === "users" ? "#4f46e5" : growthMetric === "jobs" ? "#10b981" : "#f59e0b";

                return (
                  <>
                    <path d={areaPath} fill="url(#growthGradient)" />
                    <path d={dPath} fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
                    {points.map((pt, i) => (
                      <g key={i}>
                        <circle cx={pt.x} cy={pt.y} r="4" fill="#ffffff" stroke={strokeColor} strokeWidth="2.5" />
                        <text x={pt.x} y="158" textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="600">
                          {pt.month}
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* User Distribution & Mission Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
          {/* User Distribution Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-bold font-heading text-slate-900 mb-4">User Distribution</h2>
            <div className="space-y-4">
              {/* Students */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-2 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span>Students</span>
                  </span>
                  <span className="text-slate-900">
                    {userDistribution.students}{" "}
                    <span className="text-slate-400 font-normal">
                      ({userDistribution.total > 0 ? Math.round((userDistribution.students / userDistribution.total) * 100) : 100}%)
                    </span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${userDistribution.total > 0 ? Math.round((userDistribution.students / userDistribution.total) * 100) : 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Admins */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-2 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                    <span>Administrators</span>
                  </span>
                  <span className="text-slate-900">
                    {userDistribution.admins}{" "}
                    <span className="text-slate-400 font-normal">
                      ({userDistribution.total > 0 ? Math.round((userDistribution.admins / userDistribution.total) * 100) : 0}%)
                    </span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${userDistribution.total > 0 ? Math.round((userDistribution.admins / userDistribution.total) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mission Card */}
          <div className="bg-white rounded-3xl p-5 border border-purple-100/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
              </div>
              <div>
                <h3 className="text-sm font-bold font-heading text-slate-900">Making Careers Brighter</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Monitor platform operations, user accounts, and AI learning intelligence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Pending Approvals & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Pending Approvals (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <h2 className="text-base font-bold font-heading text-slate-900 mb-4">Pending Approvals & Moderation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/admin/moderation?status=Pending"
              className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 hover:border-amber-300 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-amber-600">
                <span className="material-symbols-outlined text-[22px]">flag</span>
                <span className="text-2xl font-black">{pendingApprovals?.reportedContent || 0}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-700 block mt-2">Reported Content</span>
                <span className="text-[10.5px] text-slate-400">Moderation flags requiring review</span>
              </div>
            </Link>

            <Link
              to="/admin/users"
              className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-blue-600">
                <span className="material-symbols-outlined text-[22px]">verified_user</span>
                <span className="text-2xl font-black">{pendingApprovals?.userVerifications || 0}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-700 block mt-2">User Verifications</span>
                <span className="text-[10.5px] text-slate-400">Student account credentials</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Actions (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <h2 className="text-base font-bold font-heading text-slate-900 mb-4">Platform Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/admin/users"
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 transition-all flex items-center gap-2.5 group"
            >
              <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-indigo-600">
                group
              </span>
              <span className="text-xs font-bold">Manage Users</span>
            </Link>

            <Link
              to="/admin/analytics"
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 transition-all flex items-center gap-2.5 group"
            >
              <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-indigo-600">
                analytics
              </span>
              <span className="text-xs font-bold">View Reports</span>
            </Link>

            <Link
              to="/admin/content"
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 transition-all flex items-center gap-2.5 group"
            >
              <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-indigo-600">
                menu_book
              </span>
              <span className="text-xs font-bold">Content Studio</span>
            </Link>

            <Link
              to="/admin/system"
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 transition-all flex items-center gap-2.5 group"
            >
              <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-indigo-600">
                dns
              </span>
              <span className="text-xs font-bold">System Status</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Administrative Activity Feed */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold font-heading text-slate-900">Recent Platform Activities</h2>
            <p className="text-xs text-slate-400 mt-0.5">Platform administrative audit event stream</p>
          </div>
          <Link
            to="/admin/audit-logs"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {recentActivities.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-medium">
            No administrative activities recorded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentActivities.slice(0, 8).map((act) => (
              <div key={act._id} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-colors">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs ${
                    act.targetType === "User"
                      ? "bg-blue-50 text-blue-600"
                      : act.targetType === "Content"
                      ? "bg-purple-50 text-purple-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {act.targetType === "User"
                      ? "person"
                      : act.targetType === "Content"
                      ? "menu_book"
                      : "flag"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{act.action}</div>
                  <div className="text-[11px] text-slate-500 truncate">{act.target || act.details}</div>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                  {formatTimeAgo(act.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;