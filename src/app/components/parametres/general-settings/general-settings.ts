import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PreferencesService } from '../../../services/preferences';
import { UserApiService } from '../../../service/api/user/user-api.service';
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
export class GeneralSettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  public prefs: PreferencesService = inject(PreferencesService);
  private readonly userApi = inject(UserApiService);
  private readonly feedback = inject(ActionResponseService);
  private readonly userStore = inject(UserStoreService);

  loading = signal({ profile: false, photo: false });
  profileImage = signal<string | null>(null);

  profileForm: FormGroup = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(2)]],
    prenom: [''],
    telephone: [''],
    entreprise: [''],
  });

  readonly accountStats = computed(() => ({
    totalProduits: 0,
    totalVentes: 0,
    totalCharges: 0,
    membreDepuis: '—',
  }));

  async ngOnInit(): Promise<void> {
    try {
      const user = await this.userApi.getCurrentUser();
      this.profileForm.patchValue({
        nom: user.name ?? '',
        prenom: user.subname ?? '',
        telephone: user.phoneNumber ?? '',
        entreprise: user.companyName ?? '',
      });
      if (user.profilePictureUrl) {
        this.profileImage.set(user.profilePictureUrl);
      }
    } catch (err) {
      console.error('Erreur chargement profil :', err);
    }
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
      const user = await this.userApi.uploadPhoto(file);
      if (user.profilePictureUrl) this.profileImage.set(user.profilePictureUrl);
      const reader = new FileReader();
      reader.onload = () => this.profileImage.set(reader.result as string);
      reader.readAsDataURL(file);
      this.feedback.success(this.prefs.t().photoUpdated);
    } catch (err) {
      this.feedback.error(err);
    } finally {
      this.loading.update(l => ({ ...l, photo: false }));
      input.value = '';
    }
  }

  removePhoto(): void {
    this.profileImage.set(null);
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
      await this.userApi.updateProfile(request);
      await this.userStore.loadUser();
      this.feedback.success(this.prefs.t().profileSaved);
    } catch (err) {
      this.feedback.error(err);
    } finally {
      this.loading.update(l => ({ ...l, profile: false }));
    }
  }

  get f() { return this.profileForm.controls; }
}
