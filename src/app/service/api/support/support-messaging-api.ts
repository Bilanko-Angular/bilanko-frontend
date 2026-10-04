import { Injectable } from '@angular/core';
import { apiClient } from '../../../core/axios/axios.config';
import {
  SupportConversationDto,
  SupportMessageDto,
  SupportMessagePage,
} from '../../../models/DTO/SupportMessagingDto';

@Injectable({
  providedIn: 'root',
})
export class SupportMessagingApi {
  private readonly basePath = '/support';

  async startConversation(): Promise<SupportConversationDto> {
    const response = await apiClient.post<SupportConversationDto>(
      `${this.basePath}/conversations/start`,
      {},
    );
    return response.data;
  }

  async getMyConversation(): Promise<SupportConversationDto> {
    const response = await apiClient.get<SupportConversationDto>(
      `${this.basePath}/conversations/mine`,
    );
    return response.data;
  }

  async getMessages(conversationId: number, page = 0, size = 50): Promise<SupportMessagePage> {
    const response = await apiClient.get<SupportMessagePage>(
      `${this.basePath}/conversations/${conversationId}/messages`,
      { params: { page, size } },
    );
    return response.data;
  }

  async sendMessage(conversationId: number, content: string): Promise<SupportMessageDto> {
    const response = await apiClient.post<SupportMessageDto>(
      `${this.basePath}/conversations/${conversationId}/messages`,
      { content },
    );
    return response.data;
  }
}
