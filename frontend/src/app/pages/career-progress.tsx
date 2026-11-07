import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/auth-context";
import axios from "axios";
import {
  TrendingUp,
  Target,
  Map,
  FileText,
  Mic,
  Award,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ChevronRight,
  AlertCircle,
  BarChart3,
  Bookmark,
  RefreshCw,
  Zap
} from "lucide-react";
import { CircularProgress } from "../components/ui/circular-progress";

export function CareerProgressPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [savedPrepsCount, setSavedPrepsCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);

  useEffect(() => {
    async function loadProgressData() {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = token ? { "x-auth-token": token } : undefined;

      try {
        // 1. Profile Data
        const pRes = await axios.get("http://localhost:5000/api/profile/me", { headers });
        if (pRes.data) setProfileData(pRes.data);
      } catch (err) {
        console.warn("Could not load profile:", err);
      }

      try {
        // 2. Roadmap Data
        const rRes = await axios.get("http://localhost:5000/api/roadmap", { headers });
        if (rRes.data) setRoadmapData(rRes.data);
      } catch (err) {
        console.warn("Could not load roadmap:", err);
      }

      try {
        // 3. Saved Preps Count
        const prepRes = await axios.get("http://localhost:5000/api/interview-prep/saved", { headers });
        if (prepRes.data?.savedPreps) setSavedPrepsCount(prepRes.data.savedPreps.length);
      } catch (err) {
        console.warn("Could not load saved preps count:", err);
      }

      try {
        // 4. Applications Count
        const appRes = await axios.get("http://localhost:5000/api/employer/my-applications", { headers });
        if (appRes.data?.applications) setApplicationsCount(appRes.data.applications.length);
      } catch (err) {
        console.warn("Could not load applications count:", err);
      }

      setLoading(false);
    }

    loadProgressData();
  }, [user]);

  // Dynamic Career Readiness Score Calculation
  const calculateCareerReadiness = () => {
    let score = 0;
    // Factor 1: Profile Completeness (Max 20)
    if (profileData?.skills?.length > 0) score += 10;
    if (profileData?.projects?.length > 0) score += 10;

    // Factor 2: Roadmap Progress (Max 35)
    if (roadmapData?.percentComplete) {
      score += Math.round((roadmapData.percentComplete / 100) * 35);
    }

    // Factor 3: Resume ATS Score (Max 25)
    if (profileData?.resumeData?.atsScore) {
      score += Math.round((profileData.resumeData.atsScore / 100) * 25);
    }

    // Factor 4: Interview & Application Prep (Max 20)
    if (savedPrepsCount > 0) score += 10;
    if (applicationsCount > 0) score += 10;

    return Math.min(100, Math.max(15, score));
  };

  const careerReadiness = calculateCareerReadiness();

  const targetCareer = profileData?.targetCareer || profileData?.recommendedCareers?.[0]?.title || null;
  const topMatch = profileData?.recommendedCareers?.[0] || null;
  const atsScore = profileData?.resumeData?.atsScore ?? null;
  const resumeRole = profileData?.resumeData?.role ?? null;
  const resumeStrengths = profileData?.resumeData?.strengths || [];
  const resumeImprovements = profileData?.resumeData?.improvements || [];

  const roadmapStages = roadmapData?.stages || [];
  const stagesComplete = roadmapData?.stagesComplete || 0;
  const totalStages = roadmapData?.totalStages || roadmapStages.length || 0;
  const roadmapPct = roadmapData?.percentComplete || 0;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Calculating your career progress...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* 1. Header Overview Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-200/60">
              Live Readiness Index
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Career Progress & Readiness
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Real-time multi-dimensional tracking of your career goals, milestone roadmaps, ATS compatibility, and placement readiness.
          </p>
        </div>

        {/* Readiness Circular Gauge Card */}
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 min-w-[260px] shrink-0">
          <CircularProgress
            value={careerReadiness}
            size="md"
            variant="auto"
          />

          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-800">Overall Career Readiness</span>
            <span className="text-[11px] text-slate-500 mt-0.5">
              {careerReadiness >= 75
                ? "Excellent Placement Ready 🎉"
                : careerReadiness >= 50
                ? "Solid Trajectory · Keep Going"
                : "Initial Phase · Complete Steps"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top 4 Progress Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Pillar 1: Career Goal */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
              {topMatch?.confidence ? `${topMatch.confidence}% Fit` : "Goal"}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Career Goal</span>
            <h3 className="text-sm font-bold text-slate-900 truncate mt-0.5" title={targetCareer || "Set Career Goal"}>
              {targetCareer || "Set Career Goal"}
            </h3>
          </div>
          <Link
            to="/assessment"
            className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
          >
            {targetCareer ? "View Path" : "Take Assessment"} <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Pillar 2: Roadmap Stages */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Map className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              {roadmapPct}% Done
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Roadmap Milestones</span>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">
              {totalStages > 0 ? `${stagesComplete} / ${totalStages} Stages` : "Not Started"}
            </h3>
          </div>
          <Link
            to="/roadmap"
            className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
          >
            {totalStages > 0 ? "Continue Roadmap" : "Generate Roadmap"} <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Pillar 3: Resume ATS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${atsScore ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
              {atsScore ? "Evaluated" : "Pending"}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Resume ATS Score</span>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">
              {atsScore !== null ? `${atsScore}% Compatibility` : "Scan Needed"}
            </h3>
          </div>
          <Link
            to="/resume"
            className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
          >
            {atsScore !== null ? "Re-scan Resume" : "Upload Resume"} <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Pillar 4: Interview Readiness */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Mic className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
              {savedPrepsCount} Guides
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Interview Readiness</span>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">
              {savedPrepsCount > 0 ? `${savedPrepsCount} Saved Preps` : "Practice Ready"}
            </h3>
          </div>
          <Link
            to="/interview-prep"
            className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
          >
            Practice Rounds <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

      </div>

      {/* 3. Deep Breakdown Sections (2 Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (7 / 12) - Roadmap & Skills Progression */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Roadmap Milestones Breakdown */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Map className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">Milestone Stage Progress</h3>
                </div>
                <p className="text-xs text-slate-500">
                  {roadmapData?.field || targetCareer || "Personalized Engineering Roadmap"}
                </p>
              </div>
              <Link to="/roadmap" className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-0.5">
                Full Roadmap <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {roadmapStages.length > 0 ? (
              <div className="space-y-3">
                {roadmapStages.map((stage: any, idx: number) => {
                  const isDone = stage.status === "Completed";
                  const inProg = stage.status === "In progress";
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                        inProg
                          ? "bg-indigo-50/40 border-indigo-200 shadow-xs"
                          : isDone
                          ? "bg-emerald-50/30 border-emerald-200/70"
                          : "bg-slate-50/70 border-slate-200/60"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold mt-0.5 ${
                          isDone
                            ? "bg-emerald-500 text-white"
                            : inProg
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {isDone ? "✓" : idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{stage.title}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isDone
                                ? "bg-emerald-100 text-emerald-800"
                                : inProg
                                ? "bg-indigo-100 text-indigo-800"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {stage.status}
                          </span>
                        </div>

                        {stage.skills && stage.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {stage.skills.map((s: any, sIdx: number) => (
                              <span
                                key={sIdx}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                                  s.completed
                                    ? "bg-emerald-100/60 text-emerald-800 border border-emerald-200"
                                    : "bg-white border border-slate-200 text-slate-600"
                                }`}
                              >
                                {s.name} {s.completed && "✓"}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                <Map className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-xs font-bold text-slate-800">No active roadmap path</h4>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">Generate a step-by-step engineering roadmap to start tracking stages.</p>
                <Link
                  to="/assessment"
                  className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 transition-all mt-1"
                >
                  Create Roadmap <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Profile Skills Mastery Checklist */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Profile Skills Inventory</h3>
              </div>
              <Link to="/profile" className="text-xs font-bold text-indigo-600 hover:underline">
                Manage Skills
              </Link>
            </div>

            {profileData?.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((sk: string) => (
                  <span
                    key={sk}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-800 text-xs font-semibold"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    {sk}
                  </span>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                <p className="text-xs text-slate-500">No skills added to your profile yet.</p>
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-all"
                >
                  + Add Skills in Profile
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* Right Column (5 / 12) - ATS Diagnostics & AI Prep Suite */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Resume & ATS Health Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Resume ATS Diagnostics</h3>
              </div>
              <Link to="/resume" className="text-xs font-bold text-indigo-600 hover:underline">
                {atsScore !== null ? "Re-scan" : "Upload"}
              </Link>
            </div>

            {atsScore !== null ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Evaluated Role</span>
                    <h4 className="text-sm font-bold text-slate-900 truncate">{resumeRole || targetCareer || "Tech Role"}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">ATS Score</span>
                    <h4 className="text-lg font-bold text-emerald-600">{atsScore}%</h4>
                  </div>
                </div>

                {resumeStrengths.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Matched Keywords</span>
                    <div className="flex flex-wrap gap-1">
                      {resumeStrengths.map((st: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                          ✓ {st}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {resumeImprovements.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggested Optimizations</span>
                    <div className="space-y-1 text-[11px] text-slate-600">
                      {resumeImprovements.map((imp: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span className="line-clamp-1">{imp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-medium text-slate-600">Scan your resume to calculate keyword overlap and ATS compatibility.</p>
                <Link
                  to="/resume"
                  className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 transition-all mt-1"
                >
                  Upload Resume <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Quick AI Acceleration Suite */}
          <div className="bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 border border-indigo-100 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Career Acceleration Tools</h3>
            </div>

            <div className="space-y-2.5">
              <Link
                to="/mock-interview"
                className="p-3.5 rounded-2xl bg-white border border-slate-200/70 hover:border-indigo-300 hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      AI Mock Interview Simulation
                    </h4>
                    <p className="text-[10px] text-slate-500">Practice role-specific voice & tech rounds</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
              </Link>

              <Link
                to="/interview-prep"
                className="p-3.5 rounded-2xl bg-white border border-slate-200/70 hover:border-indigo-300 hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Company Question Bank
                    </h4>
                    <p className="text-[10px] text-slate-500">DSA, System Design & Core Engineering</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
              </Link>

              <div
                onClick={() => window.dispatchEvent(new CustomEvent("open-career-assistant"))}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/70 hover:border-indigo-300 hover:shadow-xs transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Career Compass AI Assistant
                    </h4>
                    <p className="text-[10px] text-slate-500">Strategy, salary advice & roadmap guidance</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
export default CareerProgressPage;
