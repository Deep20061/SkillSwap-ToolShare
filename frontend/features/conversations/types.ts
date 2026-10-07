export interface ConversationUser {
  id: string;
  name: string;
  image: string | null;
  createdAt: string;
  profile: {
    avatarUrl: string | null;
    rating: number | null;
    reviewCount: number;
    isIdentityVerified: boolean;
  } | null;
}

export interface MessageAttachment {
  id: string;
  path: string;
  mimeType: string;
  fileName: string;
  sizeBytes: number;
}

export interface ScheduleSlot {
  day: string;
  date: string;
  time: string;
  dur: string;
  rawDate: string;
}

export interface ScheduleProposalData {
  id: string;
  slots: ScheduleSlot[];
  confirmedSlot: number | null;
  confirmedAt: string | null;
  confirmedById: string | null;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: "USER" | "CONTRACT_PROPOSAL" | "SCHEDULE_PROPOSAL";
  contractId: string | null;
  scheduleProposal: ScheduleProposalData | null;
  createdAt: string;
  attachments: MessageAttachment[];
}

export interface Conversation {
  id: string;
  updatedAt: string;
  listing: { id: string; title: string; type: string; coverImage: string | null } | null;
  otherUser: ConversationUser | null;
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    hasAttachment: boolean;
  } | null;
  unreadCount: number;
  contractStatus: ContractStatus | null;
  otherUserLastReadAt: string | null;
}

export type ContractStatus =
  | "PENDING"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "DECLINED"
  | "CANCELLED"
  | "DISPUTED";

export interface ContractListing {
  id: string;
  title: string;
  type: string;
  userId: string;
  coverImage: string | null;
}

export interface SerializedContract {
  id: string;
  conversationId: string | null;
  requesterId: string;
  providerId: string;
  listingId: string;
  listing: ContractListing;
  counterListingId: string | null;
  counterListing: ContractListing | null;
  status: ContractStatus;
  message: string | null;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelledById: string | null;
  cancelReason: string | null;
  requesterConfirmedComplete: boolean;
  providerConfirmedComplete: boolean;
  createdAt: string;
  updatedAt: string;
  reviewedByIds: string[];
}
