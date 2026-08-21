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

  notifications = signal<NotificationPreference[]>([
    { id: 'n1', label: 'Alertes de stock', description: 'Recevoir une notification quand un produit atteint son seuil d\'alerte', enabled: true, type: 'stock' },
    { id: 'n2', label: 'Nouvelles ventes', description: 'Être informé des nouvelles ventes enregistrées', enabled: true, type: 'vente' },
    { id: 'n3', label: 'Rapports mensuels', description: 'Recevoir le résumé mensuel de votre activité', enabled: false, type: 'rapport' },
    { id: 'n4', label: 'Mises à jour', description: 'Notifications sur les nouvelles fonctionnalités', enabled: true, type: 'systeme' },
  ]);

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
        this.showToast('Profil sauvegardé avec succès !');
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
      this.showToast('Mot de passe modifié avec succès !');
    } else {
      this.securityForm.markAllAsTouched();
    }
  }

  toggleNotification(id: string): void {
    this.notifications.update(items =>
      items.map(item => item.id === id ? { ...item, enabled: !item.enabled } : item)
    );
    try {
      localStorage.setItem('bilanko_notifications', JSON.stringify(this.notifications()));
      this.showToast('Notifications mises à jour');
    } catch (e) {
      console.warn('Erreur sauvegarde notifications :', e);
    }
  }

  onLanguageChange(value: BilankoLanguage): void {
    this.prefs.language.set(value);
    this.showToast('Langue modifiée avec succès');
  }

  onDateFormatChange(value: string): void {
    this.prefs.dateFormat.set(value);
    this.showToast('Format de date modifié avec succès');
  }

  onCurrencyChange(value: BilankoCurrency): void {
    this.prefs.currency.set(value);
    this.showToast('Devise modifiée avec succès');
  }

  toggleCompactMode(): void {
    this.prefs.compactMode.update(v => !v);
    this.showToast(this.prefs.compactMode() ? 'Mode compact activé' : 'Mode compact désactivé');
  }

  saveAppearance(): void {
    this.showToast('Préférences sauvegardées avec succès !');
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