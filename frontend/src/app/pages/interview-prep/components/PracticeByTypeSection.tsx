import React from "react";
import { Code2, Brain, Layers, MessageSquare, ArrowRight } from "lucide-react";
import { 
  MASTER_DSA_QUESTIONS, 
  MASTER_FUNDAMENTALS_QUESTIONS, 
  MASTER_SYSTEM_QUESTIONS, 
  MASTER_HR_QUESTIONS 
} from "../../interviewQuestionsData";

interface PracticeByTypeSectionProps {
  solvedMap: Record<string, boolean>;
  onSelectCategory: (category: "dsa" | "fundamentals" | "system" | "hr") => void;
}

export function PracticeByTypeSection({
  solvedMap,
  onSelectCategory
}: PracticeByTypeSectionProps) {
  const dsaSolved = MASTER_DSA_QUESTIONS.filter(q => !!solvedMap[q.id]).length;
  const fundSolved = MASTER_FUNDAMENTALS_QUESTIONS.filter(q => !!solvedMap[q.id]).length;
  const sysSolved = MASTER_SYSTEM_QUESTIONS.filter(q => !!solvedMap[q.id]).length;
  const hrSolved = MASTER_HR_QUESTIONS.filter(q => !!solvedMap[q.id]).length;

  const tracks = [
    {
      category: "dsa" as const,
      title: "Data Structures & Algorithms",
      shortTitle: "DSA",
      topics: "Arrays, Strings, Trees, Graphs, DP, Binary Search",
      desc: "Master essential algorithmic problem-solving patterns required for tech screening & OA rounds.",
      total: MASTER_DSA_QUESTIONS.length,
      solved: dsaSolved,
      icon: Code2,
      difficultyBreakdown: { easy: 12, medium: 18, hard: 6 },
      borderHover: "hover:border-indigo-400 dark:hover:border-indigo-600",
      accent: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60"
    },
    {
      category: "fundamentals" as const,
      title: "CS Fundamentals",
      shortTitle: "CS Fundamentals",
      topics: "OOP, DBMS, OS, Computer Networks, SQL",
      desc: "Deep-dive into core computer science concepts, memory layout, indexing, concurrency, and protocols.",
      total: MASTER_FUNDAMENTALS_QUESTIONS.length,
      solved: fundSolved,
      icon: Brain,
      difficultyBreakdown: { easy: 10, medium: 12, hard: 2 },
      borderHover: "hover:border-emerald-400 dark:hover:border-emerald-600",
      accent: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60"
    },
    {
      category: "system" as const,
      title: "System Design",
      shortTitle: "System Design",
      topics: "HLD, LLD, APIs, Caching, Sharding, Scalability",
      desc: "Learn to architect resilient, high-throughput distributed systems using industry design patterns.",
      total: MASTER_SYSTEM_QUESTIONS.length,
      solved: sysSolved,
      icon: Layers,
      difficultyBreakdown: { easy: 4, medium: 14, hard: 8 },
      borderHover: "hover:border-blue-400 dark:hover:border-blue-600",
      accent: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60"
    },
    {
      category: "hr" as const,
      title: "Behavioral & STAR Method",
      shortTitle: "Behavioral",
      topics: "Leadership Principles, Conflict Resolution, STAR Stories",
      desc: "Structure high-impact behavioral answers with quantifiable metrics and engineering leadership ownership.",
      total: MASTER_HR_QUESTIONS.length,
      solved: hrSolved,
      icon: MessageSquare,
      difficultyBreakdown: { easy: 8, medium: 10, hard: 2 },
      borderHover: "hover:border-rose-400 dark:hover:border-rose-600",
      accent: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60"
    }
  ];

  return (
    <section className="space-y-3.5">
      <div>
        <h3 className="text-base font-bold font-heading text-on-surface">
          Practice by Type
        </h3>
        <p className="text-xs text-on-surface-variant">
          Structured interview preparation tracks tailored for technical and behavioral rounds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tracks.map(track => {
          const Icon = track.icon;
          const percent = track.total > 0 ? Math.round((track.solved / track.total) * 100) : 0;
          return (
            <div
              key={track.category}
              onClick={() => onSelectCategory(track.category)}
              className={`p-5 rounded-2xl bg-surface-1 border border-border ${track.borderHover} hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-4 group`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${track.accent}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold font-heading text-on-surface group-hover:text-primary transition-colors">
                      {track.title}
                    </h4>
                    <p className="text-[11px] text-on-surface-variant mt-0.5 font-medium">
                      {track.topics}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-on-surface-variant bg-surface-2 px-2.5 py-1 rounded-full flex-shrink-0">
                  {track.solved}/{track.total} Solved
                </span>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed">
                {track.desc}
              </p>

              {/* Progress & Action */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="text-[11px] text-on-surface-variant font-medium">{percent}%</span>
                </div>

                <div className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                  <span>Explore Track</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
