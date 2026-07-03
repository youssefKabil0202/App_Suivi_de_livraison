import { useEffect, useState, FormEvent } from "react";
import { adminService } from "../services/api";
import { Address, User } from "../types";
import { MapPin, Plus, Trash2, Edit2, Star, UserCheck } from "lucide-react";

export default function Addresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  
  const [label, setLabel] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [latitude, setLatitude] = useState("33.5731");
  const [longitude, setLongitude] = useState("-7.5898");
  const [isFrequent, setIsFrequent] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAddresses();
      const usersRes = await adminService.getUsers();
      
      if (res.success) setAddresses(res.data);
      if (usersRes.success) {
        setUsers(usersRes.data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch address records database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingAddress(null);
    setLabel("");
    setAddressLine("");
    setLatitude("33.5720");
    setLongitude("-7.5900");
    setIsFrequent(true);
    setSelectedUserId("");
    setShowModal(true);
  };

  const handleOpenEditModal = (address: Address) => {
    setEditingAddress(address);
    setLabel(address.label);
    setAddressLine(address.addressLine);
    setLatitude(String(address.latitude));
    setLongitude(String(address.longitude));
    setIsFrequent(address.isFrequent);
    setSelectedUserId(address.userId ? String(address.userId) : "");
    setShowModal(true);
  };

  const handleDelete = async (addressId: number) => {
    if (!confirm("Are you sure you want to delete this address? All deliveries pointing to this location will lose its reference.")) return;
    try {
      const res = await adminService.deleteAddress(addressId);
      if (res.success) {
        alert("Address successfully deleted.");
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete address.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!label || !addressLine || !latitude || !longitude) return;

    setSaving(true);
    const payload = {
      label,
      addressLine,
      latitude: Number(latitude),
      longitude: Number(longitude),
      isFrequent,
      userId: selectedUserId ? Number(selectedUserId) : undefined,
    };

    try {
      if (editingAddress) {
        const res = await adminService.updateAddress(editingAddress.id, payload);
        if (res.success) {
          alert("Address updated successfully.");
          setShowModal(false);
          loadData();
        }
      } else {
        const res = await adminService.createAddress(payload);
        if (res.success) {
          alert("Address created successfully.");
          setShowModal(false);
          loadData();
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save address settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 min-h-[300px]">
        <svg className="animate-spin h-8 w-8 text-primary mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm font-mono text-text-muted">Loading campus locations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-text-main">Address Management</h2>
          <p className="text-sm text-text-muted">Add frequent campus landmarks, cafeterias, libraries, or custom client dorms.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Location Spot</span>
        </button>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 text-[10px] font-mono uppercase tracking-wider text-text-muted border-b border-slate-200">
                <th className="py-3.5 px-6 font-bold">ID</th>
                <th className="py-3.5 px-6 font-bold">Label / Hotspot Name</th>
                <th className="py-3.5 px-6 font-bold">Address Line Details</th>
                <th className="py-3.5 px-6 font-bold">Coordinates (Lat, Lng)</th>
                <th className="py-3.5 px-6 font-bold">Linked User / Client</th>
                <th className="py-3.5 px-6 font-bold">Frequent Spot</th>
                <th className="py-3.5 px-6 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-text-main">
              {addresses.map((address) => (
                <tr key={address.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-primary">#{address.id}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-text-main">{address.label}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-text-main font-medium max-w-[200px] truncate">{address.addressLine}</td>
                  <td className="py-4 px-6 font-mono text-xs text-text-muted">
                    {address.latitude.toFixed(4)}, {address.longitude.toFixed(4)}
                  </td>
                  <td className="py-4 px-6">
                    {address.userName ? (
                      <div className="flex items-center space-x-1 text-text-main">
                        <UserCheck className="h-3.5 w-3.5 text-primary" />
                        <span className="font-semibold text-xs">{address.userName}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Campus-wide (General)</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {address.isFrequent ? (
                      <span className="flex items-center space-x-1 text-accent text-xs font-bold font-mono">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        <span>FREQUENT</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs font-mono">Standard</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end items-center space-x-2.5">
                      <button
                        onClick={() => handleOpenEditModal(address)}
                        title="Edit Location"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        title="Delete Location"
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

      {/* Modal: Add/Edit Address */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fadeIn">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="font-extrabold text-text-main">
                {editingAddress ? "Configure Location Coordinates" : "Create Landmark Spot"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-text-muted font-bold mb-1.5">
                    Landmark Label / Name
                  </label>
                  <input
                    type="text"
                    required
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Science Library, Dorm block A"
                    className="w-full bg-white border border-slate-200 text-text-main rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-text-muted font-bold mb-1.5">
                    Exact Address Line Details
                  </label>
                  <input
                    type="text"
                    required
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="e.g. Room 304, Central Campus, Floor 2"
                    className="w-full bg-white border border-slate-200 text-text-main rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-text-muted font-bold mb-1.5">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="33.5731"
                      className="w-full bg-white border border-slate-200 text-text-main rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-text-muted font-bold mb-1.5">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="-7.5898"
                      className="w-full bg-white border border-slate-200 text-text-main rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-text-muted font-bold mb-1.5">
                    Link to User (Optional)
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-text-main rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="">-- General Campus Hub (No User Link) --</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <input
                    type="checkbox"
                    id="isFrequent"
                    checked={isFrequent}
                    onChange={(e) => setIsFrequent(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-slate-200 bg-white text-primary focus:ring-primary"
                  />
                  <label htmlFor="isFrequent" className="text-sm font-semibold text-text-main select-none">
                    Frequent Destination Spot
                    <span className="block text-xs text-text-muted font-normal mt-0.5">
                      Frequent points display as rapid shortcuts in mobile delivery orders.
                    </span>
                  </label>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  {saving ? "Saving Coordinates..." : "Persist Location"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
