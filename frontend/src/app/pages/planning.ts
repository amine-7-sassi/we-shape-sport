import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, Cours, JOURS, messageErreur } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-planning',
  template: `
    <div class="conteneur page">
      <h1>Planning hebdomadaire</h1>
      <p class="alerte alerte-info">Consultation libre. Un compte est nécessaire uniquement pour réserver.</p>

      @if (message()) { <p class="alerte alerte-succes" role="status">{{ message() }}</p> }
      @if (erreur()) { <p class="alerte alerte-erreur" role="alert">{{ erreur() }}</p> }

      <div class="onglets" role="tablist" aria-label="Jours de la semaine">
        @for (j of jours; track j) {
          <button type="button" role="tab" class="onglet" [class.actif]="j === jour()" [attr.aria-selected]="j === jour()" (click)="choisir(j)">{{ j.slice(0, 3) }}</button>
        }
      </div>

      <h2>{{ jour() }}</h2>
      @if (chargement()) {
        <p class="secondaire">Chargement…</p>
      } @else if (!cours().length) {
        <p class="secondaire">Aucun cours ce jour-là.</p>
      } @else {
        <div class="liste">
          @for (c of cours(); track c.id) {
            <article class="carte ligne">
              <div class="horaire">{{ c.heureDebut }} – {{ c.heureFin }}</div>
              <div class="sport">{{ c.sport }}</div>
              <div class="places">
                @if (c.placesRestantes > 0) {
                  <span class="pastille">{{ c.placesRestantes }} / {{ c.nbPlaces }} places</span>
                } @else {
                  <span class="pastille complet">Complet</span>
                }
              </div>
              <div class="action">
                @if (c.reserve) {
                  <button class="btn btn-secondaire" type="button" disabled>Réservé</button>
                } @else if (c.placesRestantes === 0) {
                  <button class="btn" type="button" disabled>Complet</button>
                } @else {
                  <button class="btn" type="button" (click)="reserver(c)">Réserver</button>
                }
              </div>
            </article>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .onglets { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 16px; }
    .onglet { min-width: 56px; min-height: 44px; padding: 8px 14px; border-radius: var(--rayon-bouton); cursor: pointer;
      background: transparent; color: var(--blanc); border: 2px solid var(--bordure); font: 500 16px 'Poppins', Arial, sans-serif; }
    .onglet.actif { background: var(--jaune); border-color: var(--jaune); color: var(--noir); font-weight: 700; }
    .liste { display: flex; flex-direction: column; gap: 12px; }
    .ligne { display: grid; grid-template-columns: 1fr; gap: 8px; align-items: center; }
    .horaire { font-weight: 700; }
    .sport { font-size: 18px; color: var(--jaune); font-weight: 700; }
    @media (min-width: 768px) { .ligne { grid-template-columns: 180px 1fr 160px 140px; } }
  `,
})
export class PlanningComponent {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly jours = JOURS;
  protected readonly jour = signal(JOURS[(new Date().getDay() + 6) % 7]); // getDay(): 0 = dimanche
  protected readonly cours = signal<Cours[]>([]);
  protected readonly chargement = signal(true);
  protected readonly message = signal('');
  protected readonly erreur = signal('');

  constructor() { this.charger(); }

  protected choisir(j: string) { this.jour.set(j); this.message.set(''); this.erreur.set(''); this.charger(); }

  private charger() {
    this.chargement.set(true);
    this.api.cours(this.jour()).subscribe({
      next: c => { this.cours.set(c); this.chargement.set(false); },
      error: e => { this.erreur.set(messageErreur(e)); this.chargement.set(false); },
    });
  }

  protected reserver(c: Cours) {
    if (!this.auth.estConnecte()) {
      this.router.navigate(['/connexion'], { queryParams: { retour: '/planning' } });
      return;
    }
    this.message.set(''); this.erreur.set('');
    this.api.reserver(c.id).subscribe({
      next: r => { this.message.set(`${r.message} (${c.sport}, ${c.jour} ${c.heureDebut})`); this.charger(); },
      error: e => { this.erreur.set(messageErreur(e)); this.charger(); },
    });
  }
}
