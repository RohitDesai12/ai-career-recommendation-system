import { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Building2, 
  Briefcase, 
  ArrowLeft, 
  Bot, 
  Mic, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  BrainCircuit, 
  Compass, 
  ChevronDown, 
  ChevronUp,
  DollarSign,
  Award,
  BookOpen,
  Bookmark
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import axios from "axios";

interface CompanyResult {
  company: string;
  roles: string[];
}

interface RoleResult {
  company: string;
  role: string;
}

interface PrepDetail {
  company: string;
  role: string;
  salaryRange: string;
  requiredSkills: string[];
  selectionProcess: string;
  technicalTopics: string[];
  aptitudeTopics: string[];
  codingTopics: string[];
  hrQuestions: string[];
  prepRoadmap: string;
  interviewQuestions: { question: string; answer: string }[];
}

export function InterviewPrepPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"company" | "role">("company");
  const [companyResults, setCompanyResults] = useState<CompanyResult[]>([]);
  const [roleResults, setRoleResults] = useState<RoleResult[]>([]);
  const [searching, setSearching] = useState(false);

  // Selected Prep Detail
  const [selectedGuide, setSelectedGuide] = useState<PrepDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [expandedRoadmap, setExpandedRoadmap] = useState(true);
  const [expandedQuestionIndex, setExpandedQuestionIndex] = useState<number | string | null>(null);

  // Saved Guide state
  const [isSaved, setIsSaved] = useState(false);

  const checkIfSaved = async (company: string, role: string) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/interview-prep/saved-status?company=${encodeURIComponent(company)}&role=${encodeURIComponent(role)}`);
      setIsSaved(res.data.saved);
    } catch (err) {
      console.error("Error checking saved status:", err);
    }
  };

  const handleToggleSave = async () => {
    if (!selectedGuide) return;
    try {
      if (isSaved) {
        await axios.delete(`http://localhost:5000/api/interview-prep/save?company=${encodeURIComponent(selectedGuide.company)}&role=${encodeURIComponent(selectedGuide.role)}`);
        setIsSaved(false);
      } else {
        await axios.post("http://localhost:5000/api/interview-prep/save", {
          company: selectedGuide.company,
          role: selectedGuide.role
        });
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Error toggling save:", err);
      alert("Failed to update save status.");
    }
  };

  useEffect(() => {
    if (selectedGuide) {
      checkIfSaved(selectedGuide.company, selectedGuide.role);
    }
  }, [selectedGuide]);

  // Company Mock Interview States
  const [isInterviewMode, setIsInterviewMode] = useState(false);
  const [interviewPhase, setInterviewPhase] = useState<"setup" | "active" | "evaluating" | "result">("setup");
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewAnswers, setInterviewAnswers] = useState<{ question: string; answer: string }[]>([]);
  const [interviewText, setInterviewText] = useState("");
  const [interviewTimeLeft, setInterviewTimeLeft] = useState(120); // 2 mins per question
  const [interviewResult, setInterviewResult] = useState<any>(null);

  // Speech Recognition
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  const navigate = useNavigate();

  // Load popular companies by default on mount or auto-load if query params exist
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const companyParam = params.get("company");
    const roleParam = params.get("role");
    if (companyParam && roleParam) {
      handleSelectRole(companyParam, roleParam);
    } else {
      handleSearch("", "company");
    }
  }, []);

  const handleSearch = async (query: string, type: "company" | "role" = searchType) => {
    setSearching(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/interview-prep/search?q=${query || "a"}&type=${type}`);
      if (type === "role") {
        setRoleResults(res.data.results || []);
        setCompanyResults([]);
      } else {
        setCompanyResults(res.data.results || []);
        setRoleResults([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectRole = async (company: string, role: string) => {
    setLoadingDetail(true);
    setSelectedGuide(null);
    try {
      const res = await axios.get(`http://localhost:5000/api/interview-prep/detail?company=${company}&role=${role}`);
      setSelectedGuide(res.data);
      setExpandedQuestionIndex(null);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || err.response?.data?.msg || `Error loading interview prep details: ${err.message}`);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Speech Dictation
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";
      
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInterviewText(prev => prev + (prev ? " " : "") + transcript);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Interview Timer
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

  const handleStartInterview = async () => {
    if (!selectedGuide) return;
    setInterviewPhase("setup");
    setIsInterviewMode(true);
    
    try {
      const res = await axios.get(`http://localhost:5000/api/interview-prep/mock/start?company=${selectedGuide.company}&role=${selectedGuide.role}`);
      setInterviewQuestions(res.data.questions || []);
      setCurrentQuestionIndex(0);
      setInterviewAnswers([]);
      setInterviewText("");
      setInterviewTimeLeft(120);
      setInterviewPhase("active");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || err.response?.data?.msg || `Error starting mock interview: ${err.message}`);
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
    if (!selectedGuide) return;
    setInterviewPhase("evaluating");
    try {
      const res = await axios.post("http://localhost:5000/api/interview-prep/mock/evaluate", {
        company: selectedGuide.company,
        role: selectedGuide.role,
        answers: finalAnswers
      });
      setInterviewResult(res.data);
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
    setInterviewResult(null);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground relative p-6 select-none overflow-y-auto">
      
      {/* Background radial glow */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient cx="50%" cy="50%" fx="50%" fy="50%" id="prep-glow" r="50%">
              <stop offset="0%" stopColor="#1F5C45" stopOpacity="0.2"></stop>
              <stop offset="100%" stopColor="#F7F3EA" stopOpacity="0"></stop>
            </radialGradient>
          </defs>
          <circle className="animate-pulse" cx="15%" cy="20%" fill="url(#prep-glow)" r="35%"></circle>
          <circle className="animate-pulse" cx="80%" cy="75%" fill="url(#prep-glow)" r="45%"></circle>
        </svg>
      </div>

      <div className="max-w-6xl mx-auto z-10 relative space-y-6">
        
        {/* Page Header */}
        <header className="flex justify-between items-center pb-4 border-b border-outline-variant/10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Company Interview Prep</h1>
            <p className="text-sm text-on-surface-variant mt-1">Search company guides, practice aptitude topics, and start AI mock interviews</p>
          </div>
          <button 
            onClick={() => navigate("/dashboard")}
            className="p-2.5 rounded-xl border border-outline-variant/10 hover:bg-surface-container-high transition-all flex items-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </header>

        {!selectedGuide ? (
          // Main Search & Discovery Panel
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Search Column */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-surface-container-low/60 backdrop-blur-md border border-outline-variant/10 rounded-2xl p-5 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" /> Find Preparation Guides
                </h2>
                
                {/* Search Type Toggle */}
                <div className="flex bg-surface-container rounded-lg p-1 text-xs font-bold uppercase tracking-wider">
                  <button 
                    onClick={() => {
                      setSearchType("company");
                      handleSearch(searchQuery, "company");
                    }}
                    className={`flex-1 py-2 text-center rounded-md transition-all ${
                      searchType === "company" 
                        ? "bg-primary text-white shadow-sm" 
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    By Company
                  </button>
                  <button 
                    onClick={() => {
                      setSearchType("role");
                      handleSearch(searchQuery, "role");
                    }}
                    className={`flex-1 py-2 text-center rounded-md transition-all ${
                      searchType === "role" 
                        ? "bg-primary text-white shadow-sm" 
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    By Role
                  </button>
                </div>

                {/* Input box */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleSearch(e.target.value);
                    }}
                    placeholder={searchType === "company" ? "Search company (e.g. TCS)..." : "Search role (e.g. Data Engineer)..."}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary transition-all focus:ring-1 focus:ring-primary/20"
                  />
                  <Search className="w-4 h-4 text-on-surface-variant/50 absolute left-3.5 top-3.5" />
                </div>
              </div>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-1">
                {searching ? "Searching..." : searchQuery ? "Search Results" : "Featured Companies"}
              </h3>

              {searching ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchType === "company" ? (
                    companyResults.map((item) => (
                      <div 
                        key={item.company}
                        className="bg-surface-container/40 border border-outline-variant/10 rounded-2xl p-5 space-y-4 transition-all hover:border-primary/20 backdrop-blur-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shrink-0 shadow-inner">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-base text-on-surface">{item.company}</h4>
                            <p className="text-xs text-on-surface-variant">{item.roles.length} roles available</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-outline-variant/5 space-y-2">
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Select a Role to Prep:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {item.roles.map(role => (
                              <button
                                key={role}
                                onClick={() => handleSelectRole(item.company, role)}
                                className="px-2.5 py-1.5 rounded-lg bg-surface-container-high/60 text-xs font-medium text-on-surface-variant hover:text-white hover:bg-primary/20 hover:border-primary/20 transition-all border border-outline-variant/5"
                              >
                                {role}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    roleResults.map((item, idx) => (
                      <div 
                        key={idx}
                        onClick={() => handleSelectRole(item.company, item.role)}
                        className="bg-surface-container/40 border border-outline-variant/10 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all hover:border-primary/20 backdrop-blur-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/25 flex items-center justify-center text-secondary shrink-0">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-on-surface leading-tight">{item.role}</h4>
                            <p className="text-xs text-on-surface-variant mt-0.5">Offered by {item.company}</p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-on-surface-variant/40 hover:text-primary transition-colors text-[20px] pr-1">
                          chevron_right
                        </span>
                      </div>
                    ))
                  )}

                  {!searching && companyResults.length === 0 && roleResults.length === 0 && (
                    <div className="col-span-2 text-center py-12 bg-surface-container-low/40 rounded-2xl border border-outline-variant/10">
                      <p className="text-sm text-on-surface-variant">No matching preparation guides found.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        ) : (
          // Guide Detail View
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left/Middle: Guide contents */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Detail Header card */}
              <div className="bg-surface-container-low/60 border border-outline-variant/10 rounded-2xl p-6 relative overflow-hidden shadow-sm backdrop-blur-md">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full blur-2xl pointer-events-none" />
                <button 
                  onClick={() => setSelectedGuide(null)}
                  className="px-3 py-1.5 rounded-lg border border-outline-variant/10 hover:bg-surface-container text-xs font-bold text-on-surface-variant transition-all hover:text-white flex items-center gap-1.5 mb-4"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Search
                </button>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-on-surface tracking-tight">{selectedGuide.role}</h2>
                    <p className="text-sm text-secondary font-semibold mt-1">Interview Prep Guide • {selectedGuide.company}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3.5 py-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" /> {selectedGuide.salaryRange}
                    </span>
                    <button
                      onClick={handleToggleSave}
                      className={`px-3 py-2.5 border rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                        isSaved
                          ? "bg-secondary/15 border-secondary/35 text-secondary"
                          : "border-outline-variant/20 hover:bg-surface-container text-on-surface-variant hover:text-white"
                      }`}
                      title={isSaved ? "Saved" : "Save Guide"}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? "fill-secondary" : ""}`} />
                      {isSaved ? "Saved" : "Save"}
                    </button>
                    <button
                      onClick={handleStartInterview}
                      className="px-4 py-2.5 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <Mic className="w-4 h-4" /> AI Mock Interview
                    </button>
                  </div>
                </div>
              </div>

              {/* Bento Grid: Required Skills & Selection Process */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Skills */}
                <div className="bg-surface-container/60 border border-outline-variant/10 rounded-2xl p-5 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-primary" /> Key Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(selectedGuide.requiredSkills || []).map(skill => (
                      <span 
                        key={skill} 
                        className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-medium rounded-lg"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Selection Round summary */}
                <div className="bg-surface-container/60 border border-outline-variant/10 rounded-2xl p-5 shadow-sm space-y-2">
                  <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-secondary" /> Selection Process
                  </h3>
                  <p className="text-xs text-on-surface leading-relaxed pt-1 whitespace-pre-wrap">{selectedGuide.selectionProcess}</p>
                </div>

              </div>

              {/* Collapsible Study roadmap */}
              <div className="bg-surface-container/60 border border-outline-variant/10 rounded-2xl p-5 shadow-sm">
                <button 
                  onClick={() => setExpandedRoadmap(prev => !prev)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-primary animate-pulse" /> Preparation Roadmap
                  </h3>
                  {expandedRoadmap ? <ChevronUp className="w-4 h-4 text-on-surface-variant" /> : <ChevronDown className="w-4 h-4 text-on-surface-variant" />}
                </button>
                {expandedRoadmap && (
                  <div className="pt-4 border-t border-outline-variant/10 mt-3 text-xs text-on-surface-variant leading-relaxed space-y-2 prose prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{selectedGuide.prepRoadmap}</p>
                  </div>
                )}
              </div>

              {/* Sample interview questions list */}
              <div className="bg-surface-container/60 border border-outline-variant/10 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-secondary" /> Common Interview Questions
                </h3>
                
                <div className="space-y-6 pt-1">
                  {selectedGuide.interviewQuestions && selectedGuide.interviewQuestions.length > 0 && 
                    ('round' in selectedGuide.interviewQuestions[0] ? (
                      // Display grouped by rounds
                      (selectedGuide.interviewQuestions as any[]).map((roundObj, roundIdx) => (
                        <div key={roundIdx} className="space-y-3">
                          <h4 className="text-xs font-bold text-primary tracking-wider uppercase flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" /> {roundObj.round}
                          </h4>
                          <div className="space-y-3 pl-3.5 border-l border-outline-variant/10 ml-0.5">
                            {roundObj.questions?.map((qa: any, index: number) => {
                              const globalIndex = `${roundIdx}-${index}`;
                              const isExpanded = expandedQuestionIndex === globalIndex;
                              return (
                                <div 
                                  key={index}
                                  className="border border-outline-variant/10 rounded-xl bg-surface-container-low/40 overflow-hidden"
                                >
                                  <button
                                    onClick={() => setExpandedQuestionIndex(isExpanded ? null : globalIndex)}
                                    className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-surface-container-high/40 transition-colors"
                                  >
                                    <span className="text-xs font-bold text-on-surface">
                                      Q{index + 1}: {qa.question}
                                    </span>
                                    {isExpanded ? <ChevronUp className="w-4 h-4 text-on-surface-variant shrink-0" /> : <ChevronDown className="w-4 h-4 text-on-surface-variant shrink-0" />}
                                  </button>
                                  
                                  {isExpanded && (
                                    <div className="p-4 border-t border-outline-variant/10 bg-surface-container/30 text-xs text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                                      <strong className="text-secondary block mb-1">Model Answer:</strong>
                                      {qa.answer}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    ) : (
                      // Fallback for flat structure
                      <div className="space-y-3">
                        {(selectedGuide.interviewQuestions || []).map((qa, index) => {
                          const isExpanded = expandedQuestionIndex === index;
                          return (
                            <div 
                              key={index}
                              className="border border-outline-variant/10 rounded-xl bg-surface-container-low/40 overflow-hidden"
                            >
                              <button
                                onClick={() => setExpandedQuestionIndex(isExpanded ? null : index)}
                                className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-surface-container-high/40 transition-colors"
                              >
                                <span className="text-xs font-bold text-on-surface">
                                  Q{index + 1}: {qa.question}
                                </span>
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-on-surface-variant shrink-0" /> : <ChevronDown className="w-4 h-4 text-on-surface-variant shrink-0" />}
                              </button>
                              
                              {isExpanded && (
                                <div className="p-4 border-t border-outline-variant/10 bg-surface-container/30 text-xs text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                                  <strong className="text-secondary block mb-1">Model Answer:</strong>
                                  {qa.answer}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))
                  }
                </div>
              </div>

            </div>

            {/* Right sidebar: Topic breakdowns */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Preparation Topics Bento Card */}
              <div className="bg-surface-container-low/60 border border-outline-variant/10 rounded-2xl p-5 shadow-sm space-y-5 backdrop-blur-md">
                <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest pb-2 border-b border-outline-variant/10">Prep Syllabus</h3>
                
                {/* Tech topics */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Technical Subjects</p>
                  <div className="flex flex-wrap gap-1">
                    {(selectedGuide.technicalTopics || []).map(topic => (
                      <span key={topic} className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-semibold rounded-md">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Aptitude topics */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Aptitude & Reasoning</p>
                  <div className="flex flex-wrap gap-1">
                    {(selectedGuide.aptitudeTopics || []).map(topic => (
                      <span key={topic} className="px-2 py-1 bg-secondary/10 text-secondary text-[10px] font-semibold rounded-md">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Coding topics */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-tertiary uppercase tracking-wider">Coding Topics</p>
                  <div className="flex flex-wrap gap-1">
                    {(selectedGuide.codingTopics || []).map(topic => (
                      <span key={topic} className="px-2 py-1 bg-tertiary/10 text-tertiary text-[10px] font-semibold rounded-md">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* HR questions */}
                <div className="space-y-2 pt-2 border-t border-outline-variant/10">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Common HR Questions</p>
                  <ul className="list-disc list-inside text-xs text-on-surface-variant space-y-1.5 leading-snug">
                    {(selectedGuide.hrQuestions || []).map(q => (
                      <li key={q} className="truncate" title={q}>{q}</li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Loading overlay for guide detail */}
      <AnimatePresence>
        {loadingDetail && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-45 flex flex-col items-center justify-center gap-4"
          >
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm font-semibold text-on-surface">Gathering company interview prep guide from database...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-Screen Mock Interview Mode Overlay */}
      <AnimatePresence>
        {isInterviewMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/98 backdrop-blur-2xl z-50 flex flex-col justify-between p-8"
          >
            {/* Overlay Top Bar */}
            <div className="w-full max-w-4xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-surface-container border border-outline-variant/20 flex items-center justify-center shadow-lg">
                  <Mic className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-on-surface leading-none">{selectedGuide?.company} Mock Interview</h2>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1">Role: {selectedGuide?.role}</p>
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
                  <p className="text-sm text-on-surface-variant">Generating customized company questions using Groq LLM...</p>
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
                    <div className="w-1.5 bg-primary rounded-full animate-[bounce_1.2s_infinite_400ms] h-[100%] shadow-[0_0_12px_#1F5C45]" />
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
                  <p className="text-sm font-semibold text-on-surface">Evaluating responses...</p>
                  <p className="text-xs text-on-surface-variant/80 max-w-xs mx-auto">Groq AI is grading your interview answers specifically against {selectedGuide?.company} standards.</p>
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
                        Mock Grade
                      </span>
                      <h4 className="text-xl font-bold text-on-surface mt-1">Mock Interview Evaluated</h4>
                      <p className="text-xs text-on-surface-variant">Tailored performance for {selectedGuide?.role} at {selectedGuide?.company}.</p>
                    </div>
                  </div>

                  {/* Feedback Markdown */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Feedback Summary</h5>
                    <div className="bg-surface-container-low/50 rounded-xl p-4 border border-outline-variant/5 text-xs text-on-surface-variant leading-relaxed space-y-2">
                      <p className="whitespace-pre-wrap">{interviewResult.feedback}</p>
                    </div>
                  </div>

                  {/* Strengths & Weaknesses tag blocks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-bold text-success uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Strong Points
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
                        <AlertTriangle className="w-3.5 h-3.5" /> Suggested Focus Areas
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
                      Return to Study Guide
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
