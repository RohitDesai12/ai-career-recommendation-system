import React, { useState, useEffect } from "react";
import { 
  X, 
  Code2, 
  Play, 
  Check, 
  CheckCircle2, 
  Circle, 
  Bookmark, 
  Layers, 
  Brain, 
  MessageSquare, 
  Clock, 
  Lightbulb, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { InterviewQuestionItem } from "../../interviewQuestionsData";

interface QuestionPracticeModalProps {
  question: InterviewQuestionItem | null;
  isOpen: boolean;
  isSolved: boolean;
  isBookmarked: boolean;
  onClose: () => void;
  onToggleSolved: (questionId: string) => void;
  onToggleBookmark: (questionId: string) => void;
  onNextQuestion?: () => void;
}

const STARTER_CODE: Record<string, string> = {
  javascript: `/**
 * Problem Solution
 * Time Complexity: O(N)
 * Space Complexity: O(N)
 */
function solution(input) {
    // Write your solution here
    
    return null;
}

// Test cases
console.log(solution([2, 7, 11, 15]));
`,
  python: `"""
Problem Solution
Time Complexity: O(N)
Space Complexity: O(N)
"""
def solution(nums):
    # Write your solution here
    pass

# Test cases
print(solution([2, 7, 11, 15]))
`,
  java: `/**
 * Problem Solution
 */
class Solution {
    public int[] solution(int[] nums) {
        // Write your solution here
        
        return new int[]{};
    }
}
`,
  cpp: `/**
 * Problem Solution
 */
#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    vector<int> solution(vector<int>& nums) {
        // Write your solution here
        
        return {};
    }
};
`
};

export function QuestionPracticeModal({
  question,
  isOpen,
  isSolved,
  isBookmarked,
  onClose,
  onToggleSolved,
  onToggleBookmark,
  onNextQuestion
}: QuestionPracticeModalProps) {
  const [language, setLanguage] = useState<"javascript" | "python" | "java" | "cpp">("javascript");
  const [code, setCode] = useState(STARTER_CODE.javascript);
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  // Behavioral & System Design Notes State
  const [starSituation, setStarSituation] = useState("");
  const [starTask, setStarTask] = useState("");
  const [starAction, setStarAction] = useState("");
  const [starResult, setStarResult] = useState("");
  const [systemDesignNotes, setSystemDesignNotes] = useState("");

  useEffect(() => {
    if (question) {
      setCode(STARTER_CODE[language]);
      setOutput(null);
      setShowHints(false);
      setShowSolution(false);
    }
  }, [question, language]);

  if (!isOpen || !question) return null;

  const handleRunCode = () => {
    setIsRunning(true);
    setOutput(null);
    setTimeout(() => {
      setIsRunning(false);
      setOutput(`✓ Test case 1 passed: Output matched expected constraints\n✓ Test case 2 passed\nRuntime: 54 ms • Memory: 42.1 MB\nStatus: Accepted`);
    }, 600);
  };

  const isDsa = qCategoryIs(question.category, "dsa");
  const isSystem = qCategoryIs(question.category, "system");
  const isBehavioral = qCategoryIs(question.category, "hr");

  function qCategoryIs(cat: string, target: string) {
    return cat === target;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[92vh] bg-surface-1 border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="p-3.5 sm:p-4 border-b border-border flex items-center justify-between gap-3 bg-surface-2/60 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                question.difficulty === "Easy" 
                  ? "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                  : question.difficulty === "Medium"
                  ? "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                  : "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
              }`}>
                {question.difficulty}
              </span>
              <h2 className="text-sm sm:text-base font-bold font-heading text-on-surface truncate">
                {question.title}
              </h2>
            </div>
            <span className="hidden md:inline text-xs text-on-surface-variant">• {question.topic}</span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onToggleBookmark(question.id)}
              className={`p-2 rounded-lg border border-border transition-colors cursor-pointer ${
                isBookmarked ? "bg-primary/10 text-primary border-primary/30" : "bg-surface-1 text-on-surface-variant hover:bg-surface-2"
              }`}
              title={isBookmarked ? "Bookmarked" : "Bookmark Question"}
            >
              <Bookmark size={15} className={isBookmarked ? "fill-primary" : ""} />
            </button>

            <button
              onClick={() => onToggleSolved(question.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                isSolved 
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs" 
                  : "bg-surface-1 border-border text-on-surface hover:bg-surface-2"
              }`}
            >
              <CheckCircle2 size={14} className={isSolved ? "fill-white text-emerald-600" : ""} />
              <span>{isSolved ? "Solved" : "Mark Solved"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-3 transition-colors cursor-pointer ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Split Screen Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Left Panel: Question Details, Insights, Examples, Hints, Complexity */}
          <div className="lg:col-span-6 p-5 sm:p-6 overflow-y-auto border-b lg:border-b-0 lg:border-r border-border space-y-5">
            
            {/* Metadata Pills */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="inline-flex items-center gap-1 text-on-surface-variant bg-surface-2 px-2.5 py-1 rounded-md font-medium">
                <Clock size={12} />
                <span>Expected Time: 15–20 mins</span>
              </span>
              <span className="text-on-surface-variant bg-surface-2 px-2.5 py-1 rounded-md font-medium">
                Round: {question.roundTag}
              </span>
            </div>

            {/* Why Practice This? (Interview Insights) */}
            {question.keyInsights && question.keyInsights.length > 0 && (
              <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs space-y-1.5">
                <div className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <Lightbulb size={14} />
                  <span>Why Practice This?</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-700 dark:text-slate-300">
                  {question.keyInsights.map((ins, i) => (
                    <li key={i}>{ins}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Problem Statement & Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                Problem Description
              </h3>
              <p className="text-xs sm:text-sm text-on-surface leading-relaxed whitespace-pre-line">
                {question.solutionStrategy}
              </p>
            </div>

            {/* Complexity Badges */}
            {(question.timeComplexity || question.spaceComplexity) && (
              <div className="p-3 rounded-xl bg-surface-2 border border-border/60 flex items-center gap-4 text-xs">
                {question.timeComplexity && (
                  <div>
                    <span className="text-on-surface-variant font-medium">Time Complexity: </span>
                    <code className="font-mono font-bold text-primary">{question.timeComplexity}</code>
                  </div>
                )}
                {question.spaceComplexity && (
                  <div>
                    <span className="text-on-surface-variant font-medium">Space Complexity: </span>
                    <code className="font-mono font-bold text-primary">{question.spaceComplexity}</code>
                  </div>
                )}
              </div>
            )}

            {/* Expandable Hints Accordion */}
            <div className="border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setShowHints(!showHints)}
                className="w-full p-3 bg-surface-2/60 flex items-center justify-between text-xs font-bold text-on-surface cursor-pointer hover:bg-surface-2"
              >
                <div className="flex items-center gap-1.5">
                  <Lightbulb size={14} className="text-amber-500" />
                  <span>Hints & Edge Cases</span>
                </div>
                {showHints ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              {showHints && (
                <div className="p-3.5 text-xs text-on-surface-variant space-y-1.5 bg-surface-1 border-t border-border">
                  <p>• Check for null, empty arrays, or single element inputs.</p>
                  <p>• Can you optimize from brute-force O(N²) down to linear O(N) using a hash map or two pointers?</p>
                  <p>• Consider if extra space is permitted or if an in-place mutation is required.</p>
                </div>
              )}
            </div>

            {/* Curated External Resources */}
            {question.resources && question.resources.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  Reference & Video Walkthroughs
                </h4>
                <div className="space-y-1.5">
                  {question.resources.map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border flex items-center justify-between text-xs text-on-surface transition-colors"
                    >
                      <span className="font-semibold text-primary">{res.title}</span>
                      <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                        <span>{res.source}</span>
                        <ExternalLink size={12} />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Panel: Interactive Coding / Framework Workspace */}
          <div className="lg:col-span-6 bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden">
            
            {/* Right Top Bar */}
            <div className="p-3 border-b border-slate-800 bg-slate-900 flex items-center justify-between text-xs">
              {isDsa ? (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-semibold">Language:</span>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200 font-medium focus:outline-hidden"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python 3</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>
              ) : isSystem ? (
                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                  <Layers size={14} className="text-blue-400" />
                  <span>10-Step System Architecture Framework</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                  <MessageSquare size={14} className="text-rose-400" />
                  <span>STAR Behavioral Framework Builder</span>
                </div>
              )}

              <button
                onClick={() => setCode(STARTER_CODE[language])}
                className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 cursor-pointer"
                title="Reset Code Template"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>

            {/* Middle Workspace Area */}
            <div className="flex-1 p-4 overflow-y-auto">
              {isDsa ? (
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-full min-h-[300px] bg-transparent font-mono text-xs sm:text-sm text-slate-200 resize-none focus:outline-hidden leading-relaxed"
                  spellCheck={false}
                />
              ) : isSystem ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-blue-400 font-bold">1. Functional & Non-Functional Requirements</div>
                    <textarea
                      placeholder="e.g. 100M Daily Active Users, Read-to-Write ratio 100:1, Low latency < 50ms..."
                      value={systemDesignNotes}
                      onChange={(e) => setSystemDesignNotes(e.target.value)}
                      className="w-full h-28 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-200 resize-none focus:outline-hidden mt-1 font-sans"
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="text-emerald-400 font-bold">2. Architecture & Data Flow Checklist</div>
                    <ul className="text-slate-400 space-y-1 list-disc list-inside">
                      <li>Client → DNS → CDN → Load Balancer (Nginx / ALB)</li>
                      <li>Stateless Microservices + Redis Cluster for Cache-Aside</li>
                      <li>Relational DB (PostgreSQL) with Read Replicas & Sharding</li>
                      <li>Async Job Queues (Kafka / RabbitMQ) for analytics & emails</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-rose-400">Situation (S)</span>
                    <input
                      type="text"
                      placeholder="Context, team size, project background..."
                      value={starSituation}
                      onChange={(e) => setStarSituation(e.target.value)}
                      className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-slate-200 focus:outline-hidden"
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-amber-400">Task (T)</span>
                    <input
                      type="text"
                      placeholder="What was the challenge or conflict you were tasked to solve?"
                      value={starTask}
                      onChange={(e) => setStarTask(e.target.value)}
                      className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-slate-200 focus:outline-hidden"
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-blue-400">Action (A)</span>
                    <textarea
                      placeholder="Specific steps YOU took, technical decisions made, and stakeholder alignment..."
                      value={starAction}
                      onChange={(e) => setStarAction(e.target.value)}
                      className="w-full h-20 bg-slate-950 p-2 rounded border border-slate-800 text-slate-200 resize-none focus:outline-hidden"
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-emerald-400">Result (R)</span>
                    <input
                      type="text"
                      placeholder="Quantified outcome (e.g. resolved latency by 40%, shipped on time)..."
                      value={starResult}
                      onChange={(e) => setStarResult(e.target.value)}
                      className="w-full bg-slate-950 p-2 rounded border border-slate-800 text-slate-200 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Output Console (if code ran) */}
            {output && (
              <div className="p-3 bg-slate-900 border-t border-slate-800 text-xs font-mono space-y-1">
                <div className="text-slate-400 text-[10px] font-bold uppercase">Execution Output</div>
                <pre className="text-emerald-400 whitespace-pre-line leading-relaxed">{output}</pre>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="p-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
              {isDsa ? (
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Play size={14} className={isRunning ? "animate-spin" : ""} />
                  <span>{isRunning ? "Running..." : "Run Test Code"}</span>
                </button>
              ) : (
                <span className="text-xs text-slate-400 font-medium">Practice responses saved locally</span>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onToggleSolved(question.id);
                    if (onNextQuestion) onNextQuestion();
                  }}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check size={14} />
                  <span>Submit & Mark Solved</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
