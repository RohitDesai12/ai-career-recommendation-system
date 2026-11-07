import React from "react";
import { Link } from "react-router";
import { JobItem, CareerMatchInfo } from "./types";
import {
  X,
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertOctagon,
  Globe,
  Plane,
  ShieldAlert,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  BookOpen,
  Layers,
  FileText,
  MessagesSquare,
  Clock
} from "lucide-react";

interface JobDetailsDrawerProps {
  job: JobItem | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (job: JobItem) => void;
  onApplyExternal: (job: JobItem) => void;
}

export const JobDetailsDrawer: React.FC<JobDetailsDrawerProps> = ({
  job,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
  onApplyExternal,
}) => {
  if (!isOpen || !job) return null;

  const matchScore = job.matchScore ?? 75;
  const breakdown = job.matchBreakdown || {
    technicalSkills: 75,
    educationRelevance: 85,
    experienceCompatibility: 90,
    careerInterest: 80,
    locationPreference: 70
  };

  const matchedSkills = job.matchedSkills || [];
  const missingSkills = job.missingSkills || [];
  const readiness = job.readiness || {
    strongMatches: ["Academic degree aligns with engineering requirements", "Experience level fits profile"],
    skillsToImprove: missingSkills.slice(0, 3),
    eligibilityConcerns: [],
    recommendedPreparation: []
  };

  const initials = job.companyName
    ? job.companyName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "CO";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-2xs animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Body */}
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/70">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-900 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-700 truncate">
                  {job.companyName}
                </span>
                {job.verificationStatus === "Verified" && (
                  <ShieldCheck
                    className="w-4 h-4 text-blue-500 shrink-0"
                    title="Verified Official Career Source"
                  />
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                {job.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onToggleSave(job)}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
              title={isSaved ? "Remove from saved" : "Save opportunity"}
            >
              {isSaved ? (
                <BookmarkCheck className="w-5 h-5 text-indigo-600 fill-indigo-100" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-800">
          {/* Metadata Highlights Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <div className="text-[10.5px] uppercase font-bold text-slate-400 tracking-wider">
                Location
              </div>
              <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                {job.location}
              </div>
            </div>
            <div>
              <div className="text-[10.5px] uppercase font-bold text-slate-400 tracking-wider">
                Work Mode
              </div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">
                {job.workMode}
              </div>
            </div>
            <div>
              <div className="text-[10.5px] uppercase font-bold text-slate-400 tracking-wider">
                Experience
              </div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">
                {job.experience}
              </div>
            </div>
            <div>
              <div className="text-[10.5px] uppercase font-bold text-slate-400 tracking-wider">
                Salary
              </div>
              <div className="text-xs font-bold text-emerald-700 mt-0.5 truncate">
                {job.salary || "Disclosed in interview"}
              </div>
            </div>
          </div>

          {/* SECTION: APPLICATION & VISA ELIGIBILITY INTELLIGENCE */}
          {job.applicationEligibility && (
            <div className={`p-5 rounded-2xl border shadow-2xs space-y-3.5 ${
              job.applicationEligibility.status === 'GREEN'
                ? 'bg-emerald-50/50 border-emerald-200/80'
                : job.applicationEligibility.status === 'YELLOW'
                ? 'bg-amber-50/50 border-amber-200/80'
                : 'bg-rose-50/50 border-rose-200/80'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {job.applicationEligibility.status === 'GREEN' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : job.applicationEligibility.status === 'YELLOW' ? (
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  ) : (
                    <AlertOctagon className="w-4 h-4 text-rose-600" />
                  )}
                  <h3 className="text-sm font-bold text-slate-900">
                    Application Eligibility Assessment
                  </h3>
                </div>
                <div className={`px-2.5 py-1 rounded-xl text-xs font-bold border shadow-xs ${
                  job.applicationEligibility.status === 'GREEN'
                    ? 'bg-emerald-100/80 text-emerald-800 border-emerald-300'
                    : job.applicationEligibility.status === 'YELLOW'
                    ? 'bg-amber-100/80 text-amber-800 border-amber-300'
                    : 'bg-rose-100/80 text-rose-800 border-rose-300'
                }`}>
                  {job.applicationEligibility.label}
                </div>
              </div>

              {/* Reasons evaluated */}
              <ul className="space-y-1.5 pt-1">
                {job.applicationEligibility.reasons.map((reason, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className={`font-bold mt-0.5 ${
                      job.applicationEligibility?.status === 'GREEN'
                        ? 'text-emerald-500'
                        : job.applicationEligibility?.status === 'YELLOW'
                        ? 'text-amber-500'
                        : 'text-rose-500'
                    }`}>•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>

              {/* Work Authorization & Visa Details Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/80 border border-slate-200/60">
                  <Plane className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <div>
                    <span className="text-[10.5px] text-slate-400 font-semibold block">Visa Sponsorship</span>
                    <span className="font-bold text-slate-800">{job.visaSponsorship || 'Unspecified'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/80 border border-slate-200/60">
                  <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <div>
                    <span className="text-[10.5px] text-slate-400 font-semibold block">Work Authorization</span>
                    <span className="font-bold text-slate-800">{job.workAuthorization || 'Standard verification'}</span>
                  </div>
                </div>
              </div>

              {/* Advisory Disclaimer */}
              <p className="text-[10.5px] text-slate-500 italic pt-1 leading-relaxed">
                {job.applicationEligibility.disclaimer}
              </p>
            </div>
          )}

          {/* SECTION: CAREER COMPASS INTELLIGENCE */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/40 border border-indigo-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Career Compass Match Intelligence
                </h3>
              </div>
              <div className="px-3 py-1 rounded-xl bg-indigo-600 text-white text-xs font-black shadow-xs">
                {matchScore}% Compatibility
              </div>
            </div>

            {/* Why This Job Matches You & What You Are Missing */}
            {((job.whyItMatches && job.whyItMatches.length > 0) || (job.whatYouAreMissing && job.whatYouAreMissing.length > 0)) && (
              <div className="space-y-2.5 pt-2 border-t border-indigo-100/60">
                {job.whyItMatches && job.whyItMatches.length > 0 && (
                  <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/60">
                    <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Why This Job Matches You</span>
                    </div>
                    <ul className="space-y-1">
                      {job.whyItMatches.map((point, idx) => (
                        <li key={idx} className="text-xs text-emerald-950 flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {job.whatYouAreMissing && job.whatYouAreMissing.length > 0 && (
                  <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/60">
                    <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>What You Are Missing</span>
                    </div>
                    <ul className="space-y-1">
                      {job.whatYouAreMissing.map((gap, idx) => (
                        <li key={idx} className="text-xs text-amber-950 flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Eligibility Concerns / Branch Warnings */}
            {job.eligibilityConcerns && job.eligibilityConcerns.length > 0 && (
              <div className="bg-rose-50/80 p-3 rounded-xl border border-rose-200/60">
                <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider mb-1">
                  Eligibility Notices
                </div>
                <ul className="space-y-1">
                  {job.eligibilityConcerns.map((concern, idx) => (
                    <li key={idx} className="text-xs text-rose-900 flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">⚠</span>
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* What to Learn Before Applying */}
            {job.whatToLearnBeforeApplying && job.whatToLearnBeforeApplying.length > 0 && (
              <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>What to Learn Before Applying</span>
                  <span className="text-[10px] text-indigo-600 font-normal">Direct Learning Links</span>
                </div>
                <div className="space-y-1.5">
                  {job.whatToLearnBeforeApplying.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                      <span className="font-semibold text-slate-800">{item.skill}</span>
                      <div className="flex items-center gap-2">
                        <Link
                          to={item.coursePath}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                        >
                          <span>Courses</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5-Factor Match Breakdown Bars */}
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Detailed Match Breakdown
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { label: "Technical Skills", score: breakdown.technicalSkills },
                  { label: "Education Relevance", score: breakdown.educationRelevance },
                  { label: "Experience Compatibility", score: breakdown.experienceCompatibility },
                  { label: "Career Interest", score: breakdown.careerInterest },
                  { label: "Location Preference", score: breakdown.locationPreference },
                ].map((factor) => (
                  <div key={factor.label} className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                    <div className="flex items-center justify-between text-xs font-medium mb-1">
                      <span className="text-slate-600">{factor.label}</span>
                      <span className="font-bold text-slate-900">{factor.score}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${factor.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills You Have vs Missing Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-white/90 p-3 rounded-xl border border-emerald-200/60">
                <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Skills You Have ({matchedSkills.length})</span>
                </div>
                {matchedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {matchedSkills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200/60"
                      >
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400">
                    Add skills to your student profile to match required technologies.
                  </p>
                )}
              </div>

              <div className="bg-white/90 p-3 rounded-xl border border-amber-200/60">
                <div className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Skills to Improve ({missingSkills.length})</span>
                </div>
                {missingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {missingSkills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[11px] font-medium border border-amber-200/60"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-emerald-600 font-medium">
                    ✓ You possess all required technical skills!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION: PREPARE FOR THIS JOB */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-500" />
              <span>Prepare for this Opportunity</span>
            </h3>
            <p className="text-xs text-slate-500">
              Leverage Career Compass AI tools to maximize your interview readiness before submitting your external application:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Link
                to={`/resume-studio/tailor?jobTitle=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.companyName)}`}
                className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Tailor My Resume</div>
                    <div className="text-[10.5px] text-slate-500">Optimize keywords for ATS</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to={`/roadmap?role=${encodeURIComponent(job.title)}`}
                className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Generate Roadmap</div>
                    <div className="text-[10.5px] text-slate-500">Milestones for this role</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to={missingSkills.length > 0 ? `/courses?skill=${encodeURIComponent(missingSkills[0])}` : `/courses`}
                className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Learn Missing Skills</div>
                    <div className="text-[10.5px] text-slate-500">
                      {missingSkills[0] ? `Courses in ${missingSkills[0]}` : "Explore learning courses"}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to={`/interview-prep?role=${encodeURIComponent(job.title)}`}
                className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <MessagesSquare className="w-4 h-4 text-indigo-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Interview Practice</div>
                    <div className="text-[10.5px] text-slate-500">Curated technical questions</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>

          {/* Job Description */}
          {job.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">About the Role</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>
          )}

          {/* Key Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">Key Responsibilities</h3>
              <ul className="space-y-1.5">
                {job.responsibilities.map((resp, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Education & Eligibility */}
          {job.education && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">Education & Eligibility</h3>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{job.education}</span>
              </div>
            </div>
          )}

          {/* Source Verification Badge */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>Source: {job.sourceName || "Official Company Career Portal"}</span>
            </span>
            <span>Last checked: {job.lastVerifiedDate ? new Date(job.lastVerifiedDate).toLocaleDateString() : "Recently verified"}</span>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-white flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onToggleSave(job)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4 text-indigo-600" /> : <Bookmark className="w-4 h-4" />}
            <span>{isSaved ? "Saved" : "Save Opportunity"}</span>
          </button>

          <button
            type="button"
            onClick={() => onApplyExternal(job)}
            className="flex-1 max-w-xs px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Apply on Company Website</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

