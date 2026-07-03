import React, { useState } from "react";
import { authService } from "../services/api";
import { Shield, Mail, Lock, LogIn, Truck, User as UserIcon, Languages } from "lucide-react";
import { useTranslation } from "../context/LanguageContext";

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const { t, language, setLanguage } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login(email, password);
      if (res.success && res.data) {
        onLoginSuccess(res.data);
      } else {
        setError(res.message || t("invalid_credentials"));
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || t("invalid_credentials")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("password123");
  };

  return (
    <div className="min-screen bg-brand-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden h-screen w-screen">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] rounded-full bg-primary/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[35rem] h-[35rem] rounded-full bg-accent/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-xl relative z-10 animate-fadeIn">
        {/* Language Selection Row */}
        <div className="flex justify-end">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-1 flex items-center space-x-1">
            <Languages className="h-3.5 w-3.5 text-slate-400 mx-1.5" />
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                language === "en" 
                  ? "bg-[#1E1B4B] text-white" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-150"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage("fr")}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                language === "fr" 
                  ? "bg-[#1E1B4B] text-white" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-150"
              }`}
            >
              FR
            </button>
          </div>
        </div>

        {/* Branding Area */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-[#1E1B4B] text-accent rounded-xl flex items-center justify-center font-extrabold text-2xl shadow-md">
            {t("login_title").charAt(0)}
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-text-main tracking-tight">
            {t("login_title").slice(0, 6)}<span className="text-primary">{t("login_title").slice(6)}</span>
          </h2>
          <p className="mt-1.5 text-sm text-text-muted">
            {t("login_subtitle")}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger p-3.5 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {/* Input Form */}
        <form className="mt-4 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-mono uppercase tracking-wider text-text-muted font-semibold mb-1.5">
                {t("email_address")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-text-main placeholder-slate-400 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-150"
                  placeholder="name@campusdelivery.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-mono uppercase tracking-wider text-text-muted font-semibold mb-1.5">
                {t("password")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-text-main placeholder-slate-400 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-150"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 bg-primary hover:bg-indigo-700 text-white text-sm font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-150 shadow-md active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{t("verifying_credentials")}</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <LogIn className="h-4 w-4" />
                  <span>{t("access_dashboard")}</span>
                </span>
              )}
            </button>
          </div>
        </form>


      </div>
    </div>
  );
}
