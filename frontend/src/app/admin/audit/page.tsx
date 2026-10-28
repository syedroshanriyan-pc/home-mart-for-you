"use client";

import React, { useState, useEffect } from "react";
import { History, RefreshCw, UserCheck, ShieldAlert, FileText } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadataJson: string | null;
  createdAt: string;
  actor: {
    name: string;
    role: string;
    mobile?: string;
  } | null;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/audit");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-charcoal-700">System Audit Trail</h1>
          <p className="text-xs text-charcoal-400 mt-1">
            Immutable log of all price updates, status changes, settings alterations, and role actions.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-3 py-2 bg-cream-200 hover:bg-cream-300 text-charcoal-700 text-xs font-semibold rounded-xl transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-cream-300 overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100 text-charcoal-500 font-semibold border-b border-cream-200">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Entity</th>
                <th className="px-6 py-4">Details / Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-charcoal-400">
                    {loading ? "Loading audit trail..." : "No audit entries recorded yet."}
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  let metadataObj: any = null;
                  try {
                    if (log.metadataJson) {
                      metadataObj = JSON.parse(log.metadataJson);
                    }
                  } catch (e) {
                    metadataObj = log.metadataJson;
                  }

                  return (
                    <tr key={log.id} className="hover:bg-cream-50/60 transition">
                      <td className="px-6 py-4 font-mono text-charcoal-500 text-[11px] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-charcoal-800">
                            {log.actor?.name || "System Automated"}
                          </span>
                          {log.actor?.role && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cream-200 text-charcoal-600 font-medium">
                              {log.actor.role}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-crimson-700 bg-crimson-50 border border-crimson-200 px-2 py-0.5 rounded text-[11px] font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-charcoal-600">
                        {log.entityType} {log.entityId ? `(#${log.entityId.slice(-6)})` : ""}
                      </td>
                      <td className="px-6 py-4 max-w-md">
                        {metadataObj ? (
                          <pre className="text-[10px] font-mono text-charcoal-600 bg-cream-100 p-2 rounded-lg overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(metadataObj, null, 2)}
                          </pre>
                        ) : (
                          <span className="text-charcoal-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
