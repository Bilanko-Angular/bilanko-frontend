import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PreferencesService } from '../../../services/preferences';
import { UserApiService } from '../../../service/api/user/user-api.service';
import { ActionResponseService } from '../../../service/action-response/action-response.service';
import { AuthStoreService } from '../../../service/store/auth/auth-store.service';
import { ChangePasswordRequest } from '../../../models/DTO/UserDto';

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './security-settings.html',
  styleUrls: ['./security-settings.css']
})
export class SecuritySettingsComponent {
  private readonly fb = inject(FormBuilder);
  public prefs: PreferencesService = inject(PreferencesService);
  private readonly userApi = inject(UserApiService);
  private readonly feedback = inject(ActionResponseService);
  private readonly authStore = inject(AuthStoreService);

  loading = signal({ password: false, logoutAll: false });

  securityForm: FormGroup = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$%^&*\-]).{8,}$/)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordsMatchValidator }
  );

  async changePassword(): Promise<void> {
    if (this.securityForm.invalid) {
      this.securityForm.markAllAsTouched();
      return;
    }
    const v = this.securityForm.value;
    const request: ChangePasswordRequest = { currentPassword: v.currentPassword, newPassword: v.newPassword };

    this.loading.update(l => ({ ...l, password: true }));
    try {
      await this.userApi.changePassword(request);
      this.securityForm.reset();
      this.feedback.success(this.prefs.t().passwordChanged);
    } catch (err) {
      this.feedback.error(err);
    } finally {
      this.loading.update(l => ({ ...l, password: false }));
    }
  }

  async logoutAllDevices(): Promise<void> {
    this.loading.update(l => ({ ...l, logoutAll: true }));
    try {
      await this.userApi.logoutAllDevices();
      this.authStore.logout();
    } catch (err) {
      this.feedback.error(err);
    } finally {
      this.loading.update(l => ({ ...l, logoutAll: false }));
    }
  }

  logout(): void {
    this.authStore.logout();
  }

  get s() { return this.securityForm.controls; }

  private passwordsMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPwd = group.get('newPassword')?.value;
    const confirmPwd = group.get('confirmPassword')?.value;
    return newPwd === confirmPwd ? null : { passwordMismatch: true };
  }
}
