"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Paperclip, Image, Lock, Calendar, Doc, Pin, X, Check, Plus } from "@/components/ui/Icons";
import { validateFileSize } from "@/lib/fileValidation";
import { cx } from "@/lib/utils";
import { api } from "@/lib/api";

interface TimeSlot {
  date: string;
  time: string;
  dur: string;
}

const DUR_OPTIONS = ["1h", "2h", "3h", "4h", "6h", "8h"];

interface Props {
  conversationId: string;
  isSending: boolean;
  onSend: (content: string, file?: File) => Promise<void>;
  onTyping: () => void;
  partnerFirstName?: string;
  onProposeTerms?: () => void;
  /** The exchange's currently-agreed time (ISO), if any — seeds the time picker. */
  agreedStart?: string | null;
  agreedEnd?: string | null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ComposerIconBtn({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className="h-7 w-7 rounded-md inline-flex items-center justify-center text-ink3 hover:bg-line/70 hover:text-ink flex-shrink-0 transition-colors"
    >
      {icon}
    </button>
  );
}

const pad2 = (n: number) => String(n).padStart(2, "0");
const localDate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const localTime = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

function defaultSlots(agreedStart?: string | null, agreedEnd?: string | null): TimeSlot[] {
  // If the exchange already has an agreed time, open the picker on it — the user is
  // here to nudge the existing time, not pick from scratch.
  if (agreedStart) {
    const start = new Date(agreedStart);
    let dur = "2h";
    if (agreedEnd) {
      const hours = Math.round((new Date(agreedEnd).getTime() - start.getTime()) / 3_600_000);
      if (hours > 0) dur = `${hours}h`;
    }
    return [
      { date: localDate(start), time: localTime(start), dur },
      { date: "", time: "", dur: "2h" },
    ];
  }
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return [
    { date: localDate(today), time: "14:00", dur: "2h" },
    { date: localDate(tomorrow), time: "10:00", dur: "2h" },
    { date: "", time: "", dur: "2h" },
  ];
}

export function MessageInput({ conversationId, isSending, onSend, onTyping, partnerFirstName, onProposeTerms, agreedStart, agreedEnd }: Props) {
  const [value, setValue] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(() => defaultSlots(agreedStart, agreedEnd));

  // Re-seed the slots from the agreed time each time the picker opens.
  useEffect(() => {
    if (showTimePicker) setTimeSlots(defaultSlots(agreedStart, agreedEnd));
  }, [showTimePicker, agreedStart, agreedEnd]);
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [submittingTimes, setSubmittingTimes] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastTypingSentRef = useRef<number>(0);

  useEffect(() => {
    if (!pendingFile?.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(pendingFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, []);

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    autoResize();
    const now = Date.now();
    if (now - lastTypingSentRef.current > 2000) {
      lastTypingSentRef.current = now;
      onTyping();
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (!validateFileSize(file, 10)) {
        e.target.value = "";
        return;
      }
      setPendingFile(file);
    }
    e.target.value = "";
  }

  async function handleSend() {
    const trimmed = value.trim();
    if ((!trimmed && !pendingFile) || isSending) return;
    const fileToSend = pendingFile;
    setValue("");
    setPendingFile(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    await onSend(trimmed, fileToSend ?? undefined);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleShareLocation() {
    if (!navigator.geolocation) return;
    setIsSharingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let name = "My location";
        let addr = `${latitude.toFixed(4)}° N, ${Math.abs(longitude).toFixed(4)}° ${longitude >= 0 ? "E" : "W"}`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en" } },
          );
          const data = await res.json();
          if (data.address) {
            name = data.address.road ?? data.address.neighbourhood ?? data.address.suburb ?? "My location";
            const parts = [data.address.road, data.address.city ?? data.address.town ?? data.address.village, data.address.country]
              .filter(Boolean)
              .join(", ");
            if (parts) addr = parts;
          }
        } catch { /* use coords fallback */ }
        const payload = `__LOCATION__:${JSON.stringify({ name, addr, lat: latitude, lng: longitude })}`;
        await onSend(payload);
        setIsSharingLocation(false);
      },
      () => setIsSharingLocation(false),
      { timeout: 8000 },
    );
  }

  async function handleSendTimesProposal() {
    const filled = timeSlots.filter((s) => s.date && s.time);
    if (filled.length === 0) return;
    const slots = filled.map((s) => {
      const d = new Date(`${s.date}T${s.time}`);
      return {
        day: d.toLocaleDateString("en-GB", { weekday: "short" }),
        date: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        time: s.time,
        dur: s.dur,
        rawDate: s.date,
      };
    });
    setSubmittingTimes(true);
    try {
      await api.post(`api/conversations/${conversationId}/schedule`, { json: { slots } });
      setShowTimePicker(false);
      setTimeSlots(defaultSlots());
    } finally {
      setSubmittingTimes(false);
    }
  }

  const canSend = !!(value.trim() || pendingFile) && !isSending;
  const placeholder = partnerFirstName ? `Message ${partnerFirstName}…` : "Write a message…";

  return (
    <div className="border-t border-line bg-surface px-4 lg:px-6 pt-2.5 pb-2.5">
      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,image/*" className="hidden" onChange={handleFileSelect} />

      {/* Time proposal picker */}
      {showTimePicker && (
        <div className="mb-2 rounded-xl border border-line bg-sunken p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink3">Propose times</span>
            <button
              type="button"
              onClick={() => setShowTimePicker(false)}
              className="inline-flex h-5 w-5 items-center justify-center rounded text-ink3 hover:bg-line hover:text-ink"
            >
              <X size={12} />
            </button>
          </div>
          <div className="space-y-1.5">
            {timeSlots.map((slot, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-4 shrink-0 font-mono text-[10px] text-ink3">{i + 1}.</span>
                <input
                  type="date"
                  value={slot.date}
                  onChange={(e) => setTimeSlots((prev) => prev.map((s, j) => j === i ? { ...s, date: e.target.value } : s))}
                  className="h-7 flex-1 rounded-lg border border-line bg-surface px-2 text-[12px] text-ink focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-200"
                />
                <input
                  type="time"
                  value={slot.time}
                  onChange={(e) => setTimeSlots((prev) => prev.map((s, j) => j === i ? { ...s, time: e.target.value } : s))}
                  className="h-7 w-24 rounded-lg border border-line bg-surface px-2 text-[12px] text-ink focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-200"
                />
                <select
                  value={slot.dur}
                  onChange={(e) => setTimeSlots((prev) => prev.map((s, j) => j === i ? { ...s, dur: e.target.value } : s))}
                  className="h-7 w-20 rounded-lg border border-line bg-surface px-1.5 text-[12px] text-ink focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-200"
                >
                  {DUR_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="mt-2.5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setTimeSlots((prev) => [...prev, { date: "", time: "", dur: "2h" }])}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-ink3 hover:text-ink"
            >
              <Plus size={11} /> Add slot
            </button>
            <button
              type="button"
              onClick={handleSendTimesProposal}
              disabled={submittingTimes || timeSlots.every((s) => !s.date || !s.time)}
              className={cx(
                "inline-flex h-7 items-center gap-1.5 rounded-lg px-3 text-[12px] font-semibold transition-colors",
                !submittingTimes && timeSlots.some((s) => s.date && s.time)
                  ? "bg-brand-600 text-white hover:bg-brand-700"
                  : "cursor-not-allowed bg-line text-ink3",
              )}
            >
              <Check size={12} /> {submittingTimes ? "Sending…" : "Send times"}
            </button>
          </div>
        </div>
      )}

      {/* Pending file preview */}
      {pendingFile && (
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-line bg-sunken px-2.5 py-2">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={pendingFile.name}
              className="h-14 w-14 rounded-md border border-line object-cover"
            />
          ) : (
            <div className="flex items-center gap-1.5 min-w-0">
              <Paperclip size={13} className="shrink-0 text-ink3" />
              <span className="truncate text-[12px] font-medium text-ink">{pendingFile.name}</span>
              <span className="shrink-0 text-[11px] text-ink3">{formatBytes(pendingFile.size)}</span>
            </div>
          )}
          <button
            onClick={() => setPendingFile(null)}
            className="ml-auto inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-line text-[13px] font-bold leading-none text-ink2 hover:bg-red-100 hover:text-red-500"
          >
            ×
          </button>
        </div>
      )}

      {/* Outer composer container */}
      <div className="rounded-2xl bg-sunken border border-line2 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-200/60 transition-all">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent text-[13.5px] text-ink px-3.5 pt-2.5 pb-1 placeholder-ink3 resize-none focus:outline-none max-h-40 leading-relaxed"
        />
        <div className="flex items-center justify-between px-2 pb-2 pt-1">
          <div className="flex items-center gap-1">
            <ComposerIconBtn
              icon={<Calendar size={14} className={showTimePicker ? "text-brand-600" : ""} />}
              label="Propose time"
              onClick={() => setShowTimePicker((v) => !v)}
            />
            <ComposerIconBtn icon={<Doc size={14} />} label="Propose terms" onClick={onProposeTerms} />
            <ComposerIconBtn
              icon={<Pin size={14} className={isSharingLocation ? "text-brand-600 animate-pulseDot" : ""} />}
              label="Share location"
              onClick={handleShareLocation}
            />
            <ComposerIconBtn icon={<Image size={14} />} label="Photos" onClick={() => imageInputRef.current?.click()} />
            <ComposerIconBtn icon={<Paperclip size={14} />} label="File" onClick={() => fileInputRef.current?.click()} />
          </div>
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={cx(
              "h-8 px-3 rounded-lg inline-flex items-center gap-1.5 text-[12px] font-semibold transition-colors",
              canSend
                ? "bg-brand-600 text-white hover:bg-brand-700"
                : "bg-line text-ink3 cursor-not-allowed",
            )}
          >
            <Send size={13} /> Send
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-1.5 text-[10px] font-mono text-ink3 px-1">
        <span className="inline-flex items-center gap-1">
          <Lock size={10} className="text-emerald-600" /> End-to-end encrypted
        </span>
        <span className="hidden md:inline">Enter to send · Shift+Enter for line break</span>
      </div>
    </div>
  );
}
