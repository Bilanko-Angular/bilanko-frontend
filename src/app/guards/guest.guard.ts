import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthStoreService } from '../service/store/auth/auth-store.service';

export const guestGuard: CanActivateFn = () => {
  const authStore = inject(AuthStoreService);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    return router.parseUrl('/dashboard');
  }

  return true;
};
