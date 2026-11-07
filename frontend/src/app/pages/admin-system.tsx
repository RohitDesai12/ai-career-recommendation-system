import React, { useState, useEffect } from "react";
import axios from "axios";

interface ServiceItem {
  name: string;
  status: string;
  port?: number;
  host?: string;
  latency: string;
}

interface SystemHealthData {
  status: string;
  timestamp: string;
  uptime: string;
  services: ServiceItem[];
  metrics: {
    heapUsedMB: number;
    rssMB: number;
    nodeVersion: string;
  };
}

export function AdminSystem() {
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/admin/system-health");
      setHealth(res.data);
    } catch (err) {
      console.error("Error fetching system health:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black font-heading text-slate-900 tracking-tight">
            System Health & Infrastructure Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Live telemetry of microservices, database clusters, machine learning endpoints, and background queues
          </p>
        </div>
        <button
          type="button"
          onClick={fetchHealth}
          className="px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200/80 shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          <span>Refresh Health Check</span>
        </button>
      </div>

      {loading || !health ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-indigo-600 text-[36px]">
            sync
          </span>
        </div>
      ) : (
        <>
          {/* Overall Status Banner */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white rounded-3xl p-6 border border-emerald-800/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
                <span className="material-symbols-outlined text-[28px]">check_circle</span>
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10.5px] font-bold mb-1">
                  All Systems Operational
                </span>
                <h2 className="text-lg font-black font-heading tracking-tight text-white">
                  Core Infrastructure Running Smoothly
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Last verified: {new Date(health.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Server Uptime</span>
                <span className="text-sm font-black text-white">{health.uptime}</span>
              </div>
            </div>
          </div>

          {/* Microservices Status Grid */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-bold font-heading text-slate-900">Service Endpoints Status</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {health.services.map((svc, i) => {
                const isOp = svc.status.includes("Operational") || svc.status.includes("Connected");
                return (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isOp ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-amber-500"
                        }`}
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">{svc.name}</div>
                        <div className="text-[10.5px] text-slate-400">
                          {svc.port ? `Port ${svc.port}` : svc.host || "Embedded Process"}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                          isOp
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {svc.status}
                      </span>
                      <div className="text-[10px] text-slate-400 font-semibold mt-1">
                        Latency: {svc.latency}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Node Process Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-400">Heap Memory Used</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{health.metrics.heapUsedMB} MB</div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-400">Resident Memory (RSS)</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{health.metrics.rssMB} MB</div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-400">Runtime Engine</span>
              <div className="text-2xl font-black text-slate-900 mt-1">Node.js {health.metrics.nodeVersion}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
