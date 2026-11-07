import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/auth-context";

export function AdminSettings() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requireJobApproval, setRequireJobApproval] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/admin/settings")
      .then((res) => {
        if (res.data?.adminUser) {
          setName(res.data.adminUser.name || "");
          setEmail(res.data.adminUser.email || "");
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (password && password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const payload: any = { name, email };
      if (password) payload.password = password;

      const res = await axios.put("http://localhost:5000/api/admin/settings", payload);
      setSuccessMsg(res.data.msg || "Settings saved successfully.");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.msg || "Error saving admin settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black font-heading text-slate-900 tracking-tight">
          Admin Settings & Platform Security
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure administrative account credentials, platform approval policies, and notification dispatch
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <h2 className="text-base font-bold font-heading text-slate-900 mb-1">
          Super Administrator Profile
        </h2>
        <p className="text-xs text-slate-400 mb-6">Update your administrator profile details and login password.</p>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Administrator Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">New Password (leave blank to keep current)</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save Admin Profile"}
            </button>
          </div>
        </form>
      </div>

      {/* Platform Policies */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-base font-bold font-heading text-slate-900">Platform Policies & Workflow</h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="text-xs font-bold text-slate-900">Platform Activity Email Alerts</div>
              <div className="text-[11px] text-slate-400">
                Receive notifications when new moderation reports or flagged content are lodged
              </div>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
