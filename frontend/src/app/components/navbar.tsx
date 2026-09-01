import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/auth-context";
import { useTheme } from "../context/theme-context";
import { motion, AnimatePresence } from "motion/react";

interface NavbarProps {
  variant?: "default" | "video";
}

export function Navbar({ variant = "default" }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isVideo = variant === "video";

  // Dismiss dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/");
  };

  return (
    <header className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
      isVideo 
        ? "bg-black/35 backdrop-blur-xl border-b border-white/10 text-white" 
        : "bg-background/90 backdrop-blur-xl border-b border-border/80 text-foreground"
    }`}>
      <div className="h-16 w-full px-6 md:px-12 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <img 
            alt="Career Compass Logo" 
            className="h-8 w-auto object-contain" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYFh4eMgyp30I0EVYQi1eQtOgK8bXKYk4sfFpOkGx3i0dDv2-46KpHAzLDgLxsvmvz5tlYYdBpv8pEPyr95iDxA_vdPSv8hvDgfzFtlyihcRbYwU1T5BiKIm1xqTz9eKDtNonRh1Q5gpF_1L8HNn2kY2pvya6KUDEYKP_FfN9wpc0hToLGIQw079_LWwHg1FFNvktS6FkBJcrFIjYVw57HWcw7HyLLMYHT_brhzxgGZQONHW79G9qA"
          />
          <span className={`font-headline-md text-[18px] font-bold ${isVideo ? "text-white" : "text-on-surface"}`}>Career Compass</span>
        </Link>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/assessment" className={`font-label-sm text-xs transition-colors uppercase tracking-wider font-semibold ${isVideo ? "text-white/80 hover:text-white" : "text-on-surface-variant hover:text-on-surface"}`}>
            Career Test
          </Link>
          <Link to="/roadmap" className={`font-label-sm text-xs transition-colors uppercase tracking-wider font-semibold ${isVideo ? "text-white/80 hover:text-white" : "text-on-surface-variant hover:text-on-surface"}`}>
            Roadmap
          </Link>
          <Link to="/courses" className={`font-label-sm text-xs transition-colors uppercase tracking-wider font-semibold ${isVideo ? "text-white/80 hover:text-white" : "text-on-surface-variant hover:text-on-surface"}`}>
            Courses
          </Link>
          <Link to="/interview-prep" className={`font-label-sm text-xs transition-colors uppercase tracking-wider font-semibold ${isVideo ? "text-white/80 hover:text-white" : "text-on-surface-variant hover:text-on-surface"}`}>
            Interview Prep
          </Link>
        </nav>

        {/* Right Actions: Theme Switcher & Profile Dropdown Trigger */}
        <div className="flex items-center gap-3">
          {/* Theme Dark / Light Mode Switcher */}
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Light (Warm Cream) Mode" : "Switch to Dark (Deep Forest) Mode"}
            aria-label="Toggle dark/light theme"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs ${
              isVideo
                ? "bg-white/10 hover:bg-white/20 text-[#D6A85F] border border-white/20 hover:scale-105 active:scale-95"
                : "bg-surface-2 hover:bg-surface-container-high text-on-surface border border-border hover:scale-105 active:scale-95"
            }`}
          >
            <span className="material-symbols-outlined text-[19px]">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
          </button>

          {/* Profile Icon with Interactive Dropdown Popover */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(prev => !prev)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md ${
                isVideo
                  ? "bg-white/15 hover:bg-white/25 text-white border border-white/30 hover:scale-105 active:scale-95"
                  : "bg-primary text-white hover:bg-primary/90 border border-primary/40 hover:scale-105 active:scale-95"
              }`}
              title="Account Menu"
              aria-expanded={isMenuOpen}
            >
              <span className="material-symbols-outlined text-[20px]">person</span>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 mt-3 w-64 rounded-2xl bg-card border border-border/80 shadow-2xl p-2.5 z-50 text-foreground"
                >
                  {isAuthenticated ? (
                    /* Authenticated User Menu */
                    <div className="flex flex-col gap-1">
                      {/* User Info Header */}
                      <div className="px-3.5 py-3 rounded-xl bg-surface-container border border-border/60 mb-1">
                        <div className="text-xs font-bold text-foreground truncate">
                          {user?.name || "Logged In User"}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {user?.email || "Account Active"}
                        </div>
                      </div>

                      {/* Menu Links */}
                      <Link
                        to="/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">dashboard</span>
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        to="/assessment"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">bolt</span>
                        <span>Career Test</span>
                      </Link>

                      <Link
                        to="/roadmap"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">map</span>
                        <span>Career Roadmap</span>
                      </Link>

                      <div className="h-[1px] bg-border/60 my-1" />

                      {/* Sign Out */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors w-full text-left cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        <span>Sign Out / Logout</span>
                      </button>
                    </div>
                  ) : (
                    /* Guest User Menu: Sign In & Sign Up Options */
                    <div className="flex flex-col gap-1.5 p-1">
                      <div className="px-3 py-2 text-center border-b border-border/60 mb-1">
                        <div className="text-xs font-bold text-foreground">Welcome to Career Compass</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">Sign in to access your saved paths</div>
                      </div>

                      {/* Sign In */}
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-foreground hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px] text-primary">login</span>
                        <div className="flex flex-col">
                          <span>Sign In</span>
                          <span className="text-[10px] text-muted-foreground font-normal">Existing account</span>
                        </div>
                      </Link>

                      {/* Sign Up */}
                      <Link
                        to="/signup"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/25 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                        <div className="flex flex-col">
                          <span>Create Account (Sign Up)</span>
                          <span className="text-[10px] text-white/80 font-normal">New to Career Compass</span>
                        </div>
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </header>
  );
}
