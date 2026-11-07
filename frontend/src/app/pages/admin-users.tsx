import React, { useState, useEffect } from "react";
import axios from "axios";

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  status: "Active" | "Suspended" | "Pending";
  isVerified: boolean;
  createdAt: string;
}

export function AdminUsers() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (roleFilter !== "All") params.append("role", roleFilter);
      if (statusFilter !== "All") params.append("status", statusFilter);

      const res = await axios.get(`http://localhost:5000/api/admin/users?${params.toString()}`);
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleUpdateStatus = async (userId: string, newStatus: "Active" | "Suspended" | "Pending") => {
    setActionLoadingId(userId);
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/status`, { status: newStatus });
      await fetchUsers();
    } catch (err) {
      console.error("Error updating user status:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleVerification = async (userId: string, current: boolean) => {
    setActionLoadingId(userId);
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/status`, { isVerified: !current });
      await fetchUsers();
    } catch (err) {
      console.error("Error updating user verification:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${userName}"?`)) return;
    setActionLoadingId(userId);
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
      await fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDate = (dStr: string) => {
    if (!dStr) return "N/A";
    return new Date(dStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black font-heading text-slate-900 tracking-tight">
            User Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage authenticated student and administrator accounts
          </p>
        </div>
        <div className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          Total Users: <span className="text-indigo-600 font-black">{total}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Role Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            {["All", "Student", "Admin"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  roleFilter === r ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {r}s
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined animate-spin text-indigo-600 text-[32px]">
              sync
            </span>
            <p className="text-xs font-semibold text-slate-400 mt-2">Loading user records...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2.5">
              <span className="material-symbols-outlined text-[24px]">person_off</span>
            </div>
            <h3 className="text-sm font-bold text-slate-800">No users found</h3>
            <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search query or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const initials = u.name ? u.name.slice(0, 2).toUpperCase() : "US";
                  const isSuspended = u.status === "Suspended";

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-2xs ${
                              u.role === "admin"
                                ? "bg-purple-600"
                                : "bg-blue-600"
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{u.name}</div>
                            <div className="text-[11px] text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                            u.role === "admin"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleVerification(u._id, u.isVerified)}
                          disabled={actionLoadingId === u._id}
                          className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold cursor-pointer transition-colors ${
                            u.isVerified
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {u.isVerified ? "Verified ✓" : "Unverified"}
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                            u.status === "Active"
                              ? "bg-emerald-50 text-emerald-700"
                              : u.status === "Suspended"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {u.status || "Active"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {formatDate(u.createdAt)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isSuspended ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(u._id, "Active")}
                              disabled={actionLoadingId === u._id}
                              className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              Activate
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(u._id, "Suspended")}
                              disabled={actionLoadingId === u._id || u.role === "admin"}
                              className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-[11px] transition-colors cursor-pointer disabled:opacity-40"
                            >
                              Suspend
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            disabled={actionLoadingId === u._id || u.role === "admin"}
                            className="p-1.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-30"
                            title="Delete user"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
