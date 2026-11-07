import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router";
import { useAuth } from "../context/auth-context";
import { AdminSidebar } from "./admin-sidebar";
import { SidebarProvider, useSidebar } from "../context/sidebar-context";
import axios from "axios";

function AdminLayoutInner() {
  const { user, logout, loading: authLoading } = useAuth();
  const { toggleCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [pendingReports, setPendingReports] = useState(0);

  // Role Guard: Ensure strictly Admin access
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/login");
      } else if (user.role !== "admin") {
        navigate("/dashboard");
      }
    }
  }, [user, authLoading, navigate]);

  // Fetch live pending counts for sidebar badges
  useEffect(() => {
    if (user?.role === "admin") {
      axios
        .get("http://localhost:5000/api/admin/dashboard")
        .then((res) => {
          if (res.data?.pendingApprovals) {
            setPendingReports(res.data.pendingApprovals.reportedContent || 0);
          }
        })
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/users?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (authLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-indigo-400 text-[36px]">
            sync
          </span>
          <p className="text-xs font-semibold text-slate-400">Verifying administrative access...</p>
        </div>
      </div>
    );
  }

  const adminInitials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AD";

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 overflow-hidden font-sans">
      {/* Desktop & Mobile Admin Sidebar */}
      <AdminSidebar
        pendingReportsCount={pendingReports}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-200">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-20">
          {/* Left: Hamburger Button & Global Search Bar */}
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth >= 1024) {
                  toggleCollapsed();
                } else {
                  setIsMobileOpen(!isMobileOpen);
                }
              }}
              className="p-1.5 -ml-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0"
              title="Toggle sidebar navigation"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>

            {/* Global Search Bar */}
            <form onSubmit={handleGlobalSearch} className="relative w-full max-w-lg hidden sm:block">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search users, companies, jobs, applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-16 py-2 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-200/80 text-[10px] font-bold text-slate-500">
                <span>Ctrl</span>
                <span>K</span>
              </div>
            </form>
          </div>

          {/* Right: Notifications & Super Admin Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Notification Bell */}
            <Link
              to="/admin/moderation"
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              title="Notifications & Reports"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {pendingReports > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9.5px] font-black flex items-center justify-center ring-2 ring-white">
                  {pendingReports}
                </span>
              )}
            </Link>

            <div className="h-6 w-px bg-slate-200" />

            {/* Admin User Profile */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2.5 p-1 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 to-purple-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                  {adminInitials}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {user.name || "Admin"}
                  </div>
                  <div className="text-[10.5px] font-medium text-indigo-600">
                    Super Admin
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-[18px]">
                  expand_more
                </span>
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsProfileOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 z-40 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <div className="text-xs font-bold text-slate-900">{user.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                      <span className="mt-1 inline-block px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                        Platform Administrator
                      </span>
                    </div>

                    <Link
                      to="/admin/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-slate-400">
                        manage_accounts
                      </span>
                      <span>Account Settings</span>
                    </Link>

                    <Link
                      to="/admin/system"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-slate-400">
                        dns
                      </span>
                      <span>System Health</span>
                    </Link>

                    <div className="h-px bg-slate-100 my-1" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px] text-rose-500">
                        logout
                      </span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AdminLayout() {
  return (
    <SidebarProvider>
      <AdminLayoutInner />
    </SidebarProvider>
  );
}

export default AdminLayout;
