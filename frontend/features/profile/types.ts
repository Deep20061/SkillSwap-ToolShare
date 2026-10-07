export interface UserProfileData {
  id: string;
  userId: string;
  bio: string | null;
  timezone: string | null;
  phone: string | null;
  avatarUrl: string | null;
  isIdentityVerified: boolean;
  rating: number | null;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: string;
  };
  profile: UserProfileData;
}

export interface PublicProfileResponse {
  user: {
    id: string;
    name: string;
    image: string | null;
    createdAt: string;
  };
  profile: UserProfileData | null;
  allowSearchIndexing: boolean;
}
