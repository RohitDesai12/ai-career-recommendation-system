import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "../context/auth-context";
import { useTheme } from "../context/theme-context";
import { motion, AnimatePresence } from "motion/react";
import { GlobalSearchBar } from "./global-search-bar";
import {
  Compass,
  Briefcase,
  BookOpen,
  Award,
  Building2,
  MapPin,
  TrendingUp,
  Bolt,
  Layers,
  History,
  FileText,
  Users,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Search,
  Moon,
  Sun,
  Menu,
  X,
  PlusCircle,
  ExternalLink,
  Shield,
  HelpCircle,
  LogOut
} from "lucide-react";

interface SubMenuItem {
  name: string;
  description: string;
  to: string;
  icon: any;
  badge?: string;
}

interface NavItemConfig {
  name: string;
  to: string;
  categoryTitle?: string;
  categorySubtitle?: string;
  footerLink?: { label: string; to: string };
  items?: SubMenuItem[];
}

interface NavbarProps {
  variant?: "default" | "video" | "light" | "cinematic";
}

export function Navbar({ variant = "default" }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll detection for transparent/frosted header transitions
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Desktop Mega Menu State
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const openTimeoutRef = useRef<any>(null);
  const closeTimeoutRef = useRef<any>(null);

  // Mobile Navigation State
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);

  // Search Modal State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchModalRef = useRef<HTMLDivElement>(null);

  // Profile Menu State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Structured Navigation with Real Existing Routes & Jobscan-inspired Architecture
  const NAV_CONFIG: NavItemConfig[] = [
    { name: "Home", to: "/" },
    {
      name: "Career Test",
      to: "/assessment",
      categoryTitle: "Discover Your Direction",
      categorySubtitle: "AI assessment & diagnostic tools",
      footerLink: { label: "Explore Career Assessment →", to: "/assessment" },
      items: [
        {
          name: "Career Assessment",
          description: "Find suitable career paths based on your interests and skills.",
          to: "/assessment",
          icon: Bolt,
          badge: "AI Powered"
        },
        {
          name: "Career Recommendations",
          description: "Get personalized AI-matched role recommendations.",
          to: "/results",
          icon: Sparkles
        },
        {
          name: "Skill Gap Insights",
          description: "Understand which skills you need to develop for your target role.",
          to: "/career-progress",
          icon: TrendingUp
        }
      ]
    },
    {
      name: "Roadmap",
      to: "/roadmap",
      categoryTitle: "Career Roadmaps",
      categorySubtitle: "Step-by-step milestone planning",
      footerLink: { label: "View Active Roadmaps →", to: "/roadmap" },
      items: [
        {
          name: "Personalized Roadmaps",
          description: "Step-by-step milestone guides for your target career.",
          to: "/roadmap",
          icon: Compass,
          badge: "Interactive"
        },
        {
          name: "Learning Stages & Milestones",
          description: "Track multi-phase stage progression and verified skills.",
          to: "/roadmap/roadmaps",
          icon: Layers
        },
        {
          name: "Roadmap History",
          description: "View your saved, active, and completed roadmaps.",
          to: "/roadmap/history",
          icon: History
        }
      ]
    },
    {
      name: "Courses",
      to: "/courses",
      categoryTitle: "Curated Learning",
      categorySubtitle: "Targeted skill development tracks",
      footerLink: { label: "Browse All Courses →", to: "/courses" },
      items: [
        {
          name: "Browse Courses",
          description: "Explore curated technical & professional skill tracks.",
          to: "/courses",
          icon: BookOpen
        },
        {
          name: "Skill-based Learning",
          description: "Target exact skills matching your career gap.",
          to: "/courses",
          icon: Award
        },
        {
          name: "Recommended Courses",
          description: "Hand-picked high-impact courses with certifications.",
          to: "/courses",
          icon: Sparkles,
          badge: "Free & Pro"
        }
      ]
    },
    {
      name: "Jobs",
      to: "/jobs",
      categoryTitle: "Verified Opportunities",
      categorySubtitle: "Direct openings from partner tech companies",
      footerLink: { label: "Explore Job Openings →", to: "/jobs" },
      items: [
        {
          name: "Explore Jobs",
          description: "Browse verified active openings across top tech firms.",
          to: "/jobs",
          icon: Briefcase,
          badge: "Live"
        },
        {
          name: "Saved Jobs",
          description: "Review and track bookmarked opportunities.",
          to: "/jobs?tab=saved",
          icon: FileText
        },
        {
          name: "Application Tracking",
          description: "Live status tracker for submitted applications.",
          to: "/jobs?tab=applications",
          icon: Building2
        }
      ]
    },
    {
      name: "About",
      to: "/#about",
      categoryTitle: "About Career Compass",
      categorySubtitle: "Our mission, intelligence engine & methodology",
      footerLink: { label: "Learn More About Us →", to: "/#about" },
      items: [
        {
          name: "About Career Compass",
          description: "Next-generation AI career orientation & placement platform.",
          to: "/#about",
          icon: HelpCircle
        },
        {
          name: "How It Works",
          description: "4-step intelligent process from assessment to hiring.",
          to: "/#how-it-works",
          icon: TrendingUp
        },
        {
          name: "Platform Features",
          description: "Resume Studio, AI Mock Interviews, Roadmaps & Jobs.",
          to: "/#features",
          icon: Shield
        }
      ]
    }
  ];

  // Mouse Enter on Menu Item with 100ms debounce
  const handleMouseEnter = (name: string) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    openTimeoutRef.current = setTimeout(() => {
      setActiveMenu(name);
    }, 100);
  };

  // Mouse Leave from Menu Item with 200ms debounce to prevent flicker
  const handleMouseLeave = () => {
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 200);
  };

  // Dismiss dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (searchModalRef.current && !searchModalRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setActiveMenu(null);
    setIsMobileNavOpen(false);
    setIsSearchOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsMobileNavOpen(false);
    navigate("/");
  };

  const dashboardRoute = "/dashboard";
  const getStartedLabel = isAuthenticated ? "Dashboard" : "Get Started";

  const isCinematic = variant === "cinematic";

  // Dynamic header container styling
  const headerClasses = isCinematic
    ? isScrolled
      ? "fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 bg-[#0A0F1D]/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg font-sans"
      : "fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 bg-[#0A0F1D]/25 backdrop-blur-[4px] border-b border-white/10 text-white shadow-none font-sans"
    : "fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 bg-white/98 dark:bg-[#0F172A]/98 backdrop-blur-md border-b border-[#E2E8F0] dark:border-slate-800 text-[#1F2937] dark:text-slate-100 shadow-xs font-sans";

  return (
    <>
      <header className={headerClasses}>
        <div className="h-18 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* ============================================================= */}
          {/* 1. BRAND LOGO BLOCK (Crisp Vertical Center Alignment)         */}
          {/* ============================================================= */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0 py-1 select-none group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#356FD8] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#356FD8]/25 group-hover:bg-[#2557B8] transition-colors">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex flex-col justify-center leading-tight min-w-0">
              <div className="flex items-center gap-1 leading-none">
                <span className={`text-[15px] sm:text-[17px] font-extrabold tracking-tight ${isCinematic ? "text-white" : "text-[#172033] dark:text-white"}`}>
                  Career
                </span>
                <span className={`text-[15px] sm:text-[17px] font-extrabold tracking-tight ${isCinematic ? "text-[#7DD3FC]" : "text-[#356FD8]"}`}>
                  Compass
                </span>
              </div>
              <span className={`hidden sm:block text-[9.5px] font-bold tracking-wider uppercase mt-0.5 ${isCinematic ? "text-white/60" : "text-[#5B6472] dark:text-slate-400"}`}>
                Intelligence Platform
              </span>
            </div>
          </Link>

          {/* ============================================================= */}
          {/* 2. DESKTOP NAVIGATION WITH CLEAN MEGA-MENUS                  */}
          {/* ============================================================= */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {NAV_CONFIG.map((navItem) => {
              const hasSubmenu = navItem.items && navItem.items.length > 0;
              const isMenuVisible = activeMenu === navItem.name;
              const isActive = location.pathname === navItem.to;

              const navItemClass = isCinematic
                ? isActive || isMenuVisible
                  ? "text-white bg-white/15"
                  : "text-white/85 hover:text-white hover:bg-white/10"
                : isActive || isMenuVisible
                  ? "text-[#356FD8] dark:text-[#5B8FE3] bg-[#EEF6FF] dark:bg-indigo-950/40"
                  : "text-[#5B6472] dark:text-slate-300 hover:text-[#356FD8] dark:hover:text-[#5B8FE3] hover:bg-[#F7FAFC] dark:hover:bg-slate-800/60";

              return (
                <div
                  key={navItem.name}
                  className="relative"
                  onMouseEnter={() => (hasSubmenu ? handleMouseEnter(navItem.name) : setActiveMenu(null))}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    to={navItem.to}
                    onClick={() => setActiveMenu(null)}
                    className={`flex items-center gap-1 px-3.5 py-2 rounded-xl text-[13.5px] font-semibold transition-all duration-150 select-none ${navItemClass}`}
                  >
                    <span>{navItem.name}</span>
                    {hasSubmenu && (
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isMenuVisible ? "rotate-180 text-[#356FD8] dark:text-[#7DD3FC]" : isCinematic ? "text-white/60" : "text-[#8A96A8]"
                        }`}
                      />
                    )}
                  </Link>

                  {/* Clean SaaS Mega Menu Dropdown */}
                  <AnimatePresence>
                    {hasSubmenu && isMenuVisible && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-84 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 shadow-xl p-3 z-50 overflow-hidden"
                      >
                        {/* Category Header */}
                        {navItem.categoryTitle && (
                          <div className="px-3 py-2 border-b border-[#F1F5F9] dark:border-slate-800 mb-1.5 flex items-center justify-between">
                            <div>
                              <span className="text-[11px] font-bold text-[#356FD8] dark:text-[#5B8FE3] uppercase tracking-wider block">
                                {navItem.categoryTitle}
                              </span>
                              {navItem.categorySubtitle && (
                                <span className="text-[10px] text-[#8A96A8] dark:text-slate-400">
                                  {navItem.categorySubtitle}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Submenu Grid */}
                        <div className="space-y-1">
                          {navItem.items?.map((item) => {
                            const ItemIcon = item.icon;
                            return (
                              <Link
                                key={item.name}
                                to={item.to}
                                onClick={() => setActiveMenu(null)}
                                className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F7FAFC] dark:hover:bg-slate-800/60 transition-colors"
                              >
                                <div className="w-8 h-8 rounded-lg bg-[#EEF6FF] dark:bg-indigo-950/50 text-[#356FD8] dark:text-[#5B8FE3] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#356FD8] group-hover:text-white transition-colors">
                                  <ItemIcon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-[#172033] dark:text-white group-hover:text-[#356FD8] dark:group-hover:text-[#5B8FE3] transition-colors">
                                      {item.name}
                                    </span>
                                    {item.badge && (
                                      <span className="px-1.5 py-0.2 rounded bg-[#EEF6FF] dark:bg-indigo-900/60 text-[#356FD8] dark:text-indigo-300 text-[9.5px] font-bold">
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-[#5B6472] dark:text-slate-400 leading-snug mt-0.5">
                                    {item.description}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>

                        {/* Optional Footer Link */}
                        {navItem.footerLink && (
                          <div className="mt-2 pt-2 border-t border-[#F1F5F9] dark:border-slate-800 px-3 py-1">
                            <Link
                              to={navItem.footerLink.to}
                              onClick={() => setActiveMenu(null)}
                              className="text-[11px] font-bold text-[#356FD8] dark:text-[#5B8FE3] hover:underline flex items-center gap-1"
                            >
                              <span>{navItem.footerLink.label}</span>
                            </Link>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          {/* ============================================================= */}
          {/* 3. RIGHT ACTIONS (SEARCH MODAL, THEME TOGGLE, AUTH CTAS)    */}
          {/* ============================================================= */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            
            {/* Quick Global Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer border border-transparent ${
                isCinematic
                  ? "text-white/85 hover:text-white hover:bg-white/10 hover:border-white/20"
                  : "text-[#5B6472] dark:text-slate-400 hover:text-[#356FD8] dark:hover:text-[#5B8FE3] hover:bg-[#F7FAFC] dark:hover:bg-slate-800 hover:border-[#E2E8F0]"
              }`}
              title="Search Career Compass (Ctrl+K)"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle dark/light theme"
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer border border-transparent ${
                isCinematic
                  ? "text-white/85 hover:text-white hover:bg-white/10 hover:border-white/20"
                  : "text-[#5B6472] dark:text-slate-400 hover:text-[#356FD8] dark:hover:text-[#5B8FE3] hover:bg-[#F7FAFC] dark:hover:bg-slate-800 hover:border-[#E2E8F0]"
              }`}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Auth Buttons / Profile Menu */}
            {!isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className={`px-3.5 py-2 text-[13px] font-semibold transition-colors ${
                    isCinematic
                      ? "text-white/90 hover:text-[#7DD3FC]"
                      : "text-[#5B6472] dark:text-slate-200 hover:text-[#356FD8] dark:hover:text-[#5B8FE3]"
                  }`}
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 ${
                    isCinematic
                      ? "bg-[#7DD3FC] hover:bg-[#BAE6FD] text-[#0A0F1D] font-bold shadow-md shadow-sky-500/20"
                      : "bg-[#356FD8] hover:bg-[#2557B8] text-white shadow-sm shadow-[#356FD8]/25"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to={dashboardRoute}
                  className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                    isCinematic
                      ? "bg-[#7DD3FC] hover:bg-[#BAE6FD] text-[#0A0F1D] font-bold shadow-md shadow-sky-500/20"
                      : "bg-[#356FD8] hover:bg-[#2557B8] text-white shadow-sm shadow-[#356FD8]/25"
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>{getStartedLabel}</span>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileOpen((prev) => !prev)}
                    className="w-9 h-9 rounded-xl bg-[#F7FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-center text-[#356FD8] dark:text-[#5B8FE3] font-bold text-xs hover:border-[#356FD8] transition-all cursor-pointer shadow-2xs"
                    aria-expanded={isProfileOpen}
                    title="Account"
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 shadow-xl p-2 z-50 text-[#1F2937] dark:text-slate-100 text-xs"
                      >
                        <div className="px-3 py-2 rounded-xl bg-[#F7FAFC] dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-800 mb-1">
                          <p className="font-bold truncate text-[#172033] dark:text-white">
                            {user?.name || "User Account"}
                          </p>
                          <p className="text-[10.5px] text-[#8A96A8] dark:text-slate-400 truncate">
                            {user?.email || "Student"}
                          </p>
                        </div>

                        <Link
                          to="/dashboard"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium hover:bg-[#EEF6FF] dark:hover:bg-indigo-950/50 hover:text-[#356FD8] dark:hover:text-[#5B8FE3] transition-colors"
                        >
                          <Compass className="w-4 h-4 text-[#356FD8]" />
                          <span>Student Dashboard</span>
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium hover:bg-[#EEF6FF] dark:hover:bg-indigo-950/50 hover:text-[#356FD8] dark:hover:text-[#5B8FE3] transition-colors"
                        >
                          <Users className="w-4 h-4 text-[#356FD8]" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/jobs"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium hover:bg-[#EEF6FF] dark:hover:bg-indigo-950/50 hover:text-[#356FD8] dark:hover:text-[#5B8FE3] transition-colors"
                        >
                          <Briefcase className="w-4 h-4 text-[#356FD8]" />
                          <span>Jobs & Applications</span>
                        </Link>

                        <div className="h-px bg-[#E2E8F0] dark:bg-slate-800 my-1" />

                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-[#DC2626] hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors w-full text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-[#DC2626]" />
                          <span>Log Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
              className={`lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                isCinematic
                  ? "text-white hover:bg-white/10"
                  : "text-[#5B6472] dark:text-slate-200 hover:bg-[#F7FAFC] dark:hover:bg-slate-800"
              }`}
              aria-label="Toggle Navigation Menu"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* ============================================================= */}
        {/* MOBILE NAVIGATION ACCORDION DRAWER                           */}
        {/* ============================================================= */}
        <AnimatePresence>
          {isMobileNavOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`lg:hidden border-t px-5 py-4 overflow-hidden max-h-[85vh] overflow-y-auto ${
                isCinematic
                  ? "border-slate-800 bg-[#0A0F1D] text-white"
                  : "border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900"
              }`}
            >
              <div className="flex flex-col gap-1.5">
                {NAV_CONFIG.map((navItem) => {
                  const hasSubmenu = navItem.items && navItem.items.length > 0;
                  const isExpanded = expandedMobileMenu === navItem.name;

                  if (!hasSubmenu) {
                    return (
                      <Link
                        key={navItem.name}
                        to={navItem.to}
                        onClick={() => setIsMobileNavOpen(false)}
                        className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#1F2937] dark:text-slate-200 hover:bg-[#EEF6FF] dark:hover:bg-indigo-950/50 hover:text-[#356FD8] dark:hover:text-[#5B8FE3] transition-colors"
                      >
                        {navItem.name}
                      </Link>
                    );
                  }

                  return (
                    <div key={navItem.name} className="rounded-2xl bg-[#F7FAFC] dark:bg-slate-800/40 p-1">
                      <button
                        type="button"
                        onClick={() => setExpandedMobileMenu(isExpanded ? null : navItem.name)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-[#1F2937] dark:text-slate-200 cursor-pointer"
                      >
                        <span>{navItem.name}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isExpanded ? "rotate-180 text-[#356FD8]" : "text-[#8A96A8]"
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-1 px-1 pb-1 pt-0.5 overflow-hidden"
                          >
                            {navItem.items?.map((sub) => (
                              <Link
                                key={sub.name}
                                to={sub.to}
                                onClick={() => setIsMobileNavOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#5B6472] dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-[#356FD8] dark:hover:text-[#5B8FE3] transition-colors"
                              >
                                <ChevronRight className="w-3.5 h-3.5 text-[#356FD8] shrink-0" />
                                <span>{sub.name}</span>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                <div className="h-px bg-[#E2E8F0] dark:bg-slate-800 my-2" />

                {!isAuthenticated ? (
                  <div className="flex flex-col gap-2 pt-1">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileNavOpen(false)}
                      className="w-full py-2.5 text-center text-sm font-semibold text-[#1F2937] dark:text-slate-200 rounded-xl border border-[#E2E8F0] dark:border-slate-700 hover:bg-[#F7FAFC] dark:hover:bg-slate-800"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMobileNavOpen(false)}
                      className="w-full py-2.5 text-center text-sm font-semibold bg-[#356FD8] text-white rounded-xl shadow-sm shadow-[#356FD8]/25"
                    >
                      Get Started Free
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 pt-1">
                    <Link
                      to={dashboardRoute}
                      onClick={() => setIsMobileNavOpen(false)}
                      className="w-full py-2.5 text-center text-sm font-semibold bg-[#356FD8] text-white rounded-xl shadow-sm shadow-[#356FD8]/25"
                    >
                      Go to {getStartedLabel}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full py-2.5 text-center text-sm font-semibold text-[#DC2626] rounded-xl border border-rose-200 dark:border-rose-900/50"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ============================================================= */}
      {/* GLOBAL SEARCH MODAL (Pure Global Search Experience)          */}
      {/* ============================================================= */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              ref={searchModalRef}
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-[#E2E8F0] dark:border-slate-800 shadow-2xl p-4 sm:p-6"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F1F5F9] dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#EEF6FF] text-[#356FD8] flex items-center justify-center">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#172033] dark:text-white">Quick Search</h3>
                    <p className="text-[10.5px] text-[#8A96A8]">Search jobs, courses, skills, career roles & companies</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-[#F7FAFC] dark:hover:bg-slate-800 text-[#8A96A8] hover:text-[#1F2937] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Pure Global Search Bar */}
              <GlobalSearchBar
                autoFocus={true}
                placeholder="Search jobs, courses, skills, companies..."
                className="w-full"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
