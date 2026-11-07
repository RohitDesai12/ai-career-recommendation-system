import React, { useState } from "react";
import { Search, Building2, ChevronRight, ArrowRight, Layers, ShieldCheck, Briefcase } from "lucide-react";
import { CompanyData } from "../types";

interface CompanyGuidesSectionProps {
  companies: CompanyData[];
  solvedMap: Record<string, boolean>;
  onSelectCompany: (company: CompanyData, roleId?: string) => void;
}

export function CompanyGuidesSection({
  companies,
  solvedMap,
  onSelectCompany
}: CompanyGuidesSectionProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"All" | "Product" | "Service">("All");

  const filtered = companies.filter(c => {
    const matchesType = filterType === "All" || c.type === filterType;
    const matchesSearch = search === "" || 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.roles.some(r => r.title.toLowerCase().includes(search.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <section className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold font-heading text-on-surface">
            Company Guides
          </h3>
          <p className="text-xs text-on-surface-variant">
            Company-specific interview loops, hiring processes, and reported question banks.
          </p>
        </div>

        {/* Search & Tabs */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company or role..."
              className="pl-8.5 pr-3 py-1.5 rounded-xl bg-surface-1 border border-border text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-hidden focus:border-primary w-48 sm:w-56"
            />
          </div>

          <div className="flex items-center p-0.5 rounded-xl bg-surface-2 border border-border">
            {(["All", "Product", "Service"] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === type 
                    ? "bg-surface-1 text-on-surface shadow-2xs" 
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Compact Responsive Company List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(company => {
          const primaryRole = company.roles[0];
          return (
            <div
              key={company.id}
              onClick={() => onSelectCompany(company)}
              className="p-4 rounded-xl bg-surface-1 border border-border hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Initials Icon */}
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-white text-sm flex-shrink-0 shadow-2xs"
                  style={{ backgroundColor: company.color }}
                >
                  {company.initials}
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-sm font-bold font-heading text-on-surface group-hover:text-primary transition-colors truncate">
                      {company.name}
                    </h4>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      company.type === "Product" 
                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800" 
                        : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    }`}>
                      {company.type}
                    </span>
                  </div>

                  <p className="text-[11px] text-on-surface-variant truncate">
                    {company.roles.length} role{company.roles.length === 1 ? "" : "s"} • {primaryRole.title} ({primaryRole.level})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-primary group-hover:translate-x-0.5 transition-transform flex-shrink-0">
                <span className="text-xs font-bold hidden sm:inline">Guide</span>
                <ChevronRight size={16} />
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-10 rounded-xl bg-surface-1 border border-border p-6 space-y-2">
          <Building2 size={24} className="mx-auto text-on-surface-variant opacity-60" />
          <h4 className="text-xs sm:text-sm font-bold text-on-surface">No matching companies found</h4>
          <p className="text-xs text-on-surface-variant">Try searching for another company or switch filter tabs.</p>
        </div>
      )}
    </section>
  );
}
