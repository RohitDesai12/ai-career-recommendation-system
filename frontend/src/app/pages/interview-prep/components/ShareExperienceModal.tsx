import React, { useState } from "react";
import { X, Check, Building2, Briefcase, Calendar, Award, Sparkles } from "lucide-react";
import { InterviewExperienceItem, InterviewRoundReport } from "../types";
import { CURATED_COMPANIES } from "../interviewStorage";

interface ShareExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExperience: (exp: InterviewExperienceItem) => void;
}

export function ShareExperienceModal({
  isOpen,
  onClose,
  onAddExperience
}: ShareExperienceModalProps) {
  const [company, setCompany] = useState("Microsoft");
  const [role, setRole] = useState("Software Engineer (SDE-1)");
  const [verdict, setVerdict] = useState<"Offer" | "Rejected" | "Pending">("Offer");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [summary, setSummary] = useState("");
  const [round1Focus, setRound1Focus] = useState("");
  const [round1Questions, setRound1Questions] = useState("");
  const [round2Focus, setRound2Focus] = useState("");
  const [round2Questions, setRound2Questions] = useState("");
  const [authorName, setAuthorName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const rounds: InterviewRoundReport[] = [];
    if (round1Focus) {
      rounds.push({
        roundName: "Round 1: Technical Screen",
        focus: round1Focus,
        difficulty: "Medium",
        questions: round1Questions.split("\n").filter(q => q.trim().length > 0)
      });
    }
    if (round2Focus) {
      rounds.push({
        roundName: "Round 2: Architecture / Managerial",
        focus: round2Focus,
        difficulty: "Hard",
        questions: round2Questions.split("\n").filter(q => q.trim().length > 0)
      });
    }

    const newExp: InterviewExperienceItem = {
      id: `exp-${Date.now()}`,
      company,
      role,
      location: "Hybrid / Remote",
      date: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      verdict,
      difficulty,
      overallRating: 5,
      summary: summary || "Comprehensive technical and behavioral interview experience.",
      rounds: rounds.length > 0 ? rounds : [
        {
          roundName: "Round 1: Technical & Problem Solving",
          focus: "Core DSA and CS foundations",
          difficulty: "Medium",
          questions: ["Two Sum variations", "DBMS Indexing concepts"]
        }
      ],
      authorName: authorName.trim() || "Anonymous Candidate",
      isVerified: true
    };

    onAddExperience(newExp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] bg-surface-1 border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-surface-2/40 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-on-surface">
                Share Interview Experience
              </h3>
              <p className="text-xs text-on-surface-variant">
                Help other students prepare by sharing your interview rounds and tips.
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface">Company</label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-xs text-on-surface font-medium focus:outline-hidden"
              >
                {CURATED_COMPANIES.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface">Target Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. SDE-1, Software Engineer"
                required
                className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-xs text-on-surface font-medium focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface">Outcome Verdict</label>
              <select
                value={verdict}
                onChange={(e) => setVerdict(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-xs text-on-surface font-medium focus:outline-hidden"
              >
                <option value="Offer">Offer Accepted / Received</option>
                <option value="Rejected">Rejected</option>
                <option value="Pending">Pending Decision</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface">Overall Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-xs text-on-surface font-medium focus:outline-hidden"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface">Experience Summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Overview of the interview loop, number of rounds, and key takeaways..."
              className="w-full h-20 p-2.5 rounded-xl bg-surface-2 border border-border text-xs text-on-surface resize-none focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface">Round 1 Focus & Questions</label>
            <input
              type="text"
              value={round1Focus}
              onChange={(e) => setRound1Focus(e.target.value)}
              placeholder="e.g. Online Assessment (Arrays & Hash Maps)"
              className="w-full px-3 py-1.5 rounded-xl bg-surface-2 border border-border text-xs text-on-surface mb-1.5 focus:outline-hidden"
            />
            <textarea
              value={round1Questions}
              onChange={(e) => setRound1Questions(e.target.value)}
              placeholder="Questions asked (one per line)..."
              className="w-full h-16 p-2 rounded-xl bg-surface-2 border border-border text-xs text-on-surface resize-none focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface">Your Name / Handle (Optional)</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. Alex M. • SDE-1"
              className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-xs text-on-surface focus:outline-hidden"
            />
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
              <span>Publish Experience</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
