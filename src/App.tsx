import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Deliveries from "./pages/Deliveries";
import Users from "./pages/Users";
import Addresses from "./pages/Addresses";
import ClientDeliveries from "./pages/ClientDeliveries";
import CourierDeliveries from "./pages/CourierDeliveries";
import TrackingDetail from "./pages/TrackingDetail";
import Profile from "./pages/Profile";
import { authService } from "./services/api";
import { User } from "./types";
import { RefreshCw, Play, ShieldAlert, CheckCircle } from "lucide-react";
import { useTranslation } from "./context/LanguageContext";

export default function App() {
  const { t, language, setLanguage } = useTranslation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedTrackingId, setSelectedTrackingId] = useState<number | null>(null);
  const [healthStatus, setHealthStatus] = useState<{ status: string; db: string } | null>(null);

  // Load user session on start
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      // Set appropriate default tab based on role
      setDefaultTabForRole(user.role);
    }

    // Fetch server health check
    fetch("/api/health")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setHealthStatus({ status: data.data.status, db: data.data.database });
        }
      })
      .catch(err => console.error("Health check error", err));
  }, []);

  const setDefaultTabForRole = (role: "ADMIN" | "CLIENT" | "COURIER") => {
    if (role === "ADMIN") setActiveTab("dashboard");
    else if (role === "CLIENT") setActiveTab("client_deliveries");
    else if (role === "COURIER") setActiveTab("courier_deliveries");
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setDefaultTabForRole(user.role);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  // Helper to quickly swap simulation roles inside the live preview
  const handleQuickSimulate = (email: string) => {
    authService.logout();
    setLoadingSim(true);
    setTimeout(async () => {
      try {
        const res = await authService.login(email, "password123");
        if (res.success && res.data) {
          setCurrentUser(res.data);
          setDefaultTabForRole(res.data.role);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSim(false);
      }
    }, 400);
  };

  const [loadingSim, setLoadingSim] = useState(false);

  // Resolve active tab view
  const renderTabContent = () => {
    if (selectedTrackingId !== null) {
      return (
        <TrackingDetail
          deliveryId={selectedTrackingId}
          onBack={() => setSelectedTrackingId(null)}
        />
      );
    }

    switch (activeTab) {
      case "dashboard":
        return <Dashboard onTrackDelivery={setSelectedTrackingId} />;
      case "deliveries":
        return <Deliveries onTrackDelivery={setSelectedTrackingId} />;
      case "users":
        return <Users />;
      case "addresses":
        return <Addresses />;
      case "client_deliveries":
      case "client_history":
        return <ClientDeliveries onTrackDelivery={setSelectedTrackingId} />;
      case "courier_deliveries":
        return <CourierDeliveries onTrackDelivery={setSelectedTrackingId} />;
      case "profile":
        return <Profile currentUser={currentUser} onProfileUpdate={setCurrentUser} />;
      default:
        return <Dashboard onTrackDelivery={setSelectedTrackingId} />;
    }
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-brand-bg text-text-main flex font-sans antialiased">
      {/* Persistent Left Sidebar */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedTrackingId(null);
        }}
        onLogout={handleLogout}
      />

      {/* Main Structural Layout Area */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen relative overflow-x-hidden">
        
        {/* Header Ribbon / Simulator Bar */}
        <header className="h-16 border-b border-slate-200 bg-white/85 backdrop-blur-sm px-8 flex items-center justify-between sticky top-0 z-10">
          
          {/* Health indicator */}
          <div className="flex items-center space-x-2.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          {/* Language Selection Bar */}
          <div className="flex items-center">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-1 flex items-center space-x-1 shadow-sm">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                  language === "en" 
                    ? "bg-[#1E1B4B] text-white shadow-sm" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage("fr")}
                className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                  language === "fr" 
                    ? "bg-[#1E1B4B] text-white shadow-sm" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                FR
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Context Panel */}
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}
