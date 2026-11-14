import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiService, messageErreur } from '../services/api.service';
import { INFOS } from './donnees';

@Component({
  selector: 'app-contact',
  imports: [FormsModule],
  template: `
    <div class="conteneur page">
      <h1>Contact</h1>
      <div class="grille">
        <section class="carte">
          <h2>Coordonnées de la salle</h2>
          <p><strong>Adresse</strong><br>{{ infos.adresse }}</p>
          <p><strong>Téléphone</strong><br>{{ infos.telephone }}</p>
          <p><strong>E-mail</strong><br>{{ infos.email }}</p>
        </section>

        <section class="carte">
          <h2>Écrivez-nous</h2>
          @if (succes()) { <p class="alerte alerte-succes" role="status">{{ succes() }}</p> }
          @if (erreur()) { <p class="alerte alerte-erreur" role="alert">{{ erreur() }}</p> }
          <form (ngSubmit)="envoyer()" novalidate>
            <div class="champ" [class.invalide]="tente() && !nom().trim()">
              <label for="nom">Nom</label>
              <input id="nom" name="nom" [ngModel]="nom()" (ngModelChange)="nom.set($event)" autocomplete="name">
              @if (tente() && !nom().trim()) { <span class="erreur-champ">Le nom est obligatoire.</span> }
            </div>
            <div class="champ" [class.invalide]="tente() && !emailValide()">
              <label for="email">E-mail</label>
              <input id="email" name="email" type="email" [ngModel]="email()" (ngModelChange)="email.set($event)" placeholder="prenom.nom@email.com" autocomplete="email">
              @if (tente() && !emailValide()) { <span class="erreur-champ">Adresse e-mail invalide.</span> }
            </div>
            <div class="champ" [class.invalide]="tente() && !message().trim()">
              <label for="message">Message</label>
              <textarea id="message" name="message" [ngModel]="message()" (ngModelChange)="message.set($event)"></textarea>
              @if (tente() && !message().trim()) { <span class="erreur-champ">Le message est obligatoire.</span> }
            </div>
            <button class="btn" type="submit" [disabled]="envoi()">Envoyer</button>
          </form>
        </section>
      </div>

      <h2 style="margin-top:32px">Nous trouver</h2>
      <iframe class="carte-maps" title="Localisation de la salle sur Google Maps" loading="lazy" [src]="carte"></iframe>
      <p style="margin-top:12px"><a [href]="infos.lienMaps" target="_blank" rel="noopener">Ouvrir dans Google Maps</a></p>
    </div>
  `,
  styles: `
    .carte-maps { width: 100%; height: 320px; border: 0; border-radius: var(--rayon-carte); }
  `,
})
export class ContactComponent {
  private readonly api = inject(ApiService);
  protected readonly infos = INFOS;
  protected readonly carte = inject(DomSanitizer).bypassSecurityTrustResourceUrl(
    `https://www.google.com/maps?q=${INFOS.latitude},${INFOS.longitude}&z=16&output=embed`);

  protected readonly nom = signal('');
  protected readonly email = signal('');
  protected readonly message = signal('');
  protected readonly tente = signal(false);
  protected readonly envoi = signal(false);
  protected readonly succes = signal('');
  protected readonly erreur = signal('');

  protected emailValide() { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email()); }

  protected envoyer() {
    this.tente.set(true); this.succes.set(''); this.erreur.set('');
    if (!this.nom().trim() || !this.emailValide() || !this.message().trim()) return;
    this.envoi.set(true);
    this.api.contact(this.nom(), this.email(), this.message()).subscribe({
      next: r => { this.succes.set(r.message); this.nom.set(''); this.email.set(''); this.message.set(''); this.tente.set(false); this.envoi.set(false); },
      error: e => { this.erreur.set(messageErreur(e)); this.envoi.set(false); },
    });
  }
}
