import React, { useState, useEffect } from "react";
import axios from "axios";

interface AIStatsData {
  totalProfilesAnalyzed: number;
  totalAtsScans: number;
  avgAtsScore: number;
  topRecommendedCareers: Array<{ title: string; count: number }>;
  topSkills: Array<{ skill: string; count: number }>;
  recommendationEngineStatus: string;
}

export function AdminAIRecommendations() {
  const [stats, setStats] = useState<AIStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/admin/ai-stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Error fetching AI stats:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-indigo-600 text-[36px]">
          sync
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black font-heading text-slate-900 tracking-tight">
          AI Models & Recommendation Telemetry
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time metrics from the career predictor, resume ATS scanner, and skill recommendation pipeline
        </p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Profiles Analyzed</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">psychology</span>
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3">{stats.totalProfilesAnalyzed}</div>
          <span className="text-[11px] font-bold text-indigo-600 mt-1 block">Live ML Assessments</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">ATS Resumes Scanned</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">description</span>
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3">{stats.totalAtsScans}</div>
          <span className="text-[11px] font-bold text-emerald-600 mt-1 block">Semantic Parser</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Average ATS Compatibility</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">grade</span>
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3">{stats.avgAtsScore}%</div>
          <span className="text-[11px] font-bold text-purple-600 mt-1 block">Platform Average</span>
        </div>
      </div>

      {/* 2 Detail Boards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Recommended Careers */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <h2 className="text-base font-bold font-heading text-slate-900 mb-1">Top Recommended Careers</h2>
          <p className="text-xs text-slate-400 mb-4">Most frequently suggested career trajectories by the ML engine</p>

          {stats.topRecommendedCareers.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              No recommendations generated yet.
            </div>
          ) : (
            <div className="space-y-3">
              {stats.topRecommendedCareers.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{c.title}</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg">
                    {c.count} students
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* In-Demand Skill Clusters */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <h2 className="text-base font-bold font-heading text-slate-900 mb-1">In-Demand Skill Clusters</h2>
          <p className="text-xs text-slate-400 mb-4">Leading skills extracted from verified candidate profiles</p>

          {stats.topSkills.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              No skill records available yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {stats.topSkills.map((s, i) => (
                <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{s.skill}</span>
                  <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {s.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
