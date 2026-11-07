import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import axios from "axios";
import { useAuth } from "../context/auth-context";
import { useSidebar } from "../context/sidebar-context";

export function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isCollapsed, isMobileOpen, setIsMobileOpen, openSection, toggleSection } = useSidebar();

  const [applicationsCount, setApplicationsCount] = useState<number>(0);

  // Resume Studio Sub-Links
  const resumeStudioItems = [
    { path: "/resume-studio", label: "Overview", icon: "dashboard_customize" },
    { path: "/resume-studio/create", label: "Create Hub", icon: "add_circle" },
    { path: "/resume-studio/templates", label: "Templates", icon: "grid_view" },
    { path: "/resume-studio/builder", label: "Resume Builder", icon: "edit_document" },
    { path: "/resume", label: "Resume Analyzer", icon: "document_scanner" },
    { path: "/resume-studio/tailor", label: "Tailor for Job", icon: "tune" },
    { path: "/resume-studio/cover-letter", label: "Cover Letter", icon: "mail" },
    { path: "/resume-studio/my-resumes", label: "My Resumes", icon: "folder" },
    { path: "/resume-studio/settings", label: "Studio Settings", icon: "settings" },
    { path: "/resume-studio/score-history", label: "Score History", icon: "history" },
  ];

  // Roadmap Sub-Links
  const roadmapItems = [
    { path: "/roadmap", label: "Overview", icon: "dashboard_customize", activeCheck: (p: string) => p === "/roadmap" || p === "/roadmap/overview" },
    { path: "/roadmap/roadmaps", label: "Roadmaps", icon: "layers", activeCheck: (p: string) => p === "/roadmap/roadmaps" },
    { path: "/roadmap/history", label: "History", icon: "history", activeCheck: (p: string) => p === "/roadmap/history" },
  ];

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      axios
        .get("http://localhost:5000/api/jobs/applications", { headers })
        .then((res) => {
          if (res.data?.applications) {
            setApplicationsCount(res.data.applications.length);
          }
        })
        .catch(() => {
          // Fallback to legacy endpoint if needed
          axios
            .get("http://localhost:5000/api/employer/my-applications", { headers })
            .then((res) => {
              if (res.data?.applications) {
                setApplicationsCount(res.data.applications.length);
              }
            })
            .catch(() => {});
        });
    }
  }, [user, location.pathname]);

  const isResumePath = location.pathname.startsWith("/resume");
  const isRoadmapPath = location.pathname.startsWith("/roadmap");

  const isRoadmapOpen = openSection === "roadmap";
  const isResumeStudioOpen = openSection === "resume-studio";

  const getItemClass = (isActive: boolean) =>
    `flex items-center ${isCollapsed ? "justify-center px-0 h-10 w-10 mx-auto" : "justify-between px-3.5 py-2.5"} rounded-xl transition-all duration-150 text-xs font-semibold group ${
      isActive
        ? "bg-[#1F315C] text-white font-bold shadow-none"
        : "text-[#9CA3AF] hover:text-white hover:bg-white/[0.06]"
    }`;

  const getSubItemClass = (isActive: boolean) =>
    `flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11.5px] font-medium transition-colors ${
      isActive
        ? "bg-[#1F315C] text-white font-bold shadow-none"
        : "text-[#9CA3AF] hover:text-white hover:bg-white/[0.06]"
    }`;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`bg-[#111827] text-[#9CA3AF] flex flex-col border-r border-[#1F2937] h-screen sticky top-0 z-40 font-sans shrink-0 select-none transition-all duration-200 ease-in-out ${
          isCollapsed ? "w-[72px]" : "w-64"
        } ${
          isMobileOpen
            ? "fixed inset-y-0 left-0 translate-x-0 w-64 shadow-2xl"
            : "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:-translate-x-full max-lg:w-64"
        }`}
      >
        {/* Brand Header */}
        <div className={`h-16 border-b border-[#1F2937] flex items-center shrink-0 ${isCollapsed ? "justify-center px-0" : "px-5"}`}>
          <Link
            to="/dashboard"
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-3 group ${isCollapsed ? "justify-center" : ""}`}
            title="Career Compass Dashboard"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform shrink-0">
              <span className="material-symbols-outlined text-[20px]">explore</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-heading text-[16px] font-black text-white leading-tight truncate">Career Compass</span>
                <span className="text-[10px] text-[#9CA3AF] font-semibold tracking-tight truncate">Your Career, Our Direction</span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Scroll Container (Zero Visible Scrollbar, 100% Scrollable) */}
        <nav className="flex-1 px-2.5 py-3 flex flex-col gap-1 overflow-y-auto min-h-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          
          {/* Section: DASHBOARD */}
          {!isCollapsed && (
            <div className="text-[10.5px] font-bold text-[#6B7280] uppercase tracking-[0.08em] px-3 pt-2 pb-1">
              Dashboard
            </div>
          )}
          <div className="relative group/tooltip">
            <Link
              to="/dashboard"
              onClick={() => setIsMobileOpen(false)}
              className={getItemClass(location.pathname === "/dashboard")}
            >
              <div className="flex items-center gap-2.5">
                <span className={`material-symbols-outlined text-[19px] shrink-0 ${location.pathname === "/dashboard" ? "text-white" : "text-[#9CA3AF] group-hover:text-white"}`}>
                  grid_view
                </span>
                {!isCollapsed && <span>Dashboard</span>}
              </div>
            </Link>
            {isCollapsed && (
              <div className="hidden group-hover/tooltip:block absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-slate-800">
                Dashboard
              </div>
            )}
          </div>

          {/* Section: CAREER DISCOVERY */}
          {!isCollapsed && (
            <div className="text-[10.5px] font-bold text-[#6B7280] uppercase tracking-[0.08em] px-3 pt-3 pb-1">
              Career Discovery
            </div>
          )}
          <div className="relative group/tooltip">
            <Link
              to="/assessment"
              onClick={() => setIsMobileOpen(false)}
              className={getItemClass(location.pathname === "/assessment")}
            >
              <div className="flex items-center gap-2.5">
                <span className={`material-symbols-outlined text-[19px] shrink-0 ${location.pathname === "/assessment" ? "text-white" : "text-[#9CA3AF] group-hover:text-white"}`}>
                  bolt
                </span>
                {!isCollapsed && <span>Career Test</span>}
              </div>
            </Link>
            {isCollapsed && (
              <div className="hidden group-hover/tooltip:block absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-slate-800">
                Career Test
              </div>
            )}
          </div>

          {/* EXPANDABLE ROADMAP GROUP (Starts CLOSED on page load) */}
          <div className="relative group/tooltip">
            <div
              onClick={() => {
                if (isCollapsed) {
                  navigate("/roadmap");
                  setIsMobileOpen(false);
                } else {
                  toggleSection("roadmap");
                }
              }}
              className={`flex items-center ${isCollapsed ? "justify-center px-0 h-10 w-10 mx-auto" : "justify-between px-3.5 py-2.5"} rounded-xl transition-all duration-150 text-xs font-semibold cursor-pointer select-none group ${
                isRoadmapPath
                  ? "bg-[#1F315C] text-white font-bold"
                  : "text-[#9CA3AF] hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`material-symbols-outlined text-[19px] shrink-0 ${isRoadmapPath ? "text-white" : "text-[#9CA3AF] group-hover:text-white"}`}>
                  map
                </span>
                {!isCollapsed && <span>Roadmap</span>}
              </div>
              {!isCollapsed && (
                <span
                  className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${
                    isRoadmapOpen ? "rotate-180" : ""
                  } ${isRoadmapPath ? "text-white" : "text-[#9CA3AF] group-hover:text-white"}`}
                >
                  expand_more
                </span>
              )}
            </div>
            {isCollapsed && (
              <div className="hidden group-hover/tooltip:block absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-slate-800">
                Roadmap
              </div>
            )}

            {/* Submenu: Overview, Roadmaps, History */}
            {!isCollapsed && isRoadmapOpen && (
              <div className="mt-1 ml-3 pl-3 border-l-2 border-slate-700/60 space-y-0.5 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                {roadmapItems.map((item) => {
                  const isActive = item.activeCheck(location.pathname);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={getSubItemClass(isActive)}
                    >
                      <span className="material-symbols-outlined text-[16px] shrink-0">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: LEARNING */}
          {!isCollapsed && (
            <div className="text-[10.5px] font-bold text-[#6B7280] uppercase tracking-[0.08em] px-3 pt-3 pb-1">
              Learning
            </div>
          )}
          <div className="relative group/tooltip">
            <Link
              to="/courses"
              onClick={() => setIsMobileOpen(false)}
              className={getItemClass(location.pathname === "/courses")}
            >
              <div className="flex items-center gap-2.5">
                <span className={`material-symbols-outlined text-[19px] shrink-0 ${location.pathname === "/courses" ? "text-white" : "text-[#9CA3AF] group-hover:text-white"}`}>
                  school
                </span>
                {!isCollapsed && <span>Courses</span>}
              </div>
            </Link>
            {isCollapsed && (
              <div className="hidden group-hover/tooltip:block absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-slate-800">
                Courses
              </div>
            )}
          </div>

          {/* Section: RESUME STUDIO */}
          {!isCollapsed && (
            <div className="text-[10.5px] font-bold text-[#6B7280] uppercase tracking-[0.08em] px-3 pt-3 pb-1">
              Resume Studio
            </div>
          )}
          <div className="relative group/tooltip">
            <div
              onClick={() => {
                if (isCollapsed) {
                  navigate("/resume-studio");
                  setIsMobileOpen(false);
                } else {
                  toggleSection("resume-studio");
                }
              }}
              className={`flex items-center ${isCollapsed ? "justify-center px-0 h-10 w-10 mx-auto" : "justify-between px-3.5 py-2.5"} rounded-xl transition-all duration-150 text-xs font-semibold cursor-pointer select-none group ${
                isResumePath
                  ? "bg-[#1F315C] text-white font-bold"
                  : "text-[#9CA3AF] hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`material-symbols-outlined text-[19px] shrink-0 ${isResumePath ? "text-white" : "text-[#9CA3AF] group-hover:text-white"}`}>
                  badge
                </span>
                {!isCollapsed && <span>Resume Studio</span>}
              </div>
              {!isCollapsed && (
                <span
                  className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${
                    isResumeStudioOpen ? "rotate-180" : ""
                  } ${isResumePath ? "text-white" : "text-[#9CA3AF] group-hover:text-white"}`}
                >
                  expand_more
                </span>
              )}
            </div>
            {isCollapsed && (
              <div className="hidden group-hover/tooltip:block absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-slate-800">
                Resume Studio
              </div>
            )}

            {/* Sub-Items Accordion */}
            {!isCollapsed && isResumeStudioOpen && (
              <div className="mt-1 ml-3 pl-3 border-l-2 border-slate-700/60 space-y-0.5 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                {resumeStudioItems.map((item) => {
                  const isSubActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={getSubItemClass(isSubActive)}
                    >
                      <span className="material-symbols-outlined text-[15px] shrink-0">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: PRACTICE & COACHING */}
          {!isCollapsed && (
            <div className="text-[10.5px] font-bold text-[#6B7280] uppercase tracking-[0.08em] px-3 pt-3 pb-1">
              Practice & Coaching
            </div>
          )}
          <div className="relative group/tooltip">
            <Link
              to="/interview-prep"
              onClick={() => setIsMobileOpen(false)}
              className={getItemClass(location.pathname === "/interview-prep")}
            >
              <div className="flex items-center gap-2.5">
                <span className={`material-symbols-outlined text-[19px] shrink-0 ${location.pathname === "/interview-prep" ? "text-white" : "text-[#9CA3AF] group-hover:text-white"}`}>
                  menu_book
                </span>
                {!isCollapsed && <span>Interview Prep</span>}
              </div>
            </Link>
            {isCollapsed && (
              <div className="hidden group-hover/tooltip:block absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-slate-800">
                Interview Prep
              </div>
            )}
          </div>

          <div className="relative group/tooltip">
            <Link
              to="/mock-interview"
              onClick={() => setIsMobileOpen(false)}
              className={getItemClass(location.pathname === "/mock-interview")}
            >
              <div className="flex items-center gap-2.5">
                <span className={`material-symbols-outlined text-[19px] shrink-0 ${location.pathname === "/mock-interview" ? "text-white" : "text-[#9CA3AF] group-hover:text-white"}`}>
                  mic
                </span>
                {!isCollapsed && <span>Mock Interview</span>}
              </div>
            </Link>
            {isCollapsed && (
              <div className="hidden group-hover/tooltip:block absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-slate-800">
                Mock Interview
              </div>
            )}
          </div>

          {/* Section: JOBS */}
          {!isCollapsed && (
            <div className="text-[10.5px] font-bold text-[#6B7280] uppercase tracking-[0.08em] px-3 pt-3 pb-1">
              Jobs
            </div>
          )}
          <div className="relative group/tooltip">
            <div
              onClick={() => {
                if (isCollapsed) {
                  navigate("/jobs");
                  setIsMobileOpen(false);
                } else {
                  toggleSection("jobs");
                }
              }}
              className={`flex items-center ${isCollapsed ? "justify-center px-0 h-10 w-10 mx-auto" : "justify-between px-3.5 py-2.5"} rounded-xl transition-all duration-150 text-xs font-semibold cursor-pointer select-none group ${
                location.pathname.startsWith("/jobs")
                  ? "bg-[#1F315C] text-white font-bold"
                  : "text-[#9CA3AF] hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`material-symbols-outlined text-[19px] shrink-0 ${location.pathname.startsWith("/jobs") ? "text-white" : "text-[#9CA3AF] group-hover:text-white"}`}>
                  business_center
                </span>
                {!isCollapsed && <span>Jobs</span>}
              </div>
              {!isCollapsed && (
                <span
                  className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${
                    openSection === "jobs" || location.pathname.startsWith("/jobs") ? "rotate-180" : ""
                  } ${location.pathname.startsWith("/jobs") ? "text-white" : "text-[#9CA3AF] group-hover:text-white"}`}
                >
                  expand_more
                </span>
              )}
            </div>
            {isCollapsed && (
              <div className="hidden group-hover/tooltip:block absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-slate-800">
                Jobs
              </div>
            )}

            {/* Sub-Items Accordion */}
            {!isCollapsed && (openSection === "jobs" || location.pathname.startsWith("/jobs")) && (
              <div className="mt-1 ml-3 pl-3 border-l-2 border-slate-700/60 space-y-0.5 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                {[
                  {
                    path: "/jobs",
                    label: "Recommended Jobs",
                    icon: "recommend",
                    isActive: location.pathname === "/jobs" && (!location.search || location.search.includes("tab=recommended")),
                  },
                  {
                    path: "/jobs?tab=explore",
                    label: "Explore Jobs",
                    icon: "search",
                    isActive: location.pathname === "/jobs" && (location.search.includes("tab=explore") || location.search.includes("tab=all")),
                  },
                  {
                    path: "/jobs?tab=companies",
                    label: "Company Career Pages",
                    icon: "domain",
                    isActive: location.pathname === "/jobs" && location.search.includes("tab=companies"),
                  },
                  {
                    path: "/jobs?tab=saved",
                    label: "Saved Jobs",
                    icon: "bookmark",
                    isActive: location.pathname === "/jobs" && location.search.includes("tab=saved"),
                  },
                  {
                    path: "/jobs?tab=applied",
                    label: "Applied Jobs",
                    icon: "assignment",
                    badge: applicationsCount,
                    isActive: location.pathname === "/jobs" && (location.search.includes("tab=applied") || location.search.includes("tab=applications")),
                  },
                  {
                    path: "/jobs?tab=alerts",
                    label: "Job Alerts",
                    icon: "notifications",
                    isActive: location.pathname === "/jobs" && location.search.includes("tab=alerts"),
                  },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={getSubItemClass(item.isActive)}
                  >
                    <span className="material-symbols-outlined text-[15px] shrink-0">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                    {item.badge && item.badge > 0 ? (
                      <span className="ml-auto px-1.5 py-0.2 rounded-full text-[9.5px] font-bold bg-indigo-500/20 text-indigo-300">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                ))}
              </div>
            )}
          </div>

        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
