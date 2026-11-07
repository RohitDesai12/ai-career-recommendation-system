import React from "react";
import { useRouteError, Link } from "react-router";

export function RouteErrorBoundary() {
  const error = useRouteError() as any;

  console.error("Route error boundary caught error:", error);

  const errorMessage =
    error?.message ||
    (typeof error === "string" ? error : "An unexpected error occurred.");

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[32px]">warning</span>
        </div>

        <h2 className="text-xl font-bold text-slate-100 mb-2">Something went wrong</h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          {errorMessage}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-sm cursor-pointer"
          >
            Reload Page
          </button>
          <Link
            to="/admin/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all text-center"
          >
            Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

