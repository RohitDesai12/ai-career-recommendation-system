import React, { useState, useEffect } from "react";
import { LegalTrustLayout } from "./legal-trust-layout";
import { useLocation } from "react-router";
import { useAuth } from "../../context/auth-context";
import axios from "axios";
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Shield,
  RefreshCw,
  FileText
} from "lucide-react";

export function ContactPage() {
  const { user } = useAuth();
  const location = useLocation();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("general_enquiry");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Read category query parameter if passed (e.g. /contact?category=privacy_request)
    const params = new URLSearchParams(location.search);
    const cat = params.get("category");
    if (cat) {
      setCategory(cat);
    }
  }, [location.search]);

  useEffect(() => {
    if (user) {
      if (!name) setName(user.name || "");
      if (!email) setEmail(user.email || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const token = localStorage.getItem("token");
    const headers = token ? { "x-auth-token": token } : undefined;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/privacy/contact",
        {
          name,
          email,
          subject,
          category,
          message,
        },
        { headers }
      );

      setSubmittedTicket(res.data.ticketId);
      setSubject("");
      setMessage("");
    } catch (err: any) {
      console.error("Error submitting contact request:", err);
      setError(err.response?.data?.msg || "Failed to submit request. Please verify all fields.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LegalTrustLayout
      title="Contact Us & Inquiries"
      subtitle="Submit general inquiries, technical support tickets, privacy rights requests, or security reports directly to our team."
      lastUpdated="November 2026"
      badge="Support & Grievances"
    >
      <div className="space-y-8">
        
        {/* Success Confirmation Card */}
        {submittedTicket ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-4 not-prose animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-emerald-900">
                  Request Successfully Submitted
                </h3>
                <p className="text-xs text-emerald-700">
                  Reference Ticket ID: <span className="font-mono font-bold text-emerald-900">{submittedTicket}</span>
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
              Your inquiry has been logged in our centralized support and privacy queue. An administrator will review your submission and reply to <span className="font-semibold">{email}</span> within 24 to 48 hours.
            </p>

            <button
              type="button"
              onClick={() => setSubmittedTicket(null)}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Submit Another Inquiry
            </button>
          </div>
        ) : (
          /* Submission Form */
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">
                Submit an Inquiry or Request
              </h2>
              <p className="text-xs text-slate-500">
                Please provide accurate details so our team can investigate and respond promptly.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 not-prose">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Your Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@university.edu"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Category of Request</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="general_enquiry">General Enquiry</option>
                    <option value="technical_issue">Technical Issue / Bug Report</option>
                    <option value="privacy_request">Privacy Request (DPDP / GDPR)</option>
                    <option value="data_deletion">Data Deletion Request</option>
                    <option value="data_export">Data Export Assistance</option>
                    <option value="security_concern">Security Concern / Vulnerability</option>
                    <option value="feedback">Product Feedback & Suggestion</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of your inquiry"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Detailed Message</label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide context, page URLs, or specific questions..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none resize-y"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Expected response time: 24–48 business hours.
                </span>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{loading ? "Submitting..." : "Submit Inquiry"}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Alternative Support Channels */}
        <section className="pt-6 border-t border-slate-100 space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Self-Service Options & Common Topics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 not-prose text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800 block">Immediate Data Export</span>
              <p className="text-slate-500 leading-snug">
                Download a machine-readable JSON archive of your personal records from Settings.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800 block">Immediate Account Deletion</span>
              <p className="text-slate-500 leading-snug">
                Perform self-service permanent erasure through the Data & Account tab in Settings.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800 block">Frequently Asked Questions</span>
              <p className="text-slate-500 leading-snug">
                Check our extensive FAQ library for answers to common questions about scores and jobs.
              </p>
            </div>
          </div>
        </section>

      </div>
    </LegalTrustLayout>
  );
}

export default ContactPage;

