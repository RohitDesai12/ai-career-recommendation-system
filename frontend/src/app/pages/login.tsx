import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/auth-context";
import axios from "axios";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);

    let score = 0;
    if (val.length > 0) score += 1; // Basic
    if (val.length > 7) score += 1; // Length
    if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score += 1; // Complexity
    if (/[^A-Za-z0-9]/.test(val)) score += 1; // Special char
    setStrength(score);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email: email.trim(), password });
      const { token, user } = res.data;
      const loggedInUser = user || { id: "1", name: email.split("@")[0], email, role: "student" };
      login(token, loggedInUser);

      if (loggedInUser.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.msg || err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const getStrengthClass = (level: number) => {
    if (strength >= level) {
      if (strength === 1) return "bg-error";
      if (strength === 2) return "bg-tertiary-container";
      if (strength === 3) return "bg-secondary";
      return "bg-primary shadow-[0_0_8px_rgba(31,92,69,0.5)]";
    }
    return "bg-outline-variant/30";
  };

  return (
    <div className="w-full flex items-center justify-center min-h-screen bg-background">
      <div className="flex w-full h-full min-h-screen lg:flex-row bg-background text-on-background relative overflow-hidden">
        {/* Left Section: Abstract Career Visual (Desktop Only) */}
        <div className="hidden lg:flex w-1/2 relative bg-surface-container-low p-16 flex-col justify-between overflow-hidden border-r border-border">
          {/* Animated Background Decor */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] rounded-full bg-primary/10 blur-[100px] animate-pulse duration-10000"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-3/4 h-3/4 rounded-full bg-secondary/15 blur-[120px] mix-blend-screen animate-pulse duration-12000"></div>
            
            {/* SVG Grid Overlay */}
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern height="40" id="gridPattern" patternUnits="userSpaceOnUse" width="40">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"></path>
                </pattern>
              </defs>
              <rect fill="url(#gridPattern)" height="100%" width="100%"></rect>
            </svg>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
            <span className="font-headline-md text-xl tracking-widest uppercase font-semibold">Career Compass</span>
          </div>

          <div className="relative z-10 max-w-md my-auto">
            <h1 className="font-display-lg text-4xl md:text-5xl leading-tight font-bold text-on-background mb-6">
              Empower your career trajectory.
            </h1>
            <p className="font-body-lg text-on-surface-variant text-base leading-relaxed">
              Harness the power of intelligent predictive insights to navigate your professional growth with clarity.
            </p>
          </div>

          {/* Decorative Graph Element */}
          <div className="relative z-10 w-full max-w-sm mt-auto">
            <div className="flex items-end gap-2 h-24 p-4 bg-card/60 backdrop-blur-md rounded-2xl shadow-lg border border-border">
              <div className="w-1/6 bg-primary/20 rounded-t-md h-[30%] relative group">
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-inverse-surface text-inverse-on-surface font-label-sm text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Q1 Growth</div>
              </div>
              <div className="w-1/6 bg-primary/40 rounded-t-md h-[50%]"></div>
              <div className="w-1/6 bg-secondary/60 rounded-t-md h-[75%]"></div>
              <div className="w-1/6 bg-primary/80 rounded-t-md h-[60%]"></div>
              <div className="w-1/6 bg-secondary rounded-t-md h-[90%] relative shadow-[0_0_15px_rgba(214,168,95,0.4)]">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-on-background shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
              </div>
              <div className="w-1/6 bg-primary rounded-t-md h-[100%] relative shadow-[0_0_20px_rgba(31,92,69,0.4)]"></div>
            </div>
            <div className="mt-2 flex justify-between font-label-sm text-[10px] text-on-surface-variant/70 uppercase tracking-widest">
              <span>Analysis</span>
              <span>Projection</span>
            </div>
          </div>
        </div>

        {/* Right Section: Authentication Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-background relative z-10">
          <div className="w-full max-w-md flex flex-col justify-center h-full">
            {/* Mobile Logo */}
            <div className="flex lg:hidden items-center gap-2 text-primary mb-12">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
              <span className="font-headline-md text-xl tracking-widest uppercase font-semibold">Career Compass</span>
            </div>

            <div className="mb-10">
              <h2 className="text-3xl font-bold text-on-surface mb-2">Welcome back</h2>
              <p className="font-body-md text-on-surface-variant">Enter your details to access your dashboard.</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-error-container/20 border border-error-container/40 text-error text-sm text-center">
                {error}
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Email Address Input */}
              <div className="relative group">
                <input 
                  className="w-full bg-surface-container-lowest/50 text-on-surface font-body-md text-sm px-4 py-3.5 rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder-transparent peer"
                  id="email" 
                  placeholder="Email Address" 
                  required 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label 
                  className="absolute left-4 top-3.5 font-body-md text-sm text-on-surface-variant transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-primary peer-focus:bg-surface px-1 cursor-text peer-valid:-top-2.5 peer-valid:text-xs peer-valid:bg-surface" 
                  htmlFor="email"
                >
                  Email Address
                </label>
              </div>

              {/* Password Input */}
              <div className="relative group">
                <input 
                  className="w-full bg-surface-container-lowest/50 text-on-surface font-body-md text-sm px-4 py-3.5 rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder-transparent peer"
                  id="password" 
                  placeholder="Password" 
                  required 
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                />
                <label 
                  className="absolute left-4 top-3.5 font-body-md text-sm text-on-surface-variant transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-primary peer-focus:bg-surface px-1 cursor-text peer-valid:-top-2.5 peer-valid:text-xs peer-valid:bg-surface" 
                  htmlFor="password"
                >
                  Password
                </label>

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="flex gap-1 mt-3 px-1">
                    <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${getStrengthClass(1)}`}></div>
                    <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${getStrengthClass(2)}`}></div>
                    <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${getStrengthClass(3)}`}></div>
                    <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${getStrengthClass(4)}`}></div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="relative w-4 h-4 flex items-center justify-center">
                    <input className="peer appearance-none w-4 h-4 rounded border border-outline-variant checked:border-primary checked:bg-primary transition-colors cursor-pointer" type="checkbox"/>
                    <span className="material-symbols-outlined text-[10px] text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                  </div>
                  <span className="font-body-md text-xs text-on-surface-variant group-hover:text-on-surface transition-colors">Remember me</span>
                </label>
                <a className="font-body-md text-xs text-primary hover:text-primary/80 transition-colors" href="#">Forgot password?</a>
              </div>

              {/* Submit Button */}
              <button 
                className="w-full bg-primary text-white font-label-sm text-xs font-bold py-4 rounded-xl uppercase tracking-widest hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                ) : (
                  <>
                    Sign In
                    <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center font-body-md text-sm text-on-surface-variant">
              Don't have an account? <Link className="text-secondary hover:text-secondary/80 transition-colors underline underline-offset-4 decoration-secondary/30 hover:decoration-secondary font-semibold" to="/signup">Create one now</Link>
            </div>

            <p className="mt-4 text-center text-[11px] text-on-surface-variant/70 leading-relaxed">
              By signing in, you access your account under our{" "}
              <Link to="/terms" target="_blank" className="text-primary hover:underline font-medium">Terms & Conditions</Link>{" "}
              and{" "}
              <Link to="/privacy-policy" target="_blank" className="text-primary hover:underline font-medium">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
