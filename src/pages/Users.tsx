import { useEffect, useState, FormEvent } from "react";
import { adminService, authService } from "../services/api";
import { User } from "../types";
import { ShieldAlert, Trash2, UserPlus, UserCheck, ShieldCheck, Edit2 } from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add User Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("CLIENT");
  const [savingUser, setSavingUser] = useState(false);

  // Edit User Form state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("CLIENT");
  const [editIsActive, setEditIsActive] = useState(true);
  const [updatingUser, setUpdatingUser] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers();
      if (res.success) setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch system users catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const res = await adminService.updateUserRole(userId, newRole);
      if (res.success) {
        alert("User role updated successfully.");
        loadUsers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update role.");
    }
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditIsActive(user.isActive !== false);
    setShowEditModal(true);
  };

  const handleEditUserSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingUserId || !editName || !editEmail) return;

    setUpdatingUser(true);
    try {
      const res = await adminService.updateUser(editingUserId, {
        name: editName,
        email: editEmail,
        role: editRole,
        isActive: editIsActive,
      });
      if (res.success) {
        alert("User updated successfully.");
        setShowEditModal(false);
        loadUsers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update user.");
    } finally {
      setUpdatingUser(false);
    }
  };

  const handleToggleBlock = async (user: User) => {
    const active = authService.getCurrentUser();
    if (active && active.id === user.id) {
      alert("You cannot block your own logged-in account!");
      return;
    }

    const currentActive = user.isActive !== false;
    const actionText = currentActive ? "block" : "activate";
    if (!confirm(`Are you sure you want to ${actionText} user "${user.name}"?`)) return;

    try {
      const res = await adminService.updateUser(user.id, {
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: !currentActive,
      });
      if (res.success) {
        alert(`User successfully ${currentActive ? "blocked" : "activated"}.`);
        loadUsers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to ${actionText} user.`);
    }
  };

  const handleDelete = async (userId: number) => {
    const active = authService.getCurrentUser();
    if (active && active.id === userId) {
      alert("You cannot delete your own logged-in account!");
      return;
    }

    if (!confirm("Are you sure you want to delete this user record permanently? All deliveries linked to this user may become orphans.")) return;
    try {
      const res = await adminService.deleteUser(userId);
      if (res.success) {
        alert("User successfully deleted.");
        loadUsers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete user.");
    }
  };

  const handleAddUserSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setSavingUser(true);
    try {
      const res = await authService.register(name, email, role);
      if (res.success) {
        alert("User created successfully (default password: password123).");
        setShowAddModal(false);
        setName("");
        setEmail("");
        setRole("CLIENT");
        loadUsers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create user. Ensure email is unique.");
    } finally {
      setSavingUser(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 min-h-[300px]">
        <svg className="animate-spin h-8 w-8 text-primary mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm font-mono text-text-muted">Loading users database...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-text-main">User Management</h2>
          <p className="text-sm text-text-muted">Control system users, create new operators, and modify roles.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-sm cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add User Account</span>
        </button>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 text-[10px] font-mono uppercase tracking-wider text-text-muted border-b border-slate-200">
                <th className="py-3.5 px-6 font-bold">ID</th>
                <th className="py-3.5 px-6 font-bold">Name</th>
                <th className="py-3.5 px-6 font-bold">Email</th>
                <th className="py-3.5 px-6 font-bold">Role / Identity</th>
                <th className="py-3.5 px-6 font-bold">Status</th>
                <th className="py-3.5 px-6 font-bold">Created Date</th>
                <th className="py-3.5 px-6 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-text-main">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-primary">#{user.id}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center font-extrabold text-[#1E1B4B]">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-text-main">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-text-muted">{user.email}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-extrabold border ${
                        user.role === "ADMIN" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        user.role === "COURIER" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        {user.role}
                      </span>
                      {/* Interactive Role Switcher for Admin */}
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="bg-white border border-slate-200 text-text-main rounded-lg py-1 px-1.5 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      >
                        <option value="CLIENT">CLIENT</option>
                        <option value="COURIER">COURIER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-extrabold border ${
                      user.isActive !== false
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}>
                      {user.isActive !== false ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-text-muted font-medium">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Historical"}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(user)}
                        title="Edit User Info"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleBlock(user)}
                        title={user.isActive !== false ? "Block/Deactivate User" : "Activate User"}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          user.isActive !== false
                            ? "bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600"
                            : "bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-600"
                        }`}
                      >
                        {user.isActive !== false ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        title="Delete User"
                        className="p-1.5 rounded-lg bg-danger/10 hover:bg-danger hover:text-white text-danger transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add User */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fadeIn">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="font-extrabold text-text-main">Create New Operator</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>
            <form onSubmit={handleAddUserSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-text-muted font-bold mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Courier Ahmed"
                    className="w-full bg-white border border-slate-200 text-text-main rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-text-muted font-bold mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@campusdelivery.com"
                    className="w-full bg-white border border-slate-200 text-text-main rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-text-muted font-bold mb-1.5">
                    User Role Assignment
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-text-main rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="CLIENT">CLIENT (Mobile App Role)</option>
                    <option value="COURIER">COURIER (Livreur Mobile Role)</option>
                    <option value="ADMIN">ADMINISTRATOR (Dashboard Access)</option>
                  </select>
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  {savingUser ? "Registering..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fadeIn">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="font-extrabold text-text-main">Modify User Account</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>
            <form onSubmit={handleEditUserSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-text-muted font-bold mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Courier Ahmed"
                    className="w-full bg-white border border-slate-200 text-text-main rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-text-muted font-bold mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="name@campusdelivery.com"
                    className="w-full bg-white border border-slate-200 text-text-main rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-text-muted font-bold mb-1.5">
                    User Role Assignment
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-text-main rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="CLIENT">CLIENT (Mobile App Role)</option>
                    <option value="COURIER">COURIER (Livreur Mobile Role)</option>
                    <option value="ADMIN">ADMINISTRATOR (Dashboard Access)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-text-muted font-bold mb-1.5">
                    Account Status
                  </label>
                  <select
                    value={editIsActive ? "active" : "blocked"}
                    onChange={(e) => setEditIsActive(e.target.value === "active")}
                    className="w-full bg-white border border-slate-200 text-text-main rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="active">Active (Permitted to Log In)</option>
                    <option value="blocked">Blocked / Inactive (Suspended Access)</option>
                  </select>
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingUser}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  {updatingUser ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
