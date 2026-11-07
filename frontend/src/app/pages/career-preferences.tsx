import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/auth-context";
import axios from "axios";
import {
  Tune,
  Briefcase,
  MapPin,
  Building,
  DollarSign,
  Bell,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Sparkles,
  Sliders,
  Check
} from "lucide-react";

const POPULAR_ROLES = [
  "Software Development Engineer",
  "Full Stack Web Developer",
  "Frontend Engineer",
  "Backend Developer",
  "Machine Learning Engineer",
  "Data Scientist",
  "Cloud / DevOps Engineer",
  "Cybersecurity Analyst",
  "Mobile App Developer",
  "Embedded Systems Engineer"
];

const POPULAR_LOCATIONS = [
  "Bangalore, Karnataka",
  "Hyderabad, Telangana",
  "Pune, Maharashtra",
  "Mumbai, Maharashtra",
  "Delhi NCR / Gurgaon",
  "Chennai, Tamil Nadu",
  "Remote"
];

export function CareerPreferencesPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Preferences State
  const [preferredRoles, setPreferredRoles] = useState<string[]>([]);
  const [roleInput, setRoleInput] = useState("");
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);
  const [locationInput, setLocationInput] = useState("");
  const [workModes, setWorkModes] = useState<string[]>(["Hybrid"]);
  const [minSalary, setMinSalary] = useState<number>(6);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>(["Full Time"]);
  const [experienceLevel, setExperienceLevel] = useState("0-2 years");
  const [jobAlertsEnabled, setJobAlertsEnabled] = useState(true);
  const [alertFrequency, setAlertFrequency] = useState<"Daily" | "Weekly" | "Instant">("Daily");

  useEffect(() => {
    async function loadPreferences() {
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:5000/api/profile/me", {
          headers: token ? { "x-auth-token": token } : undefined
        });

        if (res.data?.careerPreferences) {
          const pref = res.data.careerPreferences;
          if (Array.isArray(pref.preferredRoles) && pref.preferredRoles.length > 0) {
            setPreferredRoles(pref.preferredRoles);
          } else if (res.data.targetCareer) {
            setPreferredRoles([res.data.targetCareer]);
          }
          if (Array.isArray(pref.preferredLocations)) setPreferredLocations(pref.preferredLocations);
          if (Array.isArray(pref.workModes)) setWorkModes(pref.workModes);
          if (pref.minSalary !== undefined) setMinSalary(pref.minSalary);
          if (Array.isArray(pref.employmentTypes)) setEmploymentTypes(pref.employmentTypes);
          if (pref.experienceLevel) setExperienceLevel(pref.experienceLevel);
          if (pref.jobAlertsEnabled !== undefined) setJobAlertsEnabled(pref.jobAlertsEnabled);
          if (pref.alertFrequency) setAlertFrequency(pref.alertFrequency);
        } else if (res.data?.targetCareer) {
          setPreferredRoles([res.data.targetCareer]);
        }
      } catch (err) {
        console.warn("Could not fetch career preferences:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPreferences();
  }, [user]);

  // Role helper
  const handleAddRole = (roleToAdd?: string) => {
    const role = (roleToAdd || roleInput).trim();
    if (role && !preferredRoles.includes(role)) {
      setPreferredRoles([...preferredRoles, role]);
      setRoleInput("");
    }
  };

  const handleRemoveRole = (roleToRemove: string) => {
    setPreferredRoles(preferredRoles.filter((r) => r !== roleToRemove));
  };

  // Location helper
  const handleAddLocation = (locToAdd?: string) => {
    const loc = (locToAdd || locationInput).trim();
    if (loc && !preferredLocations.includes(loc)) {
      setPreferredLocations([...preferredLocations, loc]);
      setLocationInput("");
    }
  };

  const handleRemoveLocation = (locToRemove: string) => {
    setPreferredLocations(preferredLocations.filter((l) => l !== locToRemove));
  };

  // Toggle helpers
  const handleToggleWorkMode = (mode: string) => {
    if (workModes.includes(mode)) {
      if (workModes.length > 1) setWorkModes(workModes.filter((m) => m !== mode));
    } else {
      setWorkModes([...workModes, mode]);
    }
  };

  const handleToggleEmpType = (type: string) => {
    if (employmentTypes.includes(type)) {
      if (employmentTypes.length > 1) setEmploymentTypes(employmentTypes.filter((t) => t !== type));
    } else {
      setEmploymentTypes([...employmentTypes, type]);
    }
  };

  // Save Preferences
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage("");

    const token = localStorage.getItem("token");
    const headers = token ? { "x-auth-token": token } : undefined;

    const payload = {
      careerPreferences: {
        preferredRoles,
        preferredLocations,
        workModes,
        minSalary: Number(minSalary),
        employmentTypes,
        experienceLevel,
        jobAlertsEnabled,
        alertFrequency,
      },
    };

    try {
      await axios.put("http://localhost:5000/api/profile", payload, { headers });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error("Error saving preferences:", err);
      setErrorMessage(err.response?.data?.msg || "Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading career preferences...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold uppercase tracking-wider border border-purple-200/60">
            Recommendation Filters
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Career & Job Search Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
          Configure your target job roles, preferred locations, compensation expectations, and alert frequencies. Our AI engine uses these criteria to rank opportunities and tailor job recommendations.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Your career preferences have been saved and synced with live job recommendations!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* 1. Target Job Roles */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Preferred Target Roles</h2>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddRole();
                }
              }}
              placeholder="Type a target role and press Enter (e.g. Full Stack Developer, Data Analyst)"
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => handleAddRole()}
              className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              + Add
            </button>
          </div>

          {/* Selected Roles */}
          <div className="flex flex-wrap gap-2">
            {preferredRoles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold"
              >
                {role}
                <button
                  type="button"
                  onClick={() => handleRemoveRole(role)}
                  className="w-3.5 h-3.5 rounded-full hover:bg-indigo-200 text-indigo-600 flex items-center justify-center text-[10px] cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Quick Add Suggestions */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Popular Domain Roles
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_ROLES.filter((r) => !preferredRoles.includes(r)).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleAddRole(r)}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  + {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Preferred Locations & Work Mode */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Locations & Work Modes</h2>
          </div>

          {/* Work Mode Toggle Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Preferred Work Modes</label>
            <div className="grid grid-cols-3 gap-3">
              {["Hybrid", "Remote", "On-site"].map((mode) => {
                const active = workModes.includes(mode);
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleToggleWorkMode(mode)}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      active
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {active && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    {mode}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location Input & Tags */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-slate-700">Target Cities / Regions</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddLocation();
                  }
                }}
                placeholder="Type location and press Enter (e.g. Bangalore, Remote, Pune)"
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => handleAddLocation()}
                className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                + Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {preferredLocations.map((loc) => (
                <span
                  key={loc}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold"
                >
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {loc}
                  <button
                    type="button"
                    onClick={() => handleRemoveLocation(loc)}
                    className="w-3.5 h-3.5 rounded-full hover:bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Quick Select Cities
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_LOCATIONS.filter((l) => !preferredLocations.includes(l)).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => handleAddLocation(l)}
                    className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    + {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Compensation & Experience Level */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Compensation & Experience</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Minimum Expected Salary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Minimum Expected Base Salary</label>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  ₹ {minSalary} LPA
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={minSalary}
                onChange={(e) => setMinSalary(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>Any Salary</span>
                <span>₹ 10 LPA</span>
                <span>₹ 20 LPA</span>
                <span>₹ 30+ LPA</span>
              </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
              >
                <option value="Fresher / Entry Level">Fresher / Entry Level</option>
                <option value="0-2 years">0-2 years (Early Career)</option>
                <option value="2-5 years">2-5 years (Mid Level)</option>
                <option value="5+ years">5+ years (Senior Level)</option>
              </select>
            </div>

            {/* Employment Types */}
            <div className="sm:col-span-2 space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700">Employment Types</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {["Full Time", "Internship", "Part Time", "Contract"].map((type) => {
                  const active = employmentTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleToggleEmpType(type)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        active
                          ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {active && <Check className="w-3 h-3 text-indigo-600" />}
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* 4. Job Alerts & Notification Frequency */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Bell className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Job Alert Subscriptions</h2>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={jobAlertsEnabled}
                onChange={(e) => setJobAlertsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-slate-500">
              Receive smart job alerts when vacancies matching your preferred roles, locations, and salary threshold become available.
            </p>

            {jobAlertsEnabled && (
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                <span className="font-bold text-slate-700">Notification Delivery Frequency</span>
                <div className="flex gap-2">
                  {(["Daily", "Weekly", "Instant"] as const).map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setAlertFrequency(freq)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        alertFrequency === freq
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/jobs"
            className="px-5 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
          >
            Explore Jobs
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all cursor-pointer"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Career Preferences
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
export default CareerPreferencesPage;
