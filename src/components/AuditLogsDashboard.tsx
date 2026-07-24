import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, Download, Filter, Loader2, RefreshCw, ShieldCheck, UserCircle2 } from "lucide-react";

interface AuditLog {
  id: number;
  actor_type: "admin" | "user" | "system" | "anonymous";
  actor_identifier: string | null;
  actor_role: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  admin_full_name: string | null;
  admin_username: string | null;
  user_full_name: string | null;
  user_email: string | null;
}

interface AuditSummaryCount {
  total: number;
  action: string;
}

interface AuditRoleCount {
  total: number;
  actor_role: string;
}

interface AuditResponse {
  success: boolean;
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    total: number;
    actionCount: number;
    resourceCount: number;
    topActions: AuditSummaryCount[];
    actorRoles: AuditRoleCount[];
  };
}

interface FiltersState {
  actorType: string;
  actorRole: string;
  action: string;
  resourceType: string;
  q: string;
  startDate: string;
  endDate: string;
}

const initialFilters: FiltersState = {
  actorType: "",
  actorRole: "",
  action: "",
  resourceType: "",
  q: "",
  startDate: "",
  endDate: "",
};

const actorTypeOptions = ["admin", "user", "system", "anonymous"];
const quickFilters = [
  { label: "Failed Logins", q: "failed", action: "" },
  { label: "Deletions", q: "deleted", action: "" },
  { label: "Fraud Flags", q: "fraud", action: "" },
  { label: "G2B Decisions", q: "g2b_audit", action: "" },
];

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-ET", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const formatKey = (value: string | null) =>
  value
    ? value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "Unknown";

const getActorLabel = (log: AuditLog) => {
  if (log.admin_full_name || log.admin_username) {
    return `${log.admin_full_name || log.admin_username} (${log.admin_username || log.actor_identifier || "admin"})`;
  }

  if (log.user_full_name || log.user_email) {
    return `${log.user_full_name || log.user_email} (${log.user_email || log.actor_identifier || "user"})`;
  }

  return log.actor_identifier || "System";
};

