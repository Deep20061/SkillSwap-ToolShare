export type NotificationType =
  | "NEW_MESSAGE"
  | "SWAP_REQUEST"
  | "CONTRACT_ACCEPTED"
  | "CONTRACT_DECLINED"
  | "CONTRACT_CANCELLED"
  | "CONTRACT_COMPLETED"
  | "SCHEDULE_CONFIRMED"
  | "REVIEW_RECEIVED"
  | "LISTING_SAVED";

export interface AppNotification {
  id: string;
  type: NotificationType;
  link: string | null;
  conversationId: string | null;
  data: { listingTitle?: string; count?: number } | null;
  readAt: string | null;
  createdAt: string;
  actor: { id: string; name: string; avatarUrl: string | null } | null;
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  nextCursor: string | null;
  unreadCount: number;
}
