import { useEffect, useState } from "react";
import { deliveryService, courierService, authService } from "../services/api";
import { Delivery, StatusLog, User } from "../types";
import RouteMap from "../components/RouteMap";
import { useTranslation } from "../context/LanguageContext";
import { 
  ArrowLeft, 
  MapPin, 
  User as UserIcon, 
  Clock, 
  CheckCircle2, 
  Navigation, 
  Phone, 
  Mail, 
  Loader2, 
  TrendingUp, 
  MessageSquare,
  Sparkles,
  ClipboardCheck,
  ArrowUpRight
} from "lucide-react";

interface TrackingDetailProps {
  deliveryId: number;
  onBack: () => void;
}

export default function TrackingDetail({ deliveryId, onBack }: TrackingDetailProps) {
  const { t, language } = useTranslation();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [logs, setLogs] = useState<StatusLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Status updating state for courier on-the-go
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updateNotes, setUpdateNotes] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const detailsRes = await deliveryService.getDetails(deliveryId);
      if (detailsRes.success && detailsRes.data) {
        setDelivery(detailsRes.data);
      } else {
        throw new Error(detailsRes.message || "Failed to load delivery details.");
      }

      const logsRes = await deliveryService.getLogs(deliveryId);
      if (logsRes.success && logsRes.data) {
        setLogs(logsRes.data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "An error occurred while loading data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentUser(authService.getCurrentUser());
    loadData();
  }, [deliveryId]);

  const handleUpdateStatus = async (nextStatus: "PICKED_UP" | "EN_ROUTE" | "DELIVERED") => {
    if (!delivery) return;
    
    setUpdatingStatus(true);
    try {
      const res = await courierService.updateStatus(delivery.id, nextStatus, updateNotes.trim() || undefined);
      if (res.success) {
        setUpdateNotes("");
        // Reload details and timeline logs
        await loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update delivery status.");
    } finally {
      setUpdatingStatus(false);
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

  if (loading && !delivery) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm font-medium text-text-muted">{t("loading_live")}</p>
      </div>
    );
  }

  if (error || !delivery) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-xl mx-auto my-12 shadow-sm">
        <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 mx-auto mb-4">
          <ArrowLeft className="h-6 w-6" />
        </div>
        <h3 className="font-extrabold text-slate-900 text-lg mb-2">{t("tracking_failed")}</h3>
        <p className="text-sm text-slate-600 mb-6">{error || "Could not fetch details for this delivery."}</p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
        >
          {t("return_dashboard")}
        </button>
      </div>
    );
  }

  // Calculate current progress stage value
  const getProgressPercentage = () => {
    switch (delivery.status) {
      case "CREATED": return 25;
      case "PICKED_UP": return 50;
      case "EN_ROUTE": return 75;
      case "DELIVERED": return 100;
      case "CANCELED": return 100;
      default: return 0;
    }
  };

  const steps = [
    { label: t("submitted"), status: "CREATED", color: "text-indigo-600" },
    { label: t("picked_up"), status: "PICKED_UP", color: "text-blue-600" },
    { label: t("en_route"), status: "EN_ROUTE", color: "text-amber-500" },
    { label: t("delivered"), status: "DELIVERED", color: "text-emerald-500" },
  ];

  const isAssignedCourier = currentUser && currentUser.role === "COURIER" && delivery.courierId === currentUser.id;

  return (
    <div className="space-y-6">
      {/* Back Button & Header Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition shadow-sm cursor-pointer"
            title="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md font-bold">
                REF #{delivery.id}
              </span>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-extrabold border ${
                delivery.status === "DELIVERED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                delivery.status === "CANCELED" ? "bg-rose-50 text-rose-700 border-rose-200" :
                delivery.status === "EN_ROUTE" ? "bg-amber-50 text-amber-700 border-amber-200" :
                "bg-indigo-50 text-indigo-700 border-indigo-200"
              }`}>
                {getStatusLabel(delivery.status)}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-text-main mt-1 tracking-tight">
              {t("realtime_tracking")}
            </h1>
          </div>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="self-start md:self-auto px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm cursor-pointer flex items-center space-x-1.5"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          ) : (
            <TrendingUp className="h-3.5 w-3.5 text-slate-500" />
          )}
          <span>{t("refresh_live")}</span>
        </button>
      </div>

      {/* Progress Tracker Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-mono uppercase tracking-wider text-text-muted font-bold">{t("delivery_progression")}</span>
          <span className="text-xs font-bold text-text-main">
            {delivery.status === "DELIVERED" ? t("completed") : delivery.status === "CANCELED" ? t("order_canceled") : t("active_on_route")}
          </span>
        </div>

        {delivery.status === "CANCELED" ? (
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-center space-x-3 text-rose-800">
            <span className="text-xs font-medium">{t("segment_canceled")}</span>
          </div>
        ) : (
          <div>
            {/* Visual Bar */}
            <div className="relative h-2 bg-slate-100 rounded-full mb-6">
              <div 
                className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getProgressPercentage()}%` }}
              />
              
              {/* Checkpoint Dots */}
              <div className="absolute inset-0 flex justify-between items-center -mx-2">
                {steps.map((step, idx) => {
                  const isPassed = getProgressPercentage() >= ((idx + 1) * 25);
                  return (
                    <div key={step.status} className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                        isPassed 
                          ? "bg-indigo-600 border-indigo-600 text-white" 
                          : "bg-white border-slate-200 text-slate-400"
                      }`}>
                        {isPassed && <CheckCircle2 className="h-2.5 w-2.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Labels under the bar */}
            <div className="grid grid-cols-4 gap-2 text-center">
              {steps.map((step) => {
                const isActive = delivery.status === step.status;
                return (
                  <div key={step.status}>
                    <p className={`text-[11px] font-bold ${isActive ? step.color : "text-text-muted"}`}>
                      {step.label}
                    </p>
                    <p className="text-[9px] font-mono text-slate-400">
                      {step.status}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Map & Address details */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Leaflet Street Route Map Container */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm p-4">
            <h3 className="font-extrabold text-sm text-text-main mb-3 flex items-center space-x-2">
              <Navigation className="h-4 w-4 text-indigo-500 animate-pulse" />
              <span>{t("interactive_nav")}</span>
            </h3>
            <RouteMap 
              pickupAddress={delivery.pickupAddress}
              dropoffAddress={delivery.dropoffAddress}
              height="400px"
            />
          </div>

          {/* Details Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-extrabold text-sm text-text-main pb-3 border-b border-slate-100">
              {t("address_terminals")}
            </h3>

            {/* Pickup Node */}
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0 font-bold text-xs mt-1 border border-indigo-100">
                P
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider font-extrabold block">
                  {t("pickup_terminal")}
                </span>
                <h4 className="font-bold text-sm text-text-main mt-0.5">
                  {delivery.pickupAddress.label}
                </h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  {delivery.pickupAddress.addressLine}
                </p>
                <div className="mt-2 flex items-center space-x-3 text-[10px] font-mono text-slate-400">
                  <span>{t("latitude_short")}: {delivery.pickupAddress.latitude.toFixed(6)}</span>
                  <span>{t("longitude_short")}: {delivery.pickupAddress.longitude.toFixed(6)}</span>
                </div>
              </div>
            </div>

            {/* Divider Dot connector line */}
            <div className="pl-4 -my-4">
              <div className="w-0.5 h-10 border-l border-dashed border-indigo-300 ml-1.5" />
            </div>

            {/* Dropoff Node */}
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0 font-bold text-xs mt-1 border border-amber-100">
                D
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono text-amber-600 uppercase tracking-wider font-extrabold block">
                  {t("dropoff_destination")}
                </span>
                <h4 className="font-bold text-sm text-text-main mt-0.5">
                  {delivery.dropoffAddress.label}
                </h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  {delivery.dropoffAddress.addressLine}
                </p>
                <div className="mt-2 flex items-center space-x-3 text-[10px] font-mono text-slate-400">
                  <span>{t("latitude_short")}: {delivery.dropoffAddress.latitude.toFixed(6)}</span>
                  <span>{t("longitude_short")}: {delivery.dropoffAddress.longitude.toFixed(6)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Logs, courier details and action update panel */}
        <div className="lg:col-span-5 space-y-6">

          {/* Courier Assignment & Contact Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-extrabold text-sm text-text-main mb-4">
              {t("courier_dispatch")}
            </h3>

            {delivery.courier ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3.5 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-lg text-primary">
                    {delivery.courier.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-text-main">{delivery.courier.name}</h4>
                    <span className="text-[10px] font-mono uppercase text-success font-bold tracking-wider">
                      {t("assigned_agent")}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center space-x-2 text-xs text-text-muted">
                    <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{delivery.courier.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-text-muted">
                    <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span>+1 (234) 567-8910 (Campus Phone)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <UserIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <h4 className="font-bold text-xs text-slate-700">{t("awaiting_assignment")}</h4>
                <p className="text-[11px] text-text-muted mt-1 px-4">
                  {t("awaiting_assignment_desc")}
                </p>
              </div>
            )}
          </div>

          {/* Active Courier Controls (Visible ONLY to the assigned courier) */}
          {isAssignedCourier && delivery.status !== "DELIVERED" && delivery.status !== "CANCELED" && (
            <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="font-extrabold text-sm text-white mb-2 flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                <span>{t("courier_actions")}</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                {t("courier_actions_desc")}
              </p>

              {/* Status transition controller */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5 font-bold">
                    {t("add_status_notes")}
                  </label>
                  <input
                    type="text"
                    value={updateNotes}
                    onChange={(e) => setUpdateNotes(e.target.value)}
                    placeholder={t("notes_placeholder")}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-2 px-3 text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {delivery.status === "CREATED" && (
                    <button
                      onClick={() => handleUpdateStatus("PICKED_UP")}
                      disabled={updatingStatus}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      {updatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
                      <span>{t("mark_picked_up")}</span>
                    </button>
                  )}

                  {delivery.status === "PICKED_UP" && (
                    <button
                      onClick={() => handleUpdateStatus("EN_ROUTE")}
                      disabled={updatingStatus}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      {updatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
                      <span>{t("mark_en_route")}</span>
                    </button>
                  )}

                  {delivery.status === "EN_ROUTE" && (
                    <button
                      onClick={() => handleUpdateStatus("DELIVERED")}
                      disabled={updatingStatus}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      {updatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      <span>{t("mark_delivered")}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Chronological Timeline Logs Feed */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-extrabold text-sm text-text-main mb-4 flex items-center space-x-2">
              <Clock className="h-4 w-4 text-indigo-500" />
              <span>{t("timeline_audit")}</span>
            </h3>

            {logs.length > 0 ? (
              <div className="relative border-l border-slate-100 pl-4 space-y-6">
                {logs.map((log) => {
                  const isDelivered = log.status === "DELIVERED";
                  const isCanceled = log.status === "CANCELED";
                  return (
                    <div key={log.id} className="relative">
                      {/* Timeline node icon */}
                      <span className={`absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${
                        isDelivered ? "bg-emerald-500" :
                        isCanceled ? "bg-rose-500" :
                        "bg-indigo-500"
                      }`} />
                      
                      <div>
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wide font-extrabold ${
                            isDelivered ? "bg-emerald-50 text-emerald-700" :
                            isCanceled ? "bg-rose-50 text-rose-700" :
                            "bg-indigo-50 text-indigo-700"
                          }`}>
                            {getStatusLabel(log.status)}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(log.changedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-text-main mt-1 leading-relaxed font-semibold">
                          {log.notes}
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5 flex items-center space-x-1">
                          <UserIcon className="h-2.5 w-2.5 text-slate-400" />
                          <span>{t("logged_by")} {log.changedBy.name} ({log.changedBy.role})</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-text-muted text-center py-4">{t("no_audit_logs")}</p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
