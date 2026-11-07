import React from "react";
import { Link, useLocation } from "react-router";
import { useSidebar } from "../context/sidebar-context";

interface AdminSidebarProps {
  pendingReportsCount?: number;
}

interface NavItem {
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function AdminSidebar({ pendingReportsCount = 0 }: AdminSidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { isCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();

  const adminSections: NavSection[] = [
    {
      title: "Dashboard",
      items: [
        { label: "Dashboard", icon: "dashboard", path: "/admin/dashboard" },
      ],
    },
    {
      title: "User Management",
      items: [
        { label: "Manage Users", icon: "group", path: "/admin/users" },
      ],
    },
    {
      title: "Applications & Alerts",
      items: [
        { label: "Applications", icon: "description", path: "/admin/applications" },
        { label: "Job Alerts", icon: "notifications", path: "/admin/job-alerts" },
      ],
    },
    {
      title: "Job Data Management",
      items: [
        { label: "Job Sources & Ingestion", icon: "cloud_sync", path: "/admin/job-sources" },
      ],
    },
    {
      title: "AI & Content",
      items: [
        { label: "Content Management", icon: "menu_book", path: "/admin/content" },
        { label: "Reports & Analytics", icon: "bar_chart", path: "/admin/analytics" },
        { label: "AI Models / Telemetry", icon: "psychology", path: "/admin/ai-models" },
      ],
    },
    {
      title: "Operations & System",
      items: [
        { label: "Moderation & Reports", icon: "flag", path: "/admin/moderation", badge: pendingReportsCount > 0 ? pendingReportsCount : undefined },
        { label: "Privacy & Support", icon: "security", path: "/admin/privacy-requests" },
        { label: "Audit Logs", icon: "history", path: "/admin/audit-logs" },
        { label: "System Management", icon: "dns", path: "/admin/system" },
        { label: "Settings", icon: "settings", path: "/admin/settings" },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Admin Sidebar Element */}
      <aside
        className={`bg-[#111827] text-[#9CA3AF] flex flex-col justify-between shrink-0 border-r border-[#1F2937] select-none h-screen sticky top-0 font-sans z-40 transition-all duration-200 ease-in-out ${
          isCollapsed ? "w-[72px]" : "w-64"
        } ${
          isMobileOpen
            ? "fixed inset-y-0 left-0 translate-x-0 w-64 shadow-2xl"
            : "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:-translate-x-full max-lg:w-64"
        }`}
      >
        {/* Brand Header & Nav */}
        <div className="flex flex-col min-h-0 flex-1">
          {/* Brand Header */}
          <div className={`h-16 border-b border-[#1F2937] flex items-center shrink-0 ${isCollapsed ? "justify-center px-0" : "px-5"}`}>
            <Link
              to="/admin/dashboard"
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 group ${isCollapsed ? "justify-center" : ""}`}
              title="Admin Panel"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
                <span className="material-symbols-outlined text-[20px]">explore</span>
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-[16px] font-black text-white font-heading tracking-tight leading-tight truncate">
                    Career Compass
                  </span>
                  <span className="text-[10px] font-semibold text-indigo-400 tracking-wider uppercase truncate">
                    Admin Panel
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation Items (Zero Visible Scrollbar, Scrollable) */}
          <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto min-h-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {adminSections.map((section, sIdx) => (
              <div key={section.title} className="flex flex-col">
                {!isCollapsed && (
                  <div className={`text-[10.5px] font-bold text-[#6B7280] uppercase tracking-[0.08em] px-3 ${sIdx === 0 ? "pt-1 pb-1" : "pt-3 pb-1"}`}>
                    {section.title}
                  </div>
                )}
                <div className="flex flex-col gap-0.5">
                  {section.items.map((item) => {
                    const isActive =
                      currentPath === item.path ||
                      (item.path === "/admin/dashboard" && currentPath === "/admin");

                    return (
                      <div key={item.path} className="relative group/tooltip">
                        <Link
                          to={item.path}
                          onClick={() => setIsMobileOpen(false)}
                          className={`flex items-center ${isCollapsed ? "justify-center px-0 h-10 w-10 mx-auto" : "justify-between px-3.5 py-2.5"} rounded-xl text-xs font-semibold transition-all group ${
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

                          {!isCollapsed && item.badge !== undefined && (
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>

                        {/* Floating Tooltip in Collapsed Mode */}
                        {isCollapsed && (
                          <div className="hidden group-hover/tooltip:block absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-slate-800">
                            {item.label} {item.badge !== undefined ? `(${item.badge})` : ""}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Support Banner */}
        <div className="p-2.5 border-t border-[#1F2937] shrink-0">
          {!isCollapsed ? (
            <div className="p-3 rounded-2xl bg-[#182234] border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[16px]">headset_mic</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-tight">Need Help?</div>
                  <div className="text-[10px] text-slate-400">Platform operations team</div>
                </div>
              </div>
              <Link
                to="/admin/system"
                onClick={() => setIsMobileOpen(false)}
                className="w-full py-1.5 px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white text-center text-xs font-semibold block transition-colors border border-slate-700/60"
              >
                Check System Status
              </Link>
            </div>
          ) : (
            <div className="relative group/tooltip flex justify-center">
              <Link
                to="/admin/system"
                onClick={() => setIsMobileOpen(false)}
                className="w-10 h-10 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-indigo-400 flex items-center justify-center border border-slate-700/60"
                title="System Status"
              >
                <span className="material-symbols-outlined text-[19px]">dns</span>
              </Link>
              <div className="hidden group-hover/tooltip:block absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-slate-800">
                System Status
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
