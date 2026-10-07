"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/use-toast";
import { validateFileSize } from "@/lib/fileValidation";
import { uploadAvatar } from "../hooks/useProfile";
import { apiUrl } from "@/lib/api";
import { Avatar } from "./Avatar";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  userName: string;
  onUpload: (avatarUrl: string) => void;
}

export function AvatarUpload({ currentAvatarUrl, userName, onUpload }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Revoke object URL whenever preview changes or on unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateFileSize(file, 5)) {
      e.target.value = "";
      return;
    }
    setPreview(URL.createObjectURL(file));
    handleUpload(file);
  }

  async function handleUpload(file: File) {
    setIsUploading(true);
    try {
      const { avatarUrl } = await uploadAvatar(file);
      // Clear preview — parent now holds the real server URL
      setPreview(null);
      onUpload(avatarUrl);
      // Let the navbar (and anything else showing the avatar) update without a refresh.
      window.dispatchEvent(new CustomEvent("avatar-updated", { detail: { avatarUrl } }));
      toast({ title: "Avatar updated" });
    } catch {
      toast({ variant: "destructive", title: "Upload failed", description: "Please try again." });
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  }

  const displaySrc = preview ?? (currentAvatarUrl ? `${apiUrl}${currentAvatarUrl}` : null);

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-20 w-20">
        <Avatar src={displaySrc} name={userName} size="xl" />
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
            <Spinner className="h-7 w-7 text-white" />
          </div>
        )}
      </div>

      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? "Uploading…" : "Change photo"}
        </Button>
        <p className="mt-1.5 text-xs text-gray-400">JPEG, PNG, WebP or GIF · max 5 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
