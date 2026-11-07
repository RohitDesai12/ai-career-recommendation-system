import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/auth-context";
import axios from "axios";

interface MessageAction {
  label: string;
  route: string;
}

interface MessageSource {
  title: string;
  doc: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: MessageSource[];
  actions?: MessageAction[];
  timestamp: Date;
}

export function CareerCompassAssistant() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Dynamic quick action suggestions based on current active page
  const getPageSpecificSuggestions = () => {
    const path = location.pathname;

    if (path.startsWith("/resume")) {
      return [
        "How do I create a resume?",
        "How does Resume Analyzer score ATS?",
        "How do I tailor for a job?",
        "What resumes do I have?",
      ];
    }

    if (path.startsWith("/jobs")) {
      return [
        "Show my applications",
        "Where are my saved jobs?",
        "How does matching score work?",
        "How do I apply?",
      ];
    }

    if (path.startsWith("/roadmap")) {
      return [
        "What is my roadmap progress?",
        "What should I learn next?",
        "How do milestones work?",
      ];
    }

    if (path.startsWith("/interview") || path.startsWith("/mock-interview")) {
      return [
        "How does Mock Interview work?",
        "Top technical interview tips",
        "Explain the STAR method",
      ];
    }

    if (path.startsWith("/assessment") || path.startsWith("/results")) {
      return [
        "How does Career Test work?",
        "How are career matches calculated?",
        "How to create a roadmap?",
      ];
    }

    if (path.startsWith("/profile") || path.startsWith("/career-preferences")) {
      return [
        "What is my profile strength?",
        "What skills do I have listed?",
        "How do I improve my profile?",
      ];
    }

    // Default suggestions
    return [
      "How do I create a resume?",
      "What is my profile strength?",
      "Show my saved jobs",
      "How does Career Test work?",
      "What should I learn next?",
    ];
  };

  const suggestions = getPageSpecificSuggestions();

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Listen for custom open event (e.g. from buttons on dashboard)
  useEffect(() => {
    const handleOpenAssistant = (e: any) => {
      setIsOpen(true);
      if (e?.detail?.prompt) {
        handleSendMessage(e.detail.prompt);
      }
    };

    window.addEventListener("open-career-assistant", handleOpenAssistant);
    return () => window.removeEventListener("open-career-assistant", handleOpenAssistant);
  }, [conversationId]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || loading) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/assistant/chat",
        {
          message: text.trim(),
          conversationId,
          currentPage: location.pathname,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        }
      );

      if (res.data) {
        if (res.data.conversationId) {
          setConversationId(res.data.conversationId);
        }

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: res.data.message || "I'm here to help with any Career Compass questions.",
          sources: res.data.sources || [],
          actions: res.data.actions || [],
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err: any) {
      console.error("Assistant chat error:", err);
      const fallbackMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content:
          err.response?.data?.message ||
          "I'm having trouble retrieving that information right now. Please try again or explore our sidebar tools.",
        actions: [{ label: "Go to Dashboard", route: "/dashboard" }],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  const handleActionClick = (route: string) => {
    navigate(route);
  };

  // Only render for authenticated student users
  if (!isAuthenticated || user?.role === "admin" || user?.role === "employer" || user?.role === "recruiter") {
    return null;
  }

  const displayName = user?.name ? user.name.split(" ")[0] : "there";

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. FLOATING ASSISTANT BUTTON (BOTTOM-RIGHT)                               */}
      {/* ========================================================================= */}
      <div className="fixed bottom-6 right-6 z-50 select-none">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Career Compass AI Assistant"
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl ${
            isOpen
              ? "bg-slate-900 text-white shadow-slate-900/30 scale-95 ring-2 ring-indigo-500/50"
              : "bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-indigo-600/35 hover:scale-105 border border-white/25 active:scale-95"
          }`}
        >
          {isOpen ? (
            <span className="material-symbols-outlined text-[24px]">close</span>
          ) : (
            <div className="relative flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">auto_awesome</span>
              {/* Subtle pulsing spark dot */}
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-indigo-700" />
            </div>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. FLOATING ASSISTANT PANEL                                              */}
      {/* ========================================================================= */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Career Compass Assistant Chat Panel"
          className="w-[calc(100vw-32px)] sm:w-[410px] h-[580px] max-h-[calc(100vh-100px)] fixed bottom-22 right-4 sm:right-6 z-50 rounded-3xl shadow-2xl bg-white dark:bg-[#151320] border border-slate-200/90 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-sans"
        >
          {/* Header */}
          <div className="h-16 px-4 bg-white dark:bg-[#151320] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/25 shrink-0">
                <span className="material-symbols-outlined text-[20px]">explore</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-black text-sm text-slate-900 dark:text-white leading-tight truncate">
                    Career Compass
                  </span>
                  <span className="px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-[9.5px] font-black uppercase tracking-wider">
                    AI
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Your AI guide for Career Compass
                </span>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Reset conversation"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close assistant"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 min-h-0 bg-slate-50/50 dark:bg-[#12101b]/50">
            {/* Initial Welcome Greeting */}
            {messages.length === 0 && (
              <div className="space-y-3.5 animate-in fade-in duration-300">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#1c192b] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">✨</span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Hi {displayName}! How can I help?
                    </h4>
                  </div>
                  <p className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    I can help you navigate Career Compass, explain tools (Resume Studio, Career Test, Roadmaps, Jobs), and look up information from your profile.
                  </p>
                </div>

                {/* Suggested Quick Actions */}
                <div className="space-y-1.5">
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider px-1">
                    Suggested Questions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(suggestion)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1e1b2e] hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-medium transition-all text-left shadow-2xs cursor-pointer active:scale-98"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Render Conversation Messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} space-y-1`}
              >
                {msg.role === "user" ? (
                  <div className="px-3.5 py-2.5 rounded-2xl rounded-br-xs bg-indigo-600 text-white text-xs font-medium max-w-[85%] shadow-xs leading-relaxed">
                    {msg.content}
                  </div>
                ) : (
                  <div className="space-y-2 max-w-[92%]">
                    {/* Assistant Chat Bubble */}
                    <div className="px-4 py-3 rounded-2xl rounded-tl-xs bg-white dark:bg-[#1c192b] text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 text-xs leading-relaxed shadow-xs whitespace-pre-line space-y-1.5">
                      {msg.content}

                      {/* Source Indicator if derived from RAG */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1 text-[10px] text-slate-400">
                          <span className="material-symbols-outlined text-[13px] text-indigo-500">menu_book</span>
                          <span className="truncate">Based on {msg.sources[0].title}</span>
                        </div>
                      )}
                    </div>

                    {/* Interactive Action Chips */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {msg.actions.map((act, actIdx) => (
                          <button
                            key={actIdx}
                            type="button"
                            onClick={() => handleActionClick(act.route)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                          >
                            <span>{act.label}</span>
                            <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Thinking / Loading Indicator */}
            {loading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-white dark:bg-[#1c192b] border border-slate-200/80 dark:border-slate-800 self-start shadow-xs animate-in fade-in">
                <span className="material-symbols-outlined text-indigo-600 text-[18px] animate-spin">
                  sync
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Career Compass Assistant is thinking...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white dark:bg-[#151320] border-t border-slate-100 dark:border-slate-800 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask Career Compass..."
                  disabled={loading}
                  className="w-full pl-3.5 pr-3 py-2.5 bg-slate-50 dark:bg-[#1c192b] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-60 font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim() || loading}
                className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </form>
            <div className="text-center mt-1.5">
              <span className="text-[9.5px] text-slate-400">
                AI guide powered by Career Compass intelligence.
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CareerCompassAssistant;
