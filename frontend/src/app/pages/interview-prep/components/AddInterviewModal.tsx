import React, { useState } from "react";
import { X, Building2, Briefcase, Calendar, Sparkles, Check } from "lucide-react";
import { CURATED_COMPANIES } from "../interviewStorage";
import { UserInterviewTarget, InterviewStage } from "../types";

interface AddInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddInterview: (target: UserInterviewTarget) => void;
}

export function AddInterviewModal({
  isOpen,
  onClose,
  onAddInterview
}: AddInterviewModalProps) {
  const [companyName, setCompanyName] = useState("Google");
  const [customCompany, setCustomCompany] = useState("");
  const [roleTitle, setRoleTitle] = useState("Software Engineer — SDE-1");
  const [customRole, setCustomRole] = useState("");
  const [interviewDate, setInterviewDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [interviewType, setInterviewType] = useState<"Technical" | "System Design" | "Behavioral" | "Full Interview" | "DSA">("Full Interview");

  if (!isOpen) return null;

  const isCustomCompany = companyName === "Other";
  const selectedCuratedCompany = CURATED_COMPANIES.find(c => c.name === companyName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCompany = isCustomCompany ? (customCompany.trim() || "Target Company") : companyName;
    const finalRole = customRole.trim() || roleTitle;

    const defaultStages: InterviewStage[] = [
      { id: "s1", name: "Online Assessment", category: "dsa", status: "Completed", description: "Algorithmic screening round", focusTopics: ["Arrays & Hash Maps", "Two Pointers"] },
      { id: "s2", name: "Technical — DSA", category: "dsa", status: "Current", description: "Core data structures and algorithms", focusTopics: ["Binary Trees", "Dynamic Programming"] },
      { id: "s3", name: "Technical — System Design", category: "system", status: "Upcoming", description: "Architecture and scalability", focusTopics: ["Caching", "Database Indexing"] },
      { id: "s4", name: "Hiring Manager / HR", category: "hr", status: "Upcoming", description: "Behavioral & STAR fit", focusTopics: ["Leadership", "Conflict Resolution"] }
    ];

    const newTarget: UserInterviewTarget = {
      id: `target-${Date.now()}`,
      company: finalCompany,
      role: finalRole,
      companyId: selectedCuratedCompany ? selectedCuratedCompany.id : undefined,
      interviewDate: interviewDate || new Date().toISOString().split("T")[0],
      interviewType,
      currentStageIndex: 1,
      stages: defaultStages,
      createdAt: new Date().toISOString()
    };

    onAddInterview(newTarget);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-surface-1 border border-border rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-surface-2/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-on-surface">
                Add Interview Target
              </h3>
              <p className="text-xs text-on-surface-variant">
                Configure your upcoming interview for a personalized study plan.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-3 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Company Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <Building2 size={13} className="text-primary" />
              <span>Company</span>
            </label>
            <select
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-surface-2 border border-border text-xs text-on-surface font-medium focus:outline-hidden focus:border-primary"
            >
              {CURATED_COMPANIES.map(c => (
                <option key={c.id} value={c.name}>{c.name} ({c.type} company)</option>
              ))}
              <option value="Other">Other (Custom Company)</option>
            </select>
          </div>

          {isCustomCompany && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <label className="text-xs font-semibold text-on-surface-variant">
                Custom Company Name
              </label>
              <input
                type="text"
                value={customCompany}
                onChange={(e) => setCustomCompany(e.target.value)}
                placeholder="e.g. Netflix, Stripe, Uber..."
                required={isCustomCompany}
                className="w-full px-3.5 py-2 rounded-xl bg-surface-2 border border-border text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-hidden focus:border-primary"
              />
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <Briefcase size={13} className="text-primary" />
              <span>Target Role & Level</span>
            </label>
            <select
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-surface-2 border border-border text-xs text-on-surface font-medium focus:outline-hidden focus:border-primary"
            >
              {selectedCuratedCompany ? (
                selectedCuratedCompany.roles.map(r => (
                  <option key={r.id} value={`${r.title} — ${r.level}`}>
                    {r.title} ({r.level})
                  </option>
                ))
              ) : (
                <>
                  <option value="Software Engineer — SDE-1">Software Engineer (SDE-1)</option>
                  <option value="Frontend Engineer — Mid Level">Frontend Engineer</option>
                  <option value="Backend Engineer — SDE-2">Backend Engineer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                </>
              )}
            </select>
          </div>

          {/* Interview Date & Type Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <Calendar size={13} className="text-primary" />
                <span>Interview Date</span>
              </label>
              <input
                type="date"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-surface-2 border border-border text-xs text-on-surface font-medium focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface">
                Interview Track
              </label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl bg-surface-2 border border-border text-xs text-on-surface font-medium focus:outline-hidden focus:border-primary"
              >
                <option value="Full Interview">Full Interview (DSA + Sys + HR)</option>
                <option value="Technical">Technical (DSA + Fundamentals)</option>
                <option value="System Design">System Design Track</option>
                <option value="Behavioral">Behavioral / HR Round</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-2 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check size={14} />
              <span>Create Preparation Plan</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
