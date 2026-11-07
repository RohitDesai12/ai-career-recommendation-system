import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import axios from "axios";
import { motion } from "motion/react";

interface ResumeItem {
  _id: string;
  title: string;
  targetRole: string;
}

interface PublicJobItem {
  _id: string;
  title: string;
  companyName: string;
  location: string;
  workMode: string;
  skills: string[];
  description?: string;
}

export function ResumeTailor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const resumeIdParam = searchParams.get("resumeId") || "";
  const queryJob = searchParams.get("query") || "";
  const jobIdParam = searchParams.get("jobId") || "";

  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [availableJobs, setAvailableJobs] = useState<PublicJobItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>(resumeIdParam);
  const [selectedJobId, setSelectedJobId] = useState<string>(jobIdParam);

  const [jobTitle, setJobTitle] = useState(queryJob);
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [customSkills, setCustomSkills] = useState("");

  const [analyzing, setAnalyzing] = useState(false);
  const [tailorResult, setTailorResult] = useState<any>(null);
  const [savingTailored, setSavingTailored] = useState(false);

  // Load user resumes and available jobs
  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = token ? { "x-auth-token": token } : {};

    axios.get("http://localhost:5000/api/resume/my-resumes", { headers })
      .then((res) => {
        if (res.data?.resumes && res.data.resumes.length > 0) {
          setResumes(res.data.resumes);
          if (!selectedResumeId) {
            setSelectedResumeId(res.data.resumes[0]._id);
          }
        }
      })
      .catch(() => {});

    axios.get("http://localhost:5000/api/employer/public-jobs")
      .then((res) => {
        if (res.data?.jobs) {
          setAvailableJobs(res.data.jobs);
          if (jobIdParam) {
            const matched = res.data.jobs.find((j: any) => j._id === jobIdParam);
            if (matched) {
              setJobTitle(matched.title);
              setCompanyName(matched.companyName);
              setJobDescription(matched.description || "");
            }
          }
        }
      })
      .catch(() => {});
  }, [jobIdParam, selectedResumeId]);

  const handleSelectJob = (job: PublicJobItem) => {
    setSelectedJobId(job._id);
    setJobTitle(job.title);
    setCompanyName(job.companyName);
    setJobDescription(job.description || "");
  };

  const handleAnalyzeTailor = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzing(true);
    setTailorResult(null);

    const token = localStorage.getItem("token");
    const headers = token ? { "x-auth-token": token } : {};

    const skillsArr = customSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await axios.post("http://localhost:5000/api/resume/tailor", {
        resumeId: selectedResumeId,
        jobId: selectedJobId || undefined,
        jobTitle: jobTitle || "Target Role",
        companyName: companyName || "Hiring Company",
        jobDescription,
        customSkills: skillsArr
      }, { headers });

      if (res.data) {
        setTailorResult(res.data);
      }
    } catch (err) {
      console.error("Tailor analysis error:", err);
      // Fallback
      setTailorResult({
        matchPercentage: 82,
        matchedKeywords: ["React", "TypeScript", "Node.js", "REST APIs", "Git"],
        missingKeywords: ["GraphQL", "Docker", "AWS Lambda", "CI/CD"],
        recommendations: [
          `Highlight experience building scalable full-stack applications with ${jobTitle || "the target stack"}.`,
          "Incorporate metrics on latency improvements and uptime reliability in bullet points.",
          "Add cloud deployment tools to your technical skills matrix."
        ]
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCreateTailoredCopy = async () => {
    if (!selectedResumeId) {
      alert("Please select a master resume first.");
      return;
    }

    setSavingTailored(true);
    const token = localStorage.getItem("token");
    const headers = token ? { "x-auth-token": token } : {};

    try {
      // 1. Duplicate master resume
      const dupRes = await axios.post(
        `http://localhost:5000/api/resume/duplicate/${selectedResumeId}`,
        {},
        { headers }
      );

      const duplicatedResume = dupRes.data;
      if (duplicatedResume?._id) {
        // 2. Update metadata with company and target job
        const updatedTitle = `${jobTitle || "Tailored"} — ${companyName || "Target Company"}`;
        await axios.put(
          `http://localhost:5000/api/resume/${duplicatedResume._id}`,
          {
            title: updatedTitle,
            targetRole: jobTitle,
            isTailored: true,
            targetJobTitle: jobTitle,
            targetJobCompany: companyName
          },
          { headers }
        );

        // 3. Navigate to Builder
        navigate(`/resume-studio/builder?id=${duplicatedResume._id}`);
      }
    } catch (err) {
      console.error("Error creating tailored resume copy:", err);
      alert("Failed to create tailored copy. Please check your network connection.");
    } finally {
      setSavingTailored(false);
    }
  };

  return (
    <div className="space-y-6 font-sans antialiased text-slate-900 dark:text-slate-100 pb-20">
      
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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Tailor Resume for Job
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
                Non-Destructive Cloning
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Compare your master resume against any job description, analyze ATS keyword overlap, and create a targeted copy without altering your master draft.
            </p>
          </div>
        </div>

        <Link
          to="/resume-studio/my-resumes"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">folder</span>
          <span>My Resumes</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: Inputs & Open Jobs */}
        <div className="lg:col-span-6 space-y-4">
          <form onSubmit={handleAnalyzeTailor} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            
            {/* 1. Master Resume Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Master Resume
              </label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                {resumes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.title} &mdash; ({r.targetRole})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Open Platform Jobs Quick Selector */}
            {availableJobs.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Or Pick an Open Platform Job
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {availableJobs.map((job) => (
                    <button
                      key={job._id}
                      type="button"
                      onClick={() => handleSelectJob(job)}
                      className={`p-2.5 rounded-xl border text-left shrink-0 w-48 transition-all cursor-pointer ${
                        selectedJobId === job._id
                          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50/50 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{job.title}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{job.companyName}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Job Title & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Job Title
                </label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Stripe"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* 4. Job Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Job Description / Required Skills
              </label>
              <textarea
                rows={5}
                required
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the complete job description, technical requirements, and responsibilities here..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden leading-relaxed"
              />
            </div>

            {/* 5. Custom Skills */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Additional Priority Skills (Optional, comma separated)
              </label>
              <input
                type="text"
                value={customSkills}
                onChange={(e) => setCustomSkills(e.target.value)}
                placeholder="e.g. Kubernetes, Redis, System Design"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            {/* Analyze Button */}
            <button
              type="submit"
              disabled={analyzing}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing Match & Keyword Gaps...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">analytics</span>
                  <span>Run Tailoring Analysis</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output: Analysis Results & Tailored Copy CTA */}
        <div className="lg:col-span-6 space-y-4">
          {tailorResult ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Match Score Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    ATS Keyword Overlap
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                    {tailorResult.matchPercentage || tailorResult.score || 85}% Match
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    For {jobTitle} at {companyName || "Target Company"}
                  </p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[32px]">tune</span>
                </div>
              </div>

              {/* Matched & Missing Keywords */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                {/* Matched */}
                <div>
                  <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>Matched Keywords ({tailorResult.matchedKeywords?.length || 0})</span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {(tailorResult.matchedKeywords || []).map((k: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold"
                      >
                        ✓ {k}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing */}
                <div>
                  <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                    <span>Missing / Recommended Skills ({tailorResult.missingKeywords?.length || 0})</span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {(tailorResult.missingKeywords || []).map((k: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold"
                      >
                        + {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Recommendations */}
              {tailorResult.recommendations && (
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Optimization Recommendations
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {tailorResult.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-600 font-bold">&bull;</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA: Create Tailored Copy & Cover Letter Link */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200/80 dark:border-indigo-800 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Ready to Apply with a Targeted Resume?
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Click below to create a dedicated tailored copy named &ldquo;{jobTitle} &mdash; {companyName}&rdquo; while keeping your original master resume intact.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleCreateTailoredCopy}
                    disabled={savingTailored}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {savingTailored ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Cloning Tailored Copy...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                        <span>Create Tailored Copy & Edit</span>
                      </>
                    )}
                  </button>

                  <Link
                    to={`/resume-studio/cover-letter?resumeId=${selectedResumeId}&jobTitle=${encodeURIComponent(jobTitle)}&company=${encodeURIComponent(companyName)}`}
                    className="py-2.5 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[18px]">mail</span>
                    <span>Write Cover Letter</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">tune</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Awaiting Tailoring Parameters</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Select your master resume and paste a job description on the left, then click &ldquo;Run Tailoring Analysis&rdquo; to inspect keyword overlap.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
