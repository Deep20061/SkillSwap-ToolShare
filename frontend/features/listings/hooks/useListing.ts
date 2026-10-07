"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { api, apiUrl } from "@/lib/api";
import { useSession } from "@/features/auth/hooks/useSession";
import { toast } from "@/components/ui/use-toast";
import type {
  Listing,
  ListingMedia,
  DeliveryMethod,
  ToolCondition,
} from "@/features/listings/types";

export interface EditForm {
  title: string;
  description: string;
  tags: string;
  status: "ACTIVE" | "PAUSED";
  estimatedHours: string;
  deliveryMethod: DeliveryMethod | "";
  exchangeFor: string;
  category: string;
  condition: ToolCondition | "";
  depositAmount: string;
  maxBorrowDays: string;
  pickupLocation: string;
}

function listingToForm(listing: Listing): EditForm {
  return {
    title: listing.title,
    description: listing.description,
    tags: listing.tags.join(", "),
    status: listing.status === "PAUSED" ? "PAUSED" : "ACTIVE",
    estimatedHours: listing.skillDetail?.estimatedHours?.toString() ?? "",
    deliveryMethod: listing.skillDetail?.deliveryMethod ?? "",
    exchangeFor: listing.skillDetail?.exchangeFor ?? "",
    category: listing.toolDetail?.category ?? "",
    condition: listing.toolDetail?.condition ?? "",
    depositAmount: listing.toolDetail?.depositAmount?.toString() ?? "",
    maxBorrowDays: listing.toolDetail?.maxBorrowDays?.toString() ?? "",
    pickupLocation: listing.toolDetail?.pickupLocation ?? "",
  };
}

export function useListing() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useSession();
  const autoEditOpened = useRef(false);

  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function loadListing() {
    if (!id) return;
    api
      .get(`api/listings/${id}`)
      .json<Listing>()
      .then(setListing)
      .catch(() => setError("Listing not found."))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    loadListing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isOwner = !!(user && listing && user.id === listing.userId);

  function openEdit() {
    if (!listing) return;
    setEditForm(listingToForm(listing));
    setEditing(true);
  }

  function closeEdit() {
    setEditing(false);
    setEditForm(null);
  }

  // Deep-link into edit mode via ?edit=1 (e.g. the Edit button on "My listings").
  // Only the owner can edit; open once, then strip the param so a refresh/back
  // doesn't re-trigger it and the URL stays clean.
  useEffect(() => {
    if (autoEditOpened.current || !listing || !isOwner || editing) return;
    const wantsEdit = searchParams.get("edit") === "1" || searchParams.get("edit") === "true";
    if (!wantsEdit) return;
    autoEditOpened.current = true;
    setEditForm(listingToForm(listing));
    setEditing(true);
    router.replace(`/listings/${listing.id}`, { scroll: false });
  }, [listing, isOwner, editing, searchParams, router]);

  async function handleSave() {
    if (!editForm || !listing) return;
    setIsSaving(true);

    const tags = editForm.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const body: Record<string, unknown> = {
      title: editForm.title,
      description: editForm.description,
      tags,
      status: editForm.status,
    };

    if (listing.type === "SKILL_OFFER") {
      body.skillDetail = {
        ...(editForm.deliveryMethod ? { deliveryMethod: editForm.deliveryMethod } : {}),
        ...(editForm.estimatedHours !== ""
          ? { estimatedHours: parseFloat(editForm.estimatedHours) }
          : {}),
        exchangeFor: editForm.exchangeFor || null,
      };
    }

    if (listing.type === "TOOL_LISTING") {
      body.toolDetail = {
        ...(editForm.category ? { category: editForm.category } : {}),
        ...(editForm.condition ? { condition: editForm.condition } : {}),
        depositAmount: editForm.depositAmount !== "" ? parseInt(editForm.depositAmount) : null,
        maxBorrowDays: editForm.maxBorrowDays !== "" ? parseInt(editForm.maxBorrowDays) : null,
        pickupLocation: editForm.pickupLocation || null,
      };
    }

    try {
      const updated = await api.patch(`api/listings/${listing.id}`, { json: body }).json<Listing>();
      setListing(updated);
      closeEdit();
      toast({ title: "Listing saved" });
    } catch {
      toast({ variant: "destructive", title: "Save failed", description: "Please try again." });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!listing) return;
    setIsDeleting(true);
    try {
      await api.delete(`api/listings/${listing.id}`);
      router.push("/listings");
    } catch {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !listing) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const media = await api
        .post(`api/listings/${listing.id}/media`, { body: formData })
        .json<ListingMedia>();
      setListing((prev) => (prev ? { ...prev, media: [...prev.media, media] } : prev));
      toast({ title: "Photo uploaded" });
    } catch (err: unknown) {
      let description = "Please try again.";
      if (err && typeof err === "object" && "response" in err) {
        try {
          const data = (await (err as { response: Response }).response.json()) as {
            error?: string;
          };
          if (data?.error) description = data.error;
        } catch {
          /* ignore */
        }
      }
      toast({ variant: "destructive", title: "Upload failed", description });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDeleteMedia(mediaId: string) {
    if (!listing) return;
    try {
      await api.delete(`api/listings/${listing.id}/media/${mediaId}`);
      setListing((prev) =>
        prev ? { ...prev, media: prev.media.filter((m) => m.id !== mediaId) } : prev
      );
    } catch {
      toast({ variant: "destructive", title: "Delete failed", description: "Please try again." });
    }
  }

  return {
    listing,
    isLoading,
    error,
    editing,
    editForm,
    setEditForm,
    isSaving,
    confirmDelete,
    setConfirmDelete,
    isDeleting,
    isUploading,
    fileInputRef,
    apiUrl,
    isOwner,
    openEdit,
    closeEdit,
    handleSave,
    handleDelete,
    handleUpload,
    handleDeleteMedia,
  };
}
