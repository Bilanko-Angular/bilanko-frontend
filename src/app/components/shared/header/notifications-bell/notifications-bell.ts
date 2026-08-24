import {
  Component,
  ElementRef,
  HostListener,
  inject,
  signal
} from '@angular/core';

import { Router } from '@angular/router';

import { PreferencesService } from '../../../../services/preferences';
import { NotificationItem, NotificationsService } from '../../../../services/notifications.service';


@Component({
  selector: 'app-notifications-bell',
  standalone: true,
  imports: [],
  templateUrl: './notifications-bell.html',
  styleUrls: ['./notifications-bell.css']
})
export class NotificationsBell {

  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  protected readonly notificationsService = inject(NotificationsService);
  protected readonly prefs = inject(PreferencesService);

  readonly notifications = this.notificationsService.notifications;
  readonly count = this.notificationsService.count;

  readonly open = signal(false);

  toggle(): void {
    this.open.update((v) => !v);
  }

  close(): void {
    this.open.set(false);
  }

  goToTarget(notif: NotificationItem): void {
    this.close();

    if (notif.type === 'stock') {
      this.router.navigate(['/catalogue']);
      return;
    }

    if (notif.type === 'vente') {
      this.router.navigate(['/ventes']);
    }
  }

  clearAll(): void {
    this.notificationsService.clear();
    this.close();
  }


  // ============================================================
  // FERMETURE AU CLIC EXTÉRIEUR
  // ============================================================

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.close();
    }
  }
}