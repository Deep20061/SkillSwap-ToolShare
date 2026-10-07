// ── Enums ─────────────────────────────────────────────────────────────────────

export type ListingType = "SKILL_OFFER" | "TOOL_LISTING";
export type ListingStatus = "ACTIVE" | "PAUSED" | "ARCHIVED";
export type DeliveryMethod = "IN_PERSON" | "REMOTE" | "BOTH";
export type ToolCondition = "NEW" | "LIKE_NEW" | "GOOD" | "FAIR";

// ── Detail shapes ─────────────────────────────────────────────────────────────

export interface SkillListingDetail {
  listingId: string;
  skillId: number;
  skill: {
    id: number;
    name: string;
    slug: string;
  };
  estimatedHours: number | null;
  deliveryMethod: DeliveryMethod;
  exchangeFor: string | null;
}

export interface ToolListingDetail {
  listingId: string;
  category: string;
  condition: ToolCondition;
  depositAmount: number | null;
  maxBorrowDays: number | null;
  pickupLocation: string | null;
}

export interface ListingMedia {
  id: string;
  listingId: string;
  type: "IMAGE" | "VIDEO";
  path: string;
  mimeType: string | null;
  sizeBytes: number | null;
  order: number;
  createdAt: string;
}

// ── Listing owner summary (embedded in list/detail responses) ─────────────────

export interface ListingOwner {
  id: string;
  name: string;
  image: string | null;
  profile: {
    avatarUrl: string | null;
    rating: number | null;
    reviewCount: number;
    isIdentityVerified: boolean;
  } | null;
}

// ── Full listing ──────────────────────────────────────────────────────────────

export interface Listing {
  id: string;
  userId: string;
  user: ListingOwner;
  type: ListingType;
  title: string;
  description: string;
  tags: string[];
  status: ListingStatus;
  viewCount: number;
  saveCount: number;
  isSaved?: boolean;
  createdAt: string;
  updatedAt: string;
  skillDetail: SkillListingDetail | null;
  toolDetail: ToolListingDetail | null;
  media: ListingMedia[];
  latitude?: number;
  longitude?: number;
  locationName?: string;
  category?: { id: string; name: string; slug: string; icon?: string };
}

// ── API request bodies ────────────────────────────────────────────────────────

// Shared location + category fields for create bodies
interface CreateListingLocationFields {
  categoryId: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
}

export interface CreateSkillListingBody extends CreateListingLocationFields {
  type: "SKILL_OFFER";
  title: string;
  description: string;
  tags?: string[];
  skillDetail: {
    skillName: string;
    estimatedHours?: number;
    deliveryMethod: DeliveryMethod;
    exchangeFor?: string | null;
  };
}

export interface CreateToolListingBody extends CreateListingLocationFields {
  type: "TOOL_LISTING";
  title: string;
  description: string;
  tags?: string[];
  toolDetail: {
    category: string;
    condition: ToolCondition;
    depositAmount?: number | null;
    maxBorrowDays?: number | null;
    pickupLocation?: string | null;
  };
}

export type CreateListingBody = CreateSkillListingBody | CreateToolListingBody;

export interface UpdateListingBody {
  title?: string;
  description?: string;
  tags?: string[];
  status?: ListingStatus;
  skillDetail?: {
    estimatedHours?: number | null;
    deliveryMethod?: DeliveryMethod;
    exchangeFor?: string | null;
  };
  toolDetail?: {
    category?: string;
    condition?: ToolCondition;
    depositAmount?: number | null;
    maxBorrowDays?: number | null;
    pickupLocation?: string | null;
  };
}

// ── API response shapes ───────────────────────────────────────────────────────

export interface ListingsResponse {
  items: Listing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface MyListingsResponse {
  listings: Listing[];
}

export interface SavedListingsResponse {
  listings: Listing[];
}

export interface CreateListingResponse {
  id: string;
}
