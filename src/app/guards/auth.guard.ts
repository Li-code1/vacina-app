import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { map, take } from 'rxjs';
import { user as authState } from '@angular/fire/auth';

/**
 * Bloqueia o acesso às telas internas (crianças, campanhas) para quem
 * não estiver autenticado. A verificação real e definitiva de acesso
 * aos dados, porém, é feita pelas Regras de Segurança do Firestore —
 * este guard é apenas a primeira camada de UX.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return authState(auth).pipe(
    take(1),
    map((user) => {
      if (user) return true;
      router.navigate(['/login']);
      return false;
    }),
  );
};
