import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Réservé aux membres connectés (sinon : page de connexion, puis retour). */
export const membreGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.estConnecte() ? true : router.createUrlTree(['/connexion'], { queryParams: { retour: state.url } });
};

/** Réservé à l'administrateur. */
export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.estAdmin()) return true;
  return auth.estConnecte() ? router.createUrlTree(['/']) : router.createUrlTree(['/connexion'], { queryParams: { retour: state.url } });
};
