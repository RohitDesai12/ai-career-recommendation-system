import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Paperclip, 
  Mic, 
  Plus, 
  Bot, 
  ArrowLeft, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  BrainCircuit,
  Trash2,
  X,
  Menu
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import axios from "axios";

interface Message {
  id: string | number;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface ChatSessionInfo {
  _id: string;
  title: string;
  updatedAt: string;
}

const SUGGESTED_QUESTIONS = [
  "What skills should I learn for my career?",
  "How to prepare for technical interviews?",
  "Best companies for my career specialization?",
  "Explain the difference between SQL and NoSQL databases.",
];

export function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content: "Welcome to Compass AI Mentor! I can help you with learning, career prep, and study topics. I also conduct Mock Interviews based on your Roadmap path. What are we studying today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Database Chat Sessions
  const [sessions, setSessions] = useState<ChatSessionInfo[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Roadmap & Profile Context
  const [roadmap, setRoadmap] = useState<any>(null);
  const [targetCareer, setTargetCareer] = useState("Software Engineer");
  const [targetMatch, setTargetMatch] = useState(70);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [recentInsights, setRecentInsights] = useState({
    pace: "Consistent",
    star: "Consistent",
    depth: "Good"
  });

  // Interview Mode States
  const [isInterviewMode, setIsInterviewMode] = useState(false);
  const [interviewPhase, setInterviewPhase] = useState<"setup" | "active" | "evaluating" | "result">("setup");
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewAnswers, setInterviewAnswers] = useState<{ question: string; answer: string }[]>([]);
  const [interviewText, setInterviewText] = useState("");
  const [interviewTimeLeft, setInterviewTimeLeft] = useState(120); // 2 mins per question
  const [interviewResult, setInterviewResult] = useState<any>(null);

