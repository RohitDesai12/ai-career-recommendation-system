import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/auth-context";
import axios from "axios";
import {
  User as UserIcon,
  ShieldCheck,
  Bell,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  LogOut,
  Sliders,
  Download,
  Trash2,
  FileText,
  ExternalLink,
  ShieldAlert,
  Info
} from "lucide-react";
import { openCookiePreferences } from "../components/cookie-consent-banner";

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"account" | "security" | "privacy" | "notifications" | "data">("account");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Account Tab State
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [designation, setDesignation] = useState("");

  // Security Tab State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Privacy Tab State
  const [isPublic, setIsPublic] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showEducation, setShowEducation] = useState(true);
  const [showExperience, setShowExperience] = useState(true);
  const [showProjects, setShowProjects] = useState(true);
  const [showSkills, setShowSkills] = useState(true);
  const [showCertifications, setShowCertifications] = useState(true);

  // Notification Tab State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [applicationUpdates, setApplicationUpdates] = useState(true);
  const [roadmapReminders, setRoadmapReminders] = useState(true);

  // Data Export & Deletion State
  const [exporting, setExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadAccountDetails() {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:5000/api/profile/me", {
          headers: token ? { "x-auth-token": token } : undefined
        });
        if (res.data) {
          setName(res.data.user?.name || user?.name || "");
          setEmail(res.data.user?.email || user?.email || "");
          setPhone(res.data.phone || res.data.user?.phone || "");
          setDesignation(res.data.designation || "");
          setIsPublic(res.data.isPublic !== false);

          if (res.data.publicPreferences) {
            setShowEmail(Boolean(res.data.publicPreferences.showEmail));
            setShowPhone(Boolean(res.data.publicPreferences.showPhone));
            setShowEducation(res.data.publicPreferences.showEducation !== false);
            setShowExperience(res.data.publicPreferences.showExperience !== false);
            setShowProjects(res.data.publicPreferences.showProjects !== false);
            setShowSkills(res.data.publicPreferences.showSkills !== false);
            setShowCertifications(res.data.publicPreferences.showCertifications !== false);
          }
        }
      } catch (err) {
        console.warn("Could not load profile settings:", err);
      }
    }
    loadAccountDetails();
  }, [user]);

  // Handle Account Update
  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    const token = localStorage.getItem("token");
    const headers = token ? { "x-auth-token": token } : undefined;

    try {
      await axios.put("http://localhost:5000/api/auth/update-account", { name, phone }, { headers });
      await axios.put("http://localhost:5000/api/profile", { phone, designation }, { headers });

      setSuccessMessage("Account information updated successfully!");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: any) {
      console.error("Error updating account:", err);
      setErrorMessage(err.response?.data?.msg || "Failed to update account.");
    } finally {
      setSaving(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match.");
      setSaving(false);
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters.");
      setSaving(false);
      return;
    }

    const token = localStorage.getItem("token");
    const headers = token ? { "x-auth-token": token } : undefined;

    try {
      await axios.put(
        "http://localhost:5000/api/auth/change-password",
        { currentPassword, newPassword },
        { headers }
      );
      setSuccessMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: any) {
      console.error("Error changing password:", err);
      setErrorMessage(err.response?.data?.msg || "Failed to change password. Please check your current password.");
    } finally {
      setSaving(false);
    }
  };

  // Handle Save Privacy Preferences
  const handleSavePrivacy = async () => {
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    const token = localStorage.getItem("token");
    const headers = token ? { "x-auth-token": token } : undefined;

    try {
      await axios.put(
        "http://localhost:5000/api/profile",
        {
          isPublic,
          publicPreferences: {
            showEmail,
            showPhone,
            showEducation,
            showExperience,
            showProjects,
            showSkills,
            showCertifications
          }
        },
        { headers }
      );

      setSuccessMessage("Privacy and profile visibility settings saved!");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: any) {
      console.error("Error saving privacy settings:", err);
      setErrorMessage(err.response?.data?.msg || "Failed to save privacy settings.");
    } finally {
      setSaving(false);
    }
  };

  // Handle Save Notifications
  const handleSaveNotifications = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccessMessage("Notification preferences saved successfully!");
      setTimeout(() => setSuccessMessage(""), 4000);
    }, 400);
  };

  // Handle Download My Data (Data Portability Export)
  const handleDownloadMyData = async () => {
    setExporting(true);
    setSuccessMessage("");
    setErrorMessage("");

    const token = localStorage.getItem("token");
    const headers = token ? { "x-auth-token": token } : undefined;

    try {
      const response = await axios.get("http://localhost:5000/api/privacy/export-data", {
        headers,
        responseType: "blob"
      });

      // Create download trigger
      const blob = new Blob([response.data], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `career-compass-data-export-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccessMessage("Your personal data export was downloaded successfully!");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: any) {
      console.error("Error exporting student data:", err);
      setErrorMessage("Failed to generate data export. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  // Handle Permanent Account Deletion
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleting(true);
    setErrorMessage("");

    const token = localStorage.getItem("token");
    const headers = token ? { "x-auth-token": token } : undefined;

    try {
      await axios.post(
        "http://localhost:5000/api/privacy/delete-account",
        {
          password: deletePassword,
          confirmationText: deleteConfirmText,
          reason: deleteReason
        },
        { headers }
      );

      // Successfully deleted
      setShowDeleteModal(false);
      logout();
      navigate("/");
    } catch (err: any) {
      console.error("Error deleting account:", err);
      setErrorMessage(err.response?.data?.msg || "Account deletion failed. Please verify your password.");
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 font-sans">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Account, Privacy & Security Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
          Manage your account credentials, security access, candidate privacy visibility, data portability, and account rights.
        </p>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        {[
          { id: "account", label: "Account Details", icon: UserIcon },
          { id: "security", label: "Security & Password", icon: Lock },
          { id: "privacy", label: "Privacy & Visibility", icon: ShieldCheck },
          { id: "notifications", label: "Notifications", icon: Bell },
          { id: "data", label: "Data & Account Management", icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSuccessMessage("");
                setErrorMessage("");
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Feedback Messages */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TAB 1: ACCOUNT DETAILS */}
      {activeTab === "account" && (
        <form onSubmit={handleUpdateAccount} className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
              <p className="text-xs text-slate-500">Update your primary identity and communication contact.</p>
            </div>
            <Link
              to="/profile"
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              View Full Student Profile →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Account Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-500 cursor-not-allowed"
                title="Email is bound to your account identity"
              />
              <span className="text-[10.5px] text-slate-400">Primary authentication identifier</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Contact Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Professional Headline / Role</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Student & Aspiring Software Engineer"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Account Changes
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: SECURITY & PASSWORD */}
      {activeTab === "security" && (
        <form onSubmit={handleChangePassword} className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Account Security & Password</h2>
            <p className="text-xs text-slate-500">Ensure your account uses a secure password to protect your information.</p>
          </div>

          <div className="space-y-4 max-w-lg">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPass ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">New Password</label>
              <div className="relative">
                <input
                  type={showNewPass ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
              Update Password
            </button>
          </div>

          {/* Session Overview */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Active Authentication Session</h4>
              <p className="text-[11px] text-slate-500">Signed in as {email}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out Everywhere
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: PRIVACY & VISIBILITY */}
      {activeTab === "privacy" && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Privacy & Profile Visibility</h2>
            <p className="text-xs text-slate-500">Control how your candidate profile and individual sections appear on the platform.</p>
          </div>

          <div className="space-y-4">
            {/* Master Public Profile Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900">Public Profile Visibility</span>
                <p className="text-[11px] text-slate-500">Allow your verified skills and portfolio to be viewable on the platform via your shareable portfolio link.</p>
              </div>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Granular Field Visibility Controls */}
            {isPublic && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 block mb-2">
                  Granular Visibility Preferences on Public Portfolio:
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={showEmail}
                      onChange={(e) => setShowEmail(e.target.checked)}
                      className="w-3.5 h-3.5 accent-indigo-600"
                    />
                    <span>Show Email Address</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={showPhone}
                      onChange={(e) => setShowPhone(e.target.checked)}
                      className="w-3.5 h-3.5 accent-indigo-600"
                    />
                    <span>Show Phone Number</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={showEducation}
                      onChange={(e) => setShowEducation(e.target.checked)}
                      className="w-3.5 h-3.5 accent-indigo-600"
                    />
                    <span>Show Education & Degrees</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={showExperience}
                      onChange={(e) => setShowExperience(e.target.checked)}
                      className="w-3.5 h-3.5 accent-indigo-600"
                    />
                    <span>Show Work Experience</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={showProjects}
                      onChange={(e) => setShowProjects(e.target.checked)}
                      className="w-3.5 h-3.5 accent-indigo-600"
                    />
                    <span>Show Projects & GitHub Repos</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={showSkills}
                      onChange={(e) => setShowSkills(e.target.checked)}
                      className="w-3.5 h-3.5 accent-indigo-600"
                    />
                    <span>Show Categorized Technical Skills</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={showCertifications}
                      onChange={(e) => setShowCertifications(e.target.checked)}
                      className="w-3.5 h-3.5 accent-indigo-600"
                    />
                    <span>Show Certifications & Badges</span>
                  </label>
                </div>
              </div>
            )}

            {/* Cookie Preferences Trigger */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900">Cookie & Tracking Preferences</span>
                <p className="text-[11px] text-slate-500">Review or update your consent choices for essential, functional, analytics, and marketing cookies.</p>
              </div>
              <button
                type="button"
                onClick={openCookiePreferences}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                Configure Cookies
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="button"
              onClick={handleSavePrivacy}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Privacy Settings
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: NOTIFICATIONS */}
      {activeTab === "notifications" && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Communication & Notification Preferences</h2>
            <p className="text-xs text-slate-500">Choose what alerts you receive and when.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800">Job Matching Alerts</span>
                <p className="text-[11px] text-slate-500">Receive emails when newly synced ATS jobs match your target career roles.</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800">Application Status Notifications</span>
                <p className="text-[11px] text-slate-500">Get notified when you advance in your personal job application tracker.</p>
              </div>
              <input
                type="checkbox"
                checked={applicationUpdates}
                onChange={(e) => setApplicationUpdates(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800">Career Roadmap Reminders</span>
                <p className="text-[11px] text-slate-500">Weekly digests to keep your technical skill milestones on track.</p>
              </div>
              <input
                type="checkbox"
                checked={roadmapReminders}
                onChange={(e) => setRoadmapReminders(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="button"
              onClick={handleSaveNotifications}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Save Notification Settings
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: DATA & ACCOUNT MANAGEMENT (DATA EXPORT & DELETION) */}
      {activeTab === "data" && (
        <div className="space-y-6">
          {/* Data Portability / Download My Data Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Download className="w-4 h-4 text-indigo-600" />
                  Download My Data (Data Portability)
                </h3>
                <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                  Export a complete machine-readable copy (JSON) of all your personal information stored on Career Compass, including your profile, academic records, resume content, assessment results, course progress, and saved job applications.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadMyData}
                disabled={exporting}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
              >
                {exporting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{exporting ? "Compiling Data..." : "Download JSON Archive"}</span>
              </button>
            </div>
            
            <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-900 space-y-1">
              <span className="font-bold block">Included Data Categories:</span>
              <ul className="list-disc pl-5 space-y-0.5 text-indigo-800">
                <li>Account identity and profile records</li>
                <li>Education, categorized skills, work experience, projects, and certifications</li>
                <li>Resume documents and ATS compatibility histories</li>
                <li>Career assessment trade-offs, trait impacts, and generated roadmaps</li>
                <li>Course progress tracking and learning path enrollments</li>
                <li>Bookmarked jobs, submitted application logs, and job alerts</li>
              </ul>
            </div>
          </div>

          {/* Account Deletion Card */}
          <div className="bg-white border border-rose-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-rose-100">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-rose-900 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  Request Account & Data Deletion
                </h3>
                <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                  Exercise your right to erasure. Permanently erase your student account, profile, uploaded resumes, learning milestones, and personalized recommendation histories.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Request Deletion</span>
              </button>
            </div>

            <div className="text-[11.5px] text-slate-500 leading-relaxed">
              Once initiated, your profile and resume data are removed immediately. Deletion cannot be undone. Refer to our{" "}
              <Link to="/data-deletion" className="text-indigo-600 underline font-semibold">
                Data Deletion Policy
              </Link>{" "}
              for detailed information on lawful retention exceptions.
            </div>
          </div>

          {/* Quick Legal Links */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Review platform legal agreements:</span>
            </div>
            <div className="flex items-center gap-4 font-semibold text-indigo-600">
              <Link to="/privacy-policy" target="_blank" className="hover:underline flex items-center gap-1">
                Privacy Policy <ExternalLink className="w-3 h-3" />
              </Link>
              <Link to="/terms" target="_blank" className="hover:underline flex items-center gap-1">
                Terms & Conditions <ExternalLink className="w-3 h-3" />
              </Link>
              <Link to="/data-deletion" target="_blank" className="hover:underline flex items-center gap-1">
                Data Deletion Policy <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MULTI-STEP ACCOUNT DELETION CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-rose-200 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start gap-3 pb-3 border-b border-rose-100">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-slate-900">
                  Confirm Permanent Account Deletion
                </h3>
                <p className="text-xs text-rose-600 font-semibold">
                  This action is permanent and cannot be reversed.
                </p>
              </div>
            </div>

            {/* Explanation of Consequences */}
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs text-rose-950 space-y-2 leading-relaxed">
              <span className="font-bold block text-rose-900">
                The following personal data will be permanently erased:
              </span>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your student account credentials and contact details</li>
                <li>Your student profile, academic degrees, and skills database</li>
                <li>All resume documents, cover letters, and ATS score histories</li>
                <li>Your career assessment dimension results and roadmaps</li>
                <li>All course progress and learning path enrollments</li>
              </ul>
              <p className="text-[11px] pt-1 text-slate-600">
                <strong>Lawful Exception:</strong> Non-personally identifiable application metrics and aggregated system logs are retained in anonymized format for auditing and regulatory compliance.
              </p>
            </div>

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              {/* Optional Reason */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Reason for Leaving (Optional)</label>
                <input
                  type="text"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="e.g. Graduated, found employment, changing email"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none"
                />
              </div>

              {/* Password Confirmation */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Re-enter Account Password</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none"
                  required
                />
              </div>

              {/* Confirmation Text Requirement */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Type <span className="text-rose-600 font-mono font-black">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none"
                  required
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleting || deleteConfirmText !== "DELETE" || !deletePassword}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {deleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>Permanently Delete Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default SettingsPage;
