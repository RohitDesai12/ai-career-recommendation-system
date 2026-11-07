import React from "react";
import { CompanyItem } from "./types";
import {
  Globe,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  MapPin,
  Users,
  ArrowRight
} from "lucide-react";

interface CompanyCardProps {
  company: CompanyItem;
  onBrowseJobs: (companyName: string) => void;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  onBrowseJobs,
}) => {
  const initials = company.companyName
    ? company.companyName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "CO";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top Header: Monogram, Name, Category */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-slate-900 truncate">
                  {company.companyName}
                </h3>
                {company.isVerified !== false && (
                  <ShieldCheck
                    className="w-4 h-4 text-blue-500 shrink-0"
                    title="Verified Official Career Source"
                  />
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium truncate">
                {company.industry}
              </p>
            </div>
          </div>

          {/* Category Tag */}
          <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-semibold shrink-0 border border-slate-200/60">
            {company.category}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
          {company.description}
        </p>

        {/* Location & Size Metadata */}
        <div className="flex flex-wrap items-center gap-2 mb-3 text-[11.5px] text-slate-500">
          {company.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{company.location}</span>
            </span>
          )}
          {company.companySize && (
            <span className="inline-flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{company.companySize} employees</span>
            </span>
          )}
        </div>

        {/* Integration Capability Distinction */}
        <div className="mb-4">
          {company.hasLiveIntegration ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Job Integration Active ({company.integrationType || 'ATS'})</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200/70 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>Official Career Page Available</span>
            </span>
          )}
        </div>
      </div>

      {/* Footer: Official Links & Browse Action */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-auto">
        <div className="flex items-center gap-2">
          {/* Official Website */}
          <a
            href={company.officialWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200/60 text-xs font-semibold flex items-center gap-1.5"
            title="Visit Official Company Website"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Website</span>
          </a>

          {/* Official Careers Portal */}
          <a
            href={company.careerPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors text-xs font-bold flex items-center gap-1.5 border border-indigo-200/60"
            title="Open Verified Careers Page"
          >
            <span>Official Careers</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Browse Available Opportunities */}
        <button
          type="button"
          onClick={() => onBrowseJobs(company.companyName)}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>
            {company.availableJobCount && company.availableJobCount > 0
              ? `View ${company.availableJobCount} Jobs`
              : "Browse Jobs"}
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

