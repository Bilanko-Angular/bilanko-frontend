import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreferencesService, BilankoLanguage, BilankoCurrency } from '../../../services/preferences';
import { UserApiService } from '../../../service/api/user/user-api.service';
import { ActionResponseService } from '../../../service/action-response/action-response.service';
import { ThemeService } from '../../../services/theme';
import { AppearancePreferencesDto } from '../../../models/DTO/UserDto';

@Component({
  selector: 'app-apparence-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './apparence-settings.html',
  styleUrls: ['./apparence-settings.css']
})
export class ApparenceSettingsComponent implements OnInit {
  public prefs: PreferencesService = inject(PreferencesService);
  public themeService: ThemeService = inject(ThemeService);
  private readonly userApi = inject(UserApiService);
  private readonly feedback = inject(ActionResponseService);

  loading = signal({ appearance: false });

  async ngOnInit(): Promise<void> {
    try {
      const ap = await this.userApi.getAppearance();
      if (ap) {
        if (ap.language) this.prefs.language.set(ap.language as BilankoLanguage);
        if (ap.currency) this.prefs.currency.set(ap.currency as BilankoCurrency);
        if (ap.dateFormat) this.prefs.dateFormat.set(ap.dateFormat);
        if (typeof ap.compactMode === 'boolean') {
          this.prefs.compactMode.set(ap.compactMode);
        }
      }
    } catch (err) {
      console.error('Erreur chargement apparence :', err);
    }
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
    const request: AppearancePreferencesDto = {
      theme: this.themeService.theme(),
      language: this.prefs.language(),
      dateFormat: this.prefs.dateFormat(),
      currency: this.prefs.currency(),
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
}
