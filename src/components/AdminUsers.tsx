/**
 * AdminUsers.tsx
 * Malazone.com — User Management for Super Admin
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Save, X, ShieldCheck, User } from "lucide-react";
import { useAdminAuth, AdminUser } from "../contexts/AdminAuthContext";

interface AdminUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: AdminUser;
  onSuccess: () => void;
}

const AdminUserModal: React.FC<AdminUserModalProps> = ({ isOpen, onClose, user, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: user?.username || "",
    full_name: user?.full_name || "",
    role: (user?.role || "admin") as any,
    password: ""
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      if (user) {
        // Update existing user
        const updateData: any = {
          username: formData.username,
          full_name: formData.full_name,
          role: formData.role
        };
        if (formData.password) updateData.password = formData.password;

        const response = await fetch(`/api/admin/users/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updateData)
        });
        const result = await response.json();
        if (result.success) {
          onSuccess();
          onClose();
        }
      } else {
        // Create new user
        const response = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (result.success) {
          onSuccess();
          onClose();
        }
      }
    } catch (err) {
      console.error("Failed to save admin user:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xl font-bold text-malazone-navy">{user ? "Edit Admin" : "Add New Admin"}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-malazone-navy hover:text-malazone-navy">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-malazone-navy">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all"
              placeholder="Enter username"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-malazone-navy">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all"
              placeholder="Enter full name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-malazone-navy">Role</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value as "super_admin" | "admin" | "g2b_municipality" | "g2b_transport"
                })
              }
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all appearance-none"
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
              <option value="g2b_municipality">Municipality</option>
              <option value="g2b_transport">Transport Bureau</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-malazone-navy">Password {user ? "(optional)" : ""}</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-malazone-navy focus:outline-none focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 transition-all"
              placeholder={user ? "Enter new password (leave blank to keep current)" : "Enter password"}
            />
          </div>
        </div>
        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-malazone-navy hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 rounded-xl font-bold bg-[#00A86B] text-white shadow-xl shadow-[#00A86B]/25 hover:bg-[#00A86B]/90 transition-all flex items-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminUsers: React.FC = () => {
  const { user: currentUser } = useAdminAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | undefined>();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setAdminUsers(result.users);
      }
    } catch (err) {
      console.error("Failed to load admin users:", err);
      setAdminUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this admin user?")) return;

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        await loadUsers();
      }
    } catch (err) {
      console.error("Failed to delete admin user:", err);
    }
  };

  const handleAdd = () => {
    setEditingUser(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-malazone-navy tracking-tight flex items-center gap-3">
            <User className="w-6 h-6 text-[#00A86B]" />
            Admin Users
          </h2>
          <p className="text-xs font-bold text-malazone-navy uppercase tracking-widest">Manage administrator accounts</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-[#00A86B] hover:bg-[#00A86B]/90 text-white shadow-xl shadow-[#00A86B]/25 transition-all font-bold text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Admin
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#00A86B]/30 border-t-[#00A86B]"></div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-malazone-navy">User</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-malazone-navy">Role</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-malazone-navy">Status</th>
                <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-malazone-navy">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adminUsers.map((adminUser) => (
                <tr key={adminUser.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-[#00A86B] to-[#008F5B] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {adminUser.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-malazone-navy">{adminUser.full_name}</p>
                        <p className="text-xs text-malazone-navy font-mono">{adminUser.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-full ${adminUser.role === "super_admin"
                        ? "bg-[#00A86B]/10 text-[#00A86B]"
                        : "bg-blue-50 text-blue-700"
                      }`}>
                      <ShieldCheck className="w-3 h-3" />
                      {adminUser.role === "super_admin"
                        ? "Super Admin"
                        : adminUser.role === "g2b_municipality"
                          ? "Municipality"
                          : adminUser.role === "g2b_transport"
                            ? "Transport Bureau"
                            : "Admin"}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-full ${adminUser.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                      }`}>
                      {adminUser.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-5 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(adminUser)}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-malazone-navy hover:bg-slate-100 hover:text-malazone-navy transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {adminUser.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDelete(adminUser.id)}
                        className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 hover:bg-red-100 hover:text-red-700 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AdminUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={editingUser}
        onSuccess={loadUsers}
      />
    </div>
  );
};

export default AdminUsers;
