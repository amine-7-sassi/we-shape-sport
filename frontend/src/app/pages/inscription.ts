import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService, messageErreur } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-inscription',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="conteneur page formulaire">
      <h1>Inscription</h1>
      @if (erreur()) { <p class="alerte alerte-erreur" role="alert">{{ erreur() }}</p> }
      <form class="carte" (ngSubmit)="creer()" novalidate>
        <div class="champ">
          <label for="nom">Nom</label>
          <input id="nom" name="nom" [ngModel]="nom()" (ngModelChange)="nom.set($event)" autocomplete="name">
        </div>
        <div class="champ">
          <label for="email">E-mail</label>
          <input id="email" name="email" type="email" [ngModel]="email()" (ngModelChange)="email.set($event)" placeholder="prenom.nom@email.com" autocomplete="email">
        </div>
        <div class="champ">
          <label for="mdp">Mot de passe (6 caractères minimum)</label>
          <input id="mdp" name="mdp" type="password" [ngModel]="mdp()" (ngModelChange)="mdp.set($event)" autocomplete="new-password">
        </div>
        <div class="champ">
          <label for="mdp2">Confirmation du mot de passe</label>
          <input id="mdp2" name="mdp2" type="password" [ngModel]="mdp2()" (ngModelChange)="mdp2.set($event)" autocomplete="new-password">
        </div>
        <button class="btn btn-bloc" type="submit" [disabled]="envoi()">Créer mon compte</button>
        <p style="margin-top:16px">Déjà un compte ? <a routerLink="/connexion" [queryParams]="{ retour: retour }">Se connecter</a></p>
      </form>
    </div>
  `,
  styles: `.formulaire { max-width: 480px; }`,
})
export class InscriptionComponent {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly retour = inject(ActivatedRoute).snapshot.queryParamMap.get('retour');

  protected readonly nom = signal('');
  protected readonly email = signal('');
  protected readonly mdp = signal('');
  protected readonly mdp2 = signal('');
  protected readonly erreur = signal('');
  protected readonly envoi = signal(false);

  protected creer() {
    this.erreur.set('');
    if (!this.nom().trim()) { this.erreur.set('Le nom est obligatoire.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email())) { this.erreur.set('Adresse e-mail invalide.'); return; }
    if (this.mdp().length < 6) { this.erreur.set('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    if (this.mdp() !== this.mdp2()) { this.erreur.set('Les deux mots de passe ne correspondent pas.'); return; }
    this.envoi.set(true);
    this.api.inscription(this.nom().trim(), this.email().trim(), this.mdp()).subscribe({
      next: r => { this.auth.ouvrirSession(r.token, r.utilisateur); this.router.navigateByUrl(this.retour || '/mes-reservations'); },
      error: e => { this.erreur.set(messageErreur(e)); this.envoi.set(false); },
    });
  }
}
