import { Component, inject, signal } from '@angular/core';
import { ApiService, Cours, MembreReservation, messageErreur } from '../services/api.service';

@Component({
  selector: 'app-admin-reservations',
  template: `
    <div class="conteneur page">
      <h1>Réservations par cours</h1>
      @if (erreur()) { <p class="alerte alerte-erreur" role="alert">{{ erreur() }}</p> }
      <div class="disposition">
        <div class="liste">
          @for (c of cours(); track c.id) {
            <button type="button" class="carte item" [class.actif]="selection()?.id === c.id" (click)="choisir(c)">
              <strong>{{ c.sport }}</strong>
              <span>{{ c.jour }} {{ c.heureDebut }}</span>
              <span class="secondaire">{{ c.reservees }} / {{ c.nbPlaces }}</span>
            </button>
          }
        </div>

        <section class="carte">
          @if (selection(); as s) {
            <h2>{{ s.sport }}</h2>
            <p>{{ s.jour }} {{ s.heureDebut }} – {{ s.heureFin }}</p>
            <p>Places réservées : <strong class="titre-jaune">{{ membres().length }} / {{ s.nbPlaces }}</strong></p>
            @if (!membres().length) {
              <p class="secondaire">Aucune réservation pour ce cours.</p>
            } @else {
              <div class="table-scroll">
                <table>
                  <thead><tr><th>Membre</th><th>E-mail</th><th>Réservé le</th></tr></thead>
                  <tbody>
                    @for (m of membres(); track m.email) {
                      <tr><td>{{ m.nom }}</td><td>{{ m.email }}</td><td>{{ m.dateReservation }}</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          } @else {
            <p class="secondaire">Choisissez un cours dans la liste pour voir ses réservations.</p>
          }
        </section>
      </div>
    </div>
  `,
  styles: `
    .disposition { display: grid; gap: 16px; grid-template-columns: 1fr; align-items: start; }
    @media (min-width: 1024px) { .disposition { grid-template-columns: 1fr 2fr; } }
    .liste { display: flex; flex-direction: column; gap: 8px; }
    .item { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; text-align: left; cursor: pointer;
      color: var(--blanc); font: 400 16px 'Poppins', Arial, sans-serif; padding: 12px 16px; }
    .item.actif { border-color: var(--jaune); }
  `,
})
export class AdminReservationsComponent {
  private readonly api = inject(ApiService);

  protected readonly cours = signal<Cours[]>([]);
  protected readonly selection = signal<Cours | null>(null);
  protected readonly membres = signal<MembreReservation[]>([]);
  protected readonly erreur = signal('');

  constructor() {
    this.api.cours().subscribe({ next: c => this.cours.set(c), error: e => this.erreur.set(messageErreur(e)) });
  }

  protected choisir(c: Cours) {
    this.selection.set(c);
    this.api.reservationsDuCours(c.id).subscribe({
      next: m => this.membres.set(m),
      error: e => this.erreur.set(messageErreur(e)),
    });
  }
}
