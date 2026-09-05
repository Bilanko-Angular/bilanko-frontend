// src/app/pages/parametres/parametres.ts

import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import { Template } from '../../components/shared/template/template';
import { ActionResponsePopup } from '../../components/globals/action-response-popup/action-response-popup';
import { ActionResponseService } from '../../service/action-response/action-response.service';
import { UserApiService } from '../../service/api/user/user-api.service';
import { AuthStoreService } from '../../service/store/auth/auth-store.service';
import { UserStoreService } from '../../service/store/user/user-store.service';
import { ThemeService } from '../../services/theme';
import {
  PreferencesService,
  BilankoLanguage,
  BilankoCurrency,
} from '../../services/preferences';
import {
  NotificationPreferencesDto,
  AppearancePreferencesDto,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '../../models/DTO/UserDto';


// ──────────────────────────────────────────────────────────────
//  Types locaux
// ──────────────────────────────────────────────────────────────

type Tab = 'general' | 'compte' | 'notifications' | 'apparence';

interface NotificationItem {
  id: keyof NotificationPreferencesDto;
  label: string;
  description: string;
  enabled: boolean;
}


@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Template,
    ActionResponsePopup,
  ],
  templateUrl: './parametres.html',
  styleUrls: ['./parametres.css'],
})
export class Parametres implements OnInit {

  /* =====================================================
     SERVICES
  ====================================================== */

  private readonly fb            = inject(FormBuilder);
  protected readonly themeService = inject(ThemeService);
  private readonly authStore     = inject(AuthStoreService);
  private readonly userStore     = inject(UserStoreService);
  private readonly userApi       = inject(UserApiService);
  private readonly feedback      = inject(ActionResponseService);
  protected readonly prefs       = inject(PreferencesService);


  /* =====================================================
     ÉTAT DE L'INTERFACE
  ====================================================== */

  activeTab = signal<Tab>('general');

  /** Indicateur de chargement par action */
  loading = signal<{
    profile: boolean;
    photo: boolean;
    password: boolean;
    notifications: boolean;
    appearance: boolean;
    logoutAll: boolean;
  }>({
    profile: false,
    photo: false,
    password: false,
    notifications: false,
    appearance: false,
    logoutAll: false,
  });

  profileImage = signal<string | null>(null);

  /** Affiche/masque le mot de passe */
  showCurrentPassword = signal(false);
  showNewPassword     = signal(false);
  showConfirmPassword = signal(false);


  /* =====================================================
     FORMULAIRE PROFIL
  ====================================================== */

  profileForm: FormGroup = this.fb.group({
    nom:       ['', [Validators.required, Validators.minLength(2)]],
    prenom:    [''],
    telephone: [''],
    entreprise:[''],
  });


  /* =====================================================
     FORMULAIRE SÉCURITÉ
  ====================================================== */

