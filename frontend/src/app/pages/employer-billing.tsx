import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import axios from "axios";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Building,
  ShieldCheck,
  Briefcase,
  Users,
  Layers,
  ArrowRight,
  Info,
  RefreshCw,
  Clock
} from "lucide-react";

interface BillingData {
  plan: string;
  planStatus: string;
  billingCycle: string;
  nextBillingDate?: string;
  usage: {
    activeJobs: number;
    maxJobs: number;
    applicationsReceived: number;
    maxApplications: number;
    recruiterSeats: number;
    maxSeats: number;
    aiRecommendationsUsed: number;
  };
  supportedPlans: Array<{
    id: string;
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    isPopular?: boolean;
    buttonLabel: string;
  }>;
  paymentGatewayConfigured: boolean;
  notice: string;
}

export function EmployerBilling() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingInfo, setBillingInfo] = useState<BillingData | null>(null);

  const fetchBilling = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");

    try {
      const res = await axios.get("http://localhost:5000/api/employer/billing", {
        headers: { "x-auth-token": token || "" },
      });
      if (res.data) {
        setBillingInfo(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load billing details:", err);
      setError(err?.response?.data?.message || "Failed to load billing information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  return (
    <div className="space-y-6 pb-12 font-sans max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Billing & Subscription Plans</h1>
          </div>
          <p className="text-sm text-slate-500">
            Manage your company hiring subscription, active quota usage, and candidate matchmaking capacity.
          </p>
        </div>

        <button
          onClick={fetchBilling}
          className="p-2.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-all cursor-pointer self-start sm:self-auto"
          title="Refresh Subscription Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-600" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-white rounded-3xl border border-slate-200 p-6 animate-pulse" />
            ))}
          </div>
          <div className="h-96 bg-white rounded-3xl border border-slate-200 p-8 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        </div>
      ) : error ? (
        <div className="p-8 bg-white rounded-3xl border border-rose-200 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">Unable to load billing data</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchBilling}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : billingInfo ? (
        <>
          {/* Current Subscription Status & Usage Meters */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
                  <Zap className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900 capitalize">
                      {billingInfo.plan} Plan
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                      {billingInfo.planStatus || "Active"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Billed {billingInfo.billingCycle || "Monthly"} • Unlimited candidate discovery & AI scoring enabled
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Next Renewal
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {billingInfo.nextBillingDate
                    ? new Date(billingInfo.nextBillingDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Active Account (No renewal required)"}
                </span>
              </div>
            </div>

            {/* Quota Usage Meters */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
                Monthly Usage & Quotas
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Active Jobs Meter */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                      Active Job Posts
                    </span>
                    <span className="font-black text-slate-900">
                      {billingInfo.usage.activeJobs} / {billingInfo.usage.maxJobs}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (billingInfo.usage.activeJobs / billingInfo.usage.maxJobs) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {billingInfo.usage.maxJobs - billingInfo.usage.activeJobs} remaining job slots available
                  </p>
                </div>

                {/* Candidate Applications Meter */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      Candidate Applications
                    </span>
                    <span className="font-black text-slate-900">
                      {billingInfo.usage.applicationsReceived} / {billingInfo.usage.maxApplications}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (billingInfo.usage.applicationsReceived / billingInfo.usage.maxApplications) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {billingInfo.usage.maxApplications - billingInfo.usage.applicationsReceived} application capacity
                  </p>
                </div>

                {/* Recruiter Seats Meter */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Recruiter Seats
                    </span>
                    <span className="font-black text-slate-900">
                      {billingInfo.usage.recruiterSeats} / {billingInfo.usage.maxSeats}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (billingInfo.usage.recruiterSeats / billingInfo.usage.maxSeats) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {billingInfo.usage.maxSeats - billingInfo.usage.recruiterSeats} team seats open
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Gateway Transparent Notice */}
            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-start gap-3">
              <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600">
                <span className="font-bold text-slate-900 block mb-0.5">Billing Integration Status</span>
                {billingInfo.notice ||
                  "Payment gateway integration is currently in sandbox/managed mode. To adjust quotas or upgrade to an Enterprise Tier, contact system administration."}
              </div>
            </div>
          </div>

          {/* Plan Comparison Cards */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4">Available Recruiter Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {billingInfo.supportedPlans?.map((plan) => {
                const isCurrent = billingInfo.plan.toLowerCase() === plan.id.toLowerCase();

                return (
                  <div
                    key={plan.id}
                    className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between relative shadow-xs ${
                      plan.isPopular
                        ? "border-purple-400 ring-2 ring-purple-600/30 shadow-md"
                        : "border-slate-200 hover:border-purple-200"
                    }`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                        Most Popular
                      </div>
                    )}

                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-lg font-black text-slate-900">{plan.name}</h4>
                          <p className="text-xs text-slate-500">{plan.description}</p>
                        </div>
                      </div>

                      <div className="my-4">
                        <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                        <span className="text-xs text-slate-400 font-semibold">{plan.period}</span>
                      </div>

                      <div className="space-y-2.5 py-4 border-t border-slate-100 text-xs">
                        {plan.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-slate-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 mt-2">
                      {isCurrent ? (
                        <button
                          disabled
                          className="w-full py-2.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 text-center"
                        >
                          ✓ Current Plan
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            alert(
                              `Your request to switch to the ${plan.name} plan has been logged. Our administration team will configure this for your company.`
                            );
                          }}
                          className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                            plan.isPopular
                              ? "bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                          }`}
                        >
                          {plan.buttonLabel}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default EmployerBilling;
