import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/auth-context";
import axios from "axios";

export function ResumeSettings() {
  const { user } = useAuth();

  const [targetRole, setTargetRole] = useState("Software Development Engineer");
  const [preferredTemplate, setPreferredTemplate] = useState("Modern");
  const [accentColor, setAccentColor] = useState("#4f46e5");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [fontSize, setFontSize] = useState("Medium");
  
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load preferences from profile or localStorage
  useEffect(() => {
    const savedPrefs = localStorage.getItem("career_compass_resume_prefs");
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        if (parsed.targetRole) setTargetRole(parsed.targetRole);
        if (parsed.preferredTemplate) setPreferredTemplate(parsed.preferredTemplate);
        if (parsed.accentColor) setAccentColor(parsed.accentColor);
        if (parsed.fontFamily) setFontFamily(parsed.fontFamily);
        if (parsed.fontSize) setFontSize(parsed.fontSize);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.location) setLocation(parsed.location);
        if (parsed.website) setWebsite(parsed.website);
        if (parsed.linkedin) setLinkedin(parsed.linkedin);
        if (parsed.github) setGithub(parsed.github);
      } catch (e) {
        console.error("Error loading resume prefs:", e);
      }
    }

    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:5000/api/profile/me", {
          headers: { "x-auth-token": token }
        })
        .then((res) => {
          if (res.data) {
            if (res.data.name) setFullName(res.data.name);
            if (res.data.email) setEmail(res.data.email);
            if (res.data.targetCareer) setTargetRole(res.data.targetCareer);
            if (res.data.phone) setPhone(res.data.phone);
            if (res.data.location) setLocation(res.data.location);
            if (res.data.links?.github) setGithub(res.data.links.github);
            if (res.data.links?.linkedin) setLinkedin(res.data.links.linkedin);
            if (res.data.links?.portfolio) setWebsite(res.data.links.portfolio);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    const prefs = {
      targetRole,
      preferredTemplate,
      accentColor,
      fontFamily,
      fontSize,
      fullName,
      email,
      phone,
      location,
      website,
      linkedin,
      github
    };

    localStorage.setItem("career_compass_resume_prefs", JSON.stringify(prefs));

    // Also update profile contacts if user is authenticated
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await axios.put(
          "http://localhost:5000/api/profile/me",
          {
            phone,
            location,
            targetCareer: targetRole,
            links: {
              github,
              linkedin,
              portfolio: website
            }
          },
          { headers: { "x-auth-token": token } }
        );
      } catch (err) {
        console.error("Error updating profile presets:", err);
      }
    }

    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const COLOR_OPTIONS = [
    { name: "Indigo Purple", hex: "#4f46e5" },
    { name: "Sky Blue", hex: "#0284c7" },
    { name: "Emerald Cyan", hex: "#059669" },
    { name: "Violet", hex: "#7c3aed" },
    { name: "Ruby Coral", hex: "#dc2626" },
    { name: "Amber Orange", hex: "#ea580c" },
    { name: "Slate Navy", hex: "#0f172a" },
  ];

  return (
    <div className="space-y-6 font-sans antialiased text-slate-900 dark:text-slate-100 pb-20 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/resume-studio"
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Resume Studio Settings
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Set default styling, contact presets, and target role configurations for new resumes.
            </p>
          </div>
        </div>

        <Link
          to="/resume-studio/builder"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">edit_document</span>
          <span>Open Resume Builder</span>
        </Link>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span>Resume Studio settings and default presets saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* Style & Template Defaults */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="material-symbols-outlined text-indigo-600 text-[20px]">tune</span>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Design & Template Preferences</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Default Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Full Stack Developer, Data Scientist"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Default Template
              </label>
              <select
                value={preferredTemplate}
                onChange={(e) => setPreferredTemplate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value="ATS-Classic">ATS Classic (Strict 1-Column)</option>
                <option value="Modern">Modern Tech (Indigo Pill Badges)</option>
                <option value="Minimal">Minimalist Executive (Monochrome)</option>
                <option value="Software-Tech">Software & Systems (Dev Focused)</option>
                <option value="Data-Science">Data & Analytics (Quant Focused)</option>
                <option value="AI-ML">AI & Machine Learning (Research & Publications)</option>
                <option value="Corporate">Corporate & Enterprise (Formal)</option>
                <option value="Creative">Creative & Design (High Impact)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Default Accent Color
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setAccentColor(c.hex)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    accentColor === c.hex
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-slate-900 dark:text-white ring-2 ring-indigo-500/20"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-black/10"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Font Family
              </label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value="Inter">Inter (Clean Modern Sans)</option>
                <option value="Outfit">Outfit (Geometric Sans)</option>
                <option value="Roboto">Roboto (Corporate Sans)</option>
                <option value="Merriweather">Merriweather (Classic Serif)</option>
                <option value="JetBrains Mono">JetBrains Mono (Technical Mono)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Font Size Hierarchy
              </label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value="Small">Compact (1-Page Density)</option>
                <option value="Medium">Balanced Standard</option>
                <option value="Large">Spacious High-Legibility</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Presets */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="material-symbols-outlined text-indigo-600 text-[20px]">badge</span>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Contact Info Auto-fill Presets</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Rohit Desai"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rohit@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 019-2834"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="San Francisco, CA / Remote"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                LinkedIn URL
              </label>
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="linkedin.com/in/username"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                GitHub URL
              </label>
              <input
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="github.com/username"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/resume-studio"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving Preferences...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>Save Default Preferences</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
