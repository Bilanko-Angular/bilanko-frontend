import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PLATFORM_ID } from '@angular/core';
import { Template } from '../../components/shared/template/template';
import { SupportMessagingApi } from '../../service/api/support/support-messaging-api';
import {
  SupportConversationDto,
  SupportMessageDto,
} from '../../models/DTO/SupportMessagingDto';

@Component({
  selector: 'app-support-messaging',
  standalone: true,
  imports: [CommonModule, FormsModule, Template],
  templateUrl: './support-messaging.html',
  styleUrls: ['./support-messaging.css'],
})
export class SupportMessaging implements OnInit, OnDestroy {
  private readonly supportApi = inject(SupportMessagingApi);
  private readonly platformId = inject(PLATFORM_ID);
  private refreshTimer?: ReturnType<typeof setInterval>;

  protected readonly conversation = signal<SupportConversationDto | null>(null);
  protected readonly messages = signal<SupportMessageDto[]>([]);
  protected readonly loading = signal(true);
  protected readonly starting = signal(false);
  protected readonly sending = signal(false);
  protected readonly error = signal('');
  protected draft = '';

  async ngOnInit(): Promise<void> {
    await this.loadConversation();
    if (isPlatformBrowser(this.platformId)) {
      this.refreshTimer = setInterval(() => void this.refreshMessages(), 10000);
    }
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }

  async startConversation(): Promise<void> {
    this.starting.set(true);
    this.error.set('');
    try {
      const conversation = await this.supportApi.startConversation();
      this.conversation.set(conversation);
      await this.loadMessages(conversation.id);
    } catch {
      this.error.set('Impossible de démarrer la conversation. Réessayez dans quelques instants.');
    } finally {
      this.starting.set(false);
    }
  }

  async sendMessage(): Promise<void> {
    const content = this.draft.trim();
    const currentConversation = this.conversation();
    if (!content || !currentConversation?.canWrite || this.sending()) {
      return;
    }

    this.sending.set(true);
    this.error.set('');
    try {
      const message = await this.supportApi.sendMessage(currentConversation.id, content);
      this.messages.update((messages) => [...messages, message]);
      this.draft = '';
      await this.refreshConversation();
    } catch {
      this.error.set("Votre message n'a pas pu être envoyé. Réessayez.");
    } finally {
      this.sending.set(false);
    }
  }

  protected displayName(name: string | null, subname: string | null): string {
    return [name, subname].filter(Boolean).join(' ') || 'Service client';
  }

  protected isMerchantMessage(message: SupportMessageDto): boolean {
    return message.senderRole.toUpperCase() === 'MERCHANT';
  }

  private async loadConversation(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const conversation = await this.supportApi.getMyConversation();
      this.conversation.set(conversation);
      await this.loadMessages(conversation.id);
    } catch (error: unknown) {
      if (this.isNotFound(error)) {
        this.conversation.set(null);
        this.messages.set([]);
      } else {
        this.error.set('Impossible de charger votre conversation.');
      }
    } finally {
      this.loading.set(false);
    }
  }

  private async refreshConversation(): Promise<void> {
    try {
      this.conversation.set(await this.supportApi.getMyConversation());
    } catch {
      // Keep the displayed conversation when a background refresh fails.
    }
  }

  private async refreshMessages(): Promise<void> {
    const currentConversation = this.conversation();
    if (!currentConversation) {
      return;
    }
    try {
      await Promise.all([
        this.loadMessages(currentConversation.id),
        this.refreshConversation(),
      ]);
    } catch {
      // Keep the current messages visible until the next refresh.
    }
  }

  private async loadMessages(conversationId: number): Promise<void> {
    const page = await this.supportApi.getMessages(conversationId);
    this.messages.set([...page.content].reverse());
  }

  private isNotFound(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      (error as { response?: { status?: number } }).response?.status === 404
    );
  }

}
