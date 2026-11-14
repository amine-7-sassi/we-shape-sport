import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, Cours, JOURS, messageErreur } from '../services/api.service';

@Component({
  selector: 'app-admin-cours',
  imports: [FormsModule],
  template: `
    <div class="conteneur page">
      <div class="entete-page">
        <h1>Gestion des cours</h1>
        <button class="btn" type="button" (click)="nouveau()">+ Ajouter un cours</button>
      </div>
      @if (message()) { <p class="alerte alerte-succes" role="status">{{ message() }}</p> }
      @if (erreur()) { <p class="alerte alerte-erreur" role="alert">{{ erreur() }}</p> }

      <div class="disposition">
        <div class="carte table-scroll">
          <table>
            <thead><tr><th>Sport</th><th>Jour</th><th>Horaire</th><th>Places</th><th>Actions</th></tr></thead>
            <tbody>
              @for (c of cours(); track c.id) {
                <tr>
                  <td>{{ c.sport }}</td><td>{{ c.jour }}</td><td>{{ c.heureDebut }} – {{ c.heureFin }}</td>
                  <td>{{ c.reservees }} / {{ c.nbPlaces }}</td>
                  <td class="actions">
                    <button class="btn btn-secondaire" type="button" (click)="modifier(c)">Modifier</button>
                    <button class="btn btn-secondaire" type="button" (click)="supprimer(c)">Supprimer</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <form class="carte" (ngSubmit)="enregistrer()" novalidate>
          <h2>{{ edition() ? 'Modifier le cours' : 'Ajouter un cours' }}</h2>
          <div class="champ">
            <label for="sport">Sport</label>
            <input id="sport" name="sport" [ngModel]="sport()" (ngModelChange)="sport.set($event)">
          </div>
          <div class="champ">
            <label for="jour">Jour</label>
            <select id="jour" name="jour" [ngModel]="jour()" (ngModelChange)="jour.set($event)">
              @for (j of jours; track j) { <option [value]="j">{{ j }}</option> }
            </select>
          </div>
          <div class="champ">
            <label for="debut">Heure de début</label>
            <input id="debut" name="debut" type="time" [ngModel]="debut()" (ngModelChange)="debut.set($event)">
          </div>
          <div class="champ">
            <label for="fin">Heure de fin</label>
            <input id="fin" name="fin" type="time" [ngModel]="fin()" (ngModelChange)="fin.set($event)">
          </div>
          <div class="champ">
            <label for="places">Nombre de places</label>
            <input id="places" name="places" type="number" min="1" [ngModel]="places()" (ngModelChange)="places.set($event)">
          </div>
          <div class="actions">
            <button class="btn" type="submit">Enregistrer</button>
            <button class="btn btn-secondaire" type="button" (click)="nouveau()">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: `
    .entete-page { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
    .disposition { display: grid; gap: 16px; grid-template-columns: 1fr; align-items: start; }
    @media (min-width: 1024px) { .disposition { grid-template-columns: 2fr 1fr; } }
    .actions { display: flex; gap: 8px; flex-wrap: wrap; }
    td .btn { min-height: 36px; padding: 4px 12px; font-size: 14px; }
  `,
})
export class AdminCoursComponent {
  private readonly api = inject(ApiService);
  protected readonly jours = JOURS;

  protected readonly cours = signal<Cours[]>([]);
  protected readonly message = signal('');
  protected readonly erreur = signal('');
  protected readonly edition = signal<number | null>(null);

  protected readonly sport = signal('');
  protected readonly jour = signal('Lundi');
  protected readonly debut = signal('');
  protected readonly fin = signal('');
  protected readonly places = signal<number>(10);

  constructor() { this.charger(); }

  private charger() {
    this.api.cours().subscribe({ next: c => this.cours.set(c), error: e => this.erreur.set(messageErreur(e)) });
  }

  protected nouveau() {
    this.edition.set(null); this.sport.set(''); this.jour.set('Lundi'); this.debut.set(''); this.fin.set(''); this.places.set(10);
  }

  protected modifier(c: Cours) {
    this.edition.set(c.id); this.sport.set(c.sport); this.jour.set(c.jour);
    this.debut.set(c.heureDebut); this.fin.set(c.heureFin); this.places.set(c.nbPlaces);
    this.message.set(''); this.erreur.set('');
  }

  protected enregistrer() {
    this.message.set(''); this.erreur.set('');
    const donnees = { sport: this.sport(), jour: this.jour(), heureDebut: this.debut(), heureFin: this.fin(), nbPlaces: Number(this.places()) };
    const id = this.edition();
    const appel = id === null ? this.api.ajouterCours(donnees) : this.api.modifierCours(id, donnees);
    appel.subscribe({
      next: r => { this.message.set(r.message); this.nouveau(); this.charger(); },
      error: e => this.erreur.set(messageErreur(e)),
    });
  }

  protected supprimer(c: Cours) {
    if (!confirm(`Supprimer le cours ${c.sport} (${c.jour} ${c.heureDebut}) ? Les réservations associées seront supprimées.`)) return;
    this.message.set(''); this.erreur.set('');
    this.api.supprimerCours(c.id).subscribe({
      next: r => { this.message.set(r.message); this.charger(); },
      error: e => this.erreur.set(messageErreur(e)),
    });
  }
}
