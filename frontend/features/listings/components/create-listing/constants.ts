export const CREATE_LISTING_STEPS = [
  { key: "type", label: "Type" },
  { key: "category", label: "Category" },
  { key: "details", label: "Details" },
  { key: "photos", label: "Photos" },
  { key: "location", label: "Location" },
  { key: "preview", label: "Preview" },
] as const;

export const CREATE_LISTING_STEP_COUNT = CREATE_LISTING_STEPS.length;
