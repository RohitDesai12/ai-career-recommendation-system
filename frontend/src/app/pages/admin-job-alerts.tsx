import React, { useState, useEffect } from "react";
import axios from "axios";

interface AlertItem {
  _id: string;
  title: string;
  userEmail: string;
  keywords: string[];
  location: string;
  frequency: string;
  isActive: boolean;
  triggeredCount: number;
  notificationsSent: number;
  createdAt: string;
}

export function AdminJobAlerts() {
  const [stats, setStats] = useState({
    activeAlerts: 0,
    totalAlerts: 0,
    alertsTriggered: 0,
    notificationsSent: 0,
    failedNotifications: 0,
  });
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newKeywords, setNewKeywords] = useState("");
  const [newLocation, setNewLocation] = useState("Any");
  const [newFrequency, setNewFrequency] = useState("Daily");
  const [submitting, setSubmitting] = useState(false);

  const fetchAlertStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/admin/job-alerts");
      setStats(res.data.stats || {});
      setAlerts(res.data.alerts || []);
    } catch (err) {
      console.error("Error fetching job alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertStats();
  }, []);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post("http://localhost:5000/api/admin/job-alerts", {
        title: newTitle,
        keywords: newKeywords.split(",").map((k) => k.trim()).filter(Boolean),
        location: newLocation,
        frequency: newFrequency,
      });
      setShowAddModal(false);
      setNewTitle("");
      setNewKeywords("");
      await fetchAlertStats();
    } catch (err) {
      console.error("Error creating job alert:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black font-heading text-slate-900 tracking-tight">
            Job Alert Monitoring & Automation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Platform notification engine telemetry and custom automated candidate matching rules
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">add_alert</span>
          <span>Create Alert Rule</span>
        </button>
      </div>

      {/* 4 Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-slate-900">{stats.activeAlerts}</div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">Active Alert Rules</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">notifications_active</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-slate-900">{stats.alertsTriggered}</div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">Alerts Triggered</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">bolt</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-slate-900">{stats.notificationsSent}</div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">Notifications Delivered</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">mark_email_read</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-slate-900">{stats.failedNotifications}</div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">Failed Dispatches</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">error</span>
          </div>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold font-heading text-slate-900">Configured Alert Rules</h2>
          <span className="text-xs font-semibold text-slate-400">{alerts.length} Rules Active</span>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined animate-spin text-indigo-600 text-[32px]">
              sync
            </span>
          </div>
        ) : alerts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2.5">
              <span className="material-symbols-outlined text-[24px]">notifications_off</span>
            </div>
            <h3 className="text-sm font-bold text-slate-800">No alert rules configured</h3>
            <p className="text-xs text-slate-400 mt-0.5">Create custom alert criteria for automated job matching.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Rule Title</th>
                  <th className="py-3 px-4">Target Keywords</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Frequency</th>
                  <th className="py-3 px-4">Triggered Count</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alerts.map((al) => (
                  <tr key={al._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{al.title}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {al.keywords.map((k, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10.5px] font-semibold">
                            {k}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{al.location}</td>
                    <td className="py-3.5 px-4 font-bold text-indigo-600">{al.frequency}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{al.triggeredCount} times</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Alert Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 z-10">
            <h3 className="text-lg font-bold font-heading text-slate-900 mb-1">Create Job Alert Rule</h3>
            <p className="text-xs text-slate-400 mb-4">Set automated dispatch rules for matching job posts.</p>

            <form onSubmit={handleCreateAlert} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Alert Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Engineers & Python Developers"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keywords (comma separated)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Python, PyTorch, Machine Learning"
                  value={newKeywords}
                  onChange={(e) => setNewKeywords(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Remote or Bengaluru"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Frequency</label>
                  <select
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="Daily">Daily Digest</option>
                    <option value="Weekly">Weekly Summary</option>
                    <option value="Instant">Instant Match</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-sm"
                >
                  {submitting ? "Creating..." : "Save Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
