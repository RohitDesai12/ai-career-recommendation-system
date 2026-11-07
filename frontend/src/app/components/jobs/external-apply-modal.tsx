import React, { useState } from "react";
import { JobItem } from "./types";
import {
  ExternalLink,
  CheckCircle2,
  Clock,
  Bookmark,
  X,
  Building2,
  FileText
} from "lucide-react";

interface ExternalApplyModalProps {
  job: JobItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmApplication: (status: 'Applied' | 'Preparing', notes: string) => void;
  onSaveForLater: () => void;
}

export const ExternalApplyModal: React.FC<ExternalApplyModalProps> = ({
  job,
  isOpen,
  onClose,
  onConfirmApplication,
  onSaveForLater,
}) => {
  const [notes, setNotes] = useState("");
  const [selectedOption, setSelectedOption] = useState<'Applied' | 'Preparing'>('Applied');

  if (!isOpen || !job) return null;

  const handleApplyAgain = () => {
    const url = job.officialApplyUrl || job.sourceUrl || "https://careers.google.com";
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmApplication(selectedOption, notes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200/90 shadow-2xl p-6 sm:p-7 relative animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
            <ExternalLink className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              Official Portal Application
            </span>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              Did you complete your application?
            </h3>
          </div>
        </div>

        {/* Role & Company Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 mb-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 truncate">
              {job.title}
            </div>
            <div className="text-xs text-slate-500 font-medium truncate flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{job.companyName}</span>
              <span>•</span>
              <span>{job.location}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleApplyAgain}
            className="px-2.5 py-1.5 rounded-xl text-indigo-700 hover:bg-indigo-100/70 text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
            title="Reopen official application link"
          >
            <span>Reopen Link</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status Choice */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">
              Choose your current status:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedOption('Applied')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  selectedOption === 'Applied'
                    ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 text-emerald-900"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <CheckCircle2
                  className={`w-5 h-5 shrink-0 ${
                    selectedOption === 'Applied' ? "text-emerald-600" : "text-slate-400"
                  }`}
                />
                <div>
                  <div className="text-xs font-bold">Yes, Applied</div>
                  <div className="text-[10.5px] text-slate-500 leading-tight">
                    Submitted on official site
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOption('Preparing')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  selectedOption === 'Preparing'
                    ? "border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20 text-indigo-900"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <Clock
                  className={`w-5 h-5 shrink-0 ${
                    selectedOption === 'Preparing' ? "text-indigo-600" : "text-slate-400"
                  }`}
                />
                <div>
                  <div className="text-xs font-bold">Not Yet (Preparing)</div>
                  <div className="text-[10.5px] text-slate-500 leading-tight">
                    Reviewing & tailoring
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Notes field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Personal Notes or Application Reference (Optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Applied via referral / Confirmation ID #83921 / Follow-up by next week"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onSaveForLater}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5 text-slate-400" />
              <span>Save for Later</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Record in Application Tracker</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

