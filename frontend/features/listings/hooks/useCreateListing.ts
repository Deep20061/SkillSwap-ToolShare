"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/features/auth/hooks/useSession";
import { api } from "@/lib/api";
import { filterFilesBySize } from "@/lib/fileValidation";
import type {
  ListingType,
  DeliveryMethod,
  ToolCondition,
  CreateListingResponse,
} from "@/features/listings/types";

export function useCreateListing() {
  const { isAuthenticated, isLoading: sessionLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!sessionLoading && !isAuthenticated) {
      router.replace("/login?redirect=/listings/new");
    }
  }, [isAuthenticated, sessionLoading, router]);

  const [type, setType] = useState<ListingType>("SKILL_OFFER");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");

  const [skillName, setSkillName] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("IN_PERSON");
  const [exchangeFor, setExchangeFor] = useState("");

  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState<ToolCondition>("GOOD");
  const [depositAmount, setDepositAmount] = useState("");
  const [maxBorrowDays, setMaxBorrowDays] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");

  // Location + category
  const [locationName, setLocationName] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [listingCategoryId, setListingCategoryId] = useState<string | undefined>(undefined);

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function validate(): boolean {
    const errs: Record<string, string> = {};

    if (title.trim().length < 5) errs.title = "Title must be at least 5 characters.";
    if (title.trim().length > 120) errs.title = "Title must be at most 120 characters.";
    if (description.trim().length < 20)
      errs.description = "Description must be at least 20 characters.";
    if (description.trim().length > 2000)
      errs.description = "Description must be at most 2000 characters.";
    if (!listingCategoryId) errs.listingCategoryId = "Category is required.";

    if (type === "SKILL_OFFER") {
      if (!skillName.trim()) errs.skillName = "Skill name is required.";
      if (skillName.trim().length > 100)
        errs.skillName = "Skill name must be at most 100 characters.";
      if (estimatedHours && (isNaN(Number(estimatedHours)) || Number(estimatedHours) <= 0)) {
        errs.estimatedHours = "Must be a positive number.";
      }
    }

    if (type === "TOOL_LISTING") {
      if (!category.trim()) errs.category = "Category is required.";
      if (depositAmount && (isNaN(Number(depositAmount)) || Number(depositAmount) < 0)) {
        errs.depositAmount = "Must be a non-negative number.";
      }
      if (maxBorrowDays && (isNaN(Number(maxBorrowDays)) || Number(maxBorrowDays) < 1)) {
        errs.maxBorrowDays = "Must be a positive integer.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  useEffect(() => {
    return () => {
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoPreviews]);

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const valid = filterFilesBySize(files, 10);
    const combined = [...photos, ...valid].slice(0, 8);
    photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    setPhotos(combined);
    setPhotoPreviews(combined.map((f) => URL.createObjectURL(f)));
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  function removePhoto(index: number) {
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 10);

    const locationFields = {
      ...(latitude !== null && longitude !== null ? { latitude, longitude } : {}),
      ...(locationName.trim() ? { locationName: locationName.trim() } : {}),
      ...(listingCategoryId ? { categoryId: listingCategoryId } : {}),
    };

    const body =
      type === "SKILL_OFFER"
        ? {
            type,
            title: title.trim(),
            description: description.trim(),
            tags,
            ...locationFields,
            skillDetail: {
              skillName: skillName.trim(),
              ...(estimatedHours ? { estimatedHours: Number(estimatedHours) } : {}),
              deliveryMethod,
              exchangeFor: exchangeFor.trim() || null,
            },
          }
        : {
            type,
            title: title.trim(),
            description: description.trim(),
            tags,
            ...locationFields,
            toolDetail: {
              category: category.trim(),
              condition,
              ...(depositAmount ? { depositAmount: Number(depositAmount) } : {}),
              ...(maxBorrowDays ? { maxBorrowDays: Number(maxBorrowDays) } : {}),
              pickupLocation: pickupLocation.trim() || null,
            },
          };

    try {
      const result = await api.post("api/listings", { json: body }).json<CreateListingResponse>();

      const failed: { name: string; reason: string }[] = [];
      for (const file of photos) {
        const formData = new FormData();
        formData.append("file", file);
        try {
          await api.post(`api/listings/${result.id}/media`, { body: formData });
        } catch (err: unknown) {
          let reason = "upload failed";
          if (err && typeof err === "object" && "response" in err) {
            try {
              const data = (await (err as { response: Response }).response.json()) as {
                error?: string;
              };
              if (data?.error) reason = data.error;
            } catch {
              /* ignore */
            }
          }
          failed.push({ name: file.name, reason });
        }
      }

      if (failed.length > 0) {
        const details = failed.map((f) => `${f.name} (${f.reason})`).join(", ");
        setSubmitError(
          `Listing published, but ${failed.length} photo${failed.length > 1 ? "s" : ""} failed: ${details}. You can add them from the listing page.`
        );
        setIsSubmitting(false);
        router.push(`/listings/${result.id}`);
        return;
      }

      router.push(`/listings/${result.id}`);
    } catch (err: unknown) {
      let msg = "Something went wrong. Please try again.";
      if (err && typeof err === "object" && "response" in err) {
        try {
          const data = (await (err as { response: Response }).response.json()) as {
            // C# RFC-7807 ProblemDetails: validation failures carry a per-field `errors` map plus
            // `title`/`detail`. (The legacy backend used `{ error }` / Zod's `{ fieldErrors,
            // formErrors }` — still handled below for backward compatibility.)
            errors?: Record<string, string[]>;
            title?: string;
            detail?: string;
            error?: string | { fieldErrors?: Record<string, string[]>; formErrors?: string[] };
          };
          if (data?.errors && typeof data.errors === "object") {
            // RFC-7807 validation problem — collect all field messages into a readable string.
            const fieldMsgs = Object.entries(data.errors)
              .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
              .join("; ");
            msg = fieldMsgs || data.detail || data.title || msg;
          } else if (typeof data?.error === "string") {
            msg = data.error;
          } else if (data?.error && typeof data.error === "object") {
            // Legacy Zod flattened error — collect all messages into a readable string.
            const fieldMsgs = Object.entries(data.error.fieldErrors ?? {})
              .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
              .join("; ");
            const formMsgs = (data.error.formErrors ?? []).join("; ");
            msg = [fieldMsgs, formMsgs].filter(Boolean).join(" — ") || msg;
          } else {
            msg = data?.detail || data?.title || msg;
          }
        } catch {
          // ignore
        }
      }
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    sessionLoading,
    isAuthenticated,
    type,
    setType,
    title,
    setTitle,
    description,
    setDescription,
    tagsRaw,
    setTagsRaw,
    skillName,
    setSkillName,
    estimatedHours,
    setEstimatedHours,
    deliveryMethod,
    setDeliveryMethod,
    exchangeFor,
    setExchangeFor,
    category,
    setCategory,
    condition,
    setCondition,
    depositAmount,
    setDepositAmount,
    maxBorrowDays,
    setMaxBorrowDays,
    pickupLocation,
    setPickupLocation,
    photos,
    photoPreviews,
    photoInputRef,
    errors,
    isSubmitting,
    submitError,
    handlePhotoSelect,
    removePhoto,
    handleSubmit,
    locationName,
    setLocationName,
    latitude,
    setLatitude,
    longitude,
    setLongitude,
    listingCategoryId,
    setListingCategoryId,
  };
}
