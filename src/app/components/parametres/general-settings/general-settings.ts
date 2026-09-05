import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PreferencesService } from '../../../services/preferences';
import { ActionResponseService } from '../../../service/action-response/action-response.service';
import { UserStoreService } from '../../../service/store/user/user-store.service';
import { UpdateProfileRequest } from '../../../models/DTO/UserDto';

@Component({
  selector: 'app-general-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './general-settings.html',
  styleUrls: ['./general-settings.css']
})
export class GeneralSettingsComponent {
  private readonly fb = inject(FormBuilder);
  public prefs: PreferencesService = inject(PreferencesService);
  private readonly feedback = inject(ActionResponseService);
  protected readonly userStore = inject(UserStoreService);

  loading = signal({ profile: false, photo: false });
  private readonly photoCleared = signal(false);
  private readonly localPhotoPreview = signal<string | null>(null);

  readonly profileImage = computed(() => {
    if (this.photoCleared()) return null;
    return this.localPhotoPreview() ?? this.userStore.user()?.profilePicture ?? null;
  });

  profileForm: FormGroup = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(2)]],
    prenom: [''],
    telephone: [''],
    entreprise: [''],
    email: ['', [Validators.required, Validators.email]]
  });

  readonly accountStats = computed(() => ({
    totalProduits: 0,
    totalVentes: 0,
    totalCharges: 0,
    membreDepuis: '—',
  }));

  constructor() {
    effect(() => {
      const user = this.userStore.user();
      if (!user) return;
      this.profileForm.patchValue({
        nom: user.nom ?? '',
        prenom: user.subname ?? '',
        telephone: user.phoneNumber ?? '',
        entreprise: user.companyName ?? '',
        email: user.email ?? '',
      });
      this.photoCleared.set(false);
      this.localPhotoPreview.set(null);
    }, { allowSignalWrites: true });
  }

  getInitials(): string {
    const nom = this.profileForm.get('nom')?.value?.charAt(0) || '';
    const prenom = this.profileForm.get('prenom')?.value?.charAt(0) || '';
    return `${nom}${prenom}`.toUpperCase() || 'B';
  }

  async onPhotoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.feedback.error({ isAxiosError: false, response: { status: 400, data: { message: this.prefs.t().photoInvalidType } } });
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.feedback.error({ isAxiosError: false, response: { status: 400, data: { message: this.prefs.t().photoTooLarge } } });
      input.value = '';
      return;
    }

    this.loading.update(l => ({ ...l, photo: true }));
    try {
      const reader = new FileReader();
      reader.onload = () => {
        this.photoCleared.set(false);
        this.localPhotoPreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);

      await this.userStore.uploadPhoto(file);
      this.localPhotoPreview.set(null);
      this.feedback.success(this.prefs.t().photoUpdated);
    } catch (err) {
      this.localPhotoPreview.set(null);
      this.feedback.error(err);
    } finally {
      this.loading.update(l => ({ ...l, photo: false }));
      input.value = '';
    }
  }

  removePhoto(): void {
    this.photoCleared.set(true);
    this.localPhotoPreview.set(null);
    this.feedback.success(this.prefs.t().photoRemoved);
  }

  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    const v = this.profileForm.value;
    const request: UpdateProfileRequest = {
      name: v.nom,
      subname: v.prenom || undefined,
      phoneNumber: v.telephone || undefined,
      companyName: v.entreprise || undefined,
    };
    this.loading.update(l => ({ ...l, profile: true }));
    try {
      await this.userStore.updateProfile(request);
      this.feedback.success(this.prefs.t().profileSaved);
    } catch (err) {
      this.feedback.error(err);
    } finally {
      this.loading.update(l => ({ ...l, profile: false }));
    }
  }

  get f() { return this.profileForm.controls; }
}
