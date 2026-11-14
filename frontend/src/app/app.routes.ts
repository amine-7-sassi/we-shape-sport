import { Routes } from '@angular/router';
import { adminGuard, membreGuard } from './guards/guards';

// Une route = une page du sitemap (Objectif 2)
export const routes: Routes = [
  { path: '', title: 'We Shape Sport', loadComponent: () => import('./pages/accueil').then(m => m.AccueilComponent) },
  { path: 'sports', title: 'Nos sports | We Shape Sport', loadComponent: () => import('./pages/sports').then(m => m.SportsComponent) },
  { path: 'planning', title: 'Planning | We Shape Sport', loadComponent: () => import('./pages/planning').then(m => m.PlanningComponent) },
  { path: 'horaires', title: 'Horaires | We Shape Sport', loadComponent: () => import('./pages/horaires').then(m => m.HorairesComponent) },
  { path: 'offres', title: 'Offres et tarifs | We Shape Sport', loadComponent: () => import('./pages/offres').then(m => m.OffresComponent) },
  { path: 'contact', title: 'Contact | We Shape Sport', loadComponent: () => import('./pages/contact').then(m => m.ContactComponent) },
  { path: 'connexion', title: 'Connexion | We Shape Sport', loadComponent: () => import('./pages/connexion').then(m => m.ConnexionComponent) },
  { path: 'inscription', title: 'Inscription | We Shape Sport', loadComponent: () => import('./pages/inscription').then(m => m.InscriptionComponent) },
  { path: 'mes-reservations', title: 'Mes réservations | We Shape Sport', canActivate: [membreGuard],
    loadComponent: () => import('./pages/mes-reservations').then(m => m.MesReservationsComponent) },
  { path: 'admin/cours', title: 'Gestion des cours | We Shape Sport', canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin-cours').then(m => m.AdminCoursComponent) },
  { path: 'admin/reservations', title: 'Réservations par cours | We Shape Sport', canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin-reservations').then(m => m.AdminReservationsComponent) },
  { path: '**', redirectTo: '' },
];
