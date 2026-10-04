export type ConversationStatus =
  | 'WAITING'
  | 'ACTIVE'
  | 'CLOSED'
  | 'TRANSFER_PENDING'
  | string;

export interface SupportConversationDto {
  id: number;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
  merchantId: number;
  merchantName: string;
  merchantSubname: string;
  merchantEmail: string;
  currentAdminId: number | null;
  currentAdminName: string | null;
  currentAdminSubname: string | null;
  canWrite: boolean;
  transferPending: boolean;
}

export interface SupportMessageDto {
  id: number;
  content: string;
  createdAt: string;
  senderId: number;
  senderName: string;
  senderSubname: string;
  senderRole: string;
}

export interface SupportMessagePage {
  content: SupportMessageDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasMore?: boolean;
}
