import React, { useState } from "react";
import { 
  Building2, 
  Award, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Search, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  ShieldCheck,
  FileText
} from "lucide-react";
import { InterviewExperienceItem } from "../types";
import { getStoredExperiences, saveExperiences } from "../interviewStorage";
import { ShareExperienceModal } from "./ShareExperienceModal";

interface InterviewExperiencesViewProps {
  companyFilter?: string;
}

export function InterviewExperiencesView({
  companyFilter
}: InterviewExperiencesViewProps) {
  const [experiences, setExperiences] = useState<InterviewExperienceItem[]>(() => {
    return getStoredExperiences();
  });
  const [search, setSearch] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = experiences.filter(exp => {
    const matchesCompany = !companyFilter || exp.company.toLowerCase() === companyFilter.toLowerCase();
    const matchesSearch = search === "" ||
      exp.company.toLowerCase().includes(search.toLowerCase()) ||
      exp.role.toLowerCase().includes(search.toLowerCase()) ||
      exp.summary.toLowerCase().includes(search.toLowerCase());
    return matchesCompany && matchesSearch;
  });

  const handleAddExperience = (newExp: InterviewExperienceItem) => {
    const updated = [newExp, ...experiences];
    setExperiences(updated);
    saveExperiences(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-heading text-on-surface">
              Interview Experiences
            </h2>
            <span className="text-xs font-bold text-on-surface-variant bg-surface-2 px-2.5 py-0.5 rounded-full">
              {filtered.length} reported loops
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Real candidate debriefs, question breakdowns, and round-by-round tips from top tech companies.
          </p>
        </div>

        <button
          onClick={() => setIsShareModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Share Experience</span>
        </button>
      </div>

      {/* Search Input (if not locked by guide) */}
      {!companyFilter && (
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, role, or questions asked..."
            className="w-full pl-8.5 pr-3 py-2 rounded-xl bg-surface-1 border border-border text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-hidden focus:border-primary"
          />
        </div>
      )}

      {/* Experiences List */}
      <div className="space-y-4">
        {filtered.map(exp => {
          const isExpanded = expandedId === exp.id || true; // Expand by default for readability
          return (
            <div
              key={exp.id}
              className="p-5 sm:p-6 rounded-2xl bg-surface-1 border border-border shadow-xs space-y-4"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-border/60">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">
                      {exp.company}
                    </span>
                    <span className="text-xs font-bold text-on-surface">
                      {exp.role}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      exp.verdict === "Offer" 
                        ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" 
                        : "bg-surface-2 text-on-surface-variant"
                    }`}>
                      {exp.verdict}
                    </span>
                    {exp.isVerified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded">
                        <ShieldCheck size={12} />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-on-surface-variant">
                    {exp.date} • {exp.location || "Remote"} • Shared by <span className="font-semibold text-on-surface">{exp.authorName || "Candidate"}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                    exp.difficulty === "Easy"
                      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                      : exp.difficulty === "Medium"
                      ? "text-amber-700 bg-amber-50 border-amber-200"
                      : "text-rose-700 bg-rose-50 border-rose-200"
                  }`}>
                    {exp.difficulty} Difficulty
                  </span>
                </div>
              </div>

              {/* Summary */}
              <p className="text-xs sm:text-sm text-on-surface leading-relaxed">
                {exp.summary}
              </p>

              {/* Round by Round Breakdown */}
              <div className="space-y-2.5 pt-1">
                <h4 className="text-[11px] font-bold text-on-surface uppercase tracking-wider">
                  Rounds Breakdown ({exp.rounds.length} rounds)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {exp.rounds.map((round, rIdx) => (
                    <div
                      key={rIdx}
                      className="p-3.5 rounded-xl bg-surface-2 border border-border/70 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between font-bold text-on-surface">
                        <span className="text-primary">{round.roundName}</span>
                        <span className="text-[10px] text-on-surface-variant font-medium">{round.difficulty}</span>
                      </div>
                      <div className="text-[11px] text-on-surface-variant font-medium">
                        Focus: <span className="text-on-surface">{round.focus}</span>
                      </div>

                      {round.questions.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] font-bold text-on-surface-variant uppercase">Questions Reported:</span>
                          <ul className="space-y-0.5 list-disc list-inside text-on-surface text-[11px]">
                            {round.questions.map((q, qIdx) => (
                              <li key={qIdx}>{q}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {round.tips && (
                        <div className="p-2 rounded bg-surface-1 border border-border/50 text-[11px] text-on-surface-variant italic">
                          💡 Tip: {round.tips}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-14 rounded-2xl bg-surface-1 border border-border p-6 space-y-3">
          <FileText size={28} className="mx-auto text-on-surface-variant opacity-60" />
          <h4 className="text-sm font-bold text-on-surface">No interview experiences available yet</h4>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
            Be the first to share your interview rounds, questions, and insights to help the student community.
          </p>
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold transition-all cursor-pointer mt-2"
          >
            <Plus size={14} />
            <span>Share Your Experience</span>
          </button>
        </div>
      )}

      {/* Share Modal */}
      <ShareExperienceModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onAddExperience={handleAddExperience}
      />

    </div>
  );
}
