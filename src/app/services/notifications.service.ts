import { Injectable, computed, signal } from '@angular/core';

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  type: 'stock' | 'vente' | 'systeme';
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {

  // Mock initial — à remplacer par un appel API / WebSocket plus tard
  private readonly _notifications = signal<NotificationItem[]>([
    {
      id: 'n1',
      title: 'Stock faible',
      detail: "Sucre 1kg atteint le seuil d'alerte",
      time: 'Il y a 2h',
      type: 'stock'
    },
    {
      id: 'n2',
      title: 'Nouvelle vente',
      detail: 'Vente enregistrée pour Restaurant Le Palo',
      time: 'Il y a 5h',
      type: 'vente'
    },
    {
      id: 'n3',
      title: 'Mise à jour',
      detail: 'Le catalogue a été synchronisé',
      time: 'Hier',
      type: 'systeme'
    }
  ]);

  readonly notifications = this._notifications.asReadonly();

  readonly count = computed(() => this._notifications().length);

  add(notification: NotificationItem): void {
    this._notifications.update((list) => [notification, ...list]);
  }

  remove(id: string): void {
    this._notifications.update((list) => list.filter((n) => n.id !== id));
  }

  clear(): void {
    this._notifications.set([]);
  }
}