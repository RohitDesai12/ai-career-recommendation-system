import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "../context/auth-context";
import { useTheme } from "../context/theme-context";
import { motion, AnimatePresence } from "motion/react";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { path: "/assessment", label: "Career Test", icon: "bolt" },
  { path: "/roadmap", label: "Roadmap", icon: "map" },
  { path: "/resume", label: "Resume Analyser", icon: "description" },
  { path: "/chatbot", label: "AI Mentor", icon: "smart_toy" },
  { path: "/interview-prep", label: "Interview Prep", icon: "work" },
  { path: "/courses", label: "Courses", icon: "school" },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside listener to dismiss profile popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <aside className="w-72 bg-surface-container-low flex flex-col border-r border-outline-variant/20 h-screen sticky top-0 z-30">
      {/* Brand Logo & Name */}
      <div className="h-16 px-6 flex items-center gap-3">
        <img 
          alt="Career Compass Logo" 
          className="h-8 w-auto object-contain" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYFh4eMgyp30I0EVYQi1eQtOgK8bXKYk4sfFpOkGx3i0dDv2-46KpHAzLDgLxsvmvz5tlYYdBpv8pEPyr95iDxA_vdPSv8hvDgfzFtlyihcRbYwU1T5BiKIm1xqTz9eKDtNonRh1Q5gpF_1L8HNn2kY2pvya6KUDEYKP_FfN9wpc0hToLGIQw079_LWwHg1FFNvktS6FkBJcrFIjYVw57HWcw7HyLLMYHT_brhzxgGZQONHW79G9qA"
        />
        <span className="font-headline-md text-[20px] font-semibold text-on-surface">Compass</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 mt-6 flex flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-primary-container text-on-primary-container font-bold shadow-md shadow-primary/10"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined mr-3 text-[22px]">{item.icon}</span>
              <span className="text-sm font-medium tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer / Action Area */}
      <div className="p-4 border-t border-outline-variant/10 relative" ref={menuRef}>
        
        {/* Floating Profile Dropdown Menu */}
        <AnimatePresence>
          {isProfileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute bottom-20 left-4 right-4 bg-surface-container border border-outline-variant/15 rounded-2xl p-2.5 shadow-2xl z-50 flex flex-col gap-1 backdrop-blur-xl"
            >
              <button 
                onClick={() => { console.log("Profile clicked"); setIsProfileMenuOpen(false); }}
                className="flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-all gap-3 text-left w-full cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">person</span>
                Profile
              </button>
              <button 
                onClick={() => { console.log("Progress clicked"); setIsProfileMenuOpen(false); }}
                className="flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-all gap-3 text-left w-full cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">trending_up</span>
                Progress
              </button>
              <Link 
                to="/resume"
                onClick={() => setIsProfileMenuOpen(false)}
                className="flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-all gap-3 text-left w-full"
              >
                <span className="material-symbols-outlined text-[18px] text-tertiary">description</span>
                Resume
              </Link>
              <Link 
                to="/assessment"
                onClick={() => setIsProfileMenuOpen(false)}
                className="flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-all gap-3 text-left w-full"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">bolt</span>
                Career Assessment
              </Link>
              <Link 
                to="/saved-preps"
                onClick={() => setIsProfileMenuOpen(false)}
                className="flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-all gap-3 text-left w-full"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">bookmark</span>
                Saved Interview Prep
              </Link>
              <button 
                onClick={() => { console.log("Settings clicked"); setIsProfileMenuOpen(false); }}
                className="flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-all gap-3 text-left w-full cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">settings</span>
                Settings
              </button>
              <button 
                onClick={() => { console.log("Help clicked"); setIsProfileMenuOpen(false); }}
                className="flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-all gap-3 text-left w-full cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">help</span>
                Help & Support
              </button>
              <button 
                onClick={() => { 
                  toggleTheme(); 
                  setIsProfileMenuOpen(false); 
                }}
                className="flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-all gap-3 text-left w-full cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-tertiary">
                  {theme === "dark" ? "light_mode" : "dark_mode"}
                </span>
                Theme: {theme === "dark" ? "Light" : "Dark"}
              </button>
              
              <div className="h-[1px] bg-outline-variant/10 my-1" />
              
              <button
                onClick={() => { logout(); setIsProfileMenuOpen(false); }}
                className="flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold text-error hover:bg-error-container/10 transition-all gap-3 text-left w-full cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User profile row representing the shifted avatar section */}
        <div 
          onClick={() => setIsProfileMenuOpen(prev => !prev)}
          className="flex items-center gap-3 px-3 py-2 bg-surface-container/30 rounded-2xl border border-outline-variant/5 hover:bg-surface-container/60 hover:border-outline-variant/15 active:scale-98 transition-all cursor-pointer select-none"
        >
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center border border-primary/30 flex-shrink-0 shadow-sm shadow-primary/25 animate-pulse">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-on-surface truncate">{user?.name || "User"}</span>
            <span className="text-[10px] text-on-surface-variant/70 truncate">{user?.email || ""}</span>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant/50 text-[18px]">
            {isProfileMenuOpen ? "expand_less" : "expand_more"}
          </span>
        </div>

      </div>
    </aside>
  );
}
