import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../../models/person';
import { UserApiService } from '../../api/user/user-api.service';
import { UserResponseMapper } from '../../../mapper/UserResponseMapper';

@Injectable({
  providedIn: 'root',
})
export class UserStoreService {
  private readonly userApi = inject(UserApiService);
  private readonly router = inject(Router);

  readonly user = signal<User | null>(null);

  constructor() {
    this.loadUser();
  }

  async loadUser(): Promise<void> {
    const token = localStorage.getItem('bilanko_jwt_token');
    if (!token) {
      this.router.navigate(['/connexion']);
      return;
    }

    try {
      const responseDto = await this.userApi.getCurrentUser();
      const mappedUser = UserResponseMapper.fromResponseDto(responseDto);
      this.user.set(mappedUser);
    } catch (error) {
      console.error('Failed to load user', error);
      this.router.navigate(['/connexion']);
    }
  }

  clearUser(): void {
    this.user.set(null);
  }
}
