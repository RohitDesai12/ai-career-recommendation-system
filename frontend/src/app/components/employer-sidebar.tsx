import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "../context/auth-context";
import { useSidebar } from "../context/sidebar-context";
import { getApiUrl } from "../config/api";

interface EmployerSidebarProps {
  onOpenSupportModal?: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: string;
  dynamicBadge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const EMPLOYER_SECTIONS: NavSection[] = [
  {
    title: "Dashboard",
    items: [
      { path: "/employer/dashboard", label: "Dashboard", icon: "dashboard" },
    ],
  },
  {
    title: "Recruitment",
    items: [
      { path: "/employer/post-job", label: "Post a Job", icon: "add_circle" },
      { path: "/employer/jobs", label: "Manage Jobs", icon: "work" },
      { path: "/employer/applicants", label: "Applicants", icon: "groups" },
    ],
  },
  {
    title: "AI & Intelligence",
    items: [
      { path: "/employer/recommendations", label: "AI Recommendations", icon: "auto_awesome" },
      { path: "/employer/analytics", label: "Analytics", icon: "monitoring" },
    ],
  },
  {
    title: "Organization",
    items: [
      { path: "/employer/profile", label: "Company Profile", icon: "apartment" },
      { path: "/employer/billing", label: "Billing & Plans", icon: "credit_card" },
      { path: "/employer/messages", label: "Messages", icon: "chat", dynamicBadge: "messages" },
      { path: "/employer/settings", label: "Settings", icon: "settings" },
    ],
  },
];

export function EmployerSidebar({ onOpenSupportModal }: EmployerSidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const { isCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(getApiUrl("/api/employer/messages"), {
          headers: { "x-auth-token": token },
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadMessagesCount(data.totalUnreadCount || 0);
        }
      } catch (err) {}
    };
    fetchUnread();
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Employer Sidebar Element */}
      <aside
        className={`bg-[#111827] text-[#9CA3AF] flex flex-col border-r border-[#1F2937] h-screen sticky top-0 z-40 font-sans select-none shrink-0 transition-all duration-200 ease-in-out ${
          isCollapsed ? "w-[72px]" : "w-64"
        } ${
          isMobileOpen
            ? "fixed inset-y-0 left-0 translate-x-0 w-64 shadow-2xl"
            : "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:-translate-x-full max-lg:w-64"
        }`}
      >
        {/* Brand Logo & Name */}
        <div className={`h-16 border-b border-[#1F2937] flex items-center shrink-0 ${isCollapsed ? "justify-center px-0" : "px-5"}`}>
          <Link
            to="/employer/dashboard"
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-3 group ${isCollapsed ? "justify-center" : ""}`}
            title="Recruiter Portal"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform shrink-0">
              <span className="material-symbols-outlined text-[20px]">explore</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-heading text-[16px] font-black tracking-tight text-white leading-tight truncate">Career Compass</span>
                <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider truncate">Recruiter Portal</span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Links with Section Headings (Zero Visible Scrollbar, Scrollable) */}
        <nav className="flex-1 px-2.5 py-3 flex flex-col gap-1 overflow-y-auto min-h-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {EMPLOYER_SECTIONS.map((section, sIdx) => (
            <div key={section.title} className="flex flex-col">
              {!isCollapsed && (
                <div className={`text-[10.5px] font-bold text-[#6B7280] uppercase tracking-[0.08em] px-3 ${sIdx === 0 ? "pt-1 pb-1" : "pt-3 pb-1"}`}>
                  {section.title}
                </div>
              )}
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path === "/employer/dashboard" && location.pathname === "/employer");

                  return (
                    <div key={item.path} className="relative group/tooltip">
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center ${isCollapsed ? "justify-center px-0 h-10 w-10 mx-auto" : "justify-between px-3.5 py-2.5"} rounded-xl transition-all duration-150 text-xs font-semibold group ${
                          isActive
                            ? "bg-[#1F315C] text-white font-bold shadow-none"
                            : "text-[#9CA3AF] hover:text-white hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2.5 min-w-0"}`}>
                          <span
                            className={`material-symbols-outlined text-[19px] shrink-0 transition-colors ${
                              isActive ? "text-white" : "text-[#9CA3AF] group-hover:text-white"
                            }`}
                          >
                            {item.icon}
                          </span>
                          {!isCollapsed && <span className="truncate">{item.label}</span>}
                        </div>

                        {!isCollapsed && item.dynamicBadge === "messages" && unreadMessagesCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                          </span>
                        )}
                      </Link>

                      {/* Floating Tooltip in Collapsed Mode */}
                      {isCollapsed && (
                        <div className="hidden group-hover/tooltip:block absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-slate-800">
                          {item.label} {item.dynamicBadge === "messages" && unreadMessagesCount > 0 ? `(${unreadMessagesCount})` : ""}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Need Help Support Card */}
        <div className="p-2.5 border-t border-[#1F2937] shrink-0">
          {!isCollapsed ? (
            <div className="p-3 rounded-2xl bg-[#182234] border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-400 text-[18px]">help</span>
                <span className="text-xs font-bold text-white">Need Support?</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Contact our dedicated recruiter operations team.
              </p>
              <button
                type="button"
                onClick={onOpenSupportModal}
                className="w-full py-1.5 px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white text-center text-xs font-semibold block transition-colors border border-slate-700/60 cursor-pointer"
              >
                Contact Support
              </button>
            </div>
          ) : (
            <div className="relative group/tooltip flex justify-center">
              <button
                type="button"
                onClick={onOpenSupportModal}
                className="w-10 h-10 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-indigo-400 flex items-center justify-center border border-slate-700/60 cursor-pointer"
                title="Support"
              >
                <span className="material-symbols-outlined text-[19px]">help</span>
              </button>
              <div className="hidden group-hover/tooltip:block absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-slate-800">
                Contact Support
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default EmployerSidebar;