  // Speech Recognition (Simulated or Real)
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch roadmap & chat sessions on mount
  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/roadmap");
        setRoadmap(res.data);
        if (res.data) {
          setTargetCareer(res.data.field);
          let completed = 0;
          let total = 0;
          res.data.stages.forEach((stage: any) => {
            stage.skills.forEach((skill: any) => {
              total++;
              if (skill.completed) completed++;
            });
          });
          if (total > 0) {
            setTargetMatch(Math.round((completed / total) * 100));
          }
        }
      } catch (err) {
        console.log("No active roadmap found or fetched.");
      }
    };

    fetchRoadmap();
    fetchSessions(true); // Fetch and load latest session

    // Check for saved interview results
    const savedResult = localStorage.getItem("latest_interview_result");
    if (savedResult) {
      try {
        const parsed = JSON.parse(savedResult);
        setInterviewResult(parsed);
        setFocusAreas(parsed.focusAreas || []);
        if (parsed.overallScore) {
          setTargetMatch(parsed.overallScore);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Web Speech API initialization
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";
      
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (isInterviewMode && interviewPhase === "active") {
          setInterviewText(prev => prev + (prev ? " " : "") + transcript);
        } else {
          setInput(prev => prev + (prev ? " " : "") + transcript);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [isInterviewMode, interviewPhase]);

  // Handle countdown timer for interviews
  useEffect(() => {
    if (isInterviewMode && interviewPhase === "active") {
      timerRef.current = setInterval(() => {
        setInterviewTimeLeft(prev => {
          if (prev <= 1) {
            handleNextInterviewQuestion();
            return 120;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isInterviewMode, interviewPhase, currentQuestionIndex]);

  // Fetch session list
  const fetchSessions = async (loadLatest = false) => {
    try {
      const res = await axios.get("http://localhost:5000/api/chatbot/sessions");
      setSessions(res.data || []);
      
      if (loadLatest && res.data && res.data.length > 0) {
        handleLoadSession(res.data[0]._id);
      }
    } catch (err) {
      console.error("Error fetching chat sessions:", err);
    }
  };

  // Load specific session
  const handleLoadSession = async (sessionId: string) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/chatbot/sessions/${sessionId}`);
      setActiveSessionId(sessionId);
      if (res.data && res.data.messages) {
        const formatted = res.data.messages.map((m: any) => ({
          id: m._id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp)
        }));
        setMessages(formatted.length > 0 ? formatted : [
          {
            id: "welcome",
            role: "ai",
            content: "Welcome back! What study topic are we reviewing today?",
            timestamp: new Date(),
          }
        ]);
      }
      setIsSidebarOpen(false);
    } catch (err) {
      console.error("Error loading chat session:", err);
    }
  };

  // Create new session
  const handleCreateSession = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/chatbot/sessions");
      setActiveSessionId(res.data._id);
      setMessages([
        {
          id: "welcome",
          role: "ai",
          content: "Welcome to Compass AI Mentor! What are we studying today?",
          timestamp: new Date(),
        }
      ]);
      await fetchSessions();
      setIsSidebarOpen(false);
    } catch (err) {
      console.error("Error creating chat session:", err);
    }
  };

  // Delete specific session
  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      await axios.delete(`http://localhost:5000/api/chatbot/sessions/${sessionId}`);
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([
          {
            id: "welcome",
            role: "ai",
            content: "Chat deleted. Start a new session or ask me anything about your studies!",
            timestamp: new Date(),
          }
        ]);
      }
      await fetchSessions();
    } catch (err) {
      console.error("Error deleting session:", err);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please type your response.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await axios.post("http://localhost:5000/api/chatbot/message", { 
        message: userMessage.content,
        sessionId: activeSessionId
      });

      const aiMessage: Message = {
        id: Date.now() + 1,
        role: "ai",
        content: res.data.reply,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Update session ID if it was a new chat
      if (!activeSessionId && res.data.sessionId) {
        setActiveSessionId(res.data.sessionId);
        fetchSessions();
      }
    } catch (err: any) {
      console.error(err);
      const aiMessage: Message = {
        id: Date.now() + 1,
        role: "ai",
        content: err.response?.data?.reply || err.response?.data?.error || err.response?.data?.msg || `Connection Error: ${err.message}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  // Start the interview flow
  const handleStartInterview = async () => {
    setInterviewPhase("setup");
    setIsInterviewMode(true);
    
    try {
      const res = await axios.get("http://localhost:5000/api/chatbot/interview/start");
      setInterviewQuestions(res.data.questions || []);
      setCurrentQuestionIndex(0);
      setInterviewAnswers([]);
      setInterviewText("");
      setInterviewTimeLeft(120);
      setInterviewPhase("active");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Error starting mock interview. Make sure your career roadmap is generated.");
      setIsInterviewMode(false);
    }
  };

  const handleNextInterviewQuestion = () => {
    const activeQuestion = interviewQuestions[currentQuestionIndex];
    const newAnswers = [
      ...interviewAnswers,
      { question: activeQuestion, answer: interviewText.trim() || "(No answer provided)" }
    ];
    setInterviewAnswers(newAnswers);
    setInterviewText("");

    if (currentQuestionIndex + 1 < interviewQuestions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setInterviewTimeLeft(120);
    } else {
      evaluateSession(newAnswers);
    }
  };

  const evaluateSession = async (finalAnswers: any[]) => {
    setInterviewPhase("evaluating");
    try {
      const res = await axios.post("http://localhost:5000/api/chatbot/interview/evaluate", {
        answers: finalAnswers
      });
      
      setInterviewResult(res.data);
      localStorage.setItem("latest_interview_result", JSON.stringify(res.data));
      
      setTargetMatch(res.data.overallScore);
      setFocusAreas(res.data.focusAreas || []);
      setRecentInsights({
        pace: res.data.overallScore > 80 ? "Optimal" : "Consistent",
        star: res.data.overallScore > 75 ? "Consistent" : "Needs Practice",
        depth: res.data.overallScore > 85 ? "Excellent" : "Good"
      });
      setInterviewPhase("result");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || err.response?.data?.msg || `Error evaluating mock interview: ${err.message}`);
      setInterviewPhase("active");
    }
  };

  const closeInterviewMode = () => {
    setIsInterviewMode(false);
    setInterviewPhase("setup");
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full flex h-screen overflow-hidden bg-background text-foreground relative">
      
      {/* Interactive Radial Glow Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient cx="50%" cy="50%" fx="50%" fy="50%" id="ai-glow" r="50%">
              <stop offset="0%" stopColor="#c0c1ff" stopOpacity="0.25"></stop>
              <stop offset="100%" stopColor="#0b1326" stopOpacity="0"></stop>
            </radialGradient>
          </defs>
          <circle className="animate-pulse" cx="20%" cy="30%" fill="url(#ai-glow)" r="35%"></circle>
          <circle className="animate-pulse" cx="85%" cy="75%" fill="url(#ai-glow)" r="45%"></circle>
        </svg>
      </div>

      {/* Drawer Backdrop Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 bg-background/60 backdrop-blur-xs z-30 cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* Collapsible Left Chat History Sidebar (Slide-out Drawer) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute left-0 top-0 h-full w-80 border-r border-outline-variant/10 bg-surface-container-low/95 backdrop-blur-xl p-4 flex flex-col z-40 shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-bold text-on-surface tracking-wide">Mentor Chat History</span>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* New Chat Button */}
            <button 
              onClick={handleCreateSession}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 active:scale-95 transition-all mb-6 font-semibold shadow-md shadow-primary/20"
            >
              <Plus className="w-5 h-5" />
              New Chat
            </button>

            {/* History Sessions List */}
            <div className="flex-1 overflow-y-auto pr-1">
              <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3 px-2">Saved Chats</h3>
              <div className="space-y-1">
                {sessions.length > 0 ? (
                  sessions.map((s) => (
                    <div 
                      key={s._id}
                      onClick={() => handleLoadSession(s._id)}
                      className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                        activeSessionId === s._id 
                          ? "bg-primary-container text-on-primary-container font-semibold" 
                          : "text-on-surface hover:bg-surface-container/60"
                      }`}
                    >
                      <span className="text-sm truncate mr-2 flex-1">
                        💬 {s.title}
                      </span>
                      <button 
                        onClick={(e) => handleDeleteSession(e, s._id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-on-surface-variant hover:text-error transition-all rounded-md hover:bg-surface-container-highest/20"
                        title="Delete Chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-on-surface-variant/70 px-2">No saved chats yet. Start asking queries!</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Chat Window */}
      <div className="flex-1 flex flex-col h-full bg-surface-dim/20 backdrop-blur-sm z-10 relative">
        
        {/* Chat Header */}
        <header className="h-20 px-6 flex items-center justify-between border-b border-outline-variant/10 bg-surface-container/30 backdrop-blur-lg">
          <div className="flex items-center gap-3">
            
            {/* Drawer Hamburger Toggle Button */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl transition-all mr-1"
              title="Chat History"
            >
              <Menu className="w-6 h-6" />
            </button>

            <button 
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 text-on-surface-variant hover:text-on-surface transition-colors rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="relative w-10 h-10 rounded-xl bg-surface-container-highest/60 border border-primary/20 flex items-center justify-center shadow-inner">
              <Bot className="w-6 h-6 text-primary" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-surface" />
            </div>
            <div>
              <h1 className="text-on-surface font-semibold tracking-tight leading-none flex items-center gap-2">
                Compass Mentor <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">v2.4</span>
              </h1>
              <p className="text-xs text-on-surface-variant mt-1">Ready for study guidance</p>
            </div>
          </div>

          {/* Mock Interview Mode Trigger Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartInterview}
              className="px-4 py-2 rounded-full bg-surface-container-high border border-outline-variant/30 text-sm font-semibold text-secondary hover:bg-secondary/10 hover:text-white transition-all duration-200 flex items-center gap-2 shadow-sm"
            >
              <Mic className="w-4 h-4" />
              Start Mock Interview
            </button>
          </div>
        </header>

        {/* Scrollable Messages Panel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-center relative my-4">
            <div className="absolute w-full h-[1px] bg-outline-variant/10"></div>
            <span className="bg-background px-3 py-1 rounded-full text-[10px] text-on-surface-variant uppercase tracking-widest relative z-10 border border-outline-variant/10">
              Today's Session
            </span>
          </div>

          {messages.map((message, index) => (
            <motion.div
              key={message.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.3) }}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
            >
              {message.role === "ai" && (
                <div className="w-8 h-8 rounded-lg bg-surface-container-highest border border-outline-variant/10 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
              )}
              
              <div
                className={`max-w-2xl ${
                  message.role === "user"
                    ? "bg-primary text-white shadow-md shadow-primary/10 rounded-2xl rounded-tr-sm px-4 py-3"
                    : "bg-surface-container/60 border border-outline-variant/10 text-on-surface rounded-2xl rounded-tl-sm px-4 py-3 backdrop-blur-sm"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                {message.role === "ai" && (
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-on-surface-variant font-medium">
                    <Sparkles className="w-3 h-3 text-secondary" />
                    <span>Personalized mentor advice</span>
                  </div>
                )}
              </div>
              
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0 border border-outline-variant/10 text-primary">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </div>
              )}
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-surface-container-highest border border-outline-variant/10 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div className="bg-surface-container/60 border border-outline-variant/10 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1.5 py-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="px-6 pb-2">
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="px-3.5 py-2 rounded-full bg-surface-container-low/80 border border-outline-variant/10 text-on-surface-variant hover:text-white hover:border-primary hover:bg-primary/5 transition-all text-xs font-medium"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Input Area */}
        <div className="p-4 border-t border-outline-variant/10 bg-surface-container-lowest/80 backdrop-blur-md">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <button className="w-10 h-10 rounded-xl bg-surface-container border border-outline-variant/10 flex items-center justify-center hover:border-primary/40 text-on-surface-variant transition-all hover:text-white shrink-0">
              <Paperclip className="w-5 h-5" />
            </button>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask anything about your path... (study questions only)"
              className="flex-1 px-4 h-10 rounded-xl bg-surface-container border border-outline-variant/10 text-on-surface placeholder-on-surface-variant/40 focus:border-primary focus:outline-none text-sm transition-all focus:ring-1 focus:ring-primary/20"
            />
            
            <button 
              onClick={toggleListening}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all shrink-0 ${
                isListening 
                  ? "bg-secondary text-white border-secondary animate-pulse" 
                  : "bg-surface-container border-outline-variant/10 text-on-surface-variant hover:text-white hover:border-primary/40"
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center hover:bg-primary/90 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center mt-2">
            <span className="text-[10px] text-on-surface-variant/40 font-medium uppercase tracking-wider">
              AI Mentor checks and restricts answers to study topics.
            </span>
          </div>
        </div>

      </div>

      {/* Right Sidebar: Contextual Insights (Shows ONLY after mock interview) */}
      <aside className="w-96 bg-surface-container-low border-l border-outline-variant/10 flex flex-col h-full z-10 overflow-y-auto p-6 scroll-smooth select-none">
        
        {!interviewResult ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4 h-full">
            <div className="w-16 h-16 rounded-2xl bg-surface-container border border-outline-variant/10 flex items-center justify-center mb-4 shadow-inner">
              <BrainCircuit className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h3 className="font-bold text-on-surface text-base mb-2">No Interview Analysis</h3>
            <p className="text-xs text-on-surface-variant/80 max-w-[240px] leading-relaxed mb-6">
              Complete a mock interview to evaluate your readiness for <strong className="text-secondary">{targetCareer}</strong>, check communication metrics, and see personalized focus recommendations.
            </p>
            <button
              onClick={handleStartInterview}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold uppercase tracking-widest hover:opacity-90 active:scale-95 shadow-md shadow-primary/20 transition-all flex items-center gap-2"
            >
              <Mic className="w-4 h-4" /> Start Mock Interview
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Target Role & Progress bar */}
            <div className="relative">
              <div className="absolute -left-6 top-0 w-1 h-full bg-primary rounded-r" />
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Target Career Path</p>
              <h2 className="text-xl font-bold text-on-surface leading-tight tracking-tight">{targetCareer}</h2>
              <div className="flex items-center gap-3 mt-4">
                <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full relative transition-all duration-1000"
                    style={{ width: `${targetMatch}%` }}
                  >
                    <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/20 animate-pulse" />
                  </div>
                </div>
                <span className="text-xs font-bold text-on-surface tracking-wide">{targetMatch}% Match</span>
              </div>
            </div>

            {/* Active Focus Areas Bento Grid */}
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">radar</span> Focus Recommendations
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                {focusAreas.length > 0 ? (
                  focusAreas.map((skill, index) => {
                    const icons = ["architecture", "psychology", "schema"];
                    const colors = ["text-primary", "text-secondary", "text-tertiary"];
                    const icon = icons[index % icons.length];
                    const color = colors[index % colors.length];

                    return (
                      <div 
                        key={skill} 
                        className="bg-surface-container border border-outline-variant/10 rounded-xl p-3.5 relative overflow-hidden group hover:bg-surface-container-high transition-colors select-none"
                      >
                        <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-bl-full blur-md group-hover:bg-primary/10 transition-colors" />
                        <div className="flex justify-between items-start mb-2">
                          <span className={`material-symbols-outlined text-[20px] ${color}`}>{icon}</span>
                          <span className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-bold uppercase tracking-wider">
                            Study Focus
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm text-on-surface">{skill}</h3>
                        <p className="text-[11px] text-on-surface-variant mt-1 leading-snug">Focus on mastering this topic to bolster your match score.</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-on-surface-variant">No immediate focus areas recommended. Keep up the good work!</p>
                )}
              </div>
            </div>

            {/* Interview Readiness Metrics */}
            <div className="relative bg-surface-container/60 border border-outline-variant/10 rounded-2xl p-4 shadow-sm">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-secondary">speed</span> Insights Summary
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface">Speaking Pace</span>
                  <span className="text-xs font-bold text-success flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    {recentInsights.pace}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface">STAR Framework Use</span>
                  <span className="text-xs font-bold text-primary">{recentInsights.star}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface">Technical Depth</span>
                  <span className="text-xs font-bold text-secondary">{recentInsights.depth}</span>
                </div>
              </div>

              {/* Pure CSS Confidence Sparkline Chart */}
              <div className="mt-5 h-16 w-full flex items-end justify-between gap-1 opacity-80 border-b border-outline-variant/10 pb-1">
                <div className="w-full bg-primary/20 h-[30%] rounded-t-sm" />
                <div className="w-full bg-primary/30 h-[45%] rounded-t-sm" />
                <div className="w-full bg-primary/40 h-[60%] rounded-t-sm" />
                <div className="w-full bg-secondary/60 h-[75%] rounded-t-sm relative">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-secondary rounded-full shadow-[0_0_8px_#89ceff]" />
                </div>
                <div className="w-full bg-primary/50 h-[82%] rounded-t-sm" />
                <div className="w-full bg-primary/60 h-[90%] rounded-t-sm" />
              </div>
              <div className="text-center mt-2">
                <span className="text-[9px] text-on-surface-variant uppercase tracking-wider font-bold">Confidence Trend (Last 5 Sessions)</span>
              </div>
            </div>

            {/* Clear Interview results button */}
            <div className="text-center">
              <button 
                onClick={() => {
                  localStorage.removeItem("latest_interview_result");
                  setInterviewResult(null);
                  setFocusAreas([]);
                }}
                className="text-[10px] text-on-surface-variant/60 hover:text-primary transition-colors uppercase tracking-widest font-bold"
              >
                Reset Insights & Retake Interview
              </button>
            </div>

          </div>
        )}

      </aside>

      {/* Full-Screen Mock Interview Mode Overlay */}
      <AnimatePresence>
        {isInterviewMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/98 backdrop-blur-2xl z-50 flex flex-col justify-between p-8"
          >
            {/* Overlay Top Bar */}
            <div className="w-full max-w-4xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-surface-container border border-outline-variant/20 flex items-center justify-center shadow-lg">
                  <Mic className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-on-surface leading-none">Compass Mock Interview</h2>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1">Active Session • {targetCareer}</p>
                </div>
              </div>

              {interviewPhase === "active" && (
                <div className="flex items-center gap-3 bg-surface-container p-2 rounded-xl border border-outline-variant/10">
                  <div className="text-2xl font-bold text-primary tabular-nums leading-none pr-2 border-r border-outline-variant/10">
                    {formatTimer(interviewTimeLeft)}
                  </div>
                  <span className="text-xs font-bold text-error uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-error rounded-full animate-pulse" />
                    Recording Answer
                  </span>
                </div>
              )}
            </div>

            {/* Overlay Main Content Area */}
            <div className="flex-1 flex items-center justify-center w-full max-w-3xl mx-auto my-6">
              
              {interviewPhase === "setup" && (
                <div className="text-center space-y-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                  <p className="text-sm text-on-surface-variant">Generating customized interview questions using Groq LLM...</p>
                </div>
              )}

              {interviewPhase === "active" && (
                <div className="w-full text-center space-y-8">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    Question {currentQuestionIndex + 1} of {interviewQuestions.length}
                  </span>
                  
                  <h3 className="text-2xl font-bold text-on-surface leading-snug tracking-tight px-4 min-h-[80px]">
                    "{interviewQuestions[currentQuestionIndex]}"
                  </h3>

                  {/* Audio visualization simulation bar graph */}
                  <div className="flex items-center justify-center gap-1.5 h-16 my-4 select-none pointer-events-none">
                    <div className="w-1.5 bg-secondary/80 rounded-full animate-[bounce_1.2s_infinite_100ms] h-[20%]" />
                    <div className="w-1.5 bg-secondary/80 rounded-full animate-[bounce_1.2s_infinite_300ms] h-[55%]" />
                    <div className="w-1.5 bg-primary/80 rounded-full animate-[bounce_1.2s_infinite_200ms] h-[85%]" />
                    <div className="w-1.5 bg-primary rounded-full animate-[bounce_1.2s_infinite_400ms] h-[100%] shadow-[0_0_12px_#6366f1]" />
                    <div className="w-1.5 bg-primary/80 rounded-full animate-[bounce_1.2s_infinite_200ms] h-[65%]" />
                    <div className="w-1.5 bg-secondary/80 rounded-full animate-[bounce_1.2s_infinite_500ms] h-[35%]" />
                    <div className="w-1.5 bg-secondary/80 rounded-full animate-[bounce_1.2s_infinite_150ms] h-[15%]" />
                  </div>

                  {/* Text Response area */}
                  <div className="w-full max-w-xl mx-auto space-y-4">
                    <textarea
                      value={interviewText}
                      onChange={(e) => setInterviewText(e.target.value)}
                      placeholder="Type your detailed response or use voice dictation..."
                      className="w-full h-32 bg-surface-container/60 border border-outline-variant/15 rounded-2xl p-4 text-on-surface focus:outline-none focus:border-primary placeholder-on-surface-variant/30 text-sm resize-none"
                    />
                    
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={toggleListening}
                        className={`px-5 py-2.5 rounded-full border text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                          isListening
                            ? "bg-secondary text-white border-secondary animate-pulse"
                            : "bg-surface-container border-outline-variant/10 text-on-surface-variant hover:text-white"
                        }`}
                      >
                        <Mic className="w-4 h-4" />
                        {isListening ? "Listening..." : "Dictate Answer"}
                      </button>

                      <button
                        onClick={handleNextInterviewQuestion}
                        className="px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold uppercase tracking-widest hover:opacity-90 active:scale-95 shadow-md shadow-primary/20 transition-all"
                      >
                        {currentQuestionIndex + 1 === interviewQuestions.length ? "Submit Interview" : "Next Question"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {interviewPhase === "evaluating" && (
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-on-surface">Evaluating performance...</p>
                  <p className="text-xs text-on-surface-variant/80 max-w-xs mx-auto">Groq AI is grading your interview answers and generating target match insights.</p>
                </div>
              )}

              {interviewPhase === "result" && interviewResult && (
                <div className="w-full max-w-2xl bg-surface-container/40 border border-outline-variant/10 rounded-2xl p-6 md:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                  
                  {/* Score & Verdict Header */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-outline-variant/10">
                    <div className="relative w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center shrink-0">
                      <div className="absolute inset-0.5 rounded-full border-4 border-secondary border-t-transparent animate-[spin_3s_linear_infinite]" />
                      <span className="text-3xl font-bold text-on-surface">{interviewResult.overallScore}%</span>
                    </div>
                    <div className="text-center sm:text-left space-y-1">
                      <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        Evaluation Result
                      </span>
                      <h4 className="text-xl font-bold text-on-surface mt-1">Interview Completed Successfully</h4>
                      <p className="text-xs text-on-surface-variant">Matched against requirements for {targetCareer}.</p>
                    </div>
                  </div>

                  {/* Feedback Markdown */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Detailed Feedback</h5>
                    <div className="bg-surface-container-low/50 rounded-xl p-4 border border-outline-variant/5 text-xs text-on-surface-variant leading-relaxed space-y-2">
                      <p className="whitespace-pre-wrap">{interviewResult.feedback}</p>
                    </div>
                  </div>

                  {/* Strengths & Weaknesses tag blocks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-bold text-success uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {interviewResult.strongAreas?.map((area: string) => (
                          <span key={area} className="text-[10px] px-2.5 py-1 bg-success/15 border border-success/20 text-success rounded-full font-medium">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Focus Needed
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {interviewResult.focusAreas?.map((area: string) => (
                          <span key={area} className="text-[10px] px-2.5 py-1 bg-primary/10 border border-primary/25 text-primary rounded-full font-medium">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Return Button */}
                  <div className="pt-4 border-t border-outline-variant/10 text-center">
                    <button
                      onClick={closeInterviewMode}
                      className="px-6 py-2.5 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wider hover:bg-primary/95 shadow-md shadow-primary/25 transition-all"
                    >
                      Return to Study Mentor
                    </button>
                  </div>

                </div>
              )}

            </div>

            {/* Overlay Footer */}
            <div className="w-full max-w-4xl mx-auto flex justify-between items-center pt-4 border-t border-outline-variant/10">
              <span className="text-[9px] text-on-surface-variant/40 font-bold uppercase tracking-wider">
                Powered by Groq LLM & Compass Core
              </span>
              <button
                onClick={closeInterviewMode}
                className="px-4 py-2 rounded-xl text-on-surface-variant hover:text-white hover:bg-surface-container text-xs font-bold transition-all"
              >
                Abort Session
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
