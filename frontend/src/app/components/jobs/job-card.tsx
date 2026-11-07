import React from "react";
import { JobItem } from "./types";
import {
  Building2,
  MapPin,
  Briefcase,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  AlertOctagon,
  Globe,
  Plane
} from "lucide-react";

interface JobCardProps {
  job: JobItem;
  isSaved: boolean;
  onToggleSave: (job: JobItem) => void;
  onOpenDetails: (job: JobItem) => void;
  onApplyExternal: (job: JobItem) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isSaved,
  onToggleSave,
  onOpenDetails,
  onApplyExternal,
}) => {
  const matchScore = job.matchScore ?? 75;

  // Visual styling for match badge based on score
  const getMatchBadgeColor = (score: number) => {
    if (score >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (score >= 65) return "bg-indigo-50 text-indigo-700 border-indigo-200";
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const getWorkModeBadgeColor = (mode: string) => {
    const m = (mode || '').toLowerCase();
    if (m === 'remote') return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (m === 'hybrid') return "bg-sky-50 text-sky-700 border-sky-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const companyInitials = job.companyName
    ? job.companyName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "CO";

  const getSourceBadge = (type?: string, name?: string) => {
    if (type === 'ATS_GREENHOUSE') return { label: 'ATS: Greenhouse', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (type === 'ATS_LEVER') return { label: 'ATS: Lever', color: 'bg-teal-50 text-teal-700 border-teal-200' };
    if (type === 'JSON_FEED') return { label: 'Verified Feed', color: 'bg-sky-50 text-sky-700 border-sky-200' };
    return { label: name || 'Official Portal', color: 'bg-slate-50 text-slate-600 border-slate-200' };
  };

  const formatRelativeFreshness = (dateString?: string) => {
    if (!dateString) return 'Verified Active';
    const diffMs = Date.now() - new Date(dateString).getTime();
    if (isNaN(diffMs) || diffMs < 0) return 'Verified Active';
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `Checked ${Math.max(1, mins)}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Checked ${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `Checked ${days}d ago`;
  };

  const sourceBadge = getSourceBadge(job.sourceType, job.sourceName);
  const freshnessLabel = formatRelativeFreshness(job.lastVerifiedDate || job.lastSeenAt);

  // Application eligibility styling
  const eligibility = job.applicationEligibility;
  const getEligibilityBadge = () => {
    if (!eligibility) return null;
    if (eligibility.status === 'GREEN') {
      return {
        icon: <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />,
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        label: eligibility.label || "Appears Eligible"
      };
    }
    if (eligibility.status === 'RED') {
      return {
        icon: <AlertOctagon className="w-3 h-3 text-rose-600 shrink-0" />,
        className: "bg-rose-50 text-rose-700 border-rose-200",
        label: eligibility.label || "Known Conflict"
      };
    }
    return {
      icon: <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />,
      className: "bg-amber-50 text-amber-700 border-amber-200",
      label: eligibility.label || "Needs Verification"
    };
  };

  const eligBadge = getEligibilityBadge();

  // Location display string
  const displayLocation = job.city
    ? (job.country && job.country !== 'India' && !job.city.includes(job.country) ? `${job.city}, ${job.country}` : job.city)
    : job.location;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top Row: Company Info & Save + Match Score */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            {/* Monogram / Avatar */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-50 to-slate-100 border border-slate-200/60 flex items-center justify-center font-bold text-xs text-indigo-700 shrink-0 shadow-xs">
              {companyInitials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-700 truncate">
                  {job.companyName}
                </span>
                {job.verificationStatus === "Verified" && (
                  <ShieldCheck
                    className="w-3.5 h-3.5 text-blue-500 shrink-0"
                    title="Verified Official Career Source"
                  />
                )}
              </div>
              <h3
                onClick={() => onOpenDetails(job)}
                className="text-sm sm:text-base font-bold text-slate-900 truncate hover:text-indigo-600 transition-colors cursor-pointer"
              >
                {job.title}
              </h3>
            </div>
          </div>

          {/* Right: AI Match Score & Save Icon */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1 shadow-2xs ${getMatchBadgeColor(
                matchScore
              )}`}
              title={job.matchExplanation || `${matchScore}% Profile Compatibility`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{matchScore}% Match</span>
            </div>

            <button
              type="button"
              onClick={() => onToggleSave(job)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
              title={isSaved ? "Remove from saved" : "Save opportunity"}
            >
              {isSaved ? (
                <BookmarkCheck className="w-5 h-5 text-indigo-600 fill-indigo-100" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Application Eligibility & Geographic Intelligence Strip */}
        {eligBadge && (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border shadow-2xs ${eligBadge.className}`}
              title={eligibility?.reasons?.join(" • ") || eligibility?.label}
            >
              {eligBadge.icon}
              <span>{eligBadge.label}</span>
            </div>

            {/* Geographical Tags */}
            {job.visaSponsorship === "Available" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold">
                <Plane className="w-3 h-3 text-blue-600" />
                <span>Visa Sponsored</span>
              </span>
            )}

            {job.relocationAssistance === "Available" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-semibold">
                <span>Relocation Available</span>
              </span>
            )}

            {job.remoteEligibility === "Worldwide Eligible" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                <Globe className="w-3 h-3 text-emerald-600" />
                <span>Worldwide Remote</span>
              </span>
            )}

            {job.remoteEligibility === "India Eligible" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200 text-[11px] font-semibold">
                <span>Remote (India)</span>
              </span>
            )}
          </div>
        )}

        {/* Attribute Badges */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 mb-3.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-700 font-medium">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span className="truncate max-w-[160px]">{displayLocation}</span>
          </span>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-medium ${getWorkModeBadgeColor(
              job.workMode
            )}`}
          >
            {job.workMode}
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-700 font-medium">
            <Briefcase className="w-3 h-3 text-slate-400" />
            <span>{job.type}</span>
          </span>

          {job.freshersEligible && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60 text-[11px] font-semibold">
              <GraduationCap className="w-3 h-3" />
              <span>Freshers Eligible</span>
            </span>
          )}

          {job.salary && job.salary !== "Disclosed upon shortlisting" && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-[11px] font-bold">
              {job.salary}
            </span>
          )}
        </div>

        {/* Skills Tag Cloud */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.skills.slice(0, 5).map((skill) => {
              const isMatched = (job.matchedSkills || []).some(
                (ms) => ms.toLowerCase() === skill.toLowerCase()
              );
              return (
                <span
                  key={skill}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                    isMatched
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-semibold"
                      : "bg-slate-100 text-slate-600 border border-slate-200/60"
                  }`}
                >
                  {isMatched && "✓ "}
                  {skill}
                </span>
              );
            })}
            {job.skills.length > 5 && (
              <span className="px-1.5 py-0.5 text-[10.5px] text-slate-400 font-semibold">
                +{job.skills.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Source Verification + Actions */}
      <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-semibold border ${sourceBadge.color}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0 opacity-80" />
            <span className="truncate max-w-[120px]">{sourceBadge.label}</span>
          </span>
          <span className="text-[10.5px] text-slate-400 font-medium truncate">
            {freshnessLabel}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onOpenDetails(job)}
            className="px-3 py-1.5 rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onApplyExternal(job)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs hover:shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Apply</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
