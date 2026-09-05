import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreferencesService, BilankoLanguage, BilankoCurrency } from '../../../services/preferences';
import { ActionResponseService } from '../../../service/action-response/action-response.service';
import { ThemeService } from '../../../services/theme';
import { UserStoreService } from '../../../service/store/user/user-store.service';
import { AppearancePreferences } from '../../../models/person';

@Component({
  selector: 'app-apparence-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './apparence-settings.html',
  styleUrls: ['./apparence-settings.css']
})
export class ApparenceSettingsComponent {
  public prefs: PreferencesService = inject(PreferencesService);
  public themeService: ThemeService = inject(ThemeService);
  private readonly userStore = inject(UserStoreService);
  private readonly feedback = inject(ActionResponseService);

  loading = signal({ appearance: false });

  constructor() {
    effect(() => {
      const ap = this.userStore.appearancePreferences();
      if (!ap) return;
      if (ap.language) this.prefs.language.set(ap.language as BilankoLanguage);
      if (ap.currency) this.prefs.currency.set(ap.currency as BilankoCurrency);
      if (ap.dateFormat) this.prefs.dateFormat.set(ap.dateFormat);
      if (typeof ap.compactMode === 'boolean') {
        this.prefs.compactMode.set(ap.compactMode);
      }
    }, { allowSignalWrites: true });
  }

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
    this.prefs.compactMode.update((v: boolean) => !v);
  }

  async saveAppearance(): Promise<void> {
    const request: AppearancePreferences = {
      theme: this.themeService.theme(),
      language: this.prefs.language(),
      dateFormat: this.prefs.dateFormat(),
      currency: this.prefs.currency(),
      compactMode: this.prefs.compactMode(),
    };

    this.loading.update(l => ({ ...l, appearance: true }));
    try {
      await this.userStore.updateAppearance(request);
      this.feedback.success(this.prefs.t().preferencesSaved);
    } catch (err) {
      this.feedback.error(err);
    } finally {
      this.loading.update(l => ({ ...l, appearance: false }));
    }
  }
}
