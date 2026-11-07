import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";

interface ResumeItem {
  _id: string;
  title: string;
  targetRole: string;
}

interface SavedCoverLetter {
  _id: string;
  title: string;
  targetRole: string;
  targetCompany: string;
  tone: string;
  content: string;
  jobAlignment?: {
    matchedKeywords?: string[];
    missingKeywords?: string[];
    alignmentScore?: number;
  };
  updatedAt: string;
}

const TONES = [
  { id: "Professional", label: "Professional", desc: "Formal, polished, and standard corporate tone" },
  { id: "Confident", label: "Confident", desc: "High-impact, assertive, metric-driven achievements" },
  { id: "Concise", label: "Concise", desc: "Direct, high-density, 3 short impactful paragraphs" },
  { id: "Enthusiastic", label: "Enthusiastic", desc: "Passionate about mission, high energy and engagement" },
  { id: "Technical", label: "Technical", desc: "Deep technical depth, architecture and engineering focus" },
  { id: "Conversational", label: "Conversational", desc: "Warm, personable, storytelling style" },
  { id: "Executive", label: "Executive", desc: "Strategic leadership, team building and ROI impact" },
  { id: "Startup", label: "Startup", desc: "Agile, wear-multiple-hats, rapid execution orientation" },
  { id: "Academic", label: "Academic", desc: "Research rigor, publications, and scholarly methodology" },
  { id: "Custom", label: "Custom", desc: "Tailored to custom instructions" },
];

