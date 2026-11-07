import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/auth-context";
import { motion } from "motion/react";
import axios from "axios";

interface ResumeItem {
  _id: string;
  title: string;
  targetRole: string;
  template: string;
  isTailored?: boolean;
  targetJobTitle?: string;
  targetJobCompany?: string;
  score?: {
    overall?: number;
    atsScore?: number;
    contentQuality?: number;
    skillsMatch?: number;
    structureFormat?: number;
  };
  updatedAt: string;
}

interface CoverLetterItem {
  _id: string;
  title: string;
  targetRole: string;
  targetCompany: string;
  tone: string;
  content: string;
  updatedAt: string;
}

interface PublicJobItem {
  _id: string;
  title: string;
  companyName: string;
  location: string;
  type: string;
  workMode: string;
  skills: string[];
}

export function ResumeStudioOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetterItem[]>([]);
  const [recentJobs, setRecentJobs] = useState<PublicJobItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Fetch student data on mount
  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem("token");
    const headers = token ? { "x-auth-token": token } : {};

    async function loadData() {
      try {
        const [profileRes, resumesRes, coverLettersRes, jobsRes] = await Promise.allSettled([
          axios.get("http://localhost:5000/api/profile/me", { headers }),
          axios.get("http://localhost:5000/api/resume/my-resumes", { headers }),
          axios.get("http://localhost:5000/api/cover-letter", { headers }),
          axios.get("http://localhost:5000/api/employer/public-jobs")
        ]);

        if (!isMounted) return;

        if (profileRes.status === "fulfilled") {
          setProfile(profileRes.value.data);
        }
        if (resumesRes.status === "fulfilled" && resumesRes.value.data?.resumes) {
          setResumes(resumesRes.value.data.resumes);
        }
        if (coverLettersRes.status === "fulfilled" && coverLettersRes.value.data?.coverLetters) {
          setCoverLetters(coverLettersRes.value.data.coverLetters);
        }
        if (jobsRes.status === "fulfilled" && jobsRes.value.data?.jobs) {
          setRecentJobs(jobsRes.value.data.jobs.slice(0, 3));
        }
      } catch (err) {
        console.error("Error loading Resume Studio overview data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:5000/api/resume/duplicate/${id}`,
        {},
        { headers: { "x-auth-token": token } }
      );
      if (res.data) {
        setResumes((prev) => [res.data, ...prev]);
        setActiveMenuId(null);
      }
    } catch (err) {
      console.error("Failed to duplicate resume:", err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this resume?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/resume/${id}`, {
        headers: { "x-auth-token": token }
      });
      setResumes((prev) => prev.filter((r) => r._id !== id));
      setActiveMenuId(null);
    } catch (err) {
      console.error("Failed to delete resume:", err);
    }
  };

  // Compute Resume Health Score from either primary resume or analyzed profile data
  const primaryResume = resumes[0];
  const profileResumeData = profile?.resumeData;

  const overallScore = primaryResume?.score?.overall || profileResumeData?.atsScore || 85;
  const tailoredCount = resumes.filter((r) => r.isTailored).length;

  return (
    <div className="space-y-6 font-sans antialiased text-slate-900 dark:text-slate-100 pb-20">
      
      {/* Top Banner / Welcome (Light, Minimal, Professional Style) */}
      <div className="rounded-3xl bg-white p-7 sm:p-8 relative overflow-hidden shadow-xs border border-[#E7E3F2]">
        {/* Subtle Radial Purple Decoration */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-[#F3EEFF]/60 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3EEFF] border border-[#E3D8FF] text-[#5B2BE0] text-xs font-bold">
            <span className="material-symbols-outlined text-[16px] text-[#5B2BE0]">auto_awesome</span>
            <span>Next-Gen Career Compass Resume Studio</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#111827]">
              Welcome to Your Professional Resume Workspace
            </h1>
            <p className="text-xs sm:text-sm text-[#667085] mt-1 leading-relaxed max-w-2xl">
              Create ATS-optimized resumes, tailor applications for specific roles, generate personalized cover letters, and track your scoring metrics in one unified studio.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/resume-studio/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all hover:scale-102"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Create New Resume</span>
            </Link>

            <Link
              to="/resume-studio/templates"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-slate-700 text-xs font-bold transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
              <span>Browse 8 Templates</span>
            </Link>

            <Link
              to="/resume-studio/cover-letter"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-slate-700 text-xs font-bold transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">mail</span>
              <span>Cover Letter Studio</span>
            </Link>

            <Link
              to="/resume"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-slate-700 text-xs font-bold transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">document_scanner</span>
              <span>ML Analyzer</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Resumes */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Resumes</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{resumes.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{tailoredCount} Tailored Copies</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">description</span>
          </div>
        </div>

        {/* Metric 2: Average ATS Health */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Resume Health Score</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{overallScore}%</div>
            <div className="text-[10px] text-emerald-600/80 font-bold mt-0.5">ATS Optimized</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">verified</span>
          </div>
        </div>

        {/* Metric 3: Cover Letters */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Cover Letters</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{coverLetters.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Saved in Cloud</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">mail</span>
          </div>
        </div>

        {/* Metric 4: Target Career Direction */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Target Career</div>
            <div className="text-sm font-black text-slate-900 dark:text-white mt-1 line-clamp-1">
              {profile?.targetCareer || "Software Engineer"}
            </div>
            <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">Verified Direction</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">explore</span>
          </div>
        </div>

      </div>

      {/* Main Content Grid: Recent Resumes & Quick Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Recent Resumes Workspace */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600 text-[22px]">folder_open</span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Resumes</h2>
            </div>
            <Link
              to="/resume-studio/my-resumes"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All ({resumes.length})</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {resumes.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px]">edit_document</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Resumes Created Yet</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Start by importing your verified profile data, uploading an existing PDF/DOCX, or choosing an ATS-friendly template.
                </p>
              </div>
              <Link
                to="/resume-studio/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Get Started in Create Hub</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resumes.slice(0, 4).map((r) => (
                <div
                  key={r._id}
                  onClick={() => navigate(`/resume-studio/builder?id=${r._id}`)}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[18px]">description</span>
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                            {r.title}
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {r.targetRole}
                          </p>
                        </div>
                      </div>

                      {/* 3-Dot Quick Action Dropdown */}
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(activeMenuId === r._id ? null : r._id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">more_vert</span>
                        </button>

                        {activeMenuId === r._id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-30">
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                navigate(`/resume-studio/builder?id=${r._id}`);
                              }}
                              className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                              <span>Edit Resume</span>
                            </button>

                            <button
                              onClick={(e) => handleDuplicate(r._id, e)}
                              className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-[16px]">content_copy</span>
                              <span>Duplicate</span>
                            </button>

                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                navigate(`/resume-studio/tailor?resumeId=${r._id}`);
                              }}
                              className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-[16px]">tune</span>
                              <span>Tailor for Job</span>
                            </button>

                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                navigate(`/resume-studio/cover-letter?resumeId=${r._id}`);
                              }}
                              className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-[16px]">mail</span>
                              <span>Create Cover Letter</span>
                            </button>

                            <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                            <button
                              onClick={(e) => handleDelete(r._id, e)}
                              className="w-full px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mt-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {r.template}
                      </span>
                      {r.isTailored && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800">
                          Tailored
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                        ATS {r.score?.atsScore || 90}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Updated {new Date(r.updatedAt).toLocaleDateString()}</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Open <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent Cover Letters */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 text-[20px]">mail</span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Cover Letters</h3>
              </div>
              <Link
                to="/resume-studio/cover-letter"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Open Studio
              </Link>
            </div>

            {coverLetters.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 text-center">
                No cover letters generated yet. Click &ldquo;Cover Letter Studio&rdquo; to create your first tailored letter.
              </div>
            ) : (
              <div className="space-y-2">
                {coverLetters.slice(0, 3).map((cl) => (
                  <div
                    key={cl._id}
                    onClick={() => navigate(`/resume-studio/cover-letter`)}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{cl.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {cl.targetRole} &bull; {cl.targetCompany} ({cl.tone})
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date(cl.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Studio Hub Links & Instant Job Tailoring */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Quick Hub Actions */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Studio Quick Links
            </h3>

            <div className="space-y-2">
              <Link
                to="/resume-studio/create"
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200/60 dark:border-slate-700 flex items-center gap-3 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    Create Resume Hub
                  </div>
                  <div className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    Import Profile, PDF, LinkedIn, Scratch
                  </div>
                </div>
              </Link>

              <Link
                to="/resume-studio/templates"
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200/60 dark:border-slate-700 flex items-center gap-3 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">dashboard_customize</span>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    Template Gallery
                  </div>
                  <div className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    8 ATS & Modern Categories
                  </div>
                </div>
              </Link>

              <Link
                to="/resume-studio/tailor"
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200/60 dark:border-slate-700 flex items-center gap-3 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    Tailor for Job
                  </div>
                  <div className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    Keyword match & non-destructive clone
                  </div>
                </div>
              </Link>

              <Link
                to="/resume-studio/settings"
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200/60 dark:border-slate-700 flex items-center gap-3 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    Studio Settings
                  </div>
                  <div className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    Default template, colors & presets
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Instant Job Tailoring Opportunities */}
          {recentJobs.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Live Job Match
                </h3>
                <Link to="/jobs" className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                  Browse Jobs
                </Link>
              </div>

              <div className="space-y-2.5">
                {recentJobs.map((job) => (
                  <div
                    key={job._id}
                    className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-2"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{job.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {job.companyName} &bull; {job.location}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        to={`/resume-studio/tailor?jobId=${job._id}&query=${encodeURIComponent(job.title)}`}
                        className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold text-center transition-colors shadow-2xs"
                      >
                        Tailor Resume
                      </Link>
                      <Link
                        to={`/resume-studio/cover-letter?jobTitle=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.companyName)}`}
                        className="py-1.5 px-2.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-[11px] font-bold text-center transition-colors"
                      >
                        Cover Letter
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
