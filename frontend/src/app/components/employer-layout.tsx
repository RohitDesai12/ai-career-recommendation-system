import { useState, useRef, useEffect } from "react";
import { Outlet, Link, useNavigate, Navigate } from "react-router";
import axios from "axios";
import { EmployerSidebar } from "./employer-sidebar";
import { useAuth } from "../context/auth-context";
import { SidebarProvider, useSidebar } from "../context/sidebar-context";
import { motion, AnimatePresence } from "motion/react";

function EmployerLayoutInner() {
  const { user, isAuthenticated, logout } = useAuth();
  const { toggleCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Guard: Admins & Students cannot access the employer portal
  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (user && user.role !== "employer" && user.role !== "recruiter") {
    return <Navigate to="/dashboard" replace />;
  }
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSent, setSupportSent] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const [companyInfo, setCompanyInfo] = useState<{
    companyName: string;
    contactPerson: string;
    hasProfile: boolean;
  }>(() => {
    try {
      const stored = localStorage.getItem("employer");
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          companyName: parsed.companyName || "",
          contactPerson: parsed.contactPerson || user?.name || "Recruiter",
          hasProfile: Boolean(parsed.companyName),
        };
      }
    } catch (e) {}
    return {
      companyName: "",
      contactPerson: user?.name || "Recruiter",
      hasProfile: false,
    };
  });

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      setLoadingNotifications(true);
      const res = await axios.get("http://localhost:5000/api/employer/notifications", {
        headers: { "x-auth-token": token },
      });
      if (res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadNotificationCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.warn("Could not fetch recruiter notifications:", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await axios.put(
        "http://localhost:5000/api/employer/notifications/read",
        { all: true },
        { headers: { "x-auth-token": token } }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadNotificationCount(0);
    } catch (err) {
      console.warn("Could not mark notifications read:", err);
    }
  };

  const handleMarkSingleNotificationRead = async (id: string, link?: string) => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await axios.put(
          "http://localhost:5000/api/employer/notifications/read",
          { notificationId: id },
          { headers: { "x-auth-token": token } }
        );
      } catch (err) {}
    }
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    setUnreadNotificationCount((prev) => Math.max(0, prev - 1));
    setIsNotificationsOpen(false);
    if (link) {
      navigate(link);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await axios.get("http://localhost:5000/api/employer/profile", {
          headers: { "x-auth-token": token },
        });
        if (res.data?.employer) {
          const emp = res.data.employer;
          setCompanyInfo({
            companyName: emp.companyName || "",
            contactPerson: emp.contactPerson || user?.name || "Recruiter",
            hasProfile: Boolean(emp.companyName),
          });
          localStorage.setItem("employer", JSON.stringify(emp));
        }
      } catch (err) {
        // Keep current state
      }
    };
    fetchProfile();
    fetchNotifications();
  }, [user]);

  const companyDisplayName = companyInfo.hasProfile && companyInfo.companyName
    ? companyInfo.companyName
    : "Complete your company profile";

  const contactName = companyInfo.contactPerson || user?.name || "Recruiter";
  const initials = companyInfo.hasProfile && companyInfo.companyName
    ? companyInfo.companyName
        .split(" ")
        .map((w: string) => w[0])
        .filter(Boolean)
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : contactName
        .split(" ")
        .map((w: string) => w[0])
        .filter(Boolean)
        .join("")
        .slice(0, 2)
        .toUpperCase() || "RC";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    setSupportSent(true);
    setTimeout(() => {
      setSupportSent(false);
      setIsSupportOpen(false);
      setSupportMessage("");
    }, 1800);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Employer Sidebar */}
      <EmployerSidebar onOpenSupportModal={() => setIsSupportOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header */}
        <header className="h-14 px-4 sm:px-6 lg:px-8 bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth >= 1024) {
                  toggleCollapsed();
                } else {
                  setIsMobileOpen(!isMobileOpen);
                }
              }}
              className="p-1.5 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center shrink-0"
              title="Toggle sidebar navigation"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">
              Talent Management & Hiring Suite
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => {
                  setIsNotificationsOpen((prev) => !prev);
                  if (!isNotificationsOpen) fetchNotifications();
                }}
                className="relative w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200/70 border border-slate-200 flex items-center justify-center text-slate-600 transition-all cursor-pointer"
                title="Notifications"
              >
                <span className="material-symbols-outlined text-[18px]">notifications</span>
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-xs">
                    {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Notifications Popover */}
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl p-4 shadow-2xl border border-slate-200 z-50 flex flex-col"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">Notifications</span>
                        {unreadNotificationCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700">
                            {unreadNotificationCount} unread
                          </span>
                        )}
                      </div>
                      {unreadNotificationCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllNotificationsRead}
                          className="text-[11px] font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 space-y-1">
                      {loadingNotifications ? (
                        <div className="py-8 text-center text-xs text-slate-400 font-semibold">
                          Loading alerts...
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="py-8 text-center space-y-1">
                          <span className="material-symbols-outlined text-slate-300 text-[28px]">done_all</span>
                          <p className="text-xs font-bold text-slate-700">You're all caught up.</p>
                          <p className="text-[10px] text-slate-400">No new alerts at this time.</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => handleMarkSingleNotificationRead(notif._id, notif.link)}
                            className={`p-2.5 rounded-2xl transition-all cursor-pointer flex items-start gap-3 ${
                              notif.read ? "hover:bg-slate-50 opacity-75" : "bg-purple-50/40 hover:bg-purple-50/70"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="material-symbols-outlined text-[16px]">
                                {notif.type === "new_application"
                                  ? "person_add"
                                  : notif.type === "message"
                                  ? "chat"
                                  : notif.type === "interview"
                                  ? "event"
                                  : notif.type === "job_status"
                                  ? "work"
                                  : "notifications"}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h5 className="text-xs font-bold text-slate-900 truncate">{notif.title}</h5>
                                {!notif.read && (
                                  <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-2">
                                {notif.message}
                              </p>
                              <span className="text-[9.5px] text-slate-400 font-medium mt-1 block">
                                {new Date(notif.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Pill */}
            <div className="relative" ref={profileRef}>
              <div
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex items-center gap-2.5 p-1 pr-2.5 rounded-2xl bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200 transition-all cursor-pointer select-none"
              >
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-[11px] flex items-center justify-center shadow-xs">
                  {initials}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 leading-tight">{companyDisplayName}</span>
                  <span className="text-[10px] text-slate-500 font-medium">{contactName}</span>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-[16px]">
                  {isProfileOpen ? "expand_less" : "expand_more"}
                </span>
              </div>

              {/* Profile Popover */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl p-2 shadow-2xl border border-slate-200 z-50 flex flex-col gap-1"
                  >
                    <Link
                      to="/employer/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px] text-purple-600">apartment</span>
                      Company Profile
                    </Link>
                    <Link
                      to="/employer/billing"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px] text-indigo-600">credit_card</span>
                      Billing & Plans
                    </Link>
                    <Link
                      to="/employer/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px] text-slate-500">settings</span>
                      Settings
                    </Link>
                    <div className="h-[1px] bg-slate-200 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                        navigate("/login");
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all text-left w-full cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dynamic Nested Content with Fluid Padding */}
        <main className="flex-1 p-4 sm:p-5 lg:p-6 overflow-y-auto w-full min-w-0 max-w-full">
          <Outlet />
        </main>
      </div>

      {/* Support Modal */}
      <AnimatePresence>
        {isSupportOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">support_agent</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Recruiter Support</h3>
                    <p className="text-xs text-slate-500">We typically reply within 15 minutes</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSupportOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {supportSent ? (
                <div className="py-8 flex flex-col items-center justify-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[28px]">check</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Message Received!</h4>
                  <p className="text-xs text-slate-500">Our hiring specialist will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSendSupport} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">How can we assist you?</label>
                    <textarea
                      rows={4}
                      required
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      placeholder="Ask about candidate matchmaking, bulk hiring plans, job promotion, or custom ATS integration..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsSupportOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200/80 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 cursor-pointer"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function EmployerLayout() {
  return (
    <SidebarProvider>
      <EmployerLayoutInner />
    </SidebarProvider>
  );
}

export default EmployerLayout;
