import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SPORTS } from './donnees';

@Component({
  selector: 'app-sports',
  imports: [RouterLink],
  template: `
    <div class="conteneur page">
      <h1>Nos sports</h1>
      <p class="secondaire">Boxe, musculation, gymnastique et bien d'autres disciplines.</p>
      <div class="grille grille-3">
        @for (s of sports; track s.nom) {
          <article class="carte carte-photo">
            <div [class]="'photo ' + s.classe" role="img" [attr.aria-label]="'Illustration : ' + s.nom">{{ s.nom }}</div>
            <div class="corps">
              <h2>{{ s.nom }}</h2>
              <p class="secondaire">{{ s.description }}</p>
              <a routerLink="/planning" class="btn">Voir le planning</a>
            </div>
          </article>
        }
      </div>
    </div>
  `,
})
export class SportsComponent {
  protected readonly sports = SPORTS;
}