const getBadgeClasses = (value: string) => {
  if (value.includes("failed") || value.includes("fraud")) {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (value.includes("logout") || value.includes("deleted") || value.includes("removed")) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (value.includes("verified") || value.includes("success") || value.includes("created")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  return "bg-slate-50 text-slate-700 border-slate-200";
};

const SummaryCard = ({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <p className="text-[11px] font-black uppercase tracking-[0.28em] text-malazone-navy">{label}</p>
    <h3 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-malazone-navy">{value}</h3>
    <p className="mt-2 text-sm text-slate-500">{helper}</p>
  </div>
);

const AuditLogsDashboard: React.FC = () => {
  const [filters, setFilters] = useState<FiltersState>(initialFilters);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AuditResponse | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "25");

    Object.entries(filters).forEach(([key, value]) => {
      if (value.trim()) {
        params.set(key, value.trim());
      }
    });

    return params.toString();
  }, [filters, page]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/audit-logs?${queryString}`, {
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load audit logs");
      }

      setData(result);
      setSelectedLog((current) => {
        if (!current) return result.logs[0] || null;
        return result.logs.find((item: AuditLog) => item.id === current.id) || result.logs[0] || null;
      });
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
      setError(err instanceof Error ? err.message : "Failed to load audit logs");
      setData(null);
      setSelectedLog(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLogs();
  }, [queryString]);

  const handleFilterChange = (key: keyof FiltersState, value: string) => {
    setPage(1);
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setPage(1);
    setFilters(initialFilters);
  };

  const applyQuickFilter = (quickFilter: { label: string; q: string; action: string }) => {
    setPage(1);
    setFilters((current) => ({
      ...current,
      q: quickFilter.q,
      action: quickFilter.action,
    }));
  };

  const exportCsv = async () => {
    setExporting(true);
    setError(null);

    try {
      const params = new URLSearchParams(queryString);
      params.set("format", "csv");
      params.set("limit", "1000");

      const response = await fetch(`/api/admin/audit-logs?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({ message: "Failed to export audit logs" }));
        throw new Error(result.message || "Failed to export audit logs");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export audit logs:", err);
      setError(err instanceof Error ? err.message : "Failed to export audit logs");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="flex items-center gap-3 text-xl sm:text-2xl font-black tracking-tight text-malazone-navy">
              <ShieldCheck className="h-6 w-6 text-[#00A86B]" />
              Audit Logs
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Review high-value admin and compliance activity with actor, action, and resource traceability.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={exportCsv}
              disabled={exporting}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-malazone-navy transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-4 w-4 text-[#00A86B]" />
              {exporting ? "Exporting..." : "Export CSV"}
            </button>

            <button
              onClick={() => void fetchLogs()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-malazone-navy transition hover:bg-slate-100"
            >
              <RefreshCw className="h-4 w-4 text-[#00A86B]" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        <SummaryCard
          label="Total Events"
          value={(data?.summary.total || 0).toLocaleString()}
          helper="All audit events matching the current filter set."
        />
        <SummaryCard
          label="Action Types"
          value={(data?.summary.actionCount || 0).toLocaleString()}
          helper="Distinct action names currently visible."
        />
        <SummaryCard
          label="Resources"
          value={(data?.summary.resourceCount || 0).toLocaleString()}
          helper="Distinct resource families touched by operations."
        />
        <SummaryCard
          label="Current Page"
          value={`${data?.pagination.page || 1}/${data?.pagination.totalPages || 1}`}
          helper="Paginated view for faster triage of activity history."
        />
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <Filter className="h-5 w-5 text-[#00A86B]" />
              <h3 className="text-lg font-black tracking-tight text-malazone-navy">Filters</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <input
                type="text"
                value={filters.q}
                onChange={(event) => handleFilterChange("q", event.target.value)}
                placeholder="Search actor, action, resource..."
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-malazone-navy placeholder:text-slate-400 focus:border-[#00A86B]/50 focus:bg-white focus:outline-none"
              />

              <select
                value={filters.actorType}
                onChange={(event) => handleFilterChange("actorType", event.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-malazone-navy focus:border-[#00A86B]/50 focus:bg-white focus:outline-none"
              >
                <option value="">All actor types</option>
                {actorTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {formatKey(option)}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={filters.actorRole}
                onChange={(event) => handleFilterChange("actorRole", event.target.value)}
                placeholder="Role, e.g. super_admin"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-malazone-navy placeholder:text-slate-400 focus:border-[#00A86B]/50 focus:bg-white focus:outline-none"
              />

              <input
                type="text"
                value={filters.action}
                onChange={(event) => handleFilterChange("action", event.target.value)}
                placeholder="Exact action, e.g. listing_verified"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-malazone-navy placeholder:text-slate-400 focus:border-[#00A86B]/50 focus:bg-white focus:outline-none"
              />

              <input
                type="text"
                value={filters.resourceType}
                onChange={(event) => handleFilterChange("resourceType", event.target.value)}
                placeholder="Resource, e.g. listing"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-malazone-navy placeholder:text-slate-400 focus:border-[#00A86B]/50 focus:bg-white focus:outline-none"
              />

              <input
                type="date"
                value={filters.startDate}
                onChange={(event) => handleFilterChange("startDate", event.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-malazone-navy focus:border-[#00A86B]/50 focus:bg-white focus:outline-none"
              />

              <input
                type="date"
                value={filters.endDate}
                onChange={(event) => handleFilterChange("endDate", event.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-malazone-navy focus:border-[#00A86B]/50 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="mt-5 space-y-4">
              <p className="text-sm text-slate-500">
                Narrow the feed to suspicious failures, role misuse, or recent resource changes.
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {quickFilters.map((quickFilter) => (
                  <button
                    key={quickFilter.label}
                    onClick={() => applyQuickFilter(quickFilter)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-malazone-navy transition hover:border-[#00A86B]/30 hover:bg-[#00A86B]/5"
                  >
                    {quickFilter.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  onClick={clearFilters}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-malazone-navy transition hover:bg-slate-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-black tracking-tight text-malazone-navy">Activity Stream</h3>
                  <p className="text-sm text-slate-500">Newest events first with actor and resource context.</p>
                </div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-malazone-navy">
                  {data?.pagination.total || 0} matching events
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-[#00A86B]" />
              </div>
            ) : error ? (
              <div className="flex items-center gap-3 px-6 py-10 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm font-semibold">{error}</p>
              </div>
            ) : data?.logs.length ? (
              <>
                <div className="divide-y divide-slate-100">
                  {data.logs.map((log) => (
                    <button
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`w-full px-6 py-5 text-left transition ${
                        selectedLog?.id === log.id ? "bg-[#00A86B]/5" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${getBadgeClasses(log.action)}`}>
                              {formatKey(log.action)}
                            </span>
                            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-600">
                              {formatKey(log.resource_type)}
                              {log.resource_id ? ` #${log.resource_id}` : ""}
                            </span>
                          </div>

                          <div>
                            <p className="text-sm font-bold text-malazone-navy">{getActorLabel(log)}</p>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                              {formatKey(log.actor_type)}
                              {log.actor_role ? ` • ${formatKey(log.actor_role)}` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1 text-left lg:text-right">
                          <p className="text-sm font-bold text-malazone-navy">{formatDateTime(log.created_at)}</p>
                          <p className="text-xs text-slate-400">{log.ip_address || "No IP recorded"}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Page {data.pagination.page} of {data.pagination.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((current) => Math.max(current - 1, 1))}
                      disabled={data.pagination.page <= 1}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-malazone-navy transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((current) => Math.min(current + 1, data.pagination.totalPages))}
                      disabled={data.pagination.page >= data.pagination.totalPages}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-malazone-navy transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-lg font-bold text-malazone-navy">No audit events match these filters.</p>
                <p className="mt-2 text-sm text-slate-500">Try broadening the search or clearing the current filters.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black tracking-tight text-malazone-navy">Top Actions</h3>
            <div className="mt-5 space-y-4">
              {data?.summary.topActions.length ? (
                data.summary.topActions.map((item) => (
                  <div key={item.action} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="text-sm font-bold text-malazone-navy">{formatKey(item.action)}</span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#00A86B] shadow-sm">
                      {item.total}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No actions available for the current filter set.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black tracking-tight text-malazone-navy">Actor Roles</h3>
            <div className="mt-5 space-y-4">
              {data?.summary.actorRoles.length ? (
                data.summary.actorRoles.map((item) => (
                  <div key={item.actor_role} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="text-sm font-bold text-malazone-navy">{formatKey(item.actor_role)}</span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#00A86B] shadow-sm">
                      {item.total}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No role distribution is available yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <UserCircle2 className="h-5 w-5 text-[#00A86B]" />
              <h3 className="text-lg font-black tracking-tight text-malazone-navy">Event Details</h3>
            </div>

            {selectedLog ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Actor</p>
                  <p className="mt-2 text-sm font-bold text-malazone-navy">{getActorLabel(selectedLog)}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatKey(selectedLog.actor_type)}
                    {selectedLog.actor_role ? ` • ${formatKey(selectedLog.actor_role)}` : ""}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Action</p>
                    <p className="mt-2 text-sm font-bold text-malazone-navy">{formatKey(selectedLog.action)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Resource</p>
                    <p className="mt-2 text-sm font-bold text-malazone-navy">
                      {formatKey(selectedLog.resource_type)}
                      {selectedLog.resource_id ? ` #${selectedLog.resource_id}` : ""}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Request Metadata</p>
                  <div className="mt-3 space-y-2 text-sm text-malazone-navy">
                    <p><span className="font-bold">Timestamp:</span> {formatDateTime(selectedLog.created_at)}</p>
                    <p><span className="font-bold">IP:</span> {selectedLog.ip_address || "No IP recorded"}</p>
                    <p className="break-all"><span className="font-bold">User-Agent:</span> {selectedLog.user_agent || "No user-agent recorded"}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-950 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-300">Payload Snapshot</p>
                  <pre className="mt-3 max-h-[360px] overflow-auto whitespace-pre-wrap break-words text-xs text-slate-100">
                    {JSON.stringify(selectedLog.details || {}, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-sm text-slate-500">Select an event from the activity stream to inspect its details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsDashboard;
