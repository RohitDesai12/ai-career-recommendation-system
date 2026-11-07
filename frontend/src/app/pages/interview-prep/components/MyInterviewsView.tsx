import React from "react";
import { 
  Building2, 
  Calendar, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  CheckCheck, 
  Trash2, 
  Play, 
  Sparkles 
} from "lucide-react";
import { UserInterviewTarget, ReadinessBreakdown } from "../types";

interface MyInterviewsViewProps {
  interviews: UserInterviewTarget[];
  activeInterviewId: string | null;
  readiness: ReadinessBreakdown;
  onSelectActiveInterview: (id: string) => void;
  onDeleteInterview: (id: string, e: React.MouseEvent) => void;
  onAddInterview: () => void;
  onOpenGuide: (company: string, role: string) => void;
}

export function MyInterviewsView({
  interviews,
  activeInterviewId,
  readiness,
  onSelectActiveInterview,
  onDeleteInterview,
  onAddInterview,
  onOpenGuide
}: MyInterviewsViewProps) {
  const upcomingInterviews = interviews.filter(i => !i.isCompleted);
  const completedInterviews = interviews.filter(i => !!i.isCompleted);

  const getDaysLeft = (dateStr: string) => {
    const today = new Date();
    const target = new Date(dateStr);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff > 0) return `${diff} day${diff === 1 ? "" : "s"} left`;
    if (diff === 0) return "Today";
    return `${Math.abs(diff)} days ago`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold font-heading text-on-surface">
            My Interviews
          </h2>
          <p className="text-xs text-on-surface-variant">
            Track your target companies, upcoming interview stages, and readiness progression.
          </p>
        </div>

        <button
          onClick={onAddInterview}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Add Interview</span>
        </button>
      </div>

      {/* Upcoming Interviews Section */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-heading text-on-surface uppercase tracking-wider text-xs">
            Upcoming Interviews ({upcomingInterviews.length})
          </h3>
        </div>

        {upcomingInterviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingInterviews.map(interview => {
              const isActive = interview.id === activeInterviewId;
              const daysText = getDaysLeft(interview.interviewDate);
              const isDueSoon = daysText.includes("left") || daysText === "Today";

              return (
                <div
                  key={interview.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                    isActive 
                      ? "bg-surface-1 border-primary/50 shadow-sm ring-1 ring-primary/20" 
                      : "bg-surface-1 border-border hover:border-border/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">
                          {interview.company}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isDueSoon 
                            ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800" 
                            : "bg-surface-2 text-on-surface-variant"
                        }`}>
                          <Clock size={11} />
                          <span>{daysText}</span>
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                            Active Target
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-bold font-heading text-on-surface mt-1">
                        {interview.role}
                      </h4>
                      <p className="text-xs text-on-surface-variant">
                        Track: <span className="font-semibold text-on-surface">{interview.interviewType}</span> • Target date: {interview.interviewDate}
                      </p>
                    </div>

                    <button
                      onClick={(e) => onDeleteInterview(interview.id, e)}
                      className="p-1.5 rounded-lg text-on-surface-variant/60 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Remove Target"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Readiness & Stage Bar */}
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-on-surface-variant">Estimated Readiness</span>
                      <span className="font-bold text-on-surface">{isActive ? readiness.overall : 65}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500" 
                        style={{ width: `${isActive ? readiness.overall : 65}%` }} 
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onSelectActiveInterview(interview.id)}
                      className="flex-1 py-2 px-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>Continue Prep</span>
                      <ArrowRight size={13} />
                    </button>
                    <button
                      onClick={() => onOpenGuide(interview.company, interview.role)}
                      className="py-2 px-3 rounded-xl bg-surface-2 hover:bg-surface-3 text-on-surface border border-border text-xs font-semibold transition-all cursor-pointer"
                    >
                      Company Guide
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 rounded-2xl bg-surface-1 border border-border p-6 space-y-3">
            <Calendar size={28} className="mx-auto text-primary opacity-70" />
            <h4 className="text-sm font-bold text-on-surface">No upcoming interviews configured</h4>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              Add your target companies to generate customized preparation roadmaps and track milestone stages.
            </p>
            <button
              onClick={onAddInterview}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold transition-all cursor-pointer mt-2"
            >
              <Plus size={14} />
              <span>Add Your First Interview</span>
            </button>
          </div>
        )}
      </div>

      {/* Completed Interviews Section */}
      {completedInterviews.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border">
          <h3 className="text-xs font-bold font-heading text-on-surface uppercase tracking-wider">
            Completed Interviews ({completedInterviews.length})
          </h3>

          <div className="space-y-2">
            {completedInterviews.map(item => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-surface-1 border border-border flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <CheckCheck size={16} className="text-emerald-600" />
                  <div>
                    <span className="font-bold text-on-surface">{item.company}</span>
                    <span className="text-on-surface-variant"> — {item.role}</span>
                  </div>
                </div>
                <span className="text-on-surface-variant font-medium">
                  Completed on {item.interviewDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
