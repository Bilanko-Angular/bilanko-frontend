import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreferencesService } from '../../../services/preferences';
import { ActionResponseService } from '../../../service/action-response/action-response.service';
import { UserStoreService } from '../../../service/store/user/user-store.service';
import { NotificationPreferences } from '../../../models/person';

interface NotificationItem {
  id: keyof NotificationPreferences;
  label: string;
  description: string;
  enabled: boolean;
}

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-settings.html',
  styleUrls: ['./notification-settings.css']
})
export class NotificationSettingsComponent {
  public prefs: PreferencesService = inject(PreferencesService);
  private readonly userStore = inject(UserStoreService);
  private readonly feedback = inject(ActionResponseService);

  loading = signal({ notifications: false });

  private notifState = signal<NotificationPreferences>({
    stockAlerts: true,
    newSales: true,
    monthlyReports: false,
    updates: true,
  });

  readonly notifications = computed<NotificationItem[]>(() => {
    const t = this.prefs.t();
    const s = this.notifState();
    return [
      { id: 'stockAlerts', label: t.notifStockAlertTitle, description: t.notifStockAlertDesc, enabled: s.stockAlerts },
      { id: 'newSales', label: t.notifNewSalesTitle, description: t.notifNewSalesDesc, enabled: s.newSales },
      { id: 'monthlyReports', label: t.notifMonthlyReportTitle, description: t.notifMonthlyReportDesc, enabled: s.monthlyReports },
      { id: 'updates', label: t.notifUpdatesTitle, description: t.notifUpdatesDesc, enabled: s.updates },
    ];
  });

  constructor() {
    effect(() => {
      const prefs = this.userStore.notificationPreferences();
      if (prefs) this.notifState.set(prefs);
    }, { allowSignalWrites: true });
  }

  async toggleNotification(id: keyof NotificationPreferences): Promise<void> {
    this.notifState.update(s => ({ ...s, [id]: !s[id] }));
    this.loading.update(l => ({ ...l, notifications: true }));
    try {
      await this.userStore.updateNotifications(this.notifState());
      this.feedback.success(this.prefs.t().notificationsUpdated);
    } catch (err) {
      this.notifState.update(s => ({ ...s, [id]: !s[id] }));
      this.feedback.error(err);
    } finally {
      this.loading.update(l => ({ ...l, notifications: false }));
    }
  }
}
