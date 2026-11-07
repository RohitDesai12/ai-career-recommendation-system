import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/auth-context";
import axios from "axios";
import {
  Bell,
  CheckCircle2,
  Briefcase,
  FileText,
  Map,
  BookOpen,
  Mic,
  Clock,
  Trash2,
  RefreshCw,
  Filter,
  Check,
  ArrowUpRight
} from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: "job" | "application" | "resume" | "roadmap" | "course" | "interview" | "system";
  time: string;
  read: boolean;
  link?: string;
}

export function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "job" | "application" | "learning">("all");

  useEffect(() => {
    async function loadNotifications() {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = token ? { "x-auth-token": token } : undefined;

      try {
        const res = await axios.get("http://localhost:5000/api/profile/notifications", { headers });
        if (res.data?.notifications) {
          setNotifications(res.data.notifications);
        }
      } catch (err) {
        console.warn("Could not load notifications:", err);
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, [user]);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleToggleRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return "Recently";
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / (1000 * 60));
      if (mins < 1) return "Just now";
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return "Recently";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "job":
        return <Briefcase className="w-4 h-4 text-blue-600" />;
      case "application":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "resume":
        return <FileText className="w-4 h-4 text-amber-600" />;
      case "roadmap":
        return <Map className="w-4 h-4 text-purple-600" />;
      case "course":
        return <BookOpen className="w-4 h-4 text-indigo-600" />;
      case "interview":
        return <Mic className="w-4 h-4 text-rose-600" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-600" />;
    }
  };

  // Filter
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "job") return n.category === "job";
    if (activeTab === "application") return n.category === "application";
    if (activeTab === "learning") return n.category === "course" || n.category === "roadmap" || n.category === "resume" || n.category === "interview";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Checking notifications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider border border-indigo-200/60">
              Notification Center
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-200">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications & Alerts</h1>
          <p className="text-xs text-slate-500">
            Real-time tracking of application status, job postings, roadmap milestones, and ATS health.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {notifications.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Mark all as read
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-1"
                title="Clear all notifications"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        {[
          { id: "all", label: `All (${notifications.length})` },
          { id: "job", label: "Job Alerts" },
          { id: "application", label: "Applications" },
          { id: "learning", label: "Roadmap & Skills" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                handleToggleRead(item.id);
                if (item.link) navigate(item.link);
              }}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                item.read
                  ? "bg-white border-slate-200/70 hover:border-slate-300"
                  : "bg-indigo-50/40 border-indigo-200/80 shadow-xs"
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex-shrink-0 mt-0.5">
                {getCategoryIcon(item.category)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-xs font-bold truncate ${item.read ? "text-slate-800" : "text-slate-900 font-extrabold"}`}>
                    {item.title}
                  </h4>
                  <span className="text-[10.5px] text-slate-400 whitespace-nowrap flex-shrink-0">
                    {formatTimeAgo(item.time)}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">{item.message}</p>
              </div>

              {!item.read && (
                <div className="w-2 h-2 rounded-full bg-indigo-600 mt-2 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No new notifications</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When new job opportunities match your preferences or application status updates occur, alerts will appear right here.
          </p>
          <div className="pt-2">
            <Link
              to="/jobs"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 transition-all"
            >
              Explore Live Jobs <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
export default NotificationsPage;
