import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Sparkles, Mail, Lock, User, ArrowRight, Loader2, GraduationCap } from "lucide-react";
import { motion } from "motion/react";
import axios from "axios";
import { useAuth } from "../context/auth-context";

export function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", { name, email, password, role });
      const { token, user } = res.data;
      login(token, user || { id: "1", name, email, role });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Warm Ambient Background */}
      <motion.div
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[120px] pointer-events-none"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </Link>
        </div>

        <div className="p-8 rounded-3xl bg-card border border-border/80 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-accent" />

          <h1 className="text-3xl text-foreground mb-2 font-bold tracking-tight">Create Account</h1>
          <p className="text-muted-foreground mb-8 text-sm">Start your personalized career journey</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-2 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Alex Morgan"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-2 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="alex@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-2 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">I am a...</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                </div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-2 border border-border text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                >
                  <option value="student">Student / Job Seeker</option>
                  <option value="recruiter">Recruiter / Mentor</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-4 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
