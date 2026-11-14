import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, Reservation, messageErreur } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-mes-reservations',
  imports: [RouterLink],
  template: `
    <div class="conteneur page">
      <h1>Mes réservations</h1>
      <p class="secondaire">Connecté en tant que {{ auth.utilisateur()?.nom }}.</p>
      @if (message()) { <p class="alerte alerte-succes" role="status">{{ message() }}</p> }
      @if (erreur()) { <p class="alerte alerte-erreur" role="alert">{{ erreur() }}</p> }

      @if (chargement()) {
        <p class="secondaire">Chargement…</p>
      } @else if (!reservations().length) {
        <div class="carte">
          <p>Vous n'avez aucune réservation pour le moment.</p>
          <a routerLink="/planning" class="btn">Voir le planning</a>
        </div>
      } @else {
        <div class="carte table-scroll">
          <table>
            <thead><tr><th>Sport</th><th>Jour</th><th>Horaire</th><th></th></tr></thead>
            <tbody>
              @for (r of reservations(); track r.id) {
                <tr>
                  <td>{{ r.sport }}</td><td>{{ r.jour }}</td><td>{{ r.heureDebut }} – {{ r.heureFin }}</td>
                  <td><button class="btn btn-secondaire" type="button" (click)="annuler(r)">Annuler</button></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class MesReservationsComponent {
  private readonly api = inject(ApiService);
  protected readonly auth = inject(AuthService);

  protected readonly reservations = signal<Reservation[]>([]);
  protected readonly chargement = signal(true);
  protected readonly message = signal('');
  protected readonly erreur = signal('');

  constructor() { this.charger(); }

  private charger() {
    this.api.mesReservations().subscribe({
      next: r => { this.reservations.set(r); this.chargement.set(false); },
      error: e => { this.erreur.set(messageErreur(e)); this.chargement.set(false); },
    });
  }

  protected annuler(r: Reservation) {
    if (!confirm(`Annuler votre réservation de ${r.sport} (${r.jour} ${r.heureDebut}) ?`)) return;
    this.message.set(''); this.erreur.set('');
    this.api.annuler(r.id).subscribe({
      next: m => { this.message.set(m.message); this.charger(); },
      error: e => this.erreur.set(messageErreur(e)),
    });
  }
}
