import React, { useState, useEffect } from "react";
import axios from "axios";

interface AnalyticsData {
  range: string;
  totalUsersInRange: number;
  totalJobsInRange: number;
  totalAppsInRange: number;
  timeline: Array<{
    date: string;
    users: number;
    jobs: number;
    applications: number;
  }>;
}

export function AdminReportsAnalytics() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/analytics?range=${range}`);
      setData(res.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const ranges = [
    { id: "7d", label: "7 Days" },
    { id: "30d", label: "30 Days" },
    { id: "3m", label: "3 Months" },
    { id: "6m", label: "6 Months" },
    { id: "1y", label: "1 Year" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header & Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black font-heading text-slate-900 tracking-tight">
            Platform Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated growth trends, candidate application velocity, and student platform adoption metrics
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
          {ranges.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                range === r.id ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-indigo-600 text-[36px]">
            sync
          </span>
        </div>
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-400">New Users ({range.toUpperCase()})</span>
              <div className="text-3xl font-black text-slate-900 mt-2">{data.totalUsersInRange}</div>
              <span className="text-[11px] font-bold text-blue-600 mt-1 block">Registered in period</span>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-400">New Job Postings ({range.toUpperCase()})</span>
              <div className="text-3xl font-black text-slate-900 mt-2">{data.totalJobsInRange}</div>
              <span className="text-[11px] font-bold text-emerald-600 mt-1 block">Created in period</span>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-400">Candidate Applications ({range.toUpperCase()})</span>
              <div className="text-3xl font-black text-slate-900 mt-2">{data.totalAppsInRange}</div>
              <span className="text-[11px] font-bold text-amber-600 mt-1 block">Submitted in period</span>
            </div>
          </div>

          {/* Timeline Activity Chart */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-bold font-heading text-slate-900 mb-1">
              Activity Trajectory Over Time
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Distribution of user signups, job vacancies, and student applications by date
            </p>

            {data.timeline.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 font-medium">
                No activity data recorded in the selected date window.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {data.timeline.slice(-6).map((t, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                      <span className="text-[10.5px] font-bold text-slate-400">{t.date}</span>
                      <div className="space-y-1 mt-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-blue-600 font-semibold">Users:</span>
                          <span className="font-bold text-slate-800">{t.users}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-emerald-600 font-semibold">Jobs:</span>
                          <span className="font-bold text-slate-800">{t.jobs}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-amber-600 font-semibold">Apps:</span>
                          <span className="font-bold text-slate-800">{t.applications}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
