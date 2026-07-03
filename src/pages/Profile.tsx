import React, { useState } from "react";
import { User, Mail, Lock, Shield, CheckCircle2, AlertCircle, Calendar, Key, Save } from "lucide-react";
import { authService } from "../services/api";
import { User as UserType } from "../types";
import { useTranslation } from "../context/LanguageContext";

interface ProfileProps {
  currentUser: UserType;
  onProfileUpdate: (updatedUser: UserType) => void;
}

export default function Profile({ currentUser, onProfileUpdate }: ProfileProps) {
  const { t, language } = useTranslation();
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await authService.updateProfile(name, email, password || undefined);
      if (res.success && res.data) {
        setSuccess(t("profile_success"));
        onProfileUpdate(res.data);
        setPassword(""); // Clear password field
      } else {
        setError(res.message || t("profile_error"));
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        (language === "fr" ? "Une erreur est survenue lors de la mise à jour." : "An error occurred while updating profile.")
      );
    } finally {
      setLoading(false);
    }
  };

  // Roles permission mapping to show rich, personalized details
  const getRolePermissions = () => {
    switch (currentUser.role) {
      case "ADMIN":
        return [
          language === "fr" ? "Accès complet à la console d'administration" : "Full access to administration console",
          language === "fr" ? "Gestion complète de tous les utilisateurs et comptes" : "Complete control of system users and accounts",
          language === "fr" ? "Dispatch manuel et assignation des livreurs" : "Manual courier assignment and dispatches",
          language === "fr" ? "Configuration des adresses et terminaux de livraison" : "Configuration of terminal coordinates and addresses",
          language === "fr" ? "Accès aux statistiques de volume globales" : "Overview of global volume trends & statistics"
        ];
      case "CLIENT":
        return [
          language === "fr" ? "Création de nouvelles demandes de livraison de colis" : "Create new delivery requests",
          language === "fr" ? "Suivi en temps réel de vos paquets en cours" : "Real-time tracking of active shipments",
          language === "fr" ? "Consultation complète de votre historique de livraison" : "Complete historic records of sent deliveries",
          language === "fr" ? "Interaction avec les cartes de navigation du campus" : "Interaction with campus coordinate route mapping"
        ];
      case "COURIER":
        return [
          language === "fr" ? "Accès exclusif à vos segments de livraison assignés" : "Exclusive access to assigned delivery segments",
          language === "fr" ? "Mise à jour des états de livraison (Récupéré, En Route, Livré)" : "Update package transit states (Picked Up, En Route, Delivered)",
          language === "fr" ? "Ajout de notes d'audit d'étape à la volée" : "Insert on-the-go audit log comments",
          language === "fr" ? "Visualisation de l'itinéraire sur la carte interactive" : "Visualize direct target routing paths on the map"
        ];
      default:
        return [];
    }
  };

  const permissions = getRolePermissions();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Info */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-text-main">
          {t("profile_title")}
        </h2>
        <p className="text-sm text-text-muted">
          {t("profile_desc")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Card Overview */}
        <div className="space-y-6 lg:col-span-1">
          {/* Main User Avatar Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-indigo-50 border-4 border-indigo-100 flex items-center justify-center font-extrabold text-3xl text-primary shadow-inner mb-4 relative">
              {currentUser.name.charAt(0)}
              <span className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white ${
                currentUser.role === "ADMIN" ? "bg-accent" : currentUser.role === "COURIER" ? "bg-success" : "bg-primary"
              }`} />
            </div>
            
            <h3 className="font-extrabold text-lg text-text-main leading-tight mb-1">{currentUser.name}</h3>
            <p className="text-xs text-text-muted font-mono mb-4">{currentUser.email}</p>
            
            <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              currentUser.role === "ADMIN" ? "bg-amber-50 text-amber-700 border border-amber-200" :
              currentUser.role === "COURIER" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
              "bg-indigo-50 text-indigo-700 border border-indigo-200"
            }`}>
              <Shield className="h-3 w-3" />
              <span>{currentUser.role}</span>
            </span>
          </div>

          {/* Account System Metadata */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-mono font-black text-text-main uppercase tracking-wider border-b border-slate-100 pb-2.5">
              {language === "fr" ? "Métadonnées de Compte" : "Account Metadata"}
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted font-medium flex items-center space-x-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>{language === "fr" ? "Créé le" : "Created on"}</span>
                </span>
                <span className="font-mono text-text-main font-semibold">
                  {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : "Active Demo Session"}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted font-medium flex items-center space-x-1.5">
                  <Key className="h-3.5 w-3.5 text-slate-400" />
                  <span>{language === "fr" ? "ID Système" : "System Ref ID"}</span>
                </span>
                <span className="font-mono text-text-main font-bold">
                  #{currentUser.id}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted font-medium flex items-center space-x-1.5">
                  <Shield className="h-3.5 w-3.5 text-slate-400" />
                  <span>{language === "fr" ? "Statut" : "Status"}</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {language === "fr" ? "ACTIF" : "ACTIVE"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns - Form and Permissions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Status Notifications */}
          {error && (
            <div className="p-4 bg-danger/5 border border-danger/25 rounded-2xl flex items-start space-x-3 text-danger text-sm shadow-sm animate-fadeIn">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">{language === "fr" ? "Erreur" : "Error Occurred"}</p>
                <p className="text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-3 text-emerald-800 text-sm shadow-sm animate-fadeIn">
              <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-bold">{language === "fr" ? "Succès" : "Success!"}</p>
                <p className="text-xs mt-0.5">{success}</p>
              </div>
            </div>
          )}

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-text-main text-base border-b border-slate-100 pb-3">
              {language === "fr" ? "Informations Personnelles" : "Personal Information"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-text-muted font-bold">
                  {language === "fr" ? "Nom Complet" : "Full Name"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-text-main text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-text-muted font-bold">
                  {language === "fr" ? "Adresse E-mail" : "Email Address"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-text-main text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-text-muted font-bold">
                  {language === "fr" ? "Nouveau Mot de Passe (laisser vide si inchangé)" : "New Password (leave blank if unchanged)"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-text-main text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>
                <p className="text-[10px] text-text-muted leading-tight">
                  {language === "fr"
                    ? "Par mesure de sécurité pour ce prototype, la modification est synchronisée dans la base locale."
                    : "For testing purposes in this environment, changes are securely updated in local session storage."}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? (language === "fr" ? "Enregistrement..." : "Saving Changes...") : t("update_btn")}</span>
              </button>
            </div>
          </form>

          {/* Role-based Authorization Scopes Details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-text-main text-base mb-4 flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>{language === "fr" ? "Niveaux d'Autorisation & Droits" : "Assigned System Capabilities"}</span>
            </h3>

            <div className="space-y-3">
              {permissions.map((perm, index) => (
                <div key={index} className="flex items-start space-x-3 text-sm text-slate-600">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{perm}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