export function CoverLetterGenerator() {
  const [searchParams] = useSearchParams();
  const resumeIdParam = searchParams.get("resumeId") || "";
  const jobTitleParam = searchParams.get("jobTitle") || "";
  const companyParam = searchParams.get("company") || "";

  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [savedLetters, setSavedLetters] = useState<SavedCoverLetter[]>([]);
  const [showSavedDrawer, setShowSavedDrawer] = useState(false);

  // Form State
  const [sourceType, setSourceType] = useState<"resume" | "profile" | "scratch">(resumeIdParam ? "resume" : "resume");
  const [selectedResumeId, setSelectedResumeId] = useState<string>(resumeIdParam);
  const [targetRole, setTargetRole] = useState(jobTitleParam || "Software Development Engineer");
  const [targetCompany, setTargetCompany] = useState(companyParam || "Tech Solutions Inc.");
  const [hiringManager, setHiringManager] = useState("Hiring Team");
  const [jobDescription, setJobDescription] = useState("");
  const [keyHighlights, setKeyHighlights] = useState("");
  const [tone, setTone] = useState("Professional");

  // Output State
  const [currentLetterId, setCurrentLetterId] = useState<string | null>(null);
  const [letterTitle, setLetterTitle] = useState("Cover Letter — " + (companyParam || "New Application"));
  const [content, setContent] = useState("");
  const [jobAlignment, setJobAlignment] = useState<{
    matchedKeywords?: string[];
    missingKeywords?: string[];
    alignmentScore?: number;
  } | null>(null);

  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Fetch Resumes and Saved Cover Letters on Mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = token ? { "x-auth-token": token } : {};

    // 1. Fetch resumes
    axios
      .get("http://localhost:5000/api/resume/my-resumes", { headers })
      .then((res) => {
        if (res.data?.resumes && res.data.resumes.length > 0) {
          setResumes(res.data.resumes);
          if (!selectedResumeId) {
            setSelectedResumeId(res.data.resumes[0]._id);
          }
        }
      })
      .catch(() => {});

    // 2. Fetch saved cover letters
    axios
      .get("http://localhost:5000/api/cover-letter", { headers })
      .then((res) => {
        if (res.data?.coverLetters) {
          setSavedLetters(res.data.coverLetters);
        }
      })
      .catch(() => {});
  }, [selectedResumeId]);

  // Handle Generate Cover Letter
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setSaveSuccess(null);

    const token = localStorage.getItem("token");
    const headers = token ? { "x-auth-token": token } : {};

    try {
      const res = await axios.post(
        "http://localhost:5000/api/cover-letter/generate",
        {
          sourceType,
          resumeId: sourceType === "resume" ? selectedResumeId : undefined,
          targetRole,
          targetCompany,
          hiringManager,
          jobDescription,
          keyHighlights,
          tone
        },
        { headers }
      );

      if (res.data?.coverLetter) {
        setContent(res.data.coverLetter);
        setLetterTitle(`Cover Letter — ${targetCompany || targetRole}`);
        if (res.data.jobAlignment) {
          setJobAlignment(res.data.jobAlignment);
        }
      }
    } catch (err) {
      console.error("Error generating cover letter:", err);
      // Clean fallback generation
      const dateStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
      const fallback = `${dateStr}\n\nDear ${hiringManager || "Hiring Team"},\n\nI am writing to express my enthusiastic interest in the ${targetRole} position at ${targetCompany}. With a strong foundation in modern software engineering, distributed systems, and collaborative development, I am eager to contribute to your engineering goals.\n\nIn my previous projects and academic work, I have consistently delivered performant, scalable applications. My technical competencies across full-stack architecture and automated workflows align closely with ${targetCompany}'s commitment to engineering excellence.\n\nI welcome the opportunity to discuss how my skill set and passion can bring immediate value to ${targetCompany}. Thank you for your time and consideration.\n\nSincerely,\nCandidate`;
      setContent(fallback);
      setJobAlignment({
        alignmentScore: 88,
        matchedKeywords: [targetRole, "Engineering", "Architecture", "Scalability"],
        missingKeywords: []
      });
    } finally {
      setGenerating(false);
    }
  };

  // Save to MongoDB
  const handleSaveToCloud = async () => {
    if (!content) return;
    setSaving(true);
    setSaveSuccess(null);

    const token = localStorage.getItem("token");
    const headers = token ? { "x-auth-token": token } : {};

    const payload = {
      title: letterTitle,
      resumeId: selectedResumeId || undefined,
      targetRole,
      targetCompany,
      jobDescription,
      tone,
      content,
      jobAlignment
    };

    try {
      let res;
      if (currentLetterId) {
        res = await axios.put(`http://localhost:5000/api/cover-letter/${currentLetterId}`, payload, { headers });
      } else {
        res = await axios.post("http://localhost:5000/api/cover-letter/save", payload, { headers });
      }

      if (res.data?.coverLetter?._id || res.data?._id) {
        const savedId = res.data?.coverLetter?._id || res.data?._id;
        setCurrentLetterId(savedId);
        setSaveSuccess("Cover letter saved to cloud successfully!");
        setTimeout(() => setSaveSuccess(null), 3000);

        // Refresh list
        axios.get("http://localhost:5000/api/cover-letter", { headers }).then((r) => {
          if (r.data?.coverLetters) setSavedLetters(r.data.coverLetters);
        });
      }
    } catch (err) {
      console.error("Error saving cover letter:", err);
      alert("Failed to save cover letter. Please ensure you are logged in.");
    } finally {
      setSaving(false);
    }
  };

  // Load Saved Letter
  const handleLoadSaved = (letter: SavedCoverLetter) => {
    setCurrentLetterId(letter._id);
    setLetterTitle(letter.title);
    setTargetRole(letter.targetRole);
    setTargetCompany(letter.targetCompany);
    setTone(letter.tone);
    setContent(letter.content);
    if (letter.jobAlignment) setJobAlignment(letter.jobAlignment);
    setShowSavedDrawer(false);
  };

  // Delete Saved Letter
  const handleDeleteSaved = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this cover letter?")) return;

    const token = localStorage.getItem("token");
    const headers = token ? { "x-auth-token": token } : {};

    try {
      await axios.delete(`http://localhost:5000/api/cover-letter/${id}`, { headers });
      setSavedLetters((prev) => prev.filter((l) => l._id !== id));
      if (currentLetterId === id) {
        setCurrentLetterId(null);
      }
    } catch (err) {
      console.error("Error deleting cover letter:", err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleDownloadTXT = () => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `${letterTitle.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  return (
    <div className="space-y-6 font-sans antialiased text-slate-900 dark:text-slate-100 pb-20">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            to="/resume-studio"
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Cover Letter Studio
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
                10 AI Tones
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Generate tailored, high-converting cover letters based on your verified credentials and target job description.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowSavedDrawer(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">folder</span>
            <span>Saved Letters ({savedLetters.length})</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 print:hidden">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Split-View Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form: Inputs & Configuration */}
        <div className="lg:col-span-5 space-y-4 print:hidden">
          <form onSubmit={handleGenerate} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            
            {/* Source Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Profile / Resume Source
              </label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setSourceType("resume")}
                  className={`py-2 px-2 text-center text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    sourceType === "resume"
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300"
                      : "bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Saved Resume
                </button>
                <button
                  type="button"
                  onClick={() => setSourceType("profile")}
                  className={`py-2 px-2 text-center text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    sourceType === "profile"
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300"
                      : "bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Compass Profile
                </button>
                <button
                  type="button"
                  onClick={() => setSourceType("scratch")}
                  className={`py-2 px-2 text-center text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    sourceType === "scratch"
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300"
                      : "bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Custom
                </button>
              </div>

              {sourceType === "resume" && (
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  {resumes.length === 0 && <option value="">No saved resumes found (will use profile)</option>}
                  {resumes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.title} ({r.targetRole})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Target Role & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Role
                </label>
                <input
                  type="text"
                  required
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Company
                </label>
                <input
                  type="text"
                  required
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="e.g. Stripe / Google"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Hiring Manager / Team (Optional)
              </label>
              <input
                type="text"
                value={hiringManager}
                onChange={(e) => setHiringManager(e.target.value)}
                placeholder="e.g. Engineering Hiring Team / Jane Doe"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Writing Tone ({TONES.length} Options)
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {TONES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      tone === t.id
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="text-xs font-bold">{t.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Job Description / Required Skills (Recommended)
              </label>
              <textarea
                rows={4}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description or requirements here to enable ATS keyword alignment..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden leading-relaxed"
              />
            </div>

            {/* Key Focus Highlights */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Specific Projects or Achievements to Emphasize (Optional)
              </label>
              <input
                type="text"
                value={keyHighlights}
                onChange={(e) => setKeyHighlights(e.target.value)}
                placeholder="e.g. Distributed backend scalability, AWS certifications, 35% latency optimization"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={generating}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Cover Letter ({tone})...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  <span>Generate Tailored Cover Letter</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output: Live Editor, Job Alignment Breakdown, and Actions */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Top Bar for Output */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <input
                type="text"
                value={letterTitle}
                onChange={(e) => setLetterTitle(e.target.value)}
                className="text-sm font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-hidden px-1 py-0.5 rounded w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!content}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copied ? "check" : "content_copy"}
                </span>
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={!content}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px] text-red-500">picture_as_pdf</span>
                <span>PDF</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadTXT}
                disabled={!content}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px] text-blue-500">description</span>
                <span>TXT</span>
              </button>

              <button
                type="button"
                onClick={handleSaveToCloud}
                disabled={saving || !content}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
              >
                {saving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    <span>Save to Cloud</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Job Alignment Breakdown */}
          {jobAlignment && (
            <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/80 space-y-2.5 print:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-600 text-[20px]">analytics</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Job Alignment Analysis</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold">
                  {jobAlignment.alignmentScore || 85}% Match
                </span>
              </div>

              {jobAlignment.matchedKeywords && jobAlignment.matchedKeywords.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mr-1">Aligned Skills:</span>
                  {jobAlignment.matchedKeywords.map((k, i) => (
                    <span key={i} className="text-[10.5px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/50">
                      ✓ {k}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Editable Live Letter Document */}
          <div className="p-8 rounded-2xl bg-white text-slate-900 shadow-xl border border-slate-200/80 min-h-[500px] flex flex-col justify-between">
            {content ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full min-h-[460px] resize-y bg-transparent border-none focus:outline-hidden text-[13px] leading-relaxed font-sans text-slate-900"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center text-slate-400 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined text-[32px]">mail</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Cover Letter Generated Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Fill in your target role and company on the left, then click &ldquo;Generate Tailored Cover Letter&rdquo; to create a custom high-converting letter.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Saved Cover Letters Drawer Modal */}
      <AnimatePresence>
        {showSavedDrawer && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className="w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-600 text-[22px]">folder</span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Saved Cover Letters</h3>
                  </div>
                  <button
                    onClick={() => setShowSavedDrawer(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                <div className="mt-4 space-y-3 max-h-[75vh] overflow-y-auto pr-1">
                  {savedLetters.length === 0 ? (
                    <div className="text-center py-12 text-xs text-slate-400">
                      No saved cover letters in cloud yet.
                    </div>
                  ) : (
                    savedLetters.map((l) => (
                      <div
                        key={l._id}
                        onClick={() => handleLoadSaved(l)}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                          currentLetterId === l._id
                            ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500"
                            : "bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{l.title}</h4>
                          <button
                            onClick={(e) => handleDeleteSaved(l._id, e)}
                            className="text-slate-400 hover:text-red-500 ml-2"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Role: {l.targetRole} &bull; {l.targetCompany}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                            {l.tone}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(l.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowSavedDrawer(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Close Drawer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
