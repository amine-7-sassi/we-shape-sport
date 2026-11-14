import { Injectable, computed, signal } from '@angular/core';

export interface Utilisateur { id: number; nom: string; role: 'membre' | 'administrateur'; }

const CLE = 'wss_session';

/** Garde en mémoire (et dans le navigateur) le jeton et l'utilisateur connecté. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly session = signal<{ token: string; utilisateur: Utilisateur } | null>(this.lire());

  readonly utilisateur = computed(() => this.session()?.utilisateur ?? null);
  readonly estConnecte = computed(() => this.session() !== null);
  readonly estAdmin = computed(() => this.session()?.utilisateur.role === 'administrateur');

  get token(): string | null { return this.session()?.token ?? null; }

  ouvrirSession(token: string, utilisateur: Utilisateur) {
    const s = { token, utilisateur };
    this.session.set(s);
    try { localStorage.setItem(CLE, JSON.stringify(s)); } catch { /* stockage indisponible */ }
  }

  deconnecter() {
    this.session.set(null);
    try { localStorage.removeItem(CLE); } catch { /* ignoré */ }
  }

  private lire() {
    try { return JSON.parse(localStorage.getItem(CLE) ?? 'null'); } catch { return null; }
  }
}
