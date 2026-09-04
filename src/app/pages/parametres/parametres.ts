// src/app/pages/parametres/parametres.ts

import {
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { Template } from '../../components/shared/template/template';

import { ThemeService } from '../../services/theme';

import { AuthStoreService } from '../../service/store/auth/auth-store.service';

import {
  PreferencesService,
  BilankoLanguage,
  BilankoCurrency
} from '../../services/preferences';


interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  type: 'stock' | 'vente' | 'rapport' | 'systeme';
}


@Component({
  selector: 'app-parametres',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Template
  ],

  templateUrl: './parametres.html',

  styleUrls: ['./parametres.css']
})
export class Parametres {

  /* =====================================================
     SERVICES
  ====================================================== */

  private readonly fb =
    inject(FormBuilder);

  protected readonly themeService =
    inject(ThemeService);

  private readonly authStore =
    inject(AuthStoreService);

  protected readonly prefs =
    inject(PreferencesService);


  /* =====================================================
     ONGLET ACTIF
  ====================================================== */

  activeTab =
    signal<
      'general' |
      'compte' |
      'notifications' |
      'apparence'
    >('general');


  /* =====================================================
     MESSAGE SUCCÈS
  ====================================================== */

  showSuccessMessage =
    signal<string>('');

  showSuccess =
    signal<boolean>(false);


  /* =====================================================
     PHOTO DE PROFIL
  ====================================================== */

  profileImage =
    signal<string | null>(null);


  /* =====================================================
     FORMULAIRE PROFIL
  ====================================================== */

  profileForm: FormGroup =
    this.fb.group({

      nom: [
        'Emmanuel',
        [
          Validators.required,
          Validators.minLength(2)
        ]
      ],

      prenom: [
        '',
        [
          Validators.required,
          Validators.minLength(2)
        ]
      ],

      email: [
        'emmanuel@bilanko.com',
        [
          Validators.required,
          Validators.email
        ]
      ],

      telephone: [
        '+237 6XX XX XX XX'
      ],

      entreprise: [
        'Bilanko SARL'
      ]

    });


  /* =====================================================
     FORMULAIRE SECURITE
  ====================================================== */

  securityForm: FormGroup =
    this.fb.group({

      currentPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(6)
        ]
      ],

      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$%^&*\-]).{8,}$/
          )
        ]
      ],

      confirmPassword: [
        '',
        [
          Validators.required
        ]
      ]

    }, {
      validators:
        this.passwordsMatchValidator
    });


  /* =====================================================
     VALIDATION MOT DE PASSE
  ====================================================== */

  private passwordsMatchValidator(
    group: FormGroup
  ): { [key: string]: boolean } | null {

    const newPassword =
      group.get('newPassword')?.value;

    const confirmPassword =
      group.get('confirmPassword')?.value;

    return newPassword === confirmPassword
      ? null
      : { passwordMismatch: true };
  }


  /* =====================================================
     NOTIFICATIONS
  ====================================================== */

 // Dans parametres.ts
