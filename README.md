# 📦 Campus Delivery - Système de Suivi de Livraison Locale
## 📝 RAPPORT DE PROJET FIN DE MODULE - ARCHITECTURE ENZYMATIQUE & FULL-STACK

Ce document fait office de rapport technique et de guide de référence pour le projet de fin de module **Campus Delivery**. Il détaille l'architecture logicielle, la structure de la base de données, la logique de sécurité, le fonctionnement du frontend React, ainsi que le design du backend de production basé sur Spring Boot.

---

## 📖 Table des Matières
1. [Présentation Générale](#-présentation-générale)
2. [Fonctionnalités Clés par Rôle](#-fonctionnalités-clés-par-rôle)
3. [Stack Technique & Choix Technologiques](#-stack-technique--choix-technologiques)
4. [Modélisation & Structure de la Base de Données](#-modélisation--structure-de-la-base-de-données)
5. [Architecture Globale & Flux de Données](#-architecture-globale--flux-de-données)
6. [Détails d'Implémentation du Client Web React](#-détails-dimplémentation-du-client-web-react)
7. [Détails d'Implémentation du Service Spring Boot](#-détails-dimplémentation-du-service-spring-boot)
8. [Guide d'Installation et Exécution](#-guide-dinstallation-et-exécution)
9. [Démonstration vidéo]
---

## 📝 Présentation Générale

Le projet **Campus Delivery** est un système intégré de livraison locale conçu pour résoudre les problèmes logistiques internes sur un campus universitaire ou d'entreprise. Il permet de coordonner les flux de colis entre les différents bâtiments de manière efficace, transparente et en temps réel.

L'objectif est de proposer une expérience fluide aux trois acteurs clés de l'écosystème :
- **Les Clients (Étudiants, Professeurs, Staff)** : Qui créent les demandes d'envoi et de réception.
- **Les Livreurs (Couriers)** : Qui prennent en charge physiquement les colis et mettent à jour le statut en temps réel.
- **L'Administrateur (Admin)** : Qui possède une vue panoramique, gère les points de livraison habituels (adresses), supervise les flux et gère les utilisateurs.

---

## 🚀 Fonctionnalités Clés par Rôle

### 💻 Dashboard d'Administration
- **Visualisation Analytique** : Graphiques d'activité quotidienne, taux d'achèvement des livraisons, répartition géographique des points de livraison, et statistiques de temps de transit moyen.
- **Gestion des Utilisateurs** : Création, activation, désactivation et attribution des rôles (`ADMIN`, `CLIENT`, `COURIER`).
- **Cartographie Interactive & Points de Livraison** : Gestion des adresses fréquentes (Bâtiments, Laboratoires, Logements) avec leurs coordonnées précises (latitude/longitude) pour optimiser les trajets.
- **Dispatching Manuel & Automatique** : Possibilité d'assigner manuellement un livreur disponible à un colis fraîchement créé.

### 📱 Espace Client
- **Formulaire de Demande d'Envoi** : Sélection intuitive du point d'enlèvement (pickup) et du point de dépôt (dropoff), description du colis (type, poids estimé, niveau de fragilité).
- **Historique et Suivi Interactif** : Suivi du colis en temps réel sur la carte du campus avec l'itinéraire tracé.
- **Notifications d'Étape** : Journal d'audit indiquant l'heure exacte du ramassage, du transit et de la livraison finale.

### 🚴 Espace Livreur (Courier)
- **Feuille de Route Simplifiée** : Liste claire des livraisons assignées en attente de prise en charge ou en cours de transport.
- **Contrôle d'État d'Étape** : Boutons d'action rapides pour passer le colis à l'état `PICKED_UP`, `EN_ROUTE` ou `DELIVERED`.
- **Notes d'Audit Vocales/Textuelles** : Possibilité d'ajouter des notes spécifiques à chaque mise à jour (ex: "Déposé à l'accueil du bâtiment C").

### 👤 Profil & Internationalisation (Bilingue)
- **Gestion du Profil** : Section dédiée permettant à chaque utilisateur de modifier ses informations de compte (Nom Complet, E-mail) et de renouveler son mot de passe en toute sécurité.
- **Multilingue Intégré (EN/FR)** : Prise en charge complète du français et de l'anglais via un moteur de traduction réactif accessible à la volée sur la barre de contrôle.

---

## 🛠️ Stack Technique & Choix Technologiques

### Frontend (Application Single Page)
- **Framework** : React 18+ (avec TypeScript pour une sécurité de type rigoureuse).
- **Outil d'Assemblage** : Vite (configurations légères, vitesse d'exécution instantanée).
- **Styles** : Tailwind CSS (approches utilitaires pour un design épuré, responsive et élégant).
- **Icônes** : Lucide React (bibliothèque vectorielle moderne).
- **Cartographie** : Canvas SVG interactif personnalisé avec calculs de géolocalisation et tracé d'itinéraires vectoriels.

### Backend de Développement (Intégré)
- **Runtime** : Node.js avec Express.js.
- **Stockage Session** : Base de données en mémoire avec persistance synchronisée sur l'environnement de développement.
- **Authentification** : Gestion des sessions sécurisées via des signatures JWT simulées.

### Backend de Production (Spring Boot)
- **Framework Principal** : Spring Boot 3.2.5 (Java 17).
- **Accès Données** : Spring Data JPA avec Hibernate (ORM).
- **Base de Données** : MySQL (connecteur natif inclus dans le package).
- **Sécurité** : Spring Security couplé avec **JSON Web Token (JJWT)** pour l'authentification et l'autorisation basée sur les rôles.
- **Optimisation du Code** : Project Lombok (génération automatique des getters, setters, constructeurs et builders).

---

## 📊 Modélisation & Structure de la Base de Données

La structure relationnelle garantit la traçabilité complète de chaque colis, de son expéditeur, de son livreur et des différentes étapes clés de son parcours logistique.

<img width="1392" height="768" alt="uml_project" src="https://github.com/user-attachments/assets/a9177fa7-2426-4888-9bc5-f955275706e8" />


### Description Détaillée des Entités

#### 1. `User` (Utilisateurs)
Représente l'ensemble des acteurs interagissant avec l'application.
- `id` (Long, PK) : Identifiant unique.
- `name` (String) : Nom complet de l'acteur.
- `email` (String, Unique) : Adresse email institutionnelle servant de login.
- `password` (String) : Empreinte de hachage du mot de passe.
- `role` (Role Enum) : Rôle d'autorisation (`ADMIN`, `CLIENT`, `COURIER`).
- `isActive` (Boolean) : Statut du compte (autorise ou non la connexion).

#### 2. `Address` (Points Logistiques)
Représente les coordonnées physiques clés du campus.
- `id` (Long, PK) : Identifiant unique.
- `label` (String) : Nom d'usage (ex: "Bâtiment d'Informatique C").
- `addressLine` (String) : Adresse textuelle précise.
- `latitude` / `longitude` (Double) : Coordonnées cartésiennes pour l'affichage de l'itinéraire sur la carte interactif.
- `isFrequent` (Boolean) : Détermine si l'adresse est globale et proposée d'office aux clients.

#### 3. `Delivery` (Colis / Livraisons)
Entité centrale stockant le cycle de vie d'un colis.
- `id` (Long, PK) : Numéro de suivi unique.
- `client` (User, FK) : Référence vers le demandeur.
- `courier` (User, FK, Nullable) : Référence vers le livreur désigné.
- `pickupAddress` (Address, FK) : Point de ramassage du colis.
- `dropoffAddress` (Address, FK) : Point de livraison attendu.
- `status` (DeliveryStatus Enum) : Statut actuel (`CREATED`, `PICKED_UP`, `EN_ROUTE`, `DELIVERED`, `CANCELED`).
- `createdAt` / `updatedAt` (Timestamp) : Trame temporelle de création et de mise à jour.

#### 4. `DeliveryStatusLog` (Journal d'Audit)
Garantit la traçabilité des colis pour prévenir les pertes.
- `id` (Long, PK) : Identifiant du log.
- `delivery` (Delivery, FK) : Colis lié.
- `status` (DeliveryStatus Enum) : Statut appliqué lors de cet événement.
- `changedBy` (User, FK) : Acteur ayant déclenché le changement d'état.
- `notes` (String) : Commentaires contextuels ajoutés à l'étape.
- `changedAt` (Timestamp) : Heure de signature de l'événement.

---

## ⚙️ REST API - Documentation des Endpoints

Le serveur expose des routes REST structurées renvoyant des objets JSON unifiés :

### Authentification & Profil
* `POST /api/auth/login` : Connecte l'utilisateur et retourne un Token JWT ainsi que les métadonnées de l'acteur.
* `PUT /api/auth/profile` : Permet à l'utilisateur de modifier son nom, son email et/ou son mot de passe actuel.

### Livraisons (Deliveries)
* `GET /api/deliveries` : Liste les livraisons (filtrées par rôle si connecté en tant que client ou courier).
* `POST /api/deliveries` : Crée une nouvelle demande de livraison (rôle `CLIENT` ou `ADMIN`).
* `PUT /api/deliveries/:id/status` : Change le statut du paquet (ajoute automatiquement une ligne d'audit dans `statusLogs`).
* `PUT /api/deliveries/:id/assign` : Assigne un livreur tiers à un colis (rôle `ADMIN`).

### Gestion Administrateur
* `GET /api/admin/dashboard/stats` : Compilation des indicateurs de performance (KPI) pour le tableau de bord principal.
* `GET /api/admin/users` : Liste tous les utilisateurs enregistrés dans la base.
* `PUT /api/admin/users/:id/status` : Active ou désactive un compte utilisateur.
* `GET /api/admin/addresses` : Récupère la liste complète des points géographiques éditables.
* `POST /api/admin/addresses` : Enregistre une nouvelle adresse réutilisable sur le campus.

---

## 💻 Détails d'Implémentation du Client Web React

La structure du frontend favorise la modularité pour éviter les lenteurs de compilation :

1. **`src/context/LanguageContext.tsx`** :
   Fournit le dictionnaire de traduction multilingue complet (EN/FR) permettant de permuter l'intégralité du vocabulaire en un clic, tout en conservant l'état actif de l'application.

2. **`src/components/RouteMap.tsx`** :
   Un composant interactif hautement optimisé utilisant des graphismes vectoriels SVG pour cartographier le campus universitaire. Il calcule dynamiquement la position des bâtiments et trace un itinéraire vectoriel dynamique à l'aide de courbes fluides lors du suivi d'un colis.

3. **`src/pages/Profile.tsx`** :
   Offre une interface de contrôle d'identité soignée. Elle affiche des cartes d'autorisation d'accès explicites selon les rôles, affiche les métadonnées système de création de compte et permet la soumission d'informations actualisées à la volée.

---

## ☕ Détails d'Implémentation du Service Spring Boot

Le projet de production utilise une structure modulaire standardisée en couches de responsabilité :

```
/spring-boot/src/main/java/com/campusdelivery/
├── config/              # Configuration Security, JWT et CORS
├── controller/          # Points d'accès REST HTTP
├── dto/                 # Modèles de transfert de données (Request/Response)
├── entity/              # Mappages de base de données relationnels (JPA)
├── exception/           # Intercepteurs globaux d'erreurs logicielles
├── repository/          # Interfaces Spring Data JPA pour les requêtes SQL
└── service/             # Logique d'affaire et validation des règles métiers
```

### Sécurité du Backend
L'architecture de sécurité Spring Security intègre :
- Un filtre d'interception JWT (`JwtAuthenticationFilter`) qui extrait le jeton de l'en-tête `Authorization: Bearer <token>`.
- Une validation de signature asymétrique garantissant que le jeton n'a pas été falsifié.
- Une vérification fine des droits via des annotations de méthodes (ex: `@PreAuthorize("hasRole('ADMIN')")`).

---

## 🚀 Guide d'Installation et Exécution

### Prérequis
- Node.js (v18 ou supérieur)
- Java JDK 17 (pour compiler et exécuter le backend de production Spring Boot)
- Maven 3.8+ (ou utiliser le wrapper Maven inclus)

### Exécution du Projet Frontend & Mock Server (Mode Intégré)
L'application est préconfigurée pour démarrer instantanément en mode de développement unifié :

```bash
# 1. Installer les dépendances NPM
npm install

# 2. Démarrer le serveur de développement Express + Vite (sur le port 3000)
npm run dev
```
Ouvrez ensuite votre navigateur à l'adresse `http://localhost:3000`.

### Compilation du Backend Spring Boot (Mode de Production)
Pour compiler et tester le service Spring Boot autonome :

```bash
# Se placer dans le répertoire du projet Spring Boot
cd spring-boot

# Compiler le projet et packager l'archive JAR exécutable
mvn clean package

# Lancer l'application Spring Boot
java -jar target/campus-delivery-0.0.1-SNAPSHOT.jar
```
Le serveur Spring Boot démarrera par défaut sur le port configuré `8080`, prêt à se connecter à une instance MySQL de production.

---

### 📝 Synthèse de Conception

Le projet **Campus Delivery** représente une synergie parfaite entre un frontend réactif, interactif et hautement esthétique (React, Tailwind CSS, Lucide Icons, SVG Canvas) et un écosystème backend robuste et sécurisé (Spring Boot, Spring Security JWT, JPA Hibernate). Sa modélisation relationnelle rigoureuse en fait une solution extensible, performante et prête pour le déploiement sur le cloud.


🎬 Démonstration vidéo


https://github.com/user-attachments/assets/5de3bba8-6b50-4edb-bf5e-6158306888ff



