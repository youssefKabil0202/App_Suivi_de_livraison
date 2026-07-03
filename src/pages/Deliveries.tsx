import { useEffect, useState } from "react";
import { adminService, clientService } from "../services/api";
import { Delivery, User, StatusLog } from "../types";
import { ArrowRight, Search, SlidersHorizontal, UserPlus, XCircle, ListCollapse, Clock, Map } from "lucide-react";
import RouteMap from "../components/RouteMap";
import { useTranslation } from "../context/LanguageContext";

interface DeliveriesProps {
  onTrackDelivery?: (deliveryId: number) => void;
}

export default function Deliveries({ onTrackDelivery }: DeliveriesProps) {
  const { t, language } = useTranslation();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [couriers, setCouriers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Assignment Modal state
  const [assigningDelivery, setAssigningDelivery] = useState<Delivery | null>(null);
  const [selectedCourierId, setSelectedCourierId] = useState<string>("");

  // Logs Modal state
  const [selectedLogsDelivery, setSelectedLogsDelivery] = useState<Delivery | null>(null);
  const [activeLogs, setActiveLogs] = useState<StatusLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Map Modal state
  const [selectedMapDelivery, setSelectedMapDelivery] = useState<Delivery | null>(null);

  const loadDeliveriesAndCouriers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDeliveries();
      const usersRes = await adminService.getUsers();
      
      if (res.success) setDeliveries(res.data);
      if (usersRes.success) {
        setCouriers(usersRes.data.filter((u: User) => u.role === "COURIER"));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch system deliveries. Make sure database is online.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveriesAndCouriers();
  }, []);

  const handleCancel = async (id: number) => {
    if (!confirm(language === "fr" ? "Êtes-vous sûr de vouloir annuler cette demande de livraison ?" : "Are you sure you want to cancel this delivery request?")) return;
    try {
      const res = await adminService.cancelDelivery(id);
      if (res.success) {
        alert(language === "fr" ? "Livraison annulée avec succès." : "Delivery successfully canceled.");
        loadDeliveriesAndCouriers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to cancel delivery.");
    }
  };

  const handleOpenAssignModal = (delivery: Delivery) => {
    setAssigningDelivery(delivery);
    setSelectedCourierId(delivery.courierId ? String(delivery.courierId) : "");
  };

  const handleConfirmAssign = async () => {
    if (!assigningDelivery || !selectedCourierId) return;
    try {
      const res = await adminService.assignCourier(assigningDelivery.id, Number(selectedCourierId));
      if (res.success) {
        alert(language === "fr" ? "Coursier assigné avec succès !" : "Courier assigned successfully.");
        setAssigningDelivery(null);
        loadDeliveriesAndCouriers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to assign courier.");
    }
  };

  const handleOpenLogsModal = async (delivery: Delivery) => {
    setSelectedLogsDelivery(delivery);
    setLoadingLogs(true);
    try {
      const res = await clientService.getLogs(delivery.id);
      if (res.success) {
        setActiveLogs(res.data);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to retrieve timeline logs.");
    } finally {
      setLoadingLogs(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "CREATED": return t("submitted");
      case "PICKED_UP": return t("picked_up");
      case "EN_ROUTE": return t("en_route");
      case "DELIVERED": return t("delivered");
      case "CANCELED": return t("canceled");
      default: return status;
    }
  };

  // Filter & Search logic
  const filteredDeliveries = deliveries.filter((delivery) => {
    // Status Filter
    const matchesStatus = statusFilter === "ALL" || delivery.status === statusFilter;

    // Search Query (Client name, client email, or Delivery ID)
    const matchesSearch =
      delivery.id.toString() === searchQuery.trim() ||
      delivery.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.client.email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 min-h-[300px]">
        <svg className="animate-spin h-8 w-8 text-primary mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm font-mono text-text-muted">
          {language === "fr" ? "Chargement des enregistrements..." : "Loading delivery records..."}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-text-main">
          {language === "fr" ? "Gestion des Livraisons" : "Deliveries Management"}
        </h2>
        <p className="text-sm text-text-muted">
          {language === "fr" 
            ? "Suivez les états, consultez l'historique des journaux d'audit et assignez des livreurs." 
            : "Track states, view historical status logs, and manually assign drivers."}
        </p>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Control Panel: Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder={language === "fr" ? "Rechercher par ID ou nom/email du client..." : "Search by ID or Client name/email..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-text-main text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center space-x-3">
          <SlidersHorizontal className="h-4 w-4 text-slate-400 hidden sm:inline" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 text-text-main rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">{language === "fr" ? "Tous les statuts" : "All Statuses"}</option>
            <option value="CREATED">CREATED</option>
            <option value="PICKED_UP">PICKED UP</option>
            <option value="EN_ROUTE">EN ROUTE</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELED">CANCELED</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 text-[10px] font-mono uppercase tracking-wider text-text-muted border-b border-slate-200">
                <th className="py-3.5 px-6 font-bold">ID</th>
                <th className="py-3.5 px-6 font-bold">{language === "fr" ? "Client" : "Client"}</th>
                <th className="py-3.5 px-6 font-bold">{language === "fr" ? "Livreur" : "Courier"}</th>
                <th className="py-3.5 px-6 font-bold">{language === "fr" ? "Itinéraire" : "Locations Route"}</th>
                <th className="py-3.5 px-6 font-bold">Status</th>
                <th className="py-3.5 px-6 font-bold">{language === "fr" ? "Date de soumission" : "Submitted Date"}</th>
                <th className="py-3.5 px-6 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-text-main">
              {filteredDeliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-primary">#{delivery.id}</td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-bold text-text-main">{delivery.client.name}</p>
                      <p className="text-xs text-text-muted font-mono">{delivery.client.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {delivery.courier ? (
                      <div>
                        <p className="font-semibold text-text-main">{delivery.courier.name}</p>
                        <p className="text-xs text-text-muted font-mono">{language === "fr" ? "Livreur" : "Courier"}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic font-mono text-xs">
                        {language === "fr" ? "Non assigné" : "Unassigned"}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2 text-xs">
                      <div>
                        <p className="font-bold text-slate-600">{delivery.pickupAddress.label}</p>
                        <p className="text-text-muted text-[10px] max-w-[150px] truncate">{delivery.pickupAddress.addressLine}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-text-main">{delivery.dropoffAddress.label}</p>
                        <p className="text-text-muted text-[10px] max-w-[150px] truncate">{delivery.dropoffAddress.addressLine}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-extrabold border ${
                      delivery.status === "DELIVERED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      delivery.status === "CANCELED" ? "bg-danger/10 text-danger border-danger/20" :
                      delivery.status === "CREATED" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {getStatusLabel(delivery.status)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-text-muted font-medium">
                    {new Date(delivery.createdAt).toLocaleDateString()} {language === "fr" ? "à" : "at"} {new Date(delivery.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end items-center space-x-2.5">
                      {/* View Route Map Button */}
                      <button
                        onClick={() => {
                          if (onTrackDelivery) {
                            onTrackDelivery(delivery.id);
                          } else {
                            setSelectedMapDelivery(delivery);
                          }
                        }}
                        title={language === "fr" ? "Voir la carte d'itinéraire" : "View Interactive Route Map"}
                        className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-900 transition-colors cursor-pointer"
                      >
                        <Map className="h-4 w-4" />
                      </button>

                      {/* Timeline Logs Button */}
                      <button
                        onClick={() => handleOpenLogsModal(delivery)}
                        title={language === "fr" ? "Voir l'historique des statuts" : "View Delivery Logs Timeline"}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
                      >
                        <ListCollapse className="h-4 w-4" />
                      </button>

                      {/* Manual Assignment Trigger */}
                      {delivery.status !== "DELIVERED" && delivery.status !== "CANCELED" && (
                        <button
                          onClick={() => handleOpenAssignModal(delivery)}
                          title={language === "fr" ? "Assigner un livreur" : "Assign Courier"}
                          className="p-1.5 rounded-lg bg-accent/10 hover:bg-accent hover:text-white text-accent transition-colors cursor-pointer"
                        >
                          <UserPlus className="h-4 w-4" />
                        </button>
                      )}

                      {/* Cancel Button */}
                      {delivery.status !== "DELIVERED" && delivery.status !== "CANCELED" && (
                        <button
                          onClick={() => handleCancel(delivery.id)}
                          title={language === "fr" ? "Annuler la livraison" : "Cancel Delivery"}
                          className="p-1.5 rounded-lg bg-danger/10 hover:bg-danger hover:text-white text-danger transition-colors cursor-pointer"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDeliveries.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-text-muted font-mono italic">
                    {language === "fr" ? "Aucun enregistrement ne correspond aux filtres de recherche." : "No delivery records match search settings."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Assign Courier */}
      {assigningDelivery && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fadeIn">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="font-extrabold text-text-main">
                {language === "fr" ? "Dispatch Manuel du Livreur" : "Manual Courier Dispatch"}
              </h3>
              <button onClick={() => setAssigningDelivery(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-text-muted">
                {language === "fr" 
                  ? "Sélectionnez un livreur à affecter à la tâche de livraison" 
                  : "Select a courier to assign to delivery job"}{" "}
                <span className="text-primary font-mono font-bold">#{assigningDelivery.id}</span>.
              </p>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-text-muted font-bold mb-1.5">
                  {language === "fr" ? "Livreurs Disponibles" : "Available Couriers"}
                </label>
                <select
                  value={selectedCourierId}
                  onChange={(e) => setSelectedCourierId(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-text-main rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">-- {language === "fr" ? "Choisir un livreur" : "Choose Courier"} --</option>
                  {couriers.map((courier) => (
                    <option key={courier.id} value={courier.id}>
                      {courier.name} ({courier.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
              <button
                onClick={() => setAssigningDelivery(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300 transition cursor-pointer"
              >
                {t("close")}
              </button>
              <button
                onClick={handleConfirmAssign}
                disabled={!selectedCourierId}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm cursor-pointer"
              >
                {language === "fr" ? "Confirmer l'affectation" : "Confirm Dispatch"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Delivery Logs Timeline */}
      {selectedLogsDelivery && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fadeIn">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="font-extrabold text-text-main">{t("timeline_audit")}</h3>
              <button onClick={() => setSelectedLogsDelivery(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>
            <div className="p-6 max-h-[350px] overflow-y-auto bg-slate-50/50">
              <p className="text-xs text-text-muted font-mono mb-4 uppercase tracking-wider">
                Auditing Delivery <span className="text-primary font-bold">#{selectedLogsDelivery.id}</span>
              </p>

              {loadingLogs ? (
                <div className="py-12 flex justify-center">
                  <svg className="animate-spin h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {activeLogs.map((log) => (
                    <div key={log.id} className="relative pl-8 group animate-fadeIn">
                      {/* Bullet Dot */}
                      <div className="absolute left-1.5 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-primary shadow shadow-primary/20 z-10 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                      </div>
                      
                      {/* Log Card */}
                      <div className="bg-white border border-slate-100 p-3.5 rounded-xl shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono font-black text-primary uppercase tracking-wider">
                            {getStatusLabel(log.status)}
                          </span>
                          <span className="text-[10px] font-mono text-text-muted">
                            {new Date(log.changedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-text-main font-semibold mt-1.5">{log.notes}</p>
                        <div className="flex items-center space-x-1.5 mt-2 pt-2 border-t border-slate-50">
                          <Clock className="h-3 w-3 text-primary" />
                          <span className="text-[10px] text-text-muted font-mono font-medium">
                            {language === "fr" ? "Modifié par" : "Changed by"} : {log.changedBy?.name} ({log.changedBy?.role})
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {activeLogs.length === 0 && (
                    <p className="text-center text-text-muted font-mono italic text-sm py-4">No transition records captured.</p>
                  )}
                </div>
              )}
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLogsDelivery(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300 transition cursor-pointer"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Route Map Visualizer */}
      {selectedMapDelivery && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fadeIn">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h3 className="font-extrabold text-text-main">{t("route_map_tracking")}</h3>
                <p className="text-xs text-text-muted mt-0.5">{t("campus_route_for")} #{selectedMapDelivery.id}</p>
              </div>
              <button onClick={() => setSelectedMapDelivery(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>
            
            <div className="p-6 bg-slate-50">
              <RouteMap 
                pickupAddress={selectedMapDelivery.pickupAddress}
                dropoffAddress={selectedMapDelivery.dropoffAddress}
                height="380px"
              />
            </div>

            <div className="p-6 bg-white border-t border-slate-100 flex justify-between items-center text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider font-bold">
                  {language === "fr" ? "Livreur Assigné :" : "Courier Assignment:"}
                </span>
                <span className="font-semibold text-text-main">
                  {selectedMapDelivery.courier?.name || (language === "fr" ? "Non assigné" : "Unassigned")}
                </span>
              </div>
              <button
                onClick={() => setSelectedMapDelivery(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition cursor-pointer"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
