import React, { useState } from "react";
import { 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  Play, 
  BookOpen, 
  Layers, 
  Code2, 
  Brain, 
  MessageSquare 
} from "lucide-react";
import { generateDynamicPreparationPlan } from "../interviewStorage";
import { PrepPlanDay, PrepTaskItem } from "../types";
import { InterviewQuestionItem, getAllMasterQuestions } from "../../interviewQuestionsData";

interface PreparationPlanViewProps {
  company: string;
  role: string;
  interviewDate?: string;
  onOpenQuestion?: (question: InterviewQuestionItem) => void;
}

export function PreparationPlanView({
  company,
  role,
  interviewDate = "2026-10-15",
  onOpenQuestion
}: PreparationPlanViewProps) {
  const [days, setDays] = useState<PrepPlanDay[]>(() => {
    return generateDynamicPreparationPlan(company, role, interviewDate, "Full Interview");
  });

  const toggleTask = (dayIndex: number, taskId: string) => {
    setDays(prev => {
      const copy = [...prev];
      const targetDay = { ...copy[dayIndex] };
      targetDay.tasks = targetDay.tasks.map(t => {
        if (t.id === taskId) return { ...t, completed: !t.completed };
        return t;
      });
      copy[dayIndex] = targetDay;
      return copy;
    });
  };

  const allQuestions = getAllMasterQuestions();

  const handleLaunchTask = (task: PrepTaskItem) => {
    if (task.questionId && onOpenQuestion) {
      const q = allQuestions.find(item => item.id === task.questionId);
      if (q) {
        onOpenQuestion(q);
      }
    }
  };

  const totalTasks = days.reduce((acc, d) => acc + d.tasks.length, 0);
  const completedTasks = days.reduce((acc, d) => acc + d.tasks.filter(t => t.completed).length, 0);
  const planProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-surface-1 border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">
              {company} • {role}
            </span>
            <span className="text-xs text-on-surface-variant font-medium">
              {days.length}-Day Personalized Study Plan
            </span>
          </div>
          <h2 className="text-lg font-bold font-heading text-on-surface mt-1">
            Interview Preparation Roadmap
          </h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Structured daily milestones designed to build mastery before your scheduled interview date.
          </p>
        </div>

        {/* Progress Box */}
        <div className="flex items-center gap-4 bg-surface-2 p-3 rounded-xl border border-border flex-shrink-0">
          <div>
            <div className="text-[11px] text-on-surface-variant font-bold uppercase">Plan Progress</div>
            <div className="text-sm font-extrabold text-on-surface">
              {completedTasks} / {totalTasks} Tasks ({planProgress}%)
            </div>
          </div>
          <div className="w-16 h-2 rounded-full bg-border overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${planProgress}%` }} />
          </div>
        </div>
      </div>

      {/* Day by Day Cards List */}
      <div className="space-y-4">
        {days.map((day, dayIdx) => {
          const dayDone = day.tasks.every(t => t.completed);
          return (
            <div
              key={day.dayNumber}
              className={`p-5 rounded-2xl bg-surface-1 border transition-all ${
                dayDone ? "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20" : "border-border"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-extrabold flex items-center justify-center">
                    D{day.dayNumber}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold font-heading text-on-surface">
                      {day.title}
                    </h3>
                    <p className="text-[11px] text-on-surface-variant">{day.focus}</p>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-on-surface-variant self-start sm:self-auto">
                  {day.tasks.filter(t => t.completed).length} of {day.tasks.length} completed
                </span>
              </div>

              {/* Tasks List */}
              <div className="pt-3 space-y-2">
                {day.tasks.map(task => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                      task.completed ? "bg-surface-2/40 border-border/40 line-through opacity-75" : "bg-surface-2 border-border/70"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => toggleTask(dayIdx, task.id)}
                        className="text-on-surface-variant hover:text-emerald-600 transition-colors cursor-pointer flex-shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle2 size={16} className="text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                        ) : (
                          <Circle size={16} className="text-on-surface-variant/50 hover:text-emerald-600" />
                        )}
                      </button>

                      <span className="font-semibold text-on-surface truncate">
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
                        <Clock size={11} />
                        <span>{task.estimatedMinutes}m</span>
                      </span>

                      {task.questionId && (
                        <button
                          onClick={() => handleLaunchTask(task)}
                          className="px-2.5 py-1 rounded-lg bg-primary text-white text-[11px] font-bold hover:bg-primary/90 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>Practice</span>
                          <ArrowRight size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
