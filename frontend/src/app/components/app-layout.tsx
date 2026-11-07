import React, { useState, useEffect, useRef } from "react";
import { Outlet, Navigate, Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "../context/auth-context";
import { useTheme } from "../context/theme-context";
import { SidebarProvider, useSidebar } from "../context/sidebar-context";
import { motion, AnimatePresence } from "motion/react";
import { Sidebar } from "./sidebar";
import { GlobalSearchBar } from "./global-search-bar";
import { CareerCompassAssistant } from "./career-compass-assistant";

const PAGE_TITLES: Record<string, { title: string; subtitle: string; icon: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Overview of your career progress and personalized roadmap", icon: "grid_view" },
  "/profile": { title: "My Profile", subtitle: "Manage your personal information, skills, and portfolio", icon: "person" },
  "/career-progress": { title: "Career Progress", subtitle: "Track readiness metrics, goals, and interview performance", icon: "trending_up" },
  "/career-preferences": { title: "Career Preferences", subtitle: "Tailor role, location, salary, and job alert filters", icon: "tune" },
  "/notifications": { title: "Notification Center", subtitle: "Live job alerts, application updates, and career milestones", icon: "notifications" },
  "/settings": { title: "Account Settings", subtitle: "Manage security, preferences, and privacy controls", icon: "settings" },
  "/assessment": { title: "Career Test", subtitle: "Discover career paths matching your personality and skills", icon: "bolt" },
  "/results": { title: "Career Recommendations", subtitle: "AI-matched roles and analysis tailored to you", icon: "analytics" },
  "/roadmap": { title: "Career Roadmap", subtitle: "Step-by-step milestone guide to reaching your dream role", icon: "map" },
  "/roadmap/roadmaps": { title: "My Roadmaps", subtitle: "Manage and track all your active and custom roadmaps", icon: "layers" },
  "/roadmap/history": { title: "Roadmap History", subtitle: "View your completed, paused, and archived roadmaps", icon: "history" },
  "/resume": { title: "Resume Analyser", subtitle: "Get actionable AI feedback to improve your ATS score", icon: "document_scanner" },
  "/resume-studio": { title: "Resume Studio", subtitle: "Comprehensive AI resume creator, optimizer, and career hub", icon: "badge" },
  "/resume-studio/create": { title: "Create Hub", subtitle: "Start a new resume from scratch, upload, or import profile", icon: "add_circle" },
  "/resume-studio/templates": { title: "Resume Templates", subtitle: "ATS-friendly modern and classic executive formats", icon: "grid_view" },
  "/resume-studio/builder": { title: "Resume Builder", subtitle: "Craft tailored bullet points and optimize section flow", icon: "edit_document" },
  "/resume-studio/tailor": { title: "Tailor for Job", subtitle: "Target your resume against specific job descriptions", icon: "tune" },
  "/resume-studio/cover-letter": { title: "Cover Letter Generator", subtitle: "Craft compelling personalized cover letters with AI", icon: "mail" },
  "/resume-studio/my-resumes": { title: "My Resumes", subtitle: "Manage and export all saved resume versions", icon: "folder" },
  "/resume-studio/settings": { title: "Studio Settings", subtitle: "Configure defaults, font styles, and export formatting", icon: "settings" },
  "/resume-studio/score-history": { title: "Score History", subtitle: "Track ATS scores and keyword matches over time", icon: "history" },
  "/mock-interview": { title: "AI Mock Interview", subtitle: "Interactive voice and technical panel interview practice", icon: "mic" },
  "/interview-prep": { title: "Interview Prep Guide", subtitle: "Company-wise question banks, DSA, System Design & HR rounds", icon: "menu_book" },
  "/saved-preps": { title: "Saved Interview Preps", subtitle: "Your bookmarked interview questions and prep notes", icon: "bookmark" },
  "/courses": { title: "Curated Courses", subtitle: "Recommended learning resources to boost your skills", icon: "school" },
  "/jobs": { title: "Explore Jobs", subtitle: "Discover verified openings matched with your profile & roadmap", icon: "business_center" }
};

function AppLayoutInner() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toggleCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const isJobsPage = location.pathname === "/jobs";
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("Bangalore, Karnataka");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Click outside listeners
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Guard: Admins are directed to Admin Portal
  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() || locationQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery)}&loc=${encodeURIComponent(locationQuery)}`);
    } else {
      navigate("/jobs");
    }
  };

  const displayName = user?.name || "Student";
  const userInitial = (displayName.charAt(0) || "S").toUpperCase();
  const displayRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Student";
  const currentPageInfo = PAGE_TITLES[location.pathname];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      {/* Sidebar on Left (Gmail-style collapse/expand with tooltips) */}
      <Sidebar />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-200">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 gap-3">
          {/* Left: Hamburger Button + Search or Title */}
          <div className="flex items-center gap-2.5 flex-1 max-w-3xl min-w-0">
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
              className="p-2 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center shrink-0"
              title="Toggle sidebar navigation"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>

            {/* Pure Functional Global Search Bar */}
            <div className="flex-1 max-w-xl">
              <GlobalSearchBar
                placeholder="Search jobs, courses, skills, companies..."
                className="w-full"
              />
            </div>
          </div>

          {/* Right Area: Notification & Profile */}
          <div className="flex items-center gap-3 ml-auto shrink-0">
            {/* Notification Bell */}
            <div className="relative" ref={notifMenuRef}>
              <button
                onClick={() => setIsNotificationsOpen((prev) => !prev)}
                className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                title="Notifications"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                {hasNotifications && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xl z-50 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-800">Notifications</span>
                      <Link
                        to="/notifications"
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-[11px] text-indigo-600 font-bold hover:underline"
                      >
                        View All
                      </Link>
                    </div>

                    <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                      <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-indigo-600 text-[18px] shrink-0 mt-0.5">
                          auto_awesome
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900">New AI Job Matches Ready</p>
                          <p className="text-[11px] text-slate-500">3 new software engineer roles match your profile.</p>
                          <span className="text-[10px] text-indigo-500 font-semibold mt-1 inline-block">10m ago</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">
                          task_alt
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Application Viewed</p>
                          <p className="text-[11px] text-slate-500">TechCorp viewed your Full Stack application.</p>
                          <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">2h ago</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <div
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer select-none border border-transparent hover:border-slate-200"
              >
                {/* Avatar circle */}
                <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {userInitial}
                </div>

                {/* Name & Subtitle */}
                <div className="flex flex-col text-left hidden sm:flex">
                  <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">{displayName}</span>
                  <span className="text-[10px] font-semibold text-slate-400">{displayRole}</span>
                </div>
              </div>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-60 bg-white border border-slate-200/80 rounded-2xl p-2 shadow-2xl z-50 flex flex-col gap-0.5"
                  >
                    {/* User Identity Header Card */}
                    <div className="px-3 py-2.5 border-b border-slate-100 mb-1 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                        {userInitial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                        <span className="inline-block px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[9.5px] font-bold uppercase tracking-wider">
                          {displayRole}
                        </span>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email || "student@careercompass.io"}</p>
                      </div>
                    </div>

                    {/* 1. My Profile */}
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-indigo-600">person</span>
                      My Profile
                    </Link>

                    {/* 2. Career Progress */}
                    <Link
                      to="/career-progress"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-emerald-600">trending_up</span>
                      Career Progress
                    </Link>

                    {/* 3. Career Preferences */}
                    <Link
                      to="/career-preferences"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-purple-600">tune</span>
                      Career Preferences
                    </Link>

                    {/* 4. Notifications */}
                    <Link
                      to="/notifications"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-amber-500">notifications</span>
                      Notifications
                    </Link>

                    {/* 5. Settings */}
                    <Link
                      to="/settings"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-slate-500">settings</span>
                      Settings
                    </Link>

                    <div className="h-px bg-slate-100 my-1" />

                    {/* 6. Log Out */}
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors w-full text-left cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 overflow-y-auto w-full p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      {/* Global Career Compass Floating AI Assistant */}
      <CareerCompassAssistant />
    </div>
  );
}

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppLayoutInner />
    </SidebarProvider>
  );
}

export default AppLayout;
