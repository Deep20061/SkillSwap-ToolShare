"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import type { SerializedContract } from "../types";

interface ReviewModalState {
  contractId: string;
  revieweeName: string;
}

export function useConversationActions(activeConvId: string | null) {
  const [activeContract, setActiveContract] = useState<SerializedContract | null | undefined>(undefined);
  const [actionLoading, setActionLoading] = useState(false);
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reviewModal, setReviewModal] = useState<ReviewModalState | null>(null);

  useEffect(() => {
    if (!activeConvId) {
      setActiveContract(undefined);
      return;
    }
    setActiveContract(undefined);
    api
      .get(`api/conversations/${activeConvId}/contracts`)
      .json<{ contract: SerializedContract | null }>()
      .then((d) => setActiveContract(d.contract))
      .catch(() => setActiveContract(null));
  }, [activeConvId]);

  async function handleContractAction(
    action: "accept" | "decline" | "complete" | "cancel",
    cancelReason?: string,
  ) {
    if (!activeContract) return;
    setActionLoading(true);
    try {
      const body: Record<string, unknown> = { action };
      if (cancelReason !== undefined) body.cancelReason = cancelReason;
      const updated = await api
        .patch(`api/contracts/${activeContract.id}`, { json: body })
        .json<SerializedContract>();
      setActiveContract(updated);
    } catch {
      toast({ variant: "destructive", title: "Action failed", description: "Please try again." });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel(reason: string) {
    setShowCancelModal(false);
    await handleContractAction("cancel", reason);
  }

  return {
    activeContract,
    setActiveContract,
    actionLoading,
    showProposeModal,
    setShowProposeModal,
    showCancelModal,
    setShowCancelModal,
    reviewModal,
    setReviewModal,
    handleContractAction,
    handleCancel,
  };
}
