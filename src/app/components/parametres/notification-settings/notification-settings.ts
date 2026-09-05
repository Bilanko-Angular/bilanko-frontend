import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreferencesService } from '../../../services/preferences';
import { UserApiService } from '../../../service/api/user/user-api.service';
import { ActionResponseService } from '../../../service/action-response/action-response.service';
import { NotificationPreferencesDto } from '../../../models/DTO/UserDto';

interface NotificationItem {
  id: keyof NotificationPreferencesDto;
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
export class NotificationSettingsComponent implements OnInit {
  public prefs: PreferencesService = inject(PreferencesService);
  private readonly userApi = inject(UserApiService);
  private readonly feedback = inject(ActionResponseService);

  loading = signal({ notifications: false });

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
      { id: 'stockAlerts', label: t.notifStockAlertTitle, description: t.notifStockAlertDesc, enabled: s.stockAlerts },
      { id: 'newSales', label: t.notifNewSalesTitle, description: t.notifNewSalesDesc, enabled: s.newSales },
      { id: 'monthlyReports', label: t.notifMonthlyReportTitle, description: t.notifMonthlyReportDesc, enabled: s.monthlyReports },
      { id: 'updates', label: t.notifUpdatesTitle, description: t.notifUpdatesDesc, enabled: s.updates },
    ];
  });

  async ngOnInit(): Promise<void> {
    try {
      const prefs = await this.userApi.getNotifications();
      if (prefs) this.notifState.set(prefs);
    } catch (err) {
      console.error('Erreur chargement notifications :', err);
    }
  }

  async toggleNotification(id: keyof NotificationPreferencesDto): Promise<void> {
    this.notifState.update(s => ({ ...s, [id]: !s[id] }));
    this.loading.update(l => ({ ...l, notifications: true }));
    try {
      const updated = await this.userApi.updateNotifications(this.notifState());
      this.notifState.set(updated);
      this.feedback.success(this.prefs.t().notificationsUpdated);
    } catch (err) {
      this.notifState.update(s => ({ ...s, [id]: !s[id] }));
      this.feedback.error(err);
    } finally {
      this.loading.update(l => ({ ...l, notifications: false }));
    }
  }
}
