import { useState, useEffect } from "react";
import { Link } from "react-router";
import axios from "axios";

interface HistoryRecord {
  _id: string;
  resumeTitle: string;
  role: string;
  atsScore: number;
  keywordScore: number;
  contentQuality: number;
  structureScore: number;
  skillsMatch: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  analyzedAt: string;
}

export function ScoreHistoryPage() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = token ? { "x-auth-token": token } : {};

    axios.get("http://localhost:5000/api/resume/score-history", { headers })
      .then((res) => {
        if (res.data?.history) {
          setHistory(res.data.history);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const latestScore = history[history.length - 1]?.atsScore || 0;
  const initialScore = history[0]?.atsScore || 0;
  const delta = history.length > 1 ? latestScore - initialScore : 0;

  return (
    <div className="space-y-6 font-sans antialiased text-slate-900 dark:text-slate-100 pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <Link
          to="/resume-studio"
          className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Resume Score History & Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track your ATS score improvement and diagnostic metrics across all analyses.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Current ATS Score</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {latestScore > 0 ? `${latestScore} / 100` : "No data yet"}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Analyses Run</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {history.length}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Score Improvement</div>
          <div className={`text-2xl font-black mt-1 ${delta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {delta > 0 ? `+${delta} pts` : delta === 0 ? "Baseline" : `${delta} pts`}
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Analysis Timeline Log</h2>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Resume Title</th>
                  <th className="py-3 px-3">Target Role</th>
                  <th className="py-3 px-3 text-center">ATS Score</th>
                  <th className="py-3 px-3 text-center">Content</th>
                  <th className="py-3 px-3 text-center">Structure</th>
                  <th className="py-3 px-3 text-center">Skills</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-500 dark:text-slate-400">
                      {new Date(record.analyzedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {record.resumeTitle}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {record.role}
                    </td>
                    <td className="py-3 px-3 text-center font-black text-indigo-600 dark:text-indigo-400">
                      {record.atsScore}%
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-400">
                      {record.contentQuality || 80}%
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-400">
                      {record.structureScore || 85}%
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-400">
                      {record.skillsMatch || 75}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs">
            No score history recorded yet. Run a resume analysis or save a resume in Resume Studio to begin tracking.
          </div>
        )}
      </div>

    </div>
  );
}
