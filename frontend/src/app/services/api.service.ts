import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Utilisateur } from './auth.service';

export interface Cours {
  id: number; sport: string; jour: string; heureDebut: string; heureFin: string;
  nbPlaces: number; reservees: number; placesRestantes: number; reserve: boolean;
}
export interface Reservation {
  id: number; idCours: number; sport: string; jour: string; heureDebut: string; heureFin: string; dateReservation: string;
}
export interface MembreReservation { nom: string; email: string; dateReservation: string; }
export interface CoursForm { sport: string; jour: string; heureDebut: string; heureFin: string; nbPlaces: number; }
export interface ReponseAuth { token: string; utilisateur: Utilisateur; }
export interface Message { message: string; }

export const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

/** Tous les appels à l'API REST Node.js passent par ce service. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  inscription(nom: string, email: string, motDePasse: string): Observable<ReponseAuth> {
    return this.http.post<ReponseAuth>('/api/auth/inscription', { nom, email, motDePasse });
  }
  connexion(email: string, motDePasse: string): Observable<ReponseAuth> {
    return this.http.post<ReponseAuth>('/api/auth/connexion', { email, motDePasse });
  }

  cours(jour?: string): Observable<Cours[]> {
    return this.http.get<Cours[]>('/api/cours', { params: jour ? { jour } : {} });
  }
  reserver(idCours: number): Observable<Message> {
    return this.http.post<Message>(`/api/cours/${idCours}/reserver`, {});
  }
  mesReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>('/api/mes-reservations');
  }
  annuler(idReservation: number): Observable<Message> {
    return this.http.delete<Message>(`/api/reservations/${idReservation}`);
  }

  ajouterCours(c: CoursForm): Observable<Message> { return this.http.post<Message>('/api/admin/cours', c); }
  modifierCours(id: number, c: CoursForm): Observable<Message> { return this.http.put<Message>(`/api/admin/cours/${id}`, c); }
  supprimerCours(id: number): Observable<Message> { return this.http.delete<Message>(`/api/admin/cours/${id}`); }
  reservationsDuCours(id: number): Observable<MembreReservation[]> {
    return this.http.get<MembreReservation[]>(`/api/admin/cours/${id}/reservations`);
  }

  contact(nom: string, email: string, message: string): Observable<Message> {
    return this.http.post<Message>('/api/contact', { nom, email, message });
  }
}

/** Extrait un message lisible d'une erreur HTTP. */
export function messageErreur(e: any): string {
  return e?.error?.message ?? 'Le serveur est injoignable. Vérifiez que l\'API est lancée.';
}
