import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import axios from "axios";
import { useAuth } from "../context/auth-context";

const COMPANY_SIZES = ["1–10", "11–50", "51–200", "201–500", "500+"];

const INDUSTRIES = [
  "Information Technology",
  "Finance & Banking",
  "Healthcare & Biotech",
  "E-Commerce & Retail",
  "Education & EdTech",
  "Manufacturing & Industrial",
  "Consulting & Professional Services",
  "Media & Entertainment",
  "Telecommunications",
  "Automotive & Transportation",
];

export function EmployerSignup() {
  const [companyName, setCompanyName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companySize, setCompanySize] = useState("1–10");
  const [industry, setIndustry] = useState("Information Technology");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/employer/register", {
        companyName,
        workEmail,
        companyWebsite,
        companySize,
        industry,
        contactPerson,
        phone,
        password,
      });

      const { token, user, employer } = res.data;
      if (employer) {
        localStorage.setItem("employer", JSON.stringify(employer));
      }
      login(token, user || { id: "emp1", name: contactPerson, email: workEmail, role: "employer" });
      navigate("/employer/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.msg || "Employer registration failed. Please check all fields.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <span className="material-symbols-outlined text-[26px]">explore</span>
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-black font-heading tracking-tight text-white">Career Compass</h2>
            <p className="text-xs text-blue-400 font-semibold tracking-wide">Recruiter & Talent Portal</p>
          </div>
        </Link>
        <h1 className="mt-6 text-2xl sm:text-3xl font-black text-white tracking-tight font-heading">
          Create Recruiter Account
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          Source top engineering & tech talent matching your job requirements.
        </p>
      </div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4 sm:px-0"
      >
        <div className="bg-[#1E293B] py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-700/80">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Company Name & Work Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. TechNova Solutions"
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Work Email</label>
                <input
                  type="email"
                  required
                  value={workEmail}
                  onChange={(e) => setWorkEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Row 2: Company Website & Company Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Company Website</label>
                <input
                  type="text"
                  required
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  placeholder="https://technova.io"
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Company Size</label>
                <div className="relative">
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                  >
                    {COMPANY_SIZES.map((size) => (
                      <option key={size} value={size} className="bg-slate-900 text-white">
                        {size} employees
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            {/* Row 3: Industry */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Industry</label>
              <div className="relative">
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind} className="bg-slate-900 text-white">
                      {ind}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Row 4: Contact Person & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Contact Person</label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Row 5: Password */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide uppercase transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Setting up Recruiter Portal...</span>
                  </>
                ) : (
                  <>
                    <span>Create Recruiter Account</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer switches */}
          <div className="mt-6 pt-6 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <span>
              Already have an account?{" "}
              <Link to="/login" className="text-blue-400 font-bold hover:underline">
                Sign in
              </Link>
            </span>
            <Link to="/signup?role=student" className="text-slate-400 hover:text-white font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">school</span>
              Student / Candidate Sign up
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default EmployerSignup;
