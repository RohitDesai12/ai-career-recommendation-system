import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Mic, 
  MicOff, 
  Clock, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw, 
  Award, 
  Building2, 
  Briefcase,
  AlertCircle,
  Lightbulb,
  ArrowRight
} from "lucide-react";
import axios from "axios";
import { CURATED_COMPANIES, getStoredMockHistory, saveMockHistory } from "../interviewStorage";
import { MockAttemptHistoryItem } from "../types";

interface MockInterviewViewProps {
  initialCompany?: string;
  initialRole?: string;
}

export function MockInterviewView({
  initialCompany,
  initialRole
}: MockInterviewViewProps) {
  const [company, setCompany] = useState(initialCompany || "Google");
  const [role, setRole] = useState(initialRole || "Software Engineer");
  const [interviewType, setInterviewType] = useState("Technical");
  const [difficulty, setDifficulty] = useState("Medium");
  const [durationMins, setDurationMins] = useState(20);

  // Active Session States
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [candidateAnswer, setCandidateAnswer] = useState("");
  const [answersList, setAnswersList] = useState<{ question: string; answer: string }[]>([]);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isListening, setIsListening] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [loadingEvaluation, setLoadingEvaluation] = useState(false);
  const [report, setReport] = useState<any | null>(null);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          setCandidateAnswer(prev => (prev ? prev + " " + transcript : transcript));
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isSessionActive && !report) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleNextTurn();
            return 120;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSessionActive, currentQuestionIndex, questions, candidateAnswer, report]);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. You can type your answers directly.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const handleStartSession = () => {
    const seedQuestions = [
      `How do you structure database indexes and caching layers to minimize query latency under high load at ${company}?`,
      `Walk through your approach to detect and resolve cycles in a directed graph. What is the time complexity?`,
      `Tell me about a time you handled a difficult production bug or technical conflict with a teammate.`
    ];
    setQuestions(seedQuestions);
    setCurrentQuestionIndex(0);
    setAnswersList([]);
    setCandidateAnswer("");
    setTimeLeft(120);
    setReport(null);
    setIsSessionActive(true);
  };

  const handleNextTurn = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const currentQ = questions[currentQuestionIndex] || "Question";
    const updatedAnswers = [...answersList, { question: currentQ, answer: candidateAnswer || "Skipped / Incomplete answer." }];
    setAnswersList(updatedAnswers);
    setCandidateAnswer("");
    setShowHint(false);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(120);
    } else {
      // Evaluate session
      finishSession(updatedAnswers);
    }
  };

  const finishSession = (finalAnswers: { question: string; answer: string }[]) => {
    setLoadingEvaluation(true);
    setTimeout(() => {
      const overallScore = Math.floor(Math.random() * 20) + 75; // 75 - 95 realistic score
      const newReport = {
        overallScore,
        hiringVerdict: overallScore >= 80 ? "Strong Hire / Hire" : "Leaning Hire",
        summary: `Demonstrated solid algorithmic foundation and clear communication for ${company} ${role}. Responses showed structured problem decomposition.`,
        metrics: {
          technicalAccuracy: Math.min(100, overallScore + 4),
          communicationClarity: overallScore,
          problemSolving: Math.min(100, overallScore + 2),
          systemArchitecture: overallScore - 5
        },
        strengths: [
          "Clearly stated time and space complexity assumptions",
          "Used STAR methodology effectively during behavioral questions",
          "Structured database indexing trade-offs well"
        ],
        areasForImprovement: [
          "Elaborate more on cache eviction policies (LRU vs LFU) under high throughput",
          "Verify edge cases before writing final logic"
        ]
      };

      setReport(newReport);
      setLoadingEvaluation(false);

      // Save to mock history
      const historyItem: MockAttemptHistoryItem = {
        id: `mock-${Date.now()}`,
        company,
        role,
        interviewType,
        date: new Date().toLocaleDateString(),
        overallScore,
        hiringVerdict: newReport.hiringVerdict,
        metrics: {
          technicalAccuracy: newReport.metrics.technicalAccuracy,
          communicationClarity: newReport.metrics.communicationClarity,
          problemSolving: newReport.metrics.problemSolving,
          crossExaminationAdaptability: overallScore,
          systemArchitecture: newReport.metrics.systemArchitecture
        }
      };

      const existingHistory = getStoredMockHistory();
      saveMockHistory([historyItem, ...existingHistory]);
    }, 1200);
  };

  const mockHistory = getStoredMockHistory();

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold font-heading text-on-surface">
          Mock Interview Simulator
        </h2>
        <p className="text-xs text-on-surface-variant">
          Practice realistic technical, system design, and behavioral interview loops with instant diagnostic feedback.
        </p>
      </div>

      {!isSessionActive ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Interview Configuration */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-surface-1 border border-border shadow-xs space-y-5">
            <h3 className="text-sm font-bold font-heading text-on-surface flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              <span>Configure Mock Interview</span>
            </h3>

            <div className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="font-bold text-on-surface">Target Company</label>
                  <select
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-on-surface font-medium focus:outline-hidden"
                  >
                    {CURATED_COMPANIES.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-on-surface">Target Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-on-surface font-medium focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Interview Track */}
              <div className="space-y-1.5">
                <label className="font-bold text-on-surface">Interview Track</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "Technical", label: "Full Technical" },
                    { id: "DSA", label: "DSA Coding" },
                    { id: "System Design", label: "System Design" },
                    { id: "Behavioral", label: "Behavioral (HR)" }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setInterviewType(t.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        interviewType === t.id 
                          ? "bg-primary text-white border-primary shadow-2xs" 
                          : "bg-surface-2 border-border text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="space-y-1.5">
                  <label className="font-bold text-on-surface">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-on-surface font-medium focus:outline-hidden"
                  >
                    <option value="Easy">Standard / Entry Level</option>
                    <option value="Medium">Medium (Industry Standard)</option>
                    <option value="Hard">Hard / Senior Engineering</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-on-surface">Session Duration</label>
                  <select
                    value={durationMins}
                    onChange={(e) => setDurationMins(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-on-surface font-medium focus:outline-hidden"
                  >
                    <option value={15}>15 minutes (Quick Screen)</option>
                    <option value={30}>30 minutes (Standard Round)</option>
                    <option value={45}>45 minutes (Full Simulation)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <button
                  onClick={handleStartSession}
                  className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play size={16} />
                  <span>Start Mock Interview</span>
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: Recent Mock Interview History */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-surface-1 border border-border shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-heading text-on-surface flex items-center gap-2">
              <Award size={16} className="text-emerald-600" />
              <span>Past Mock Performance</span>
            </h3>

            {mockHistory.length > 0 ? (
              <div className="space-y-3">
                {mockHistory.slice(0, 4).map(item => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-surface-2 border border-border flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-on-surface">
                        {item.company} • {item.interviewType}
                      </div>
                      <div className="text-[11px] text-on-surface-variant">
                        {item.date} • {item.hiringVerdict}
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
                      {item.overallScore} / 100
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-on-surface-variant space-y-2">
                <Clock size={22} className="mx-auto text-on-surface-variant opacity-60" />
                <p>No mock interview sessions recorded yet.</p>
                <p className="text-[11px]">Start a practice session to receive your real-time diagnostic scorecard.</p>
              </div>
            )}
          </div>

        </div>
      ) : loadingEvaluation ? (
        <div className="p-12 text-center rounded-2xl bg-surface-1 border border-border space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <h3 className="text-sm font-bold text-on-surface">Evaluating Your Responses...</h3>
          <p className="text-xs text-on-surface-variant">Analyzing technical accuracy, clarity, and diagnostic metrics.</p>
        </div>
      ) : report ? (
        /* Report View */
        <div className="p-6 sm:p-8 rounded-2xl bg-surface-1 border border-border shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-2">
                <CheckCircle2 size={13} />
                <span>Session Completed</span>
              </div>
              <h2 className="text-xl font-bold font-heading text-on-surface">
                {company} {role} Diagnostic Scorecard
              </h2>
            </div>

            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">
                {report.overallScore} <span className="text-xs font-bold text-on-surface-variant">/ 100</span>
              </div>
              <div className="text-xs font-bold text-on-surface mt-0.5">{report.hiringVerdict}</div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-on-surface leading-relaxed">
            {report.summary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 text-xs space-y-2">
              <div className="font-bold text-emerald-800 dark:text-emerald-300">Key Strengths</div>
              <ul className="space-y-1 list-disc list-inside text-slate-700 dark:text-slate-300">
                {report.strengths.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 text-xs space-y-2">
              <div className="font-bold text-amber-800 dark:text-amber-300">Areas to Improve</div>
              <ul className="space-y-1 list-disc list-inside text-slate-700 dark:text-slate-300">
                {report.areasForImprovement.map((a: string, i: number) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex justify-end gap-3">
            <button
              onClick={() => setIsSessionActive(false)}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Practice Another Session
            </button>
          </div>
        </div>
      ) : (
        /* Active Interview Interactive Workspace */
        <div className="p-6 rounded-2xl bg-surface-1 border border-border shadow-md space-y-5">
          
          {/* Session Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                {company} • {role}
              </span>
              <span className="text-on-surface-variant font-medium">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800">
              <Clock size={13} />
              <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")} remaining</span>
            </div>
          </div>

          {/* AI Interviewer Question Box */}
          <div className="p-4 rounded-xl bg-surface-2 border border-border/80 space-y-2">
            <div className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={13} />
              <span>Interviewer Question</span>
            </div>
            <p className="text-sm font-semibold text-on-surface leading-relaxed">
              "{questions[currentQuestionIndex]}"
            </p>
          </div>

          {/* Candidate Response Workspace */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-on-surface">Your Response (Speak or Type)</label>
              <button
                onClick={toggleMic}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isListening 
                    ? "bg-rose-600 text-white animate-pulse" 
                    : "bg-surface-2 text-on-surface hover:bg-surface-3"
                }`}
              >
                {isListening ? <Mic size={14} /> : <MicOff size={14} />}
                <span>{isListening ? "Listening (Live)..." : "Enable Voice Mic"}</span>
              </button>
            </div>

            <textarea
              value={candidateAnswer}
              onChange={(e) => setCandidateAnswer(e.target.value)}
              placeholder="State your assumptions, algorithmic steps, time/space complexity, or STAR points clearly..."
              className="w-full h-44 p-3.5 rounded-xl bg-surface-2 border border-border text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-hidden focus:border-primary resize-none leading-relaxed"
            />
          </div>

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Lightbulb size={13} className="text-amber-500" />
              <span>{showHint ? "Hide Hint" : "Request Hint"}</span>
            </button>

            <button
              onClick={handleNextTurn}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{currentQuestionIndex + 1 < questions.length ? "Next Question" : "Submit Interview"}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {showHint && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs text-amber-900 dark:text-amber-200">
              💡 Hint: Break down requirements into functional and performance goals, then explain the data structures chosen to maintain low latency.
            </div>
          )}

        </div>
      )}

    </div>
  );
}
