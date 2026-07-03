import { useEffect, useState, FormEvent } from "react";
import { clientService, adminService } from "../services/api";
import { Delivery, Address, StatusLog } from "../types";
import { Truck, ArrowRight, ListCollapse, Clock, Plus, Check, Map } from "lucide-react";
import RouteMap from "../components/RouteMap";
import { useTranslation } from "../context/LanguageContext";

interface ClientDeliveriesProps {
  onTrackDelivery?: (deliveryId: number) => void;
}

export default function ClientDeliveries({ onTrackDelivery }: ClientDeliveriesProps) {
  const { t, language } = useTranslation();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [frequentAddresses, setFrequentAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Request Form State
  const [pickupId, setPickupId] = useState("");
  const [dropoffId, setDropoffId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Audit Logs Modal state
  const [selectedLogsDelivery, setSelectedLogsDelivery] = useState<Delivery | null>(null);
  const [activeLogs, setActiveLogs] = useState<StatusLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Map Modal state
  const [selectedMapDelivery, setSelectedMapDelivery] = useState<Delivery | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await clientService.getHistory();
      const addrRes = await adminService.getAddresses();
      
      if (res.success) setDeliveries(res.data);
      if (addrRes.success) {
        setFrequentAddresses(addrRes.data.filter((a: Address) => a.isFrequent || a.userId === null));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to retrieve client profile deliveries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDelivery = async (e: FormEvent) => {
    e.preventDefault();
    if (!pickupId || !dropoffId) {
      alert(language === "fr" ? "Veuillez sélectionner les lieux de ramassage et de livraison." : "Please select both pickup and drop-off locations.");
      return;
    }
    if (pickupId === dropoffId) {
      alert(language === "fr" ? "Les lieux de ramassage et de livraison ne peuvent pas être identiques." : "Pickup and drop-off locations cannot be identical.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await clientService.createDelivery(Number(pickupId), Number(dropoffId));
      if (res.success) {
        alert(language === "fr" ? "Demande de livraison soumise avec succès ! Un administrateur va attribuer un coursier." : "Delivery request submitted successfully! An administrator will manually assign a courier.");
        setPickupId("");
        setDropoffId("");
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit delivery request.");
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 min-h-[300px]">
        <svg className="animate-spin h-8 w-8 text-amber-500 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm font-mono text-slate-400">
          {language === "fr" ? "Chargement du portail client..." : "Loading Client tracking panel..."}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">{t("request_console")}</h2>
        <p className="text-sm text-slate-400">{t("request_desc")}</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl h-fit">
          <div className="flex items-center space-x-2.5 mb-6">
            <div className="bg-amber-500/10 p-2 rounded-xl text-amber-500">
              <Truck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-base">{t("create_new_delivery")}</h3>
          </div>

          <form onSubmit={handleCreateDelivery} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
                {t("pickup_terminal")}
              </label>
              <select
                required
                value={pickupId}
                onChange={(e) => setPickupId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="">-- {t("frequent_pickup")} --</option>
                {frequentAddresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.label} ({addr.addressLine})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
                {t("dropoff_destination")}
              </label>
              <select
                required
                value={dropoffId}
                onChange={(e) => setDropoffId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="">-- {t("frequent_dropoff")} --</option>
                {frequentAddresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.label} ({addr.addressLine})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span>{submitting ? t("submitting_request") : t("submit_request")}</span>
            </button>
          </form>
        </div>

        {/* History Column */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-white text-base">{t("history_tracking")}</h3>

          <div className="space-y-3">
            {deliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md hover:border-slate-700 transition"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-3.5">
                    <span className="text-amber-500 font-bold font-mono text-sm">#{delivery.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      delivery.status === "DELIVERED" ? "bg-green-500/10 text-green-400" :
                      delivery.status === "CANCELED" ? "bg-red-500/10 text-red-400" :
                      delivery.status === "CREATED" ? "bg-blue-500/10 text-blue-400" :
                      "bg-amber-500/10 text-amber-400"
                    }`}>
                      {getStatusLabel(delivery.status)}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(delivery.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Locations details */}
                  <div className="flex items-center space-x-2 text-xs">
                    <div>
                      <p className="font-bold text-slate-450">{delivery.pickupAddress.label}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-650 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-slate-200">{delivery.dropoffAddress.label}</p>
                    </div>
                  </div>

                  {/* Assigned Courier */}
                  <p className="text-xs text-slate-400">
                    <span className="text-slate-500 font-mono">Livreur / Courier:</span>{" "}
                    {delivery.courier ? (
                      <span className="font-semibold text-slate-300">{delivery.courier.name}</span>
                    ) : (
                      <span className="text-slate-500 italic">{language === "fr" ? "En attente d'affectation..." : "Waiting for assignment..."}</span>
                    )}
                  </p>
                </div>

                <div className="flex sm:flex-col items-end gap-2.5">
                  <button
                    onClick={() => {
                      if (onTrackDelivery) {
                        onTrackDelivery(delivery.id);
                      } else {
                        setSelectedMapDelivery(delivery);
                      }
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs rounded-xl transition cursor-pointer"
                  >
                    <Map className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                    <span>{t("view_route_map")}</span>
                  </button>
                  <button
                    onClick={() => handleOpenLogsModal(delivery)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition cursor-pointer"
                  >
                    <ListCollapse className="h-3.5 w-3.5 text-amber-500" />
                    <span>{t("view_timeline")}</span>
                  </button>
                </div>
              </div>
            ))}

            {deliveries.length === 0 && (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center text-slate-500 font-mono italic">
                {language === "fr" 
                  ? "Vous n'avez pas encore demandé de livraison. Utilisez le formulaire pour en initier une !" 
                  : "You have not requested any campus deliveries yet. Use the requester form to trigger one!"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Timeline status logs */}
      {selectedLogsDelivery && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white">{t("timeline_audit")}</h3>
              <button onClick={() => setSelectedLogsDelivery(null)} className="text-slate-500 hover:text-slate-300 font-bold">✕</button>
            </div>
            <div className="p-6 max-h-[350px] overflow-y-auto">
              {loadingLogs ? (
                <div className="py-8 flex justify-center">
                  <svg className="animate-spin h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : (
                <div className="space-y-5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {activeLogs.map((log) => (
                    <div key={log.id} className="relative pl-8 group">
                      <div className="absolute left-1.5 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-slate-900 bg-amber-500 z-10"></div>
                      <div className="bg-slate-800/50 border border-slate-800 p-3 rounded-xl">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono font-black text-amber-500 uppercase">{getStatusLabel(log.status)}</span>
                          <span className="text-[9px] font-mono text-slate-500">
                            {new Date(log.changedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium mt-1">{log.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 bg-slate-950 border-t border-slate-800/80 flex justify-end">
              <button
                onClick={() => setSelectedLogsDelivery(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition cursor-pointer"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Client Route Map Tracking */}
      {selectedMapDelivery && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fadeIn">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <div>
                <h3 className="font-bold text-white text-base">{t("route_map_tracking")}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{t("campus_route_for")} #{selectedMapDelivery.id}</p>
              </div>
              <button onClick={() => setSelectedMapDelivery(null)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>
            
            <div className="p-6 bg-slate-950">
              <RouteMap 
                pickupAddress={selectedMapDelivery.pickupAddress}
                dropoffAddress={selectedMapDelivery.dropoffAddress}
                height="380px"
              />
            </div>

            <div className="p-6 bg-slate-900 border-t border-slate-800 flex justify-between items-center text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="font-mono text-slate-500 uppercase text-[10px]">Status:</span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase ${
                  selectedMapDelivery.status === "DELIVERED" ? "bg-green-500/10 text-green-400" :
                  selectedMapDelivery.status === "CANCELED" ? "bg-red-500/10 text-red-400" :
                  "bg-amber-500/10 text-amber-400"
                }`}>
                  {getStatusLabel(selectedMapDelivery.status)}
                </span>
              </div>
              <button
                onClick={() => setSelectedMapDelivery(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-350 text-xs font-semibold hover:bg-slate-750 hover:text-white transition cursor-pointer"
              >
                {t("close_tracking")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