  securityForm: FormGroup = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$%^&*\-]).{8,}$/
          ),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordsMatchValidator }
  );


  /* =====================================================
     NOTIFICATIONS (état local, sync backend)
  ====================================================== */

  private notifState = signal<NotificationPreferencesDto>({
    stockAlerts: true,
    newSales: true,
    monthlyReports: false,
    updates: true,
  });

  readonly notifications = computed<NotificationItem[]>(() => {
    const t = this.prefs.t();
    const s = this.notifState();
    return [
      {
        id: 'stockAlerts',
        label: t.notifStockAlertTitle,
        description: t.notifStockAlertDesc,
        enabled: s.stockAlerts,
      },
      {
        id: 'newSales',
        label: t.notifNewSalesTitle,
        description: t.notifNewSalesDesc,
        enabled: s.newSales,
      },
      {
        id: 'monthlyReports',
        label: t.notifMonthlyReportTitle,
        description: t.notifMonthlyReportDesc,
        enabled: s.monthlyReports,
      },
      {
        id: 'updates',
        label: t.notifUpdatesTitle,
        description: t.notifUpdatesDesc,
        enabled: s.updates,
      },
    ];
  });

  /* =====================================================
     STATISTIQUES DU COMPTE
  ====================================================== */

  readonly accountStats = computed(() => ({
    totalProduits: 0,
    totalVentes: 0,
    totalCharges: 0,
    membreDepuis: '—',
  }));


  /* =====================================================
     CONSTRUCTEUR / INIT
  ====================================================== */

  constructor() {}

  async ngOnInit(): Promise<void> {
    await this.loadUserData();
  }


  /* =====================================================
     CHARGEMENT INITIAL
  ====================================================== */

  private async loadUserData(): Promise<void> {
    try {
      const user = await this.userApi.getCurrentUser();

      // Pré-remplir le formulaire profil
      this.profileForm.patchValue({
        nom:        user.name        ?? '',
        prenom:     user.subname     ?? '',
        telephone:  user.phoneNumber ?? '',
        entreprise: user.companyName ?? '',
      });

      // Photo de profil
      if (user.profilePictureUrl) {
        this.profileImage.set(user.profilePictureUrl);
      }

      // Notifications
      if (user.notificationPreferences) {
        this.notifState.set(user.notificationPreferences);
      }

      // Apparence : synchroniser les préférences locales avec le backend
      if (user.appearancePreferences) {
        const ap = user.appearancePreferences;
        if (ap.language) this.prefs.language.set(ap.language as BilankoLanguage);
        if (ap.currency) this.prefs.currency.set(ap.currency as BilankoCurrency);
        if (ap.dateFormat) this.prefs.dateFormat.set(ap.dateFormat);
        if (typeof ap.compactMode === 'boolean') {
          this.prefs.compactMode.set(ap.compactMode);
        }
      }

    } catch (err) {
      // Erreur silencieuse au chargement (pas de toast intrusif)
      console.error('Erreur chargement profil :', err);
    }
  }


  /* =====================================================
     ONGLETS
  ====================================================== */

  setActiveTab(tab: Tab): void {
    this.activeTab.set(tab);
  }


  /* =====================================================
     INITIALES (avatar fallback)
  ====================================================== */

  getInitials(): string {
    const nom    = this.profileForm.get('nom')?.value?.charAt(0) || '';
    const prenom = this.profileForm.get('prenom')?.value?.charAt(0) || '';
    return `${nom}${prenom}`.toUpperCase() || 'B';
  }


  /* =====================================================
     PHOTO DE PROFIL
  ====================================================== */

  async onPhotoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.feedback.error({
        isAxiosError: false,
        response: { status: 400, data: { message: this.prefs.t().photoInvalidType } },
      });
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.feedback.error({
        isAxiosError: false,
        response: { status: 400, data: { message: this.prefs.t().photoTooLarge } },
      });
      input.value = '';
      return;
    }

    this.loading.update(l => ({ ...l, photo: true }));
    try {
      const user = await this.userApi.uploadPhoto(file);
      if (user.profilePictureUrl) {
        this.profileImage.set(user.profilePictureUrl);
      }
      // Aperçu local aussi
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


  /* =====================================================
     SAUVEGARDER PROFIL
  ====================================================== */

  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const v = this.profileForm.value;
    const request: UpdateProfileRequest = {
      name:        v.nom,
      subname:     v.prenom     || undefined,
      phoneNumber: v.telephone  || undefined,
      companyName: v.entreprise || undefined,
    };

    this.loading.update(l => ({ ...l, profile: true }));
    try {
      await this.userApi.updateProfile(request);
      // Rafraîchir le store global
      await this.userStore.loadUser();
      this.feedback.success(this.prefs.t().profileSaved);
    } catch (err) {
      this.feedback.error(err);
    } finally {
      this.loading.update(l => ({ ...l, profile: false }));
    }
  }


  /* =====================================================
     CHANGER LE MOT DE PASSE
  ====================================================== */

  async changePassword(): Promise<void> {
    if (this.securityForm.invalid) {
      this.securityForm.markAllAsTouched();
      return;
    }

    const v = this.securityForm.value;
    const request: ChangePasswordRequest = {
      currentPassword: v.currentPassword,
      newPassword:     v.newPassword,
    };

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


  /* =====================================================
     NOTIFICATIONS
  ====================================================== */

  async toggleNotification(id: keyof NotificationPreferencesDto): Promise<void> {
    // Mise à jour optimiste locale
    this.notifState.update(s => ({ ...s, [id]: !s[id] }));

    this.loading.update(l => ({ ...l, notifications: true }));
    try {
      const updated = await this.userApi.updateNotifications(this.notifState());
      this.notifState.set(updated);
      this.feedback.success(this.prefs.t().notificationsUpdated);
    } catch (err) {
      // Rollback en cas d'erreur
      this.notifState.update(s => ({ ...s, [id]: !s[id] }));
      this.feedback.error(err);
    } finally {
      this.loading.update(l => ({ ...l, notifications: false }));
    }
  }


  /* =====================================================
     APPARENCE
  ====================================================== */

  onLanguageChange(value: BilankoLanguage): void {
    this.prefs.language.set(value);
  }

  onDateFormatChange(value: string): void {
    this.prefs.dateFormat.set(value);
  }

  onCurrencyChange(value: BilankoCurrency): void {
    this.prefs.currency.set(value);
  }

  toggleCompactMode(): void {
    this.prefs.compactMode.update(v => !v);
  }

  async saveAppearance(): Promise<void> {
    const request: AppearancePreferencesDto = {
      theme:       this.themeService.theme(),
      language:    this.prefs.language(),
      dateFormat:  this.prefs.dateFormat(),
      currency:    this.prefs.currency(),
      compactMode: this.prefs.compactMode(),
    };

    this.loading.update(l => ({ ...l, appearance: true }));
    try {
      await this.userApi.updateAppearance(request);
      this.feedback.success(this.prefs.t().preferencesSaved);
    } catch (err) {
      this.feedback.error(err);
    } finally {
      this.loading.update(l => ({ ...l, appearance: false }));
    }
  }


  /* =====================================================
     DÉCONNECTER TOUS LES APPAREILS
  ====================================================== */

  async logoutAllDevices(): Promise<void> {
    this.loading.update(l => ({ ...l, logoutAll: true }));
    try {
      await this.userApi.logoutAllDevices();
      // Déconnexion locale ensuite
      this.authStore.logout();
    } catch (err) {
      this.feedback.error(err);
    } finally {
      this.loading.update(l => ({ ...l, logoutAll: false }));
    }
  }


  /* =====================================================
     DÉCONNEXION SIMPLE
  ====================================================== */

  logout(): void {
    this.authStore.logout();
  }


  /* =====================================================
     GETTERS FORMULAIRES
  ====================================================== */

  get f() {
    return this.profileForm.controls;
  }

  get s() {
    return this.securityForm.controls;
  }


  /* =====================================================
     VALIDATEUR : MOTS DE PASSE IDENTIQUES
  ====================================================== */

  private passwordsMatchValidator(
    group: FormGroup
  ): { [key: string]: boolean } | null {
    const newPwd     = group.get('newPassword')?.value;
    const confirmPwd = group.get('confirmPassword')?.value;
    return newPwd === confirmPwd ? null : { passwordMismatch: true };
  }


  /* =====================================================
     HELPERS TEMPLATE
  ====================================================== */

  isLoading(key: keyof ReturnType<typeof this.loading>): boolean {
    return this.loading()[key];
  }
}