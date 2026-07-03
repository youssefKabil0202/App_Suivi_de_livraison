import { useEffect, useState, FormEvent } from "react";
import { courierService } from "../services/api";
import { Delivery } from "../types";
import { Truck, ArrowRight, ClipboardCheck, ArrowUpRight, CheckCircle2, MessageSquareText, Map } from "lucide-react";
import RouteMap from "../components/RouteMap";
import { useTranslation } from "../context/LanguageContext";

interface CourierDeliveriesProps {
  onTrackDelivery?: (deliveryId: number) => void;
}

export default function CourierDeliveries({ onTrackDelivery }: CourierDeliveriesProps) {
  const { t, language } = useTranslation();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status Change Dialog state
  const [updatingDelivery, setUpdatingDelivery] = useState<Delivery | null>(null);
  const [nextStatus, setNextStatus] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Map Modal state
  const [selectedMapDelivery, setSelectedMapDelivery] = useState<Delivery | null>(null);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const res = await courierService.getMyDeliveries();
      if (res.success) setDeliveries(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch assigned delivery schedule.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const handleOpenUpdateModal = (delivery: Delivery, targetStatus: string) => {
    setUpdatingDelivery(delivery);
    setNextStatus(targetStatus);
    // Suggest some default notes
    if (targetStatus === "PICKED_UP") {
      setNotes(language === "fr" 
        ? `Le coursier a récupéré le colis chez ${delivery.pickupAddress.label}` 
        : `Courier picked up the parcel from ${delivery.pickupAddress.label}`);
    } else if (targetStatus === "EN_ROUTE") {
      setNotes(language === "fr" 
        ? `Le coursier est en route vers ${delivery.dropoffAddress.label}` 
        : `Courier is en route to ${delivery.dropoffAddress.label}`);
    } else if (targetStatus === "DELIVERED") {
      setNotes(language === "fr" 
        ? `Colis livré en toute sécurité au client. Signé.` 
        : `Parcel delivered safely to client. signed.`);
    } else {
      setNotes("");
    }
  };

  const handleStatusUpdateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!updatingDelivery || !nextStatus) return;

    setSubmitting(true);
    try {
      const res = await courierService.updateStatus(updatingDelivery.id, nextStatus, notes);
      if (res.success) {
        alert(language === "fr" ? `Statut mis à jour avec succès vers ${nextStatus}.` : `Status updated successfully to ${nextStatus}.`);
        setUpdatingDelivery(null);
        setNotes("");
        loadDeliveries();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update status. Follow structural lifecycle rules.");
    } finally {
      setSubmitting(false);
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
          {language === "fr" ? "Chargement du planning coursier..." : "Loading Courier dispatch panel..."}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">{t("courier_schedule")}</h2>
        <p className="text-sm text-slate-400">{t("courier_schedule_desc")}</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Grid of assigned deliveries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deliveries.map((delivery) => (
          <div
            key={delivery.id}
            className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-6 shadow-xl hover:border-slate-75 transition"
          >
            {/* Header metadata */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-amber-500 font-mono font-bold text-sm">Job #{delivery.id}</span>
                <p className="text-xs text-slate-500 font-mono">
                  {t("requested_by")}: {delivery.client.name}
                </p>
              </div>
              <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold ${
                delivery.status === "DELIVERED" ? "bg-green-500/10 text-green-400" :
                delivery.status === "CANCELED" ? "bg-red-500/10 text-red-400" :
                delivery.status === "CREATED" ? "bg-blue-500/10 text-blue-400" :
                "bg-amber-500/10 text-amber-400"
              }`}>
                {getStatusLabel(delivery.status)}
              </span>
            </div>

            {/* Route Landmarks */}
            <div className="space-y-3.5 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <div className="flex items-start space-x-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-blue-500"></div>
                <div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{t("pickup_terminal")}</span>
                  <p className="text-sm font-bold text-white">{delivery.pickupAddress.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{delivery.pickupAddress.addressLine}</p>
                </div>
              </div>

              <div className="h-4 border-l border-slate-800 ml-1"></div>

              <div className="flex items-start space-x-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-amber-500"></div>
                <div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{t("dropoff_destination")}</span>
                  <p className="text-sm font-bold text-white">{delivery.dropoffAddress.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{delivery.dropoffAddress.addressLine}</p>
                </div>
              </div>
            </div>

            {/* Actions: transition forward in lifecycle */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  if (onTrackDelivery) {
                    onTrackDelivery(delivery.id);
                  } else {
                    setSelectedMapDelivery(delivery);
                  }
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                <Map className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                <span>{t("view_route_map")}</span>
              </button>

              <div className="flex items-center">
                {delivery.status === "CREATED" && (
                  <button
                    onClick={() => handleOpenUpdateModal(delivery, "PICKED_UP")}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    <ClipboardCheck className="h-4 w-4" />
                    <span>{t("mark_picked_up")}</span>
                  </button>
                )}

                {delivery.status === "PICKED_UP" && (
                  <button
                    onClick={() => handleOpenUpdateModal(delivery, "EN_ROUTE")}
                    className="flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    <span>{t("mark_en_route")}</span>
                  </button>
                )}

                {delivery.status === "EN_ROUTE" && (
                  <button
                    onClick={() => handleOpenUpdateModal(delivery, "DELIVERED")}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{t("mark_delivered")}</span>
                  </button>
                )}

                {delivery.status === "DELIVERED" && (
                  <span className="text-xs font-mono text-green-500 font-bold flex items-center space-x-1.5 py-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{t("completed")}</span>
                  </span>
                )}

                {delivery.status === "CANCELED" && (
                  <span className="text-xs font-mono text-red-500 italic py-1.5">{t("canceled")}</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {deliveries.length === 0 && (
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center text-slate-500 font-mono italic">
            {language === "fr" 
              ? "Aucune livraison ne vous est actuellement attribuée. Allez dans l'onglet Admin pour allouer manuellement une tâche !" 
              : "No deliveries are currently assigned to you. Go to the Admin tab to manually allocate a job!"}
          </div>
        )}
      </div>

      {/* Status Update Modal with Notes */}
      {updatingDelivery && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white">{t("update_delivery_state")}</h3>
              <button onClick={() => setUpdatingDelivery(null)} className="text-slate-500 hover:text-slate-300 font-bold">✕</button>
            </div>
            <form onSubmit={handleStatusUpdateSubmit}>
              <div className="p-6 space-y-4">
                <p className="text-xs font-mono uppercase text-slate-400">
                  {language === "fr" ? "Progression du Job" : "Advancing Job"} <span className="text-amber-500 font-bold">#{updatingDelivery.id}</span> {language === "fr" ? "vers l'état :" : "to state:"}{" "}
                  <span className="text-white font-black">{getStatusLabel(nextStatus)}</span>
                </p>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
                    {t("transition_log_notes")}
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 text-slate-500">
                      <MessageSquareText className="h-4 w-4" />
                    </div>
                    <textarea
                      required
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t("notes_placeholder")}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-950 border-t border-slate-800/80 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setUpdatingDelivery(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition cursor-pointer"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-600 transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? t("submitting_request") : t("confirm_update")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Courier Route Map Visualizer */}
      {selectedMapDelivery && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fadeIn">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <div>
                <h3 className="font-bold text-white text-base">{t("route_map_tracking")}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{t("campus_route_for")} #{selectedMapDelivery.id}</p>
              </div>
              <button onClick={() => setSelectedMapDelivery(null)} className="text-slate-500 hover:text-white font-bold text-lg">✕</button>
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
                <span className="font-mono text-slate-500 uppercase text-[10px]">Client:</span>
                <span className="font-bold text-white">{selectedMapDelivery.client.name}</span>
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
