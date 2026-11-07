import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import {
  Settings,
  User,
  Building,
  Bell,
  Sliders,
  Shield,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
  Trash2,
  RefreshCw,
  X,
  Eye,
  EyeOff
} from "lucide-react";
import { useAuth } from "../context/auth-context";

type SettingsTab = "account" | "company" | "notifications" | "preferences" | "security" | "danger";

export function EmployerSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Account State
  const [accountData, setAccountData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
  });

  // Company State
  const [companyData, setCompanyData] = useState({
    companyName: "",
    website: "",
    industry: "",
    location: "",
    companySize: "1-10",
  });

  // Notifications State
  const [notifications, setNotifications] = useState({
    newApplications: true,
    candidateMessages: true,
    interviewAlerts: true,
    jobStatusChanges: true,
    emailAlerts: true,
  });

  // Preferences State
  const [preferences, setPreferences] = useState({
    defaultJobVisibility: "Public",
    autoReviewThreshold: 75,
  });

  // Password / Security State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Danger Zone Deactivate Modal
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [deactivateConfirmationText, setDeactivateConfirmationText] = useState("");

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");

    try {
      const res = await axios.get("http://localhost:5000/api/employer/profile", {
        headers: { "x-auth-token": token || "" },
      });

      if (res.data?.employer) {
        const emp = res.data.employer;
        setAccountData({
          name: emp.contactPerson || user?.name || "",
          email: emp.workEmail || user?.email || "",
          phone: emp.phone || "",
        });
        setCompanyData({
          companyName: emp.companyName || "",
          website: emp.website || "",
          industry: emp.industry || "",
          location: emp.location || "",
          companySize: emp.companySize || "1-10",
        });

        if (emp.settings?.notifications) {
          setNotifications({
            newApplications: emp.settings.notifications.newApplications ?? true,
            candidateMessages: emp.settings.notifications.candidateMessages ?? true,
            interviewAlerts: emp.settings.notifications.interviewAlerts ?? true,
            jobStatusChanges: emp.settings.notifications.jobStatusChanges ?? true,
            emailAlerts: emp.settings.notifications.emailAlerts ?? true,
          });
        }

        if (emp.settings?.preferences) {
          setPreferences({
            defaultJobVisibility: emp.settings.preferences.defaultJobVisibility || "Public",
            autoReviewThreshold: emp.settings.preferences.autoReviewThreshold || 75,
          });
        }
      }
    } catch (err: any) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save Account & Company Settings
  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem("token");

    try {
      await axios.put(
        "http://localhost:5000/api/employer/settings",
        {
          account: accountData,
          company: companyData,
          notifications,
          preferences,
        },
        { headers: { "x-auth-token": token || "" } }
      );

      setFeedback({ message: "Settings saved successfully!", type: "success" });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      console.error("Error saving settings:", err);
      setFeedback({
        message: err?.response?.data?.message || "Failed to save settings.",
        type: "error",
      });
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFeedback({ message: "New passwords do not match.", type: "error" });
      setTimeout(() => setFeedback(null), 3500);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setFeedback({ message: "Password must be at least 6 characters.", type: "error" });
      setTimeout(() => setFeedback(null), 3500);
      return;
    }

    setChangingPassword(true);
    const token = localStorage.getItem("token");

    try {
      await axios.put(
        "http://localhost:5000/api/employer/account/password",
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        { headers: { "x-auth-token": token || "" } }
      );

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setFeedback({ message: "Password updated successfully!", type: "success" });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      setFeedback({
        message: err?.response?.data?.message || "Failed to update password.",
        type: "error",
      });
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans max-w-5xl mx-auto">
      {/* Action Feedback Banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl flex items-center justify-between text-sm font-semibold shadow-md ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Recruiter Portal Settings</h1>
        </div>
        <p className="text-sm text-slate-500">
          Configure recruiter account details, company preferences, notification alerts, and security credentials.
        </p>
      </div>

      {loading ? (
        <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-600">Loading settings...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Settings Left Navigation Sidebar */}
          <div className="bg-white rounded-3xl p-3 border border-slate-200 shadow-xs flex flex-col gap-1 self-start">
            {[
              { id: "account", label: "Account", icon: User },
              { id: "company", label: "Company Info", icon: Building },
              { id: "notifications", label: "Notifications", icon: Bell },
              { id: "preferences", label: "Preferences", icon: Sliders },
              { id: "security", label: "Security & Password", icon: Shield },
              { id: "danger", label: "Danger Zone", icon: AlertTriangle, danger: true },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                    isActive
                      ? tab.danger
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-purple-600 text-white shadow-xs"
                      : tab.danger
                      ? "text-rose-600 hover:bg-rose-50/50"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Settings Content Area */}
          <div className="md:col-span-3 space-y-6">
            {/* 1. Account Settings */}
            {activeTab === "account" && (
              <form onSubmit={handleSaveGeneral} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold text-slate-900">Personal & Recruiter Account</h3>
                  <p className="text-xs text-slate-500">Update your contact information visible on job listings</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Recruiter Full Name</label>
                    <input
                      type="text"
                      required
                      value={accountData.name}
                      onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Work Email Address</label>
                    <input
                      type="email"
                      required
                      value={accountData.email}
                      onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 font-semibold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Direct Phone Number</label>
                    <input
                      type="tel"
                      value={accountData.phone}
                      onChange={(e) => setAccountData({ ...accountData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Account Changes
                  </button>
                </div>
              </form>
            )}

            {/* 2. Company Info Settings */}
            {activeTab === "company" && (
              <form onSubmit={handleSaveGeneral} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold text-slate-900">Company Overview</h3>
                  <p className="text-xs text-slate-500">Set primary organization identity and industry vertical</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Company Legal Name</label>
                    <input
                      type="text"
                      required
                      value={companyData.companyName}
                      onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Industry Sector</label>
                    <input
                      type="text"
                      value={companyData.industry}
                      onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Company Website</label>
                    <input
                      type="url"
                      value={companyData.website}
                      onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Headquarters Location</label>
                    <input
                      type="text"
                      value={companyData.location}
                      onChange={(e) => setCompanyData({ ...companyData, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 font-semibold"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Company Info
                  </button>
                </div>
              </form>
            )}

            {/* 3. Notification Preferences */}
            {activeTab === "notifications" && (
              <form onSubmit={handleSaveGeneral} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold text-slate-900">Notification Alerts</h3>
                  <p className="text-xs text-slate-500">Choose when and how you receive candidate activity alerts</p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      key: "newApplications",
                      title: "New Candidate Applications",
                      desc: "Get notified immediately when a candidate submits an application for your active jobs.",
                    },
                    {
                      key: "candidateMessages",
                      title: "Candidate Direct Messages",
                      desc: "Receive alerts when candidates reply to your messages or inquiries.",
                    },
                    {
                      key: "interviewAlerts",
                      title: "Interview Reminders & Updates",
                      desc: "Get scheduled interview confirmations and candidate responses.",
                    },
                    {
                      key: "jobStatusChanges",
                      title: "Job Status & Expiry Notifications",
                      desc: "Alerts when job postings are approved, close, or reach maximum application caps.",
                    },
                    {
                      key: "emailAlerts",
                      title: "Email Digests & Summary",
                      desc: "Receive daily summary of applicant activity directly to your registered work email.",
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={notifications[item.key as keyof typeof notifications]}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              [item.key]: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Notification Toggles
                  </button>
                </div>
              </form>
            )}

            {/* 4. Preferences Settings */}
            {activeTab === "preferences" && (
              <form onSubmit={handleSaveGeneral} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold text-slate-900">Recruiting Preferences</h3>
                  <p className="text-xs text-slate-500">Configure default options for new job listings and matching thresholds</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Default Job Visibility</label>
                    <select
                      value={preferences.defaultJobVisibility}
                      onChange={(e) => setPreferences({ ...preferences, defaultJobVisibility: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 cursor-pointer font-semibold"
                    >
                      <option value="Public">Public (All Career Compass Students)</option>
                      <option value="Unlisted">Unlisted (Direct Link Only)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Strong Match Threshold ({preferences.autoReviewThreshold}%)
                    </label>
                    <input
                      type="range"
                      min={50}
                      max={95}
                      step={5}
                      value={preferences.autoReviewThreshold}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          autoReviewThreshold: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full accent-purple-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                      <span>50% (Broad Match)</span>
                      <span>75% (Recommended)</span>
                      <span>95% (Strict Match)</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Preferences
                  </button>
                </div>
              </form>
            )}

            {/* 5. Security & Password */}
            {activeTab === "security" && (
              <form onSubmit={handleChangePassword} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold text-slate-900">Password & Security</h3>
                  <p className="text-xs text-slate-500">Ensure your recruiter credentials remain secure</p>
                </div>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords ? "text" : "password"}
                        required
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
                    <input
                      type={showPasswords ? "text" : "password"}
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm New Password</label>
                    <input
                      type={showPasswords ? "text" : "password"}
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {changingPassword ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                    Update Password
                  </button>
                </div>
              </form>
            )}

            {/* 6. Danger Zone */}
            {activeTab === "danger" && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-200 shadow-xs space-y-5">
                <div className="border-b border-rose-100 pb-4">
                  <h3 className="text-base font-bold text-rose-900">Danger Zone</h3>
                  <p className="text-xs text-rose-600">Deactivate recruiter account or archive organization postings</p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-rose-900">Deactivate Recruiter Account</h4>
                    <p className="text-[11px] text-rose-700 mt-0.5 max-w-md">
                      Temporarily pause your recruiter profile and pause all active job postings. This can be re-enabled by an administrator.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDeactivateModalOpen(true)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 whitespace-nowrap cursor-pointer"
                  >
                    Deactivate Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      <AnimatePresence>
        {isDeactivateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Confirm Account Deactivation</h3>
                  <p className="text-xs text-slate-500">This will pause all your published job postings</p>
                </div>
              </div>

              <p className="text-xs text-slate-600">
                Type <strong>DEACTIVATE</strong> below to confirm pausing your recruiter access.
              </p>

              <input
                type="text"
                value={deactivateConfirmationText}
                onChange={(e) => setDeactivateConfirmationText(e.target.value)}
                placeholder="DEACTIVATE"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30 font-bold"
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeactivateModalOpen(false);
                    setDeactivateConfirmationText("");
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deactivateConfirmationText !== "DEACTIVATE"}
                  onClick={() => {
                    setIsDeactivateModalOpen(false);
                    alert("Your deactivation request has been recorded.");
                  }}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                >
                  Confirm Deactivation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EmployerSettings;
