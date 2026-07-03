import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "fr";

// Comprehensive translations dictionary for CampusDly
const translations = {
  en: {
    // Branding & Navigation
    campus_dly: "CAMPUS",
    status_tracker: "Status Tracker",
    dashboard: "Dashboard",
    deliveries: "Deliveries",
    users: "Users",
    addresses: "Addresses",
    new_request: "New Request",
    history_tracking: "History & Tracking",
    my_deliveries: "My Deliveries",
    profile: "My Profile",
    logout: "Logout",
    profile_title: "Manage Your Profile",
    profile_desc: "Update your account details and password.",
    update_btn: "Save Profile Changes",
    profile_success: "Profile updated successfully!",
    profile_error: "Failed to update profile.",
    
    // Login Screen
    login_title: "CAMPUSDLY",
    login_subtitle: "Local Delivery Tracking System Rebuilt",
    email_address: "Email Address",
    password: "Password",
    access_dashboard: "Access Dashboard",
    verifying_credentials: "Verifying Credentials...",
    quick_login_title: "Quick-Login Demo Accounts (pw: password123)",
    admin: "Admin",
    client: "Client",
    courier: "Courier",
    invalid_credentials: "Invalid credentials. Note: Default password is password123.",

    // Dashboard Screen
    total_deliveries: "Total Deliveries",
    pending_packages: "Pending Packages",
    in_transit: "In Transit",
    completed_deliveries: "Completed Deliveries",
    delivery_volume_trend: "Delivery Volume Trend",
    status_distribution: "Status Distribution",
    recent_jobs: "Recent Campus Jobs",
    create_new_delivery: "Create New Delivery",
    track_route: "Track Route",
    no_jobs_recorded: "No deliveries recorded in the database.",
    ref_id: "Ref",
    route_path: "Route",
    status_header: "Status",
    created_header: "Created",
    actions_header: "Actions",

    // Tracking Details Page
    realtime_tracking: "Real-Time Route Tracking",
    refresh_live: "Refresh Live Location",
    loading_live: "Loading live tracking system...",
    tracking_failed: "Tracking Failed",
    return_dashboard: "Return to Dashboard",
    delivery_progression: "Delivery Progression",
    completed: "Completed!",
    order_canceled: "Order Canceled",
    active_on_route: "Active on route",
    segment_canceled: "This delivery job has been canceled. Tracing is inactive.",
    interactive_nav: "Interactive Navigation Path",
    address_terminals: "Address & Routing Terminals",
    pickup_terminal: "Pickup Terminal",
    dropoff_destination: "Drop-off Destination",
    courier_dispatch: "Courier Dispatch Details",
    assigned_agent: "Assigned Agent",
    awaiting_assignment: "Awaiting Assignment",
    awaiting_assignment_desc: "Admin will dispatch a campus courier to pick up the package.",
    courier_actions: "On-The-Go Courier Actions",
    courier_actions_desc: "You are authorized to change progression on this delivery segment.",
    add_status_notes: "Add Status Notes (Optional)",
    notes_placeholder: "e.g. Package collected from lobby counter",
    timeline_audit: "Timeline Audit & Activity logs",
    no_audit_logs: "No audit logs retrieved yet.",
    logged_by: "Logged by",

    // Action States / Logs status names
    submitted: "Submitted",
    picked_up: "Picked Up",
    en_route: "En Route",
    delivered: "Delivered",
    canceled: "Canceled",
    mark_picked_up: "Mark Picked Up",
    mark_en_route: "Mark En Route",
    mark_delivered: "Mark Delivered",
    job_completed: "Job Completed",
    job_canceled: "Job Canceled",

    // Admin Deliveries Page
    all_deliveries: "Campus Deliveries Console",
    deliveries_desc: "Monitor, filter, assign, and audit campus-wide transit packages.",
    search_placeholder: "Search client or courier name...",
    filter_status: "Filter Status",
    filter_all: "All Statuses",
    view_timeline: "View Timeline Logs",
    assign_courier: "Assign Courier",
    choose_courier: "Choose Courier",
    unassigned: "Unassigned",
    assign_btn: "Assign",
    audit_logs_for: "Audit Logs for Delivery",
    no_logs_for_delivery: "No tracking log entries recorded for this package yet.",
    close: "Close",
    close_map: "Close Map",
    interactive_route_map: "Interactive Route Map",
    tracing_delivery_path: "Tracing delivery path for Job",

    // Admin Users Page
    users_console: "Users Administration",
    users_desc: "Manage profiles, roles, and authorization levels for all system actors.",
    create_new_user: "Create New User",
    full_name: "Full Name",
    user_role: "User Role",
    add_user_btn: "Add User Account",
    creating_user: "Creating User...",
    registered_users: "Registered Campus Accounts",

    // Admin Addresses Page
    addresses_console: "Addresses Directory",
    addresses_desc: "Register and geolocalize key campus delivery and pickup coordinates.",
    register_address: "Register Campus Coordinates",
    location_label: "Location Label",
    location_label_placeholder: "e.g., Computer Science Building Lobby",
    full_street: "Full Street / Delivery Address",
    full_street_placeholder: "e.g., 500 University Ave, Suite 10",
    latitude: "Latitude Coordinate",
    longitude: "Longitude Coordinate",
    add_address_btn: "Add Coordinates",
    registered_addresses: "Registered Locations",
    latitude_short: "LAT",
    longitude_short: "LNG",

    // Client Page
    request_console: "Campus Delivery Request",
    request_desc: "Specify campus pickup & delivery locations to coordinate courier dispatch.",
    frequent_pickup: "Select Frequent Pickup Location",
    frequent_dropoff: "Select Frequent Dropoff Location",
    submit_request: "Submit Delivery Request",
    submitting_request: "Submitting Request...",
    active_deliveries: "Active Delivery Segments",
    active_deliveries_desc: "Real-time updates and active courier assignments.",
    past_completed: "Past Completed Jobs",
    past_completed_desc: "History of completed packages on campus.",
    view_route_map: "View Route Map",
    close_tracking: "Close Tracking",
    route_map_tracking: "Route Map Tracking",
    campus_route_for: "Campus Delivery route map for Job",
  },
  fr: {
    // Branding & Navigation
    campus_dly: "CAMPUS",
    status_tracker: "Suivi des Livraisons",
    dashboard: "Tableau de Bord",
    deliveries: "Livraisons",
    users: "Utilisateurs",
    addresses: "Adresses",
    new_request: "Nouvelle Demande",
    history_tracking: "Historique & Suivi",
    my_deliveries: "Mes Livraisons",
    profile: "Mon Profil",
    logout: "Déconnexion",
    profile_title: "Gérer Votre Profil",
    profile_desc: "Mettez à jour vos informations de compte et votre mot de passe.",
    update_btn: "Enregistrer les modifications",
    profile_success: "Profil mis à jour avec succès !",
    profile_error: "Échec de la mise à jour du profil.",

    // Login Screen
    login_title: "CAMPUSDLY",
    login_subtitle: "Système de suivi des livraisons de campus reconstruit",
    email_address: "Adresse E-mail",
    password: "Mot de passe",
    access_dashboard: "Accéder au Tableau de Bord",
    verifying_credentials: "Vérification des identifiants...",
    quick_login_title: "Comptes démo de connexion rapide (mdp: password123)",
    admin: "Admin",
    client: "Client",
    courier: "Coursier",
    invalid_credentials: "Identifiants invalides. Remarque : Le mot de passe par défaut est password123.",

    // Dashboard Screen
    total_deliveries: "Total des Livraisons",
    pending_packages: "Colis en Attente",
    in_transit: "En Cours de Route",
    completed_deliveries: "Livraisons Terminées",
    delivery_volume_trend: "Tendance du Volume de Livraison",
    status_distribution: "Répartition des Statuts",
    recent_jobs: "Missions Récentes du Campus",
    create_new_delivery: "Créer une Nouvelle Livraison",
    track_route: "Suivre l'itinéraire",
    no_jobs_recorded: "Aucune livraison enregistrée dans la base de données.",
    ref_id: "Réf",
    route_path: "Itinéraire",
    status_header: "Statut",
    created_header: "Créé le",
    actions_header: "Actions",

    // Tracking Details Page
    realtime_tracking: "Suivi d'Itinéraire en Temps Réel",
    refresh_live: "Actualiser la Position en Direct",
    loading_live: "Chargement du système de suivi en direct...",
    tracking_failed: "Échec du Suivi",
    return_dashboard: "Retour au Tableau de Bord",
    delivery_progression: "Progression de la Livraison",
    completed: "Terminée !",
    order_canceled: "Commande Annulée",
    active_on_route: "Actif en cours de route",
    segment_canceled: "Cette mission de livraison a été annulée. Le suivi est inactif.",
    interactive_nav: "Itinéraire de Navigation Interactif",
    address_terminals: "Terminaux d'Adresses & de Routage",
    pickup_terminal: "Point de Ramassage",
    dropoff_destination: "Destination de Livraison",
    courier_dispatch: "Détails d'Affectation du Coursier",
    assigned_agent: "Agent Assigné",
    awaiting_assignment: "En Attente d'Affectation",
    awaiting_assignment_desc: "L'administrateur va dépêcher un coursier de campus pour récupérer le colis.",
    courier_actions: "Actions du Coursier en Déplacement",
    courier_actions_desc: "Vous êtes autorisé à modifier la progression de ce segment de livraison.",
    add_status_notes: "Ajouter des Notes de Statut (Optionnel)",
    notes_placeholder: "ex. Colis récupéré au comptoir du hall",
    timeline_audit: "Audit Chronologique & Journal d'Activité",
    no_audit_logs: "Aucun journal d'audit récupéré pour le moment.",
    logged_by: "Enregistré par",

    // Action States / Logs status names
    submitted: "Soumis",
    picked_up: "Récupéré",
    en_route: "En Route",
    delivered: "Livré",
    canceled: "Annulé",
    mark_picked_up: "Marquer comme Récupéré",
    mark_en_route: "Marquer en Cours",
    mark_delivered: "Marquer comme Livré",
    job_completed: "Mission Terminée",
    job_canceled: "Mission Annulée",

    // Admin Deliveries Page
    all_deliveries: "Console des Livraisons du Campus",
    deliveries_desc: "Surveillez, filtrez, assignez et auditez les colis en transit sur le campus.",
    search_placeholder: "Rechercher un client ou un coursier...",
    filter_status: "Filtrer par Statut",
    filter_all: "Tous les Statuts",
    view_timeline: "Voir l'Historique",
    assign_courier: "Assigner un Coursier",
    choose_courier: "Choisir un Coursier",
    unassigned: "Non Assigné",
    assign_btn: "Assigner",
    audit_logs_for: "Journal d'Audit pour la Livraison",
    no_logs_for_delivery: "Aucun enregistrement de suivi pour ce colis pour le moment.",
    close: "Fermer",
    close_map: "Fermer la Carte",
    interactive_route_map: "Carte d'Itinéraire Interactive",
    tracing_delivery_path: "Tracé de l'itinéraire pour le Job",

    // Admin Users Page
    users_console: "Administration des Utilisateurs",
    users_desc: "Gérez les profils, les rôles et les niveaux d'autorisation de tous les acteurs.",
    create_new_user: "Créer un Nouvel Utilisateur",
    full_name: "Nom Complet",
    user_role: "Rôle de l'Utilisateur",
    add_user_btn: "Ajouter un Compte",
    creating_user: "Création de l'utilisateur...",
    registered_users: "Comptes Campus Enregistrés",

    // Admin Addresses Page
    addresses_console: "Annuaire des Adresses",
    addresses_desc: "Enregistrez et géolocalisez les coordonnées clés de livraison et de ramassage du campus.",
    register_address: "Enregistrer des Coordonnées Campus",
    location_label: "Libellé du Lieu",
    location_label_placeholder: "ex. Hall du bâtiment informatique",
    full_street: "Adresse Complète / Adresse de Livraison",
    full_street_placeholder: "ex. 500 University Ave, Bureau 10",
    latitude: "Coordonnée Latitude",
    longitude: "Coordonnée Longitude",
    add_address_btn: "Ajouter les Coordonnées",
    registered_addresses: "Emplacements Enregistrés",
    latitude_short: "LAT",
    longitude_short: "LNG",

    // Client Page
    request_console: "Demande de Livraison de Campus",
    request_desc: "Spécifiez les lieux de ramassage et de livraison pour coordonner l'envoi d'un coursier.",
    frequent_pickup: "Sélectionner le Point de Ramassage Fréquent",
    frequent_dropoff: "Sélectionner la Destination de Livraison Fréquente",
    submit_request: "Soumettre la Demande de Livraison",
    submitting_request: "Soumission de la Demande...",
    active_deliveries: "Segments de Livraison Actifs",
    active_deliveries_desc: "Mises à jour en temps réel et coursiers assignés.",
    past_completed: "Missions Passées Terminées",
    past_completed_desc: "Historique des colis livrés sur le campus.",
    view_route_map: "Voir la Carte",
    close_tracking: "Fermer le Suivi",
    route_map_tracking: "Suivi de la Carte d'Itinéraire",
    campus_route_for: "Carte de livraison campus pour le Job",
  }
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations["en"]) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("campus_dly_lang");
    return (saved === "fr" || saved === "en") ? saved : "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("campus_dly_lang", lang);
  };

  const t = (key: keyof typeof translations["en"]): string => {
    const translationSet = translations[language] || translations["en"];
    return translationSet[key] || translations["en"][key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};
