/**
 * OfficerDetailModal.tsx
 * Malazone.com — G2B Officer Detail Modal with Tabs
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  BarChart3,
  FileText,
  Settings,
  AlertTriangle,
  Eye,
  Edit3,
} from "lucide-react";

interface AdminUser {
  id: number;
  username: string;
  full_name: string;
  role: string;
  city: string;
  sub_cities: string[];
  is_active: boolean;
  last_login: string;
  created_at: string;
}

interface AuditLog {
  id: number;
  action: string;
  resource_type: string;
  resource_id: number;
  details: any;
  created_at: string;
}

interface OfficerStats {
  totalProcessed: number;
  totalApproved: number;
  totalRejected: number;
  totalPending: number;
  approvalRate: number;
  avgResponseTime: string;
  thisWeekActivity: number;
  thisMonthActivity: number;
}

interface OfficerDetailModalProps {
  officer: AdminUser | null;
  cityLabel: string;
  onClose: () => void;
  onEdit: (officer: AdminUser) => void;
}

const OfficerDetailModal: React.FC<OfficerDetailModalProps> = ({
  officer,
  cityLabel,
  onClose,
  onEdit,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "queue" | "performance" | "audit" | "settings">("overview");
  const [stats, setStats] = useState<OfficerStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (officer) {
      loadOfficerData();
    }
  }, [officer]);

  const loadOfficerData = async () => {
    if (!officer) return;
    setLoading(true);
    try {
      // Load audit logs for this officer
      const response = await fetch(`/api/admin/audit-logs?actor_id=${officer.id}&limit=50`, {
        credentials: "include",
      });
      const result = await response.json();
      
      if (result.success) {
        setAuditLogs(result.logs || []);
        
        // Calculate stats from audit logs
        const approvals = result.logs.filter((log: AuditLog) => 
          log.action.includes("approve") || log.action.includes("verified")
        ).length;
        const rejections = result.logs.filter((log: AuditLog) => 
          log.action.includes("reject") || log.action.includes("fraud")
        ).length;
        const thisWeek = result.logs.filter((log: AuditLog) => {
          const logDate = new Date(log.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return logDate > weekAgo;
        }).length;
        const thisMonth = result.logs.filter((log: AuditLog) => {
          const logDate = new Date(log.created_at);
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return logDate > monthAgo;
        }).length;

        setStats({
          totalProcessed: result.logs.length,
          totalApproved: approvals,
          totalRejected: rejections,
          totalPending: 0, // Would need separate API
          approvalRate: result.logs.length > 0 ? Math.round((approvals / result.logs.length) * 100) : 0,
          avgResponseTime: "N/A",
          thisWeekActivity: thisWeek,
          thisMonthActivity: thisMonth,
        });
      }
    } catch (err) {
      console.error("Failed to load officer data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!officer) return null;

  const tabs = [
    { id: "overview", label: "Overview", icon: <User className="w-4 h-4" /> },
    { id: "queue", label: "Work Queue", icon: <Activity className="w-4 h-4" /> },
    { id: "performance", label: "Performance", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "audit", label: "Audit Trail", icon: <FileText className="w-4 h-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-[#00A86B]/5 to-transparent">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 bg-gradient-to-br from-[#00A86B] to-[#008F5B] rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {officer.full_name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-black text-malazone-navy">{officer.full_name}</h2>
                <p className="text-sm text-malazone-navy/60 font-mono">@{officer.username}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-3 py-1 text-xs font-black rounded-full ${
                    officer.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {officer.is_active ? "Active" : "Inactive"}
                  </span>
                  <span className="px-3 py-1 text-xs font-black rounded-full bg-blue-100 text-blue-800">
                    {officer.role === "g2b_municipality" ? "Municipality" : "Transport Bureau"}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-malazone-navy/60">
                    <MapPin className="w-3 h-3" />
                    {cityLabel}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-malazone-navy transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 bg-slate-50/50">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-[#00A86B] text-[#00A86B] bg-white"
                    : "border-transparent text-malazone-navy/60 hover:text-malazone-navy hover:bg-slate-100"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-malazone-navy/60" />
                    <span className="text-xs font-bold text-malazone-navy/60 uppercase">Total</span>
                  </div>
                  <p className="text-2xl font-black text-malazone-navy">{stats?.totalProcessed || 0}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-bold text-green-700 uppercase">Approved</span>
                  </div>
                  <p className="text-2xl font-black text-green-700">{stats?.totalApproved || 0}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-bold text-red-700 uppercase">Rejected</span>
                  </div>
                  <p className="text-2xl font-black text-red-700">{stats?.totalRejected || 0}</p>
                </div>
                <div className="p-4 bg-[#00A86B]/10 rounded-xl border border-[#00A86B]/20">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-[#00A86B]" />
                    <span className="text-xs font-bold text-[#00A86B] uppercase">Rate</span>
                  </div>
                  <p className="text-2xl font-black text-[#00A86B]">{stats?.approvalRate || 0}%</p>
                </div>
              </div>

              {/* Jurisdiction Info */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="text-sm font-black text-malazone-navy uppercase tracking-wider mb-3">Jurisdiction</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-malazone-navy/60" />
                    <span className="font-bold text-malazone-navy">{cityLabel}</span>
                  </div>
                  {officer.sub_cities && officer.sub_cities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {officer.sub_cities.map((subCity, idx) => (
                        <span key={idx} className="px-3 py-1 text-xs font-bold bg-white text-malazone-navy rounded-lg border border-slate-200">
                          {subCity}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="text-sm font-black text-malazone-navy uppercase tracking-wider mb-3">Recent Activity</h3>
                <div className="space-y-3">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200">
                      <Activity className="w-4 h-4 text-[#00A86B] mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-malazone-navy">{log.action.replace(/_/g, " ")}</p>
                        <p className="text-xs text-malazone-navy/60">{log.resource_type} #{log.resource_id}</p>
                      </div>
                      <span className="text-xs text-malazone-navy/60 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <p className="text-sm text-malazone-navy/60 text-center py-4">No recent activity</p>
                  )}
                </div>
              </div>

              {/* Account Info */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="text-sm font-black text-malazone-navy uppercase tracking-wider mb-3">Account Info</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-malazone-navy/60 mb-1">Last Login</p>
                    <p className="text-sm font-bold text-malazone-navy">
                      {officer.last_login ? new Date(officer.last_login).toLocaleString() : "Never"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-malazone-navy/60 mb-1">Created</p>
                    <p className="text-sm font-bold text-malazone-navy">
                      {new Date(officer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "queue" && (
            <div className="space-y-4">
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-malazone-navy/20 mx-auto mb-4" />
                <p className="text-lg font-bold text-malazone-navy/60">Work Queue</p>
                <p className="text-sm text-malazone-navy/40 mt-2">Integration with listing verification system</p>
              </div>
            </div>
          )}

          {activeTab === "performance" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-malazone-navy/60" />
                    <span className="text-xs font-bold text-malazone-navy/60 uppercase">This Week</span>
                  </div>
                  <p className="text-3xl font-black text-malazone-navy">{stats?.thisWeekActivity || 0}</p>
                  <p className="text-xs text-malazone-navy/60 mt-1">Actions taken</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-malazone-navy/60" />
                    <span className="text-xs font-bold text-malazone-navy/60 uppercase">This Month</span>
                  </div>
                  <p className="text-3xl font-black text-malazone-navy">{stats?.thisMonthActivity || 0}</p>
                  <p className="text-xs text-malazone-navy/60 mt-1">Actions taken</p>
                </div>
              </div>

              <div className="p-8 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <BarChart3 className="w-16 h-16 text-malazone-navy/20 mx-auto mb-4" />
                <p className="text-lg font-bold text-malazone-navy/60">Performance Charts</p>
                <p className="text-sm text-malazone-navy/40 mt-2">Advanced analytics coming soon</p>
              </div>
            </div>
          )}

          {activeTab === "audit" && (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-[#00A86B]/50 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-[#00A86B] mt-0.5" />
                      <div>
                        <p className="font-bold text-malazone-navy">{log.action.replace(/_/g, " ")}</p>
                        <p className="text-sm text-malazone-navy/60 mt-1">
                          {log.resource_type} #{log.resource_id}
                        </p>
                        {log.details && Object.keys(log.details).length > 0 && (
                          <pre className="text-xs text-malazone-navy/60 mt-2 bg-white p-2 rounded border border-slate-200 overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-malazone-navy/60">{new Date(log.created_at).toLocaleDateString()}</p>
                      <p className="text-xs text-malazone-navy/60">{new Date(log.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-malazone-navy/20 mx-auto mb-4" />
                  <p className="text-lg font-bold text-malazone-navy/60">No audit logs found</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="text-sm font-black text-malazone-navy uppercase tracking-wider mb-3">Officer Management</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      onEdit(officer);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-[#00A86B] hover:bg-[#00A86B]/5 transition-all text-left"
                  >
                    <Edit3 className="w-5 h-5 text-[#00A86B]" />
                    <div>
                      <p className="font-bold text-malazone-navy">Edit Officer Details</p>
                      <p className="text-xs text-malazone-navy/60">Update name, jurisdiction, or role</p>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-bold text-malazone-navy">View Full Audit Log</p>
                      <p className="text-xs text-malazone-navy/60">See complete activity history</p>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-red-200 hover:border-red-500 hover:bg-red-50 transition-all text-left">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-bold text-malazone-navy">
                        {officer.is_active ? "Deactivate Officer" : "Activate Officer"}
                      </p>
                      <p className="text-xs text-malazone-navy/60">
                        {officer.is_active ? "Suspend access to admin panel" : "Restore access to admin panel"}
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 bg-slate-50/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-malazone-navy hover:bg-slate-100 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfficerDetailModal;
