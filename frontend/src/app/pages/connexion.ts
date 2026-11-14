import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService, messageErreur } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-connexion',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="conteneur page formulaire">
      <h1>Connexion</h1>
      @if (erreur()) { <p class="alerte alerte-erreur" role="alert">{{ erreur() }}</p> }
      <form class="carte" (ngSubmit)="connecter()" novalidate>
        <div class="champ">
          <label for="email">E-mail</label>
          <input id="email" name="email" type="email" [ngModel]="email()" (ngModelChange)="email.set($event)" placeholder="prenom.nom@email.com" autocomplete="email">
        </div>
        <div class="champ">
          <label for="mdp">Mot de passe</label>
          <input id="mdp" name="mdp" type="password" [ngModel]="mdp()" (ngModelChange)="mdp.set($event)" placeholder="••••••••" autocomplete="current-password">
        </div>
        <button class="btn btn-bloc" type="submit" [disabled]="envoi()">Se connecter</button>
        <p style="margin-top:16px">Pas encore de compte ? <a routerLink="/inscription" [queryParams]="{ retour: retour }">S'inscrire</a></p>
      </form>
    </div>
  `,
  styles: `.formulaire { max-width: 480px; }`,
})
export class ConnexionComponent {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly retour = inject(ActivatedRoute).snapshot.queryParamMap.get('retour');

  protected readonly email = signal('');
  protected readonly mdp = signal('');
  protected readonly erreur = signal('');
  protected readonly envoi = signal(false);

  protected connecter() {
    this.erreur.set('');
    if (!this.email().trim() || !this.mdp()) { this.erreur.set('Veuillez saisir votre e-mail et votre mot de passe.'); return; }
    this.envoi.set(true);
    this.api.connexion(this.email().trim(), this.mdp()).subscribe({
      next: r => {
        this.auth.ouvrirSession(r.token, r.utilisateur);
        // admin → gestion des cours ; membre → page d'origine (ou Mes réservations)
        const cible = r.utilisateur.role === 'administrateur' ? '/admin/cours' : (this.retour || '/mes-reservations');
        this.router.navigateByUrl(cible);
      },
      error: e => { this.erreur.set(messageErreur(e)); this.envoi.set(false); },
    });
  }
}
