import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HORAIRES } from './donnees';

@Component({
  selector: 'app-horaires',
  imports: [RouterLink],
  template: `
    <div class="conteneur page">
      <h1>Horaires d'ouverture</h1>
      <div class="carte table-scroll" style="max-width:560px">
        <table>
          <thead><tr><th>Jour</th><th>Ouverture – fermeture</th></tr></thead>
          <tbody>
            @for (h of horaires; track h.jour) {
              <tr><td>{{ h.jour }}</td><td>{{ h.horaire }}</td></tr>
            }
          </tbody>
        </table>
      </div>
      <div class="carte" style="max-width:560px; margin-top:24px">
        <h3>Une question ?</h3>
        <a routerLink="/contact" class="btn">Nous contacter</a>
      </div>
    </div>
  `,
})
export class HorairesComponent {
  protected readonly horaires = HORAIRES;
}
