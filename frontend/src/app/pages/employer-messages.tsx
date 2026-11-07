import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import {
  MessageSquare,
  Search,
  Send,
  User,
  Clock,
  Briefcase,
  AlertCircle,
  RefreshCw,
  FileText,
  ExternalLink,
  CheckCheck,
  Sparkles,
  Inbox
} from "lucide-react";
import { useAuth } from "../context/auth-context";

interface MessageItem {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  recipient: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  content: string;
  read: boolean;
  createdAt: string;
  job?: {
    _id: string;
    title: string;
  };
}

interface ConversationItem {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  role?: string;
  jobTitle?: string;
  jobId?: string;
  applicationId?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: MessageItem[];
}

export function EmployerMessages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const targetCandidateId = searchParams.get("candidateId");

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async (autoSelectId?: string | null) => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");

    try {
      const res = await axios.get("http://localhost:5000/api/employer/messages", {
        headers: { "x-auth-token": token || "" },
      });

      const convList: ConversationItem[] = res.data?.conversations || [];
      setConversations(convList);

      if (convList.length > 0) {
        if (autoSelectId) {
          const matched = convList.find((c) => c.candidateId === autoSelectId);
          setSelectedConversation(matched || convList[0]);
        } else if (!selectedConversation) {
          setSelectedConversation(convList[0]);
        } else {
          // Refresh existing selected conversation
          const updated = convList.find((c) => c.candidateId === selectedConversation.candidateId);
          if (updated) setSelectedConversation(updated);
        }
      }
    } catch (err: any) {
      console.error("Failed to load recruiter messages:", err);
      setError(err?.response?.data?.message || "Failed to load candidate conversations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(targetCandidateId);
  }, [targetCandidateId]);

  useEffect(() => {
    // Scroll to bottom when conversation messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !messageInput.trim() || sending) return;

    const content = messageInput.trim();
    setSending(true);
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/employer/messages",
        {
          recipientId: selectedConversation.candidateId,
          jobId: selectedConversation.jobId || null,
          applicationId: selectedConversation.applicationId || null,
          content,
        },
        { headers: { "x-auth-token": token || "" } }
      );

      const newMsg = res.data?.message;
      if (newMsg) {
        // Append locally
        const updatedMessages = [...(selectedConversation.messages || []), newMsg];
        const updatedConv: ConversationItem = {
          ...selectedConversation,
          lastMessage: content,
          lastMessageAt: new Date().toISOString(),
          messages: updatedMessages,
        };

        setSelectedConversation(updatedConv);
        setConversations((prev) =>
          prev.map((c) => (c.candidateId === selectedConversation.candidateId ? updatedConv : c))
        );
      }

      setMessageInput("");
    } catch (err: any) {
      console.error("Failed to send message:", err);
      alert(err?.response?.data?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.candidateName.toLowerCase().includes(q) ||
      c.candidateEmail.toLowerCase().includes(q) ||
      (c.jobTitle && c.jobTitle.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Candidate Messages</h1>
          </div>
          <p className="text-sm text-slate-500">
            Communicate directly with candidates regarding job postings, interview rounds, and offers.
          </p>
        </div>

        <button
          onClick={() => fetchMessages(selectedConversation?.candidateId)}
          className="p-2.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-all cursor-pointer self-start sm:self-auto"
          title="Refresh Messages"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-600" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="h-[520px] bg-white rounded-3xl border border-slate-200 p-8 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="text-sm font-bold text-slate-600">Loading candidate conversations...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-white rounded-3xl border border-rose-200 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">Failed to load conversations</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => fetchMessages(targetCandidateId)}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[640px]">
          {/* Left Column: Conversation List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
            {/* Search filter */}
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search candidates or roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">No conversations yet</p>
                  <p className="text-[11px] text-slate-400">
                    Messages with candidates who apply to your job postings will appear here.
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = selectedConversation?.candidateId === conv.candidateId;
                  const initials = conv.candidateName
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  return (
                    <div
                      key={conv.candidateId}
                      onClick={() => setSelectedConversation(conv)}
                      className={`p-4 transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? "bg-purple-50/70 border-l-4 border-purple-600"
                          : "hover:bg-slate-50/80"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {initials}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {conv.candidateName}
                          </h4>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {conv.lastMessageAt
                              ? new Date(conv.lastMessageAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })
                              : ""}
                          </span>
                        </div>

                        {conv.jobTitle && (
                          <span className="inline-block text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-md mb-1 truncate max-w-full">
                            {conv.jobTitle}
                          </span>
                        )}

                        <p className="text-[11px] text-slate-500 truncate">{conv.lastMessage || "No messages yet"}</p>
                      </div>

                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-xs">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Active Thread Stream */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
            {selectedConversation ? (
              <>
                {/* Active Chat Header */}
                <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      {selectedConversation.candidateName
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {selectedConversation.candidateName}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {selectedConversation.jobTitle ? (
                          <span>Applied for: <strong>{selectedConversation.jobTitle}</strong></span>
                        ) : (
                          selectedConversation.candidateEmail
                        )}
                      </p>
                    </div>
                  </div>

                  {selectedConversation.applicationId && (
                    <Link
                      to="/employer/applicants"
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 shadow-2xs"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                      View Application
                    </Link>
                  )}
                </div>

                {/* Message Bubble Stream */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
                  {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                    selectedConversation.messages.map((msg) => {
                      const isMe =
                        msg.sender?._id === user?._id ||
                        msg.sender?.role === "employer" ||
                        msg.sender?.role === "recruiter";

                      return (
                        <div
                          key={msg._id}
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                              isMe
                                ? "bg-purple-600 text-white rounded-br-xs"
                                : "bg-white text-slate-900 border border-slate-200 rounded-bl-xs"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {isMe && <CheckCheck className="w-3 h-3 text-purple-600" />}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
                      <Sparkles className="w-8 h-8 text-purple-400" />
                      <p className="text-xs font-bold text-slate-700">Start the conversation</p>
                      <p className="text-[11px] text-slate-400 max-w-xs">
                        Reach out to discuss job requirements, schedule an interview, or request further information.
                      </p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Box */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 border-t border-slate-100 bg-white flex items-center gap-2"
                >
                  <input
                    type="text"
                    required
                    placeholder="Type your message to candidate..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  />
                  <button
                    type="submit"
                    disabled={sending || !messageInput.trim()}
                    className="p-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl shadow-md shadow-purple-600/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {sending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <MessageSquare className="w-12 h-12 text-slate-300" />
                <h3 className="text-base font-bold text-slate-700">Select a Candidate Conversation</h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  Choose a candidate from the left list to view your interaction history and send direct messages.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployerMessages;
