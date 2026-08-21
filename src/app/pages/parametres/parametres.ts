// src/app/pages/parametres/parametres.ts
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Template } from '../../components/shared/template/template';
import { ThemeService } from '../../services/theme';
import { AuthStoreService } from '../../service/store/auth/auth-store.service';
import { PreferencesService, BilankoLanguage, BilankoCurrency } from '../../services/preferences';

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
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Template],
  templateUrl: './parametres.html',
  styleUrls: ['./parametres.css'],
})
export class Parametres {
  private readonly fb = inject(FormBuilder);
  protected readonly themeService = inject(ThemeService);
  private readonly authStore = inject(AuthStoreService);
  protected readonly prefs = inject(PreferencesService);

  activeTab = signal<'general' | 'compte' | 'notifications' | 'apparence'>('general');
  showSuccessMessage = signal<string>('');
  showSuccess = signal<boolean>(false);

  profileForm: FormGroup = this.fb.group({
    nom: ['Emmanuel', [Validators.required, Validators.minLength(2)]],
    prenom: ['', [Validators.required, Validators.minLength(2)]],
    email: ['emmanuel@bilanko.com', [Validators.required, Validators.email]],
    telephone: ['+237 6XX XX XX XX'],
    entreprise: ['Bilanko SARL'],
  });

  securityForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required, Validators.minLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$%^&*\-]).{8,}$/)]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: this.passwordsMatchValidator });

  private passwordsMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

   private readonly notifEnabledState = signal<Record<string, boolean>>({
    n1: true, n2: true, n3: false, n4: true,
  });

  notifications = computed<NotificationPreference[]>(() => {
    const t = this.prefs.t();
    const state = this.notifEnabledState();
    return [
      { id: 'n1', label: t.notifStockAlertTitle, description: t.notifStockAlertDesc, enabled: state['n1'], type: 'stock' },
      { id: 'n2', label: t.notifNewSalesTitle, description: t.notifNewSalesDesc, enabled: state['n2'], type: 'vente' },
      { id: 'n3', label: t.notifMonthlyReportTitle, description: t.notifMonthlyReportDesc, enabled: state['n3'], type: 'rapport' },
      { id: 'n4', label: t.notifUpdatesTitle, description: t.notifUpdatesDesc, enabled: state['n4'], type: 'systeme' },
    ];
  });

  accountStats = computed(() => ({
    totalProduits: 12,
    totalVentes: 20,
    totalCharges: 17,
    membreDepuis: 'Janvier 2026',
  }));

  setActiveTab(tab: 'general' | 'compte' | 'notifications' | 'apparence'): void {
    this.activeTab.set(tab);
  }

   saveProfile(): void {
    if (this.profileForm.valid) {
      console.log('Profil sauvegardé :', this.profileForm.value);
      try {
        localStorage.setItem('bilanko_profile', JSON.stringify(this.profileForm.value));
        this.showToast(this.prefs.t().profileSaved);
      } catch (e) {
        console.warn('Erreur sauvegarde profil :', e);
      }
    } else {
      this.profileForm.markAllAsTouched();
    }
  }

  changePassword(): void {
    if (this.securityForm.valid) {
      console.log('Mot de passe changé');
      this.securityForm.reset();
      this.showToast(this.prefs.t().passwordChanged);
    } else {
      this.securityForm.markAllAsTouched();
    }
  }
    toggleNotification(id: string): void {
    this.notifEnabledState.update(state => ({ ...state, [id]: !state[id] }));
    try {
      localStorage.setItem('bilanko_notifications', JSON.stringify(this.notifEnabledState()));
      this.showToast(this.prefs.t().notificationsUpdated);
    } catch (e) {
      console.warn('Erreur sauvegarde notifications :', e);
    }
  }

   onLanguageChange(value: BilankoLanguage): void {
    this.prefs.language.set(value);
    this.showToast(this.prefs.t().languageChanged);
  }

  onDateFormatChange(value: string): void {
    this.prefs.dateFormat.set(value);
    this.showToast(this.prefs.t().dateFormatChanged);
  }

  onCurrencyChange(value: BilankoCurrency): void {
    this.prefs.currency.set(value);
    this.showToast(this.prefs.t().currencyChanged);
  }

  toggleCompactMode(): void {
    this.prefs.compactMode.update(v => !v);
    this.showToast(this.prefs.compactMode() ? this.prefs.t().compactModeOn : this.prefs.t().compactModeOff);
  }

  saveAppearance(): void {
    this.showToast(this.prefs.t().preferencesSaved);
  }

  private showToast(message: string): void {
    this.showSuccessMessage.set(message);
    this.showSuccess.set(true);
    setTimeout(() => this.showSuccess.set(false), 3000);
  }

  logout(): void {
    this.authStore.logout();
  }

  get f() { return this.profileForm.controls; }
  get s() { return this.securityForm.controls; }
}