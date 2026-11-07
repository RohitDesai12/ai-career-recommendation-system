import React from "react";
import { Sparkles, Code2, Layers, Brain, MessageSquare, ArrowRight, CheckCircle2, Bookmark } from "lucide-react";
import { InterviewQuestionItem } from "../../interviewQuestionsData";

interface RecommendedForYouSectionProps {
  questions: InterviewQuestionItem[];
  solvedMap: Record<string, boolean>;
  bookmarkMap: Record<string, boolean>;
  onOpenQuestion: (question: InterviewQuestionItem) => void;
  onToggleBookmark: (questionId: string, e: React.MouseEvent) => void;
  onToggleSolved: (questionId: string, e: React.MouseEvent) => void;
}

export function RecommendedForYouSection({
  questions,
  solvedMap,
  bookmarkMap,
  onOpenQuestion,
  onToggleBookmark,
  onToggleSolved
}: RecommendedForYouSectionProps) {
  if (questions.length === 0) return null;

  return (
    <section className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Sparkles size={14} />
          </div>
          <div>
            <h3 className="text-base font-bold font-heading text-on-surface">
              Recommended for You
            </h3>
            <p className="text-xs text-on-surface-variant">
              High-yield questions targeted for your active role preparation and weak topic areas.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {questions.map(q => {
          const isSolved = !!solvedMap[q.id];
          const isBookmarked = !!bookmarkMap[q.id];
          
          let CategoryIcon = Code2;
          let categoryColor = "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60";
          if (q.category === "system") {
            CategoryIcon = Layers;
            categoryColor = "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60";
          } else if (q.category === "fundamentals") {
            CategoryIcon = Brain;
            categoryColor = "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60";
          } else if (q.category === "hr") {
            CategoryIcon = MessageSquare;
            categoryColor = "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60";
          }

          let diffColor = "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800";
          if (q.difficulty === "Medium") {
            diffColor = "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800";
          } else if (q.difficulty === "Hard") {
            diffColor = "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800";
          }

          return (
            <div
              key={q.id}
              onClick={() => onOpenQuestion(q)}
              className="p-4 rounded-xl bg-surface-1 border border-border hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${categoryColor}`}>
                    <CategoryIcon size={16} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${diffColor}`}>
                        {q.difficulty}
                      </span>
                      <span className="text-[11px] text-on-surface-variant font-medium">
                        {q.topic}
                      </span>
                      {q.frequency && (
                        <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {q.frequency}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold font-heading text-on-surface group-hover:text-primary transition-colors leading-snug">
                      {q.title}
                    </h4>
                  </div>
                </div>

                {/* Bookmark Button */}
                <button
                  onClick={(e) => onToggleBookmark(q.id, e)}
                  className={`p-1.5 rounded-lg text-on-surface-variant hover:text-primary transition-colors cursor-pointer ${isBookmarked ? "text-primary fill-primary" : ""}`}
                  title={isBookmarked ? "Remove Bookmark" : "Save Question"}
                >
                  <Bookmark size={15} className={isBookmarked ? "fill-primary" : ""} />
                </button>
              </div>

              {/* Bottom Company Relevance & CTA */}
              <div className="pt-2.5 border-t border-border/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
                  <span>Asked at:</span>
                  <span className="font-semibold text-on-surface truncate max-w-[150px]">
                    {q.companies ? q.companies.slice(0, 3).join(", ") : "Top Tech Companies"}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                  <span>Practice</span>
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
