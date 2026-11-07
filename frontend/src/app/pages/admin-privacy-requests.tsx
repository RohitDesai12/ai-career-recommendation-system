import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  RefreshCw,
  FileText,
  Trash2,
  Download,
  Lock,
  Mail,
  Sliders,
  X
} from "lucide-react";

interface PrivacyRequestItem {
  _id: string;
  ticketId: string;
  userName: string;
  userEmail: string;
  requestType: string;
  subject: string;
  message: string;
  status: "Pending" | "Under Review" | "Processing" | "Completed" | "Rejected";
  resolutionNotes?: string;
  rejectionReason?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export function AdminPrivacyRequests() {
  const [requests, setRequests] = useState<PrivacyRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<PrivacyRequestItem | null>(null);

  // Modal Action Form State
  const [updateStatus, setUpdateStatus] = useState<"Pending" | "Under Review" | "Processing" | "Completed" | "Rejected">("Under Review");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [updating, setUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = token ? { "x-auth-token": token } : undefined;

    try {
      const params = new URLSearchParams();
      if (statusFilter !== "All") params.append("status", statusFilter);
      if (categoryFilter !== "All") params.append("category", categoryFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await axios.get(`http://localhost:5000/api/privacy/admin/requests?${params.toString()}`, { headers });
      setRequests(res.data.requests || []);
      setTotal(res.data.pagination?.total || 0);
    } catch (err) {
      console.error("Error fetching admin privacy requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequests();
  };

  const openActionModal = (req: PrivacyRequestItem) => {
    setSelectedRequest(req);
    setUpdateStatus(req.status);
    setResolutionNotes(req.resolutionNotes || "");
    setRejectionReason(req.rejectionReason || "");
    setStatusMessage("");
  };

  const handleUpdateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setUpdating(true);
    setStatusMessage("");
    const token = localStorage.getItem("token");
    const headers = token ? { "x-auth-token": token } : undefined;

    try {
      await axios.put(
        `http://localhost:5000/api/privacy/admin/requests/${selectedRequest._id}`,
        {
          status: updateStatus,
          resolutionNotes,
          rejectionReason,
        },
        { headers }
      );

      setStatusMessage("Request status and audit log updated successfully!");
      setTimeout(() => {
        setSelectedRequest(null);
        fetchRequests();
      }, 1000);
    } catch (err: any) {
      console.error("Error updating request:", err);
      setStatusMessage("Failed to update request.");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Pending</span>;
      case "Under Review":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">Under Review</span>;
      case "Processing":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">Processing</span>;
      case "Completed":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Completed</span>;
      case "Rejected":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">Rejected</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "data_deletion":
        return <Trash2 className="w-3.5 h-3.5 text-rose-600" />;
      case "data_export":
        return <Download className="w-3.5 h-3.5 text-indigo-600" />;
      case "security_concern":
        return <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />;
      case "privacy_request":
        return <Lock className="w-3.5 h-3.5 text-sky-600" />;
      default:
        return <Mail className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Privacy, Security & Support Requests
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational center for Data Subject Access Requests (DSAR), account deletion logs, security disclosures, and contact tickets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-bold text-slate-600 bg-white px-3.5 py-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
            Open Tickets: <span className="text-indigo-600 font-black">{requests.filter((r) => r.status === "Pending" || r.status === "Under Review").length}</span>
          </div>
          <button
            type="button"
            onClick={fetchRequests}
            className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="Refresh requests"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl overflow-x-auto text-xs font-bold">
            {["All", "Pending", "Under Review", "Processing", "Completed", "Rejected"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === st ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Ticket ID, email, subject..."
              className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
            />
          </form>

        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] mr-1">Category:</span>
          {[
            { id: "All", label: "All Categories" },
            { id: "privacy_request", label: "Privacy Request (DSAR)" },
            { id: "data_deletion", label: "Account Deletion" },
            { id: "data_export", label: "Data Export" },
            { id: "security_concern", label: "Security Incident" },
            { id: "general_enquiry", label: "General Support" },
            { id: "technical_issue", label: "Technical Issue" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer ${
                categoryFilter === cat.id
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-500 text-xs flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
            <span>Loading privacy and support requests...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs">
            No requests matching the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-100">
              <thead className="bg-slate-50 font-bold text-slate-700">
                <tr>
                  <th className="p-3.5">Ticket ID</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">User & Email</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-indigo-700">
                      {req.ticketId}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        {getCategoryIcon(req.requestType)}
                        <span className="capitalize">{req.requestType.replace(/_/g, " ")}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 block">{req.userName}</span>
                        <span className="text-[11px] text-slate-400 block">{req.userEmail}</span>
                      </div>
                    </td>
                    <td className="p-3.5 max-w-xs truncate font-medium text-slate-800" title={req.subject}>
                      {req.subject}
                    </td>
                    <td className="p-3.5">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="p-3.5 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => openActionModal(req)}
                        className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INSPECT & UPDATE ACTION MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700">
                    {selectedRequest.ticketId}
                  </span>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <h3 className="text-base font-bold text-slate-900 pt-1">
                  {selectedRequest.subject}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User & Metadata */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Requesting Principal:</span>
                <span className="font-bold text-slate-900">{selectedRequest.userName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Email Address:</span>
                <span className="font-bold text-slate-900">{selectedRequest.userEmail}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Request Category:</span>
                <span className="font-bold text-slate-900 capitalize">{selectedRequest.requestType.replace(/_/g, " ")}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Submitted Timestamp:</span>
                <span className="font-medium text-slate-700">{new Date(selectedRequest.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-800 block">Detailed Message Body:</span>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {selectedRequest.message}
              </div>
            </div>

            {/* Administrative Resolution Form */}
            <form onSubmit={handleUpdateRequest} className="space-y-4 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-900 block">
                Administrative Action & Audit Resolution:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Set Ticket Status</label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {updateStatus === "Rejected" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-rose-700">Rejection Reason</label>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Identity could not be verified"
                      className="w-full px-3.5 py-2 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-900 outline-none"
                      required={updateStatus === "Rejected"}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Resolution & Audit Log Notes</label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Record verification steps, resolution details, or student communications..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none resize-y"
                />
              </div>

              {statusMessage && (
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-800 text-xs font-semibold">
                  {statusMessage}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {updating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Save Resolution</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminPrivacyRequests;

