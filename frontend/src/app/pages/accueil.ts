import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OFFRES, SPORTS } from './donnees';

@Component({
  selector: 'app-accueil',
  imports: [RouterLink],
  template: `
    <section class="bandeau">
      <div class="conteneur">
        <h1>WE SHAPE <span class="titre-jaune">SPORT</span></h1>
        <p>Découvrez nos sports, consultez le planning et réservez votre cours en quelques clics.</p>
        <div class="actions">
          <a routerLink="/planning" class="btn">Voir le planning</a>
          <a routerLink="/offres" class="btn btn-secondaire">Offres et tarifs</a>
        </div>
      </div>
    </section>

    <div class="conteneur page">
      <h2>Nos sports</h2>
      <div class="grille grille-3">
        @for (s of sports; track s.nom) {
          <article class="carte carte-photo">
            <div [class]="'photo ' + s.classe" role="img" [attr.aria-label]="'Illustration : ' + s.nom">{{ s.nom }}</div>
            <div class="corps">
              <h3>{{ s.nom }}</h3>
              <a routerLink="/sports" class="btn btn-secondaire">Découvrir</a>
            </div>
          </article>
        }
      </div>

      <h2 style="margin-top:40px">Offres et tarifs</h2>
      <div class="grille grille-4">
        @for (o of offres; track o.nom) {
          <article class="carte">
            <h3>{{ o.nom }}</h3>
            <div class="prix">{{ o.prix }} <small>DT</small></div>
          </article>
        }
      </div>
    </div>
  `,
  styles: `
    /* Photo du bandeau : frontend/public/photos/accueil.jpg (assombrie pour garder le texte lisible) */
    .bandeau { padding: 96px 0; background:
      linear-gradient(90deg, rgba(17,17,17,.88) 0%, rgba(17,17,17,.55) 45%, rgba(17,17,17,.15) 100%),
      url('/photos/accueil.jpg') center / cover no-repeat,
      linear-gradient(135deg, #3a3100, #111 60%); border-bottom: 1px solid var(--bordure); }
    .bandeau h1 { font-size: 40px; line-height: 48px; }
    .bandeau p { max-width: 520px; }
    .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 20px; }
    @media (min-width: 1024px) { .bandeau h1 { font-size: 56px; line-height: 64px; } }
  `,
})
export class AccueilComponent {
  protected readonly sports = SPORTS.slice(0, 3);
  protected readonly offres = OFFRES;
}
