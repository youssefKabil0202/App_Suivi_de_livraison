import { LayoutDashboard, Truck, Users, MapPin, LogOut, Shield, Map, Languages, User as UserIcon } from "lucide-react";
import { User } from "../types";
import { useTranslation, Language } from "../context/LanguageContext";

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ currentUser, activeTab, setActiveTab, onLogout }: SidebarProps) {
  const { t, language, setLanguage } = useTranslation();

  // Navigation tabs based on user role
  const getNavItems = () => {
    const baseItems = [];
    if (currentUser.role === "ADMIN") {
      baseItems.push(
        { id: "dashboard", label: t("dashboard"), icon: LayoutDashboard },
        { id: "deliveries", label: t("deliveries"), icon: Truck },
        { id: "users", label: t("users"), icon: Users },
        { id: "addresses", label: t("addresses"), icon: MapPin }
      );
    } else if (currentUser.role === "CLIENT") {
      baseItems.push(
        { id: "client_deliveries", label: t("new_request"), icon: Truck },
        { id: "client_history", label: t("history_tracking"), icon: Map }
      );
    } else {
      // COURIER
      baseItems.push(
        { id: "courier_deliveries", label: t("my_deliveries"), icon: Truck }
      );
    }

    // Add Profile tab for all authenticated sessions
    baseItems.push({ id: "profile", label: t("profile"), icon: UserIcon });
    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-[#1E1B4B] text-white flex flex-col h-screen fixed left-0 top-0 z-20 shadow-xl border-r border-[#1E1B4B]">
      {/* Brand Header */}
      <div className="p-6 pb-8 flex items-center space-x-3">
        <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center font-extrabold text-lg text-[#1E1B4B] shadow-md">
          {t("campus_dly").charAt(0)}
        </div>
        <div>
          <h1 className="font-extrabold text-lg tracking-tight leading-none text-white">
            {t("campus_dly")}<span className="text-accent">DLY</span>
          </h1>
          <span className="text-[10px] text-white/50 font-mono tracking-wider uppercase font-semibold">
            {t("status_tracker")}
          </span>
        </div>
      </div>

      {/* User Info Card */}
      <div className="p-4 mx-4 mb-6 bg-white/5 rounded-xl border border-white/10 flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent">
          {currentUser.name.charAt(0)}
        </div>
        <div className="overflow-hidden">
          <p className="font-semibold text-sm text-white truncate">{currentUser.name}</p>
          <div className="flex items-center space-x-1 mt-0.5">
            <Shield className="h-3 w-3 text-accent" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-extrabold">
              {currentUser.role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-0 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-6 py-3.5 text-sm transition-all duration-150 border-l-4 ${
                isActive
                  ? "bg-white/10 text-white border-accent font-semibold"
                  : "text-white/70 hover:bg-white/5 hover:text-white border-transparent"
              }`}
            >
              <IconComponent className={`h-4.5 w-4.5 ${isActive ? "text-accent" : "text-white/60 group-hover:text-white"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer area with language switcher & logout */}
      <div className="p-4 border-t border-white/10 space-y-3">
        {/* Language Switcher */}
        <div className="bg-white/5 rounded-xl p-2 flex items-center justify-between border border-white/10">
          <div className="flex items-center space-x-1.5 text-white/60">
            <Languages className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Lang</span>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => setLanguage("en")}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                language === "en" 
                  ? "bg-accent text-[#1E1B4B]" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("fr")}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                language === "fr" 
                  ? "bg-accent text-[#1E1B4B]" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              FR
            </button>
          </div>
        </div>

        {/* Logout Action */}
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 text-white/60 hover:bg-danger/10 hover:text-danger rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>{t("logout")}</span>
        </button>
      </div>
    </aside>
  );
}

