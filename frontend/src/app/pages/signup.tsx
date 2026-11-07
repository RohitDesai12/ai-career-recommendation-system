import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Sparkles, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import axios from "axios";
import { useAuth } from "../context/auth-context";

export function Signup() {
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [consentAgreed, setConsentAgreed] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!consentAgreed) {
      setError("Please read and accept the Privacy Policy and Terms & Conditions to create an account.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name: studentName,
        email: studentEmail,
        password: studentPassword,
        role: "student",
        termsAccepted: true,
        privacyAccepted: true,
        consentVersion: "v1.0",
      });
      const { token, user } = res.data;
      login(token, user || { id: "1", name: studentName, email: studentEmail, role: "student" });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.msg || "Registration failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Warm Ambient Background */}
      <motion.div
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[140px] pointer-events-none"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full relative z-10 max-w-md transition-all duration-300"
      >
        {/* Brand Logo Header */}
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-foreground tracking-tight">Career Compass</span>
              <span className="text-[11px] text-muted-foreground font-medium">AI Career & Intelligence Platform</span>
            </div>
          </Link>
        </div>

        {/* Main Card */}
        <div className="p-6 md:p-8 rounded-3xl bg-card border border-border/80 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-[#D6A85F] to-accent" />

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-medium text-center">
              {error}
            </div>
          )}

          {/* STUDENT SIGNUP FORM */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Create Student Account</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Start your personalized AI career roadmaps, test assessments, and mock interviews.
            </p>
          </div>

          <form onSubmit={handleStudentSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Alex Rivera"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="email"
                  required
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="alex@university.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Must be at least 6 characters</p>
            </div>

            {/* Registration Consent Notice */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentAgreed}
                  onChange={(e) => setConsentAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-border text-primary accent-primary cursor-pointer shrink-0"
                />
                <span className="text-xs text-muted-foreground leading-snug">
                  I have read and understood the{" "}
                  <Link
                    to="/privacy-policy"
                    target="_blank"
                    className="text-primary font-semibold hover:underline"
                  >
                    Privacy Policy
                  </Link>{" "}
                  and agree to the{" "}
                  <Link
                    to="/terms"
                    target="_blank"
                    className="text-primary font-semibold hover:underline"
                  >
                    Terms & Conditions
                  </Link>
                  .
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all cursor-pointer group disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Create Student Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Login Link */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
export default Signup;