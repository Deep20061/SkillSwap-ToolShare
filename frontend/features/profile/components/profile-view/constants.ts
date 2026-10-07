export const PROFILE_TABS = ["listings", "reviews", "about"] as const;
export type ProfileTab = (typeof PROFILE_TABS)[number];
