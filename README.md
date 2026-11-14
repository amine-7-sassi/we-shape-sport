# We Shape Sport — Projet Web, Objectif 3

Site vitrine d'une salle de sport avec réservation de cours.
SUP'COM 2025/2026 — Groupe A — Enseignante : Dr. Maroua Nouioua.

Le site met en œuvre les prototypes et la charte graphique de l'Objectif 2 (fond noir, accent jaune, police Poppins, approche mobile-first).

## 1. Choix technologiques

| Couche | Technologie | Pourquoi |
|---|---|---|
| Frontend | **Angular 22** (TypeScript) | Routeur, formulaires et client HTTP intégrés ; gardes de route pour les rôles ; un composant par page du sitemap. |
| Backend | **Node.js + Express** (API REST) | Un seul langage (TypeScript/JavaScript) du navigateur au serveur ; échanges en JSON. |
| Base de données | **SQL (SQLite)** via le module `node:sqlite` intégré à Node.js (rien à compiler) | Base relationnelle sans installation de serveur : le fichier `backend/wss.db` est créé automatiquement. Le schéma (`backend/schema.sql`) est du SQL standard. |
| Sécurité | `bcryptjs` + `jsonwebtoken` | Mots de passe hachés, connexion par jeton (JWT), rôles membre / administrateur. |

## 2. Fonctionnalités développées

**Visiteur (sans compte)**
- Accueil, Nos sports, Horaires, Offres et tarifs.
- Planning hebdomadaire par onglets de jours, avec places restantes mises à jour depuis la base.
- Contact : formulaire validé (nom, e-mail, message) + carte Google Maps.
- Inscription et connexion.

**Membre**
- Réserver une place depuis le planning (un visiteur est redirigé vers la connexion, puis revient au planning).
- Page « Mes réservations » : liste et annulation (avec confirmation).

**Administrateur**
- Gestion des cours : ajouter, modifier, supprimer (formulaire + tableau).
- Réservations par cours : liste des membres inscrits et compteur de places.

**Règles de gestion (appliquées côté serveur)**
- Places restantes = places du cours − réservations.
- Une seule réservation par membre et par cours ; réservation refusée si le cours est complet.
- Les routes réservées exigent un jeton valide et le bon rôle (le navigateur seul ne peut pas les contourner).
- Un cours ne peut pas être ramené sous le nombre de places déjà réservées.

## 3. Lancer le projet

Prérequis : Node.js 22.5 ou plus récent (et npm), Git.

Ouvrir **deux terminaux** à la racine du projet.

**Terminal 1 — backend (API sur http://localhost:3000)**
```bash
cd backend
npm install
npm start
```
Au premier lancement, la base est créée avec des données de démonstration.

**Terminal 2 — frontend (site sur http://localhost:4200)**
```bash
cd frontend
npm install
npm start
```
Le site appelle l'API via un proxy (`frontend/proxy.conf.json`) : il faut donc lancer le backend d'abord.

### Comptes de démonstration

| Rôle | E-mail | Mot de passe |
|---|---|---|
| Administrateur | `admin@wss.tn` | `admin123` |
| Membre | `membre@wss.tn` | `membre123` |

Pour repartir d'une base neuve : arrêter le backend, supprimer `backend/wss.db`, relancer.

## 4. Organisation du code

```
backend/
  schema.sql          Tables utilisateur, cours, reservation
  src/db.js           Connexion SQLite, création des tables, données de démo
  src/auth.js         Jetons JWT et contrôle des rôles
  src/server.js       Routes de l'API REST
frontend/
  src/styles.css      Charte graphique (variables CSS déclarées une seule fois)
  src/app/app.*       En-tête (menu mobile), pied de page, routeur
  src/app/app.routes.ts      Une route par page du sitemap
  src/app/guards/            Gardes « membre » et « administrateur »
  src/app/services/          ApiService (appels REST), AuthService (session), intercepteur du jeton
  src/app/pages/             Un composant par page
```

### API REST

| Méthode et route | Accès | Rôle |
|---|---|---|
| `POST /api/auth/inscription`, `POST /api/auth/connexion` | public | Créer un compte, se connecter |
| `GET /api/cours?jour=Lundi` | public | Cours avec places restantes |
| `POST /api/cours/:id/reserver` | membre | Réserver une place |
| `GET /api/mes-reservations`, `DELETE /api/reservations/:id` | membre | Lister, annuler |
| `POST/PUT/DELETE /api/admin/cours[/:id]` | admin | Gérer les cours |
| `GET /api/admin/cours/:id/reservations` | admin | Membres inscrits à un cours |
| `POST /api/contact` | public | Message de contact (affiché dans la console du serveur) |

## 5. Points à finaliser

- Les photos sont remplacées par des visuels en dégradé : y déposer de vraies photos d'entraînement (`frontend/public/`).
- Les prix, horaires d'ouverture, adresse et coordonnées sont des exemples (`frontend/src/app/pages/donnees.ts` et pied de page).
- Le formulaire de contact enregistre le message dans la console du serveur ; un envoi réel par e-mail reste à brancher.
- En production, définir la variable d'environnement `JWT_SECRET` et changer les mots de passe de démonstration.