private getDefaultNotifications(): NotificationPreference[] {
  const t = this.prefs.t();
  return [
    {
      id: 'stock',
      label: t.notifStockAlertTitle,
      description: t.notifStockAlertDesc,
      enabled: true,
      type: 'stock'
    },
    {
      id: 'vente',
      label: t.notifNewSalesTitle,
      description: t.notifNewSalesDesc,
      enabled: true,
      type: 'vente'
    },
    {
      id: 'rapport',
      label: t.notifMonthlyReportTitle,
      description: t.notifMonthlyReportDesc,
      enabled: false,
      type: 'rapport'
    },
    {
      id: 'systeme',
      label: t.notifUpdatesTitle,
      description: t.notifUpdatesDesc,
      enabled: true,
      type: 'systeme'
    }
  ];
}


  readonly notifEnabledState =
    signal<Record<string, boolean>>(
      this.loadNotificationState()
    );


  readonly notifications =
    computed<NotificationPreference[]>(() => {

      return this.getDefaultNotifications().map(
        notification => ({

          ...notification,

          enabled:
            this.notifEnabledState()[
              notification.id
            ] ?? notification.enabled

        })
      );

    });


  /* =====================================================
     STATISTIQUES
  ====================================================== */

  accountStats =
    computed(() => ({

      totalProduits: 12,

      totalVentes: 20,

      totalCharges: 17,

      membreDepuis: 'Janvier 2026'

    }));


  /* =====================================================
     CONSTRUCTEUR
  ====================================================== */

  constructor() {

    this.loadProfile();

    this.loadPhoto();

  }


  /* =====================================================
     CHANGER D'ONGLET
  ====================================================== */

  setActiveTab(
    tab:
      'general' |
      'compte' |
      'notifications' |
      'apparence'
  ): void {

    this.activeTab.set(tab);

  }


  /* =====================================================
     CHARGER PROFIL
  ====================================================== */

  private loadProfile(): void {

    try {

      const saved =
        localStorage.getItem(
          'bilanko_profile'
        );

      if (!saved) {
        return;
      }

      const profile =
        JSON.parse(saved);

      this.profileForm.patchValue(
        profile
      );

    } catch (error) {

      console.warn(
        'Erreur chargement profil :',
        error
      );

    }

  }


  /* =====================================================
     SAUVEGARDER PROFIL
  ====================================================== */

  saveProfile(): void {

    if (this.profileForm.invalid) {

      this.profileForm.markAllAsTouched();

      return;

    }


    try {

      localStorage.setItem(
        'bilanko_profile',

        JSON.stringify(
          this.profileForm.value
        )
      );


      this.showToast(
        this.prefs.t().profileSaved
      );

    } catch (error) {

      console.warn(
        'Erreur sauvegarde profil :',
        error
      );

    }

  }


  /* =====================================================
     INITIALS
  ====================================================== */

  getInitials(): string {

    const nom =
      this.profileForm
        .get('nom')
        ?.value
        ?.charAt(0) || '';

    const prenom =
      this.profileForm
        .get('prenom')
        ?.value
        ?.charAt(0) || '';

    const initials =
      `${nom}${prenom}`.toUpperCase();

    return initials || 'B';

  }


  /* =====================================================
     CHARGER PHOTO
  ====================================================== */

  private loadPhoto(): void {

    try {

      const saved =
        localStorage.getItem(
          'bilanko_profile_photo'
        );

      if (saved) {

        this.profileImage.set(
          saved
        );

      }

    } catch (error) {

      console.warn(
        'Erreur chargement photo :',
        error
      );

    }

  }


  /* =====================================================
     SELECTION PHOTO
  ====================================================== */

  onPhotoSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    const file =
      input.files?.[0];

    if (!file) {
      return;
    }


    /* Types acceptés */

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {

      this.showToast(
        this.prefs.t().photoInvalidType
      );

      input.value = '';

      return;

    }


    /* Maximum 5 MB */

    if (
      file.size >
      5 * 1024 * 1024
    ) {

      this.showToast(
        this.prefs.t().photoTooLarge
      );

      input.value = '';

      return;

    }


    /* Lecture */

    const reader =
      new FileReader();


    reader.onload = () => {

      const result =
        reader.result as string;

      this.profileImage.set(
        result
      );


      try {

        localStorage.setItem(
          'bilanko_profile_photo',
          result
        );

        this.showToast(
          this.prefs.t().photoUpdated
        );

      } catch (error) {

        console.warn(
          'Impossible de sauvegarder la photo :',
          error
        );

      }

    };


    reader.readAsDataURL(file);

  }


  /* =====================================================
     SUPPRIMER PHOTO
  ====================================================== */

  removePhoto(): void {

    this.profileImage.set(null);

    localStorage.removeItem(
      'bilanko_profile_photo'
    );

    this.showToast(
      this.prefs.t().photoRemoved
    );

  }


  /* =====================================================
     MOT DE PASSE
  ====================================================== */

  changePassword(): void {

    if (this.securityForm.invalid) {

      this.securityForm.markAllAsTouched();

      return;

    }


    console.log(
      'Mot de passe changé'
    );


    this.securityForm.reset();


    this.showToast(
      this.prefs.t().passwordChanged
    );

  }


  /* =====================================================
     NOTIFICATION
  ====================================================== */

  toggleNotification(
    id: string
  ): void {

    this.notifEnabledState.update(
      state => ({

        ...state,

        [id]:
          !state[id]

      })
    );


    try {

      localStorage.setItem(
        'bilanko_notifications',

        JSON.stringify(
          this.notifEnabledState()
        )
      );


      this.showToast(
        this.prefs.t().notificationsUpdated
      );

    } catch (error) {

      console.warn(
        'Erreur sauvegarde notifications :',
        error
      );

    }

  }


  /* =====================================================
     CHARGER NOTIFICATIONS
  ====================================================== */

  private loadNotificationState():
    Record<string, boolean> {

    try {

      const saved =
        localStorage.getItem(
          'bilanko_notifications'
        );

      if (saved) {

        return JSON.parse(
          saved
        );

      }

    } catch (error) {

      console.warn(
        'Erreur chargement notifications :',
        error
      );

    }

    return {};

  }


  /* =====================================================
     LANGUE
  ====================================================== */

  onLanguageChange(
    value: BilankoLanguage
  ): void {

    this.prefs.language.set(
      value
    );


    this.showToast(
      this.prefs.t().languageChanged
    );

  }


  /* =====================================================
     FORMAT DATE
  ====================================================== */

  onDateFormatChange(
    value: string
  ): void {

    this.prefs.dateFormat.set(
      value
    );


    this.showToast(
      this.prefs.t().dateFormatChanged
    );

  }


  /* =====================================================
     DEVISE
  ====================================================== */

  onCurrencyChange(
    value: BilankoCurrency
  ): void {

    this.prefs.currency.set(
      value
    );


    this.showToast(
      this.prefs.t().currencyChanged
    );

  }


  /* =====================================================
     MODE COMPACT
  ====================================================== */

  toggleCompactMode(): void {

    this.prefs.compactMode.update(
      value => !value
    );


    this.showToast(

      this.prefs.compactMode()

        ? this.prefs.t().compactModeOn

        : this.prefs.t().compactModeOff

    );

  }


  /* =====================================================
     SAUVEGARDER APPARENCE
  ====================================================== */

  saveAppearance(): void {

    this.showToast(
      this.prefs.t().preferencesSaved
    );

  }


  /* =====================================================
     TOAST
  ====================================================== */

  private showToast(
    message: string
  ): void {

    this.showSuccessMessage.set(
      message
    );

    this.showSuccess.set(
      true
    );


    setTimeout(() => {

      this.showSuccess.set(
        false
      );

    }, 3000);

  }


  /* =====================================================
     LOGOUT
  ====================================================== */

  logout(): void {

    this.authStore.logout();

  }


  /* =====================================================
     GETTERS FORM
  ====================================================== */

  get f() {

    return this.profileForm.controls;

  }


  get s() {

    return this.securityForm.controls;

  }

}