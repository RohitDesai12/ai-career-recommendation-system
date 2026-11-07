import React, { useState, useEffect } from "react";
import axios from "axios";

interface CompanyItem {
  _id: string;
  companyName: string;
  workEmail: string;
  companyWebsite: string;
  industry: string;
  companySize: string;
  contactPerson: string;
  phone: string;
  location: string;
  status: "Pending" | "Verified" | "Suspended" | "Rejected";
  isVerified: boolean;
  activeJobs: number;
  totalJobs: number;
  totalApplications: number;
  createdAt: string;
}

export function AdminCompanies() {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "All") params.append("status", statusFilter);

      const res = await axios.get(`http://localhost:5000/api/admin/companies?${params.toString()}`);
      setCompanies(res.data.companies || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Error fetching companies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCompanies();
  };

  const handleUpdateStatus = async (companyId: string, newStatus: "Verified" | "Suspended" | "Rejected") => {
    setActionLoadingId(companyId);
    try {
      await axios.put(`http://localhost:5000/api/admin/companies/${companyId}/status`, { status: newStatus });
      await fetchCompanies();
    } catch (err) {
      console.error("Error updating company status:", err);
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
            Company Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review registered employer entities, verification credentials, and job volume
          </p>
        </div>
        <div className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          Registered Entities: <span className="text-indigo-600 font-black">{total}</span>
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
            placeholder="Search by company, website, or contact person..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
        </form>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
          {["All", "Pending", "Verified", "Suspended", "Rejected"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined animate-spin text-indigo-600 text-[32px]">
              sync
            </span>
            <p className="text-xs font-semibold text-slate-400 mt-2">Loading company directory...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-2.5">
              <span className="material-symbols-outlined text-[24px]">domain_disabled</span>
            </div>
            <h3 className="text-sm font-bold text-slate-800">No companies found</h3>
            <p className="text-xs text-slate-400 mt-0.5">No registered employer entities match your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Industry & Size</th>
                  <th className="py-3 px-4">Jobs & Apps</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companies.map((c) => {
                  const initials = c.companyName ? c.companyName.slice(0, 2).toUpperCase() : "CO";
                  return (
                    <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{c.companyName}</div>
                            {c.companyWebsite && (
                              <a
                                href={c.companyWebsite}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-indigo-600 hover:underline flex items-center gap-0.5 mt-0.5"
                              >
                                <span>{c.companyWebsite.replace(/^https?:\/\//, "")}</span>
                                <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{c.contactPerson}</div>
                        <div className="text-[11px] text-slate-400">{c.workEmail}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-700">{c.industry || "Technology"}</div>
                        <div className="text-[10.5px] text-slate-400 font-semibold">{c.companySize || "11-50"} employees</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[10.5px]">
                            {c.activeJobs || 0} active jobs
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-[10.5px]">
                            {c.totalApplications || 0} apps
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                            c.status === "Verified"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : c.status === "Pending"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : c.status === "Suspended"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {c.status || "Verified"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {formatDate(c.createdAt)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {c.status !== "Verified" ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(c._id, "Verified")}
                              disabled={actionLoadingId === c._id}
                              className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Verify
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(c._id, "Suspended")}
                              disabled={actionLoadingId === c._id}
                              className="px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Suspend
                            </button>
                          )}
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
