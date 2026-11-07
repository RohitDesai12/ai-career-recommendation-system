import React from "react";
import { Code2, Brain, Layers, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react";
import { 
  MASTER_DSA_QUESTIONS, 
  MASTER_FUNDAMENTALS_QUESTIONS, 
  MASTER_SYSTEM_QUESTIONS, 
  MASTER_HR_QUESTIONS 
} from "../../interviewQuestionsData";

interface ContinuePreparationSectionProps {
  solvedMap: Record<string, boolean>;
  onSelectCategory: (category: "dsa" | "fundamentals" | "system" | "hr", topic?: string) => void;
}

export function ContinuePreparationSection({
  solvedMap,
  onSelectCategory
}: ContinuePreparationSectionProps) {
  // Compute progress for each core topic
  const dsaTotal = MASTER_DSA_QUESTIONS.length;
  const dsaSolved = MASTER_DSA_QUESTIONS.filter(q => !!solvedMap[q.id]).length;

  const fundTotal = MASTER_FUNDAMENTALS_QUESTIONS.length;
  const fundSolved = MASTER_FUNDAMENTALS_QUESTIONS.filter(q => !!solvedMap[q.id]).length;

  const sysTotal = MASTER_SYSTEM_QUESTIONS.length;
  const sysSolved = MASTER_SYSTEM_QUESTIONS.filter(q => !!solvedMap[q.id]).length;

  const hrTotal = MASTER_HR_QUESTIONS.length;
  const hrSolved = MASTER_HR_QUESTIONS.filter(q => !!solvedMap[q.id]).length;

  const cards = [
    {
      category: "dsa" as const,
      title: "DSA",
      topic: "Arrays, Trees & Graphs",
      solved: dsaSolved,
      total: dsaTotal,
      percent: dsaTotal > 0 ? Math.round((dsaSolved / dsaTotal) * 100) : 0,
      icon: Code2,
      accentColor: "text-indigo-600 dark:text-indigo-400",
      barColor: "bg-indigo-600",
      bgAccent: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/60"
    },
    {
      category: "fundamentals" as const,
      title: "CS Fundamentals",
      topic: "OOP, DBMS & OS",
      solved: fundSolved,
      total: fundTotal,
      percent: fundTotal > 0 ? Math.round((fundSolved / fundTotal) * 100) : 0,
      icon: Brain,
      accentColor: "text-emerald-600 dark:text-emerald-400",
      barColor: "bg-emerald-600",
      bgAccent: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/60"
    },
    {
      category: "system" as const,
      title: "System Design",
      topic: "Architecture & Caching",
      solved: sysSolved,
      total: sysTotal,
      percent: sysTotal > 0 ? Math.round((sysSolved / sysTotal) * 100) : 0,
      icon: Layers,
      accentColor: "text-blue-600 dark:text-blue-400",
      barColor: "bg-blue-600",
      bgAccent: "bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/60"
    },
    {
      category: "hr" as const,
      title: "Behavioral",
      topic: "STAR Questions & Fit",
      solved: hrSolved,
      total: hrTotal,
      percent: hrTotal > 0 ? Math.round((hrSolved / hrTotal) * 100) : 0,
      icon: MessageSquare,
      accentColor: "text-rose-600 dark:text-rose-400",
      barColor: "bg-rose-600",
      bgAccent: "bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/60"
    }
  ];

  return (
    <section className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold font-heading text-on-surface">
            Continue Preparation
          </h3>
          <p className="text-xs text-on-surface-variant">
            Pick up right where you left off across key interview dimensions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <div
              key={card.category}
              className="p-4 rounded-xl bg-surface-1 border border-border hover:border-primary/40 hover:shadow-sm transition-all flex flex-col justify-between space-y-3.5 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${card.bgAccent} ${card.accentColor}`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-on-surface">
                      {card.title}
                    </div>
                    <div className="text-[11px] text-on-surface-variant font-medium truncate max-w-[130px]">
                      {card.topic}
                    </div>
                  </div>
                </div>

                <span className="text-xs font-extrabold text-on-surface">
                  {card.solved} / {card.total}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                  <div 
                    className={`h-full ${card.barColor} rounded-full transition-all duration-500`} 
                    style={{ width: `${card.percent}%` }} 
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-on-surface-variant font-medium">
                  <span>{card.percent}% completed</span>
                  {card.percent === 100 && (
                    <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                      <CheckCircle2 size={10} /> Completed
                    </span>
                  )}
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={() => onSelectCategory(card.category)}
                className="w-full py-1.5 px-3 rounded-lg bg-surface-2 hover:bg-primary hover:text-white text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer group-hover:bg-primary group-hover:text-white"
              >
                <span>Continue</span>
                <ArrowRight size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
