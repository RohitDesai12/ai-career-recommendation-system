import { Link } from "react-router";
import { useAuth } from "../context/auth-context";

export function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 w-full px-6 md:px-12 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center gap-2">
          <img 
            alt="Career Compass Logo" 
            className="h-8 w-auto object-contain" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYFh4eMgyp30I0EVYQi1eQtOgK8bXKYk4sfFpOkGx3i0dDv2-46KpHAzLDgLxsvmvz5tlYYdBpv8pEPyr95iDxA_vdPSv8hvDgfzFtlyihcRbYwU1T5BiKIm1xqTz9eKDtNonRh1Q5gpF_1L8HNn2kY2pvya6KUDEYKP_FfN9wpc0hToLGIQw079_LWwHg1FFNvktS6FkBJcrFIjYVw57HWcw7HyLLMYHT_brhzxgGZQONHW79G9qA"
          />
          <span className="font-headline-md text-[18px] font-semibold text-on-surface">Career Compass</span>
        </Link>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="font-label-sm text-xs text-on-surface-variant hover:text-on-surface transition-colors uppercase tracking-wider">
            Features
          </a>
          <a href="#how-it-works" className="font-label-sm text-xs text-on-surface-variant hover:text-on-surface transition-colors uppercase tracking-wider">
            How It Works
          </a>
          <a href="#results" className="font-label-sm text-xs text-on-surface-variant hover:text-on-surface transition-colors uppercase tracking-wider">
            Pricing
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <button 
                onClick={logout}
                className="font-label-sm text-xs text-on-surface-variant hover:text-error transition-colors uppercase tracking-wider"
              >
                Logout
              </button>
              <Link 
                to="/dashboard"
                className="bg-primary text-white px-5 py-2 rounded-full font-label-sm text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-md shadow-primary/20"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="font-label-sm text-xs text-on-surface-variant hover:text-on-surface transition-colors uppercase tracking-wider"
              >
                Login
              </Link>
              <Link 
                to="/signup"
                className="bg-primary text-white px-5 py-2 rounded-full font-label-sm text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-md shadow-primary/20"
              >
                Get Started
              </Link>
            </>
          )}
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <span className="material-symbols-outlined text-primary text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
