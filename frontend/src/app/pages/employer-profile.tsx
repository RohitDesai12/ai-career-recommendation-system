import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import {
  Building,
  Globe,
  MapPin,
  Users,
  Calendar,
  Mail,
  Phone,
  Edit3,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Save,
  X,
  Sparkles,
  Briefcase,
  Layers,
  UploadCloud,
  RefreshCw
} from "lucide-react";
import { useAuth } from "../context/auth-context";

interface EmployerProfileData {
  _id?: string;
  companyName: string;
  contactPerson: string;
  workEmail?: string;
  phone?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  location?: string;
  foundedYear?: number | string;
  description?: string;
  logo?: string;
  verified?: boolean;
  status?: string;
}

export function EmployerProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [profile, setProfile] = useState<EmployerProfileData>({
    companyName: "",
    contactPerson: user?.name || "Recruiter",
    workEmail: user?.email || "",
    phone: "",
    website: "",
    industry: "",
    companySize: "1-10",
    location: "",
    foundedYear: "",
    description: "",
    logo: "",
    verified: false,
    status: "active",
  });

  const [editFormData, setEditFormData] = useState<EmployerProfileData>({ ...profile });

  const fetchCompanyProfile = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");

    try {
      const res = await axios.get("http://localhost:5000/api/employer/profile", {
        headers: { "x-auth-token": token || "" },
      });

      if (res.data?.employer) {
        const emp = res.data.employer;
        const mappedProfile: EmployerProfileData = {
          _id: emp._id,
          companyName: emp.companyName || "",
          contactPerson: emp.contactPerson || user?.name || "Recruiter",
          workEmail: emp.workEmail || user?.email || "",
          phone: emp.phone || "",
          website: emp.website || "",
          industry: emp.industry || "",
          companySize: emp.companySize || "1-10",
          location: emp.location || "",
          foundedYear: emp.foundedYear || "",
          description: emp.description || "",
          logo: emp.logo || "",
          verified: emp.verified || false,
          status: emp.status || "active",
        };
        setProfile(mappedProfile);
        setEditFormData(mappedProfile);
        localStorage.setItem("employer", JSON.stringify(emp));
      }
    } catch (err: any) {
      console.error("Failed to load company profile:", err);
      setError(err?.response?.data?.message || "Failed to load company profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const handleStartEdit = () => {
    setEditFormData({ ...profile });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditFormData({ ...profile });
    setIsEditing(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem("token");

    try {
      const res = await axios.put(
        "http://localhost:5000/api/employer/profile",
        editFormData,
        { headers: { "x-auth-token": token || "" } }
      );

      if (res.data?.employer) {
        const updated = res.data.employer;
        setProfile({
          ...profile,
          ...updated,
        });
        localStorage.setItem("employer", JSON.stringify(updated));
      } else {
        setProfile({ ...editFormData });
      }

      setIsEditing(false);
      setFeedback({ message: "Company profile updated successfully!", type: "success" });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setFeedback({
        message: err?.response?.data?.message || "Failed to update company profile.",
        type: "error",
      });
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const initials = profile.companyName
    ? profile.companyName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "CO";

  const hasCompleteProfile = Boolean(profile.companyName && profile.description && profile.location);

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

      {loading ? (
        <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-600">Loading company profile details...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-white rounded-3xl border border-rose-200 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">Unable to load profile</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchCompanyProfile}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Company Banner / Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 relative">
              <div className="absolute top-4 right-4">
                {!isEditing && (
                  <button
                    onClick={handleStartEdit}
                    className="px-4 py-2 bg-white/90 hover:bg-white text-slate-900 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            <div className="px-6 pb-6 pt-0 relative">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4">
                <div className="flex items-end gap-4">
                  {profile.logo ? (
                    <img
                      src={profile.logo}
                      alt={profile.companyName}
                      className="w-24 h-24 rounded-3xl border-4 border-white shadow-md object-cover bg-white"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-3xl border-4 border-white shadow-md bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center">
                      {initials}
                    </div>
                  )}

                  <div className="mb-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-black text-slate-900">
                        {profile.companyName || "Your Company Name"}
                      </h1>
                      {profile.verified && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {profile.industry || "Industry Not Specified"} • {profile.location || "Location Not Specified"}
                    </p>
                  </div>
                </div>
              </div>

              {!hasCompleteProfile && !isEditing && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900 font-semibold mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Complete your company profile to give candidates a complete picture of your culture and roles.</span>
                  </div>
                  <button
                    onClick={handleStartEdit}
                    className="px-3 py-1 bg-amber-600 text-white rounded-lg text-[11px] font-bold shadow-xs hover:bg-amber-700 cursor-pointer"
                  >
                    Complete Profile
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Form (Edit Mode) or Profile View (View Mode) */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900">Edit Company Information</h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.companyName}
                    onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
                    placeholder="e.g. Acme Technologies"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Industry *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.industry}
                    onChange={(e) => setEditFormData({ ...editFormData, industry: e.target.value })}
                    placeholder="e.g. Software, Healthcare, FinTech"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Website URL</label>
                  <input
                    type="url"
                    value={editFormData.website}
                    onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Headquarters / Location *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    placeholder="e.g. San Francisco, CA / Hybrid"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Company Size</label>
                  <select
                    value={editFormData.companySize}
                    onChange={(e) => setEditFormData({ ...editFormData, companySize: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 cursor-pointer"
                  >
                    <option value="1-10">1-10 employees (Startup)</option>
                    <option value="11-50">11-50 employees (Early Stage)</option>
                    <option value="51-200">51-200 employees (Growth)</option>
                    <option value="201-500">201-500 employees (Mid-sized)</option>
                    <option value="500+">500+ employees (Enterprise)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Founded Year</label>
                  <input
                    type="number"
                    value={editFormData.foundedYear || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, foundedYear: e.target.value })}
                    placeholder="e.g. 2021"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Contact Person Name</label>
                  <input
                    type="text"
                    value={editFormData.contactPerson}
                    onChange={(e) => setEditFormData({ ...editFormData, contactPerson: e.target.value })}
                    placeholder="Recruiter or HR Manager name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Company Logo Image URL</label>
                  <input
                    type="url"
                    value={editFormData.logo}
                    onChange={(e) => setEditFormData({ ...editFormData, logo: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">About Company / Description</label>
                  <textarea
                    rows={5}
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    placeholder="Tell candidates about your company mission, work culture, engineering values, and what makes your team unique..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Company Profile
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left 2 Cols: About & Overview */}
              <div className="md:col-span-2 space-y-6">
                {/* About Company Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Building className="w-4 h-4 text-purple-600" />
                    About Company
                  </h3>
                  {profile.description ? (
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {profile.description}
                    </p>
                  ) : (
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
                      <p className="text-xs font-bold text-slate-600">No company description added yet</p>
                      <p className="text-[11px] text-slate-400">
                        Add a description to tell candidates about your organization's mission and culture.
                      </p>
                      <button
                        onClick={handleStartEdit}
                        className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-xl text-xs font-bold hover:bg-purple-100 cursor-pointer"
                      >
                        + Add Description
                      </button>
                    </div>
                  )}
                </div>

                {/* Key Information Grid */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    Company Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                      <Globe className="w-5 h-5 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Website</span>
                        {profile.website ? (
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-purple-600 hover:underline truncate block"
                          >
                            {profile.website}
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">Not specified</span>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location</span>
                        <span className="font-bold text-slate-800">{profile.location || "Not specified"}</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                      <Users className="w-5 h-5 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Company Size</span>
                        <span className="font-bold text-slate-800">{profile.companySize || "1-10"} employees</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Founded</span>
                        <span className="font-bold text-slate-800">{profile.foundedYear || "Not specified"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Col: Recruiter & Contact Information */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    Hiring Contact
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Primary Recruiter</span>
                      <span className="font-bold text-slate-900">{profile.contactPerson || user?.name || "Recruiter"}</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Work Email</span>
                      <span className="font-bold text-slate-900">{profile.workEmail || user?.email || "Not specified"}</span>
                    </div>

                    {profile.phone && (
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone</span>
                        <span className="font-bold text-slate-900">{profile.phone}</span>
                      </div>
                    )}
                  </div>

                  <Link
                    to="/employer/post-job"
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold text-center block shadow-md shadow-purple-600/20 transition-all"
                  >
                    + Post a Job from this Profile
                  </Link>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default EmployerProfile;
