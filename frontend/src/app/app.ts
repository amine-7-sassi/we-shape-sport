import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { INFOS, resumeHoraires } from './pages/donnees';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="entete">
      <div class="conteneur entete-barre">
        <a routerLink="/" class="logo" (click)="fermer()">WE SHAPE <span>SPORT</span></a>

        <button class="burger" type="button" aria-label="Ouvrir le menu" [attr.aria-expanded]="ouvert()" (click)="ouvert.set(!ouvert())">
          <span></span><span></span><span></span>
        </button>

        <nav class="menu" [class.ouvert]="ouvert()" aria-label="Navigation principale">
          @if (auth.estAdmin()) {
            <a routerLink="/admin/cours" routerLinkActive="actif" (click)="fermer()">Gestion des cours</a>
            <a routerLink="/admin/reservations" routerLinkActive="actif" (click)="fermer()">Réservations par cours</a>
            <button type="button" class="btn btn-secondaire" (click)="deconnexion()">Déconnexion</button>
          } @else {
            <a routerLink="/" routerLinkActive="actif" [routerLinkActiveOptions]="{ exact: true }" (click)="fermer()">Accueil</a>
            <a routerLink="/sports" routerLinkActive="actif" (click)="fermer()">Nos sports</a>
            <a routerLink="/planning" routerLinkActive="actif" (click)="fermer()">Planning</a>
            <a routerLink="/horaires" routerLinkActive="actif" (click)="fermer()">Horaires</a>
            <a routerLink="/offres" routerLinkActive="actif" (click)="fermer()">Offres et tarifs</a>
            <a routerLink="/contact" routerLinkActive="actif" (click)="fermer()">Contact</a>
            @if (auth.estConnecte()) {
              <a routerLink="/mes-reservations" class="btn" (click)="fermer()">Mon compte</a>
              <button type="button" class="btn btn-secondaire" (click)="deconnexion()">Déconnexion</button>
            } @else {
              <a routerLink="/connexion" class="btn" (click)="fermer()">Connexion</a>
            }
          }
        </nav>
      </div>
    </header>

    <main><router-outlet /></main>

    <footer class="pied">
      <div class="conteneur pied-grille">
        <div>
          <div class="logo">WE SHAPE <span>SPORT</span></div>
          <p class="secondaire">Façonnez votre corps, façonnez votre pratique.</p>
        </div>
        <div>
          <h3>Navigation</h3>
          <a routerLink="/sports">Nos sports</a><br>
          <a routerLink="/planning">Planning</a><br>
          <a routerLink="/offres">Offres et tarifs</a><br>
          <a routerLink="/contact">Contact</a>
        </div>
        <div>
          <h3>Coordonnées</h3>
          <p class="secondaire">{{ infos.adresse }}<br>{{ infos.telephone }}<br>{{ infos.email }}</p>
        </div>
        <div>
          <h3>Horaires</h3>
          <p class="secondaire">@for (l of horaires; track l) { {{ l }}<br> }</p>
        </div>
      </div>
    </footer>
  `,
  styles: `
    .entete { background: var(--noir); border-bottom: 1px solid var(--bordure); position: sticky; top: 0; z-index: 10; }
    .entete-barre { display: flex; align-items: center; justify-content: space-between; min-height: 64px; flex-wrap: wrap; }
    .logo { font-weight: 700; font-size: 20px; color: var(--blanc); text-decoration: none; letter-spacing: .5px; }
    .logo span { color: var(--jaune); }
    .burger { display: inline-flex; flex-direction: column; justify-content: center; gap: 5px; width: 44px; height: 44px;
      background: transparent; border: 0; cursor: pointer; padding: 10px; }
    .burger span { height: 3px; background: var(--jaune); border-radius: 2px; }
    .menu { display: none; flex-direction: column; align-items: stretch; gap: 4px; width: 100%; padding: 8px 0 16px; }
    .menu.ouvert { display: flex; }
    .menu a:not(.btn) { color: var(--blanc); text-decoration: none; font-weight: 500; padding: 10px 4px; border-bottom: 3px solid transparent; }
    .menu a.actif:not(.btn) { color: var(--jaune); border-bottom-color: var(--jaune); }
    .pied { background: #0b0b0b; border-top: 1px solid var(--bordure); padding: 32px 0; margin-top: 24px; }
    .pied-grille { display: grid; gap: 24px; grid-template-columns: 1fr; }
    .pied a { color: var(--gris); text-decoration: none; }
    .pied a:hover { color: var(--jaune); }
    .pied h3 { font-size: 16px; line-height: 24px; color: var(--jaune); }
    @media (min-width: 768px) {
      .burger { display: none; }
      .menu { display: flex; flex-direction: row; align-items: center; width: auto; padding: 0; gap: 18px; }
      .pied-grille { grid-template-columns: repeat(4, 1fr); }
    }
  `,
})
export class App {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly ouvert = signal(false);
  protected readonly infos = INFOS;
  protected readonly horaires = resumeHoraires();

  protected fermer() { this.ouvert.set(false); }
  protected deconnexion() {
    this.auth.deconnecter();
    this.fermer();
    this.router.navigate(['/']);
  }
}
