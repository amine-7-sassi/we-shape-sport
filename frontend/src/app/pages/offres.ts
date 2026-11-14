import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OFFRES } from './donnees';

@Component({
  selector: 'app-offres',
  imports: [RouterLink],
  template: `
    <div class="conteneur page">
      <h1>Offres et tarifs</h1>
      <div class="grille grille-4">
        @for (o of offres; track o.nom) {
          <article class="carte" [class.etudiante]="o.etudiante">
            @if (o.etudiante) { <span class="badge">Étudiants</span> }
            <h2>{{ o.nom }}</h2>
            <div class="prix">{{ o.prix }} <small>DT</small></div>
            <p class="secondaire">{{ o.detail }}</p>
            <a routerLink="/contact" class="btn btn-secondaire btn-bloc">Nous contacter</a>
          </article>
        }
      </div>
      <p class="alerte alerte-info" style="margin-top:24px">Pas de paiement ni de souscription en ligne : les offres et tarifs sont à consulter, contactez-nous pour vous abonner.</p>
    </div>
  `,
  styles: `
    .etudiante { border-color: var(--jaune); }
    .badge { display: inline-block; background: var(--jaune-pale); color: var(--noir); font-size: 14px; font-weight: 500;
      padding: 2px 10px; border-radius: 999px; margin-bottom: 8px; }
  `,
})
export class OffresComponent {
  protected readonly offres = OFFRES;
}
