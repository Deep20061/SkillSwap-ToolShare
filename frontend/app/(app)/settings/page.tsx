"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AppFooter } from "@/components/AppFooter";
import { Avatar } from "@/features/profile/components/Avatar";
import { useProfile, saveProfile, uploadAvatar } from "@/features/profile/hooks/useProfile";
import { useSession } from "@/features/auth/hooks/useSession";
import { authApi } from "@/lib/api-client";
import { useSettings } from "@/features/settings/hooks/useSettings";
import { passwordSchema } from "@/features/auth/lib/password";
import {
  User,
  Key,
  Lock,
  Bell,
  Shield,
  Card,
  Globe,
  Doc,
  Logout,
} from "@/components/ui/Icons";
import { cx, inputCls } from "@/lib/utils";
import { api, apiErrorMessage } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { SettingsCard, Divider } from "@/features/settings/components/SettingsCard";
import { ToggleRow } from "@/features/settings/components/ToggleRow";
import { ComingSoon } from "@/features/settings/components/ComingSoon";
import { NotifRow } from "@/features/settings/components/NotifRow";
import { VerifyRow } from "@/features/settings/components/VerifyRow";

import { apiUrl } from "@/lib/api";

const TABS = [
  { v: "profile", l: "Profile", i: <User size={15} /> },
  { v: "account", l: "Account & Login", i: <Key size={15} /> },
  { v: "security", l: "Privacy & Security", i: <Lock size={15} /> },
  { v: "notifications", l: "Notifications", i: <Bell size={15} /> },
  { v: "verification", l: "Verification", i: <Shield size={15} /> },
  { v: "deposits", l: "Deposits & Wallet", i: <Card size={15} /> },
  { v: "connected", l: "Connected apps", i: <Globe size={15} /> },
  { v: "data", l: "Data & Export", i: <Doc size={15} /> },
] as const;

type TabKey = (typeof TABS)[number]["v"];

// Each row toggles the in-app channel for one or more backend notification types.
const NOTIF_EVENTS = [
  { label: "New message", desc: "Someone sends you a chat message", types: ["NEW_MESSAGE"] },
  { label: "Swap requests", desc: "Someone proposes an exchange with you", types: ["SWAP_REQUEST"] },
  {
    label: "Contract updates",
    desc: "Your swap is accepted, declined, cancelled or completed",
    types: ["CONTRACT_ACCEPTED", "CONTRACT_DECLINED", "CONTRACT_CANCELLED", "CONTRACT_COMPLETED"],
  },
  { label: "Schedule confirmed", desc: "A proposed time slot is confirmed", types: ["SCHEDULE_CONFIRMED"] },
  { label: "Review received", desc: "Someone reviews you after a swap", types: ["REVIEW_RECEIVED"] },
] as const;

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useSession();
  const { profile, setProfile, isLoading } = useProfile();
  const { settings, update: updateSettings } = useSettings();
  const [tab, setTab] = useState<TabKey>("profile");
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [nameVal, setNameVal] = useState("");
  const [bioVal, setBioVal] = useState("");
  const [phoneVal, setPhoneVal] = useState("");

  // Change password form
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwStatus, setPwStatus] = useState<{ kind: "error" | "success"; msg: string } | null>(null);
  const [pwSaving, setPwSaving] = useState(false);

  // Delete account
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Data export
  const [exporting, setExporting] = useState(false);

  const avatarSrc = profile?.profile?.avatarUrl ? `${apiUrl}${profile.profile.avatarUrl}` : null;
  const displayName = profile?.user?.name ?? user?.name ?? "User";
  const displayEmail = profile?.user?.email ?? user?.email ?? "";

  async function handleSignOut() {
    await authApi.logout();
    router.push("/login");
  }

  async function handleSaveProfile() {
    setSaving(true);
    try {
      const updated = await saveProfile({
        name: nameVal || undefined,
        bio: bioVal || undefined,
        phone: phoneVal || undefined,
      });
      setProfile(updated);
      toast({ title: "Profile saved" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Couldn't save profile",
        description: await apiErrorMessage(err, "Please try again."),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const res = await uploadAvatar(file);
      setProfile((prev) =>
        prev ? { ...prev, profile: { ...prev.profile!, avatarUrl: res.avatarUrl } } : prev
      );
      // Update the navbar avatar (and anything else listening) without a refresh.
      window.dispatchEvent(new CustomEvent("avatar-updated", { detail: { avatarUrl: res.avatarUrl } }));
      toast({ title: "Photo updated" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: await apiErrorMessage(err, "Please try again."),
      });
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  async function handleChangePassword() {
    setPwStatus(null);
    const parsed = passwordSchema.safeParse(newPw);
    if (!parsed.success) {
      setPwStatus({ kind: "error", msg: parsed.error.issues[0]?.message ?? "Invalid password" });
      return;
    }
    if (newPw !== confirmPw) {
      setPwStatus({ kind: "error", msg: "Passwords don't match" });
      return;
    }
    setPwSaving(true);
    try {
      const { error } = await authApi.changePassword({
        currentPassword: currentPw,
        newPassword: newPw,
      });
      if (error) {
        setPwStatus({ kind: "error", msg: error.message ?? "Current password is incorrect" });
      } else {
        setPwStatus({ kind: "success", msg: "Password updated." });
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
      }
    } catch {
      setPwStatus({ kind: "error", msg: "Something went wrong. Please try again." });
    } finally {
      setPwSaving(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await api.delete("api/settings/account");
      await authApi.logout().catch(() => {});
      router.push("/");
    } catch {
      setDeleting(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const blob = await api.get("api/settings/export").blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "skillswap-data-export.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    } finally {
      setExporting(false);
    }
  }

  // Trust score from the verifications that actually exist.
  const emailDone = !!profile?.user?.emailVerified;
  const phoneDone = !!profile?.profile?.phone;
  const idDone = !!profile?.profile?.isIdentityVerified;
  const trustScore = (emailDone ? 40 : 0) + (phoneDone ? 20 : 0) + (idDone ? 40 : 0);

  if (isLoading) {
    return (
      <div className="min-h-full bg-surface">
        <div className="flex items-center justify-center py-24">
          <div className="animate-pulse font-mono text-sm text-ink3">Loading settings…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-surface">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-6 md:py-8 lg:px-8">
        <PageHeader
          kicker="Account"
          title="Settings"
          desc="Profile, security, notifications and preferences."
        />

        <div className="grid gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="self-start md:sticky md:top-32">
            <nav className="overflow-hidden rounded-xl border border-line bg-surface">
              {TABS.map((t) => (
                <button
                  key={t.v}
                  onClick={() => setTab(t.v)}
                  className={cx(
                    "flex w-full items-center gap-2.5 border-l-2 px-3 py-2.5 text-left text-sm transition-colors",
                    tab === t.v
                      ? "border-brand-600 bg-brand-50 font-medium text-ink"
                      : "border-transparent text-ink2 hover:bg-sunken hover:text-ink"
                  )}
                >
                  <span className={tab === t.v ? "text-brand-600" : "text-ink3"}>{t.i}</span>
                  {t.l}
                </button>
              ))}
            </nav>
            <button
              onClick={handleSignOut}
              className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
            >
              <Logout size={14} /> Log out
            </button>
          </aside>

          {/* Content */}
          <div className="min-w-0">
            {tab === "profile" && (
              <SettingsCard
                title="Public profile"
                desc="This information appears on your profile and listings."
              >
                <div className="mb-6 flex items-start gap-4">
                  <Avatar src={avatarSrc} name={displayName} size="lg" />
                  <div className="flex-1">
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="h-8 rounded-lg border border-line px-3 text-sm text-ink2 transition-colors hover:bg-sunken hover:text-ink disabled:opacity-50"
                    >
                      {avatarUploading ? "Uploading…" : "Upload new photo"}
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                    <p className="mt-2 text-[11px] text-ink3">JPG or PNG · 1 MB max</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <div className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink3">
                      Full name
                    </div>
                    <input
                      className={inputCls}
                      defaultValue={displayName}
                      onChange={(e) => setNameVal(e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <div className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink3">
                      Email
                    </div>
                    <input className={inputCls} defaultValue={displayEmail} disabled />
                  </label>
                  <label className="block md:col-span-2">
                    <div className="mb-1.5 flex items-baseline justify-between">
                      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink3">
                        Bio
                      </span>
                      <span className="text-[10px] text-ink3">160 chars max</span>
                    </div>
                    <textarea
                      rows={3}
                      maxLength={160}
                      className="w-full resize-none rounded-lg border border-line2 bg-surface p-3 text-sm text-ink focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      defaultValue={profile?.profile?.bio ?? ""}
                      onChange={(e) => setBioVal(e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <div className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink3">
                      Phone
                    </div>
                    <input
                      className={inputCls}
                      placeholder="+351 …"
                      defaultValue={profile?.profile?.phone ?? ""}
                      onChange={(e) => setPhoneVal(e.target.value)}
                    />
                  </label>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2">
                  <button className="h-9 rounded-lg border border-line px-4 text-sm text-ink2 hover:bg-sunken hover:text-ink">
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="h-9 rounded-lg bg-ink px-4 text-sm font-medium text-surface transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </SettingsCard>
            )}

            {tab === "account" && (
              <SettingsCard title="Account & login" desc="How you sign in to SkillSwap.">
                <div className="mb-6 grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <div className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink3">
                      Email
                    </div>
                    <input className={inputCls} defaultValue={displayEmail} disabled />
                  </label>
                </div>

                <Divider />

                <div className="mt-4">
                  <div className="text-sm font-semibold text-ink">Change password</div>
                  <div className="mt-1 text-xs text-ink3">
                    8+ characters with an uppercase letter, a number and a symbol. Changing it
                    signs out your other devices.
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <label className="block">
                      <div className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink3">
                        Current password
                      </div>
                      <input
                        type="password"
                        className={inputCls}
                        value={currentPw}
                        onChange={(e) => setCurrentPw(e.target.value)}
                        autoComplete="current-password"
                      />
                    </label>
                    <label className="block">
                      <div className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink3">
                        New password
                      </div>
                      <input
                        type="password"
                        className={inputCls}
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        autoComplete="new-password"
                      />
                    </label>
                    <label className="block">
                      <div className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink3">
                        Confirm new password
                      </div>
                      <input
                        type="password"
                        className={inputCls}
                        value={confirmPw}
                        onChange={(e) => setConfirmPw(e.target.value)}
                        autoComplete="new-password"
                      />
                    </label>
                  </div>
                  {pwStatus && (
                    <p
                      className={cx(
                        "mt-3 rounded-lg px-3 py-2 text-[12px]",
                        pwStatus.kind === "error"
                          ? "bg-rose-50 text-rose-600"
                          : "bg-emerald-50 text-emerald-700"
                      )}
                    >
                      {pwStatus.msg}
                    </p>
                  )}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleChangePassword}
                      disabled={pwSaving || !currentPw || !newPw || !confirmPw}
                      className="h-9 rounded-lg bg-ink px-4 text-sm font-medium text-surface transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {pwSaving ? "Updating…" : "Update password"}
                    </button>
                  </div>
                </div>

                <Divider />

                <div className="mt-4 flex items-start justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50/50 p-4">
                  <div>
                    <div className="text-sm font-semibold text-rose-700">
                      Delete account permanently
                    </div>
                    <div className="mt-1 max-w-md text-xs text-ink2">
                      Removes your profile, login and notifications, and archives your listings.
                      Messages and completed exchanges stay visible to the other person as
                      &ldquo;Deleted user&rdquo;. Cannot be undone.
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteOpen(true)}
                    className="h-8 flex-shrink-0 rounded-lg border border-rose-300 px-3 text-sm text-rose-600 transition-colors hover:bg-rose-100"
                  >
                    Delete account
                  </button>
                </div>
              </SettingsCard>
            )}

            {tab === "security" && (
              <SettingsCard title="Privacy & security" desc="Control who sees what.">
                <ToggleRow
                  label="Show last name on profile"
                  desc="Off = only your first name and initial appear to other users."
                  checked={settings?.showLastName ?? true}
                  onChange={(v) => updateSettings({ showLastName: v })}
                  disabled={!settings}
                />
                <ToggleRow
                  label="Show exact location"
                  desc="When off, your listings appear roughly 0.5–1.5 km from their real spot."
                  checked={settings?.showExactLocation ?? false}
                  onChange={(v) => updateSettings({ showExactLocation: v })}
                  disabled={!settings}
                />
                <ToggleRow
                  label="Allow profile to appear in search engines"
                  desc="When off, your public profile asks search engines not to index it."
                  checked={settings?.allowSearchIndexing ?? true}
                  onChange={(v) => updateSettings({ allowSearchIndexing: v })}
                  disabled={!settings}
                />
              </SettingsCard>
            )}

            {tab === "notifications" && (
              <SettingsCard title="Notifications" desc="What we send you, where.">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink3">
                        <th className="py-2 text-left">Event</th>
                        <th className="w-20 py-2 text-center">In-app</th>
                        <th className="w-20 py-2 text-center">Email</th>
                        <th className="w-20 py-2 text-center">Push</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line text-sm">
                      {NOTIF_EVENTS.map((row) => {
                        const prefs = settings?.notificationPrefs ?? {};
                        const checked = row.types.every((t) => prefs[t] !== false);
                        return (
                          <NotifRow
                            key={row.label}
                            label={row.label}
                            desc={row.desc}
                            checked={checked}
                            onChange={(v) =>
                              updateSettings({
                                notificationPrefs: Object.fromEntries(
                                  row.types.map((t) => [t, v])
                                ),
                              })
                            }
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-[11px] text-ink3">
                  Email and push delivery aren&apos;t built yet — in-app toggles take effect
                  immediately.
                </p>
              </SettingsCard>
            )}

            {tab === "verification" && (
              <SettingsCard
                title="Verification"
                desc="Verified profiles get more swap requests."
              >
                <div className="space-y-3">
                  <VerifyRow
                    label="Email"
                    desc={displayEmail}
                    status={emailDone ? "done" : "pending"}
                  />
                  <VerifyRow
                    label="Phone number"
                    desc={profile?.profile?.phone ?? "Add one in Profile settings"}
                    status={phoneDone ? "done" : "missing"}
                  />
                  <VerifyRow
                    label="Government ID"
                    desc="Passport / Citizen card"
                    status={idDone ? "done" : "soon"}
                  />
                  <VerifyRow
                    label="Selfie liveness check"
                    desc="One-time biometric match against ID"
                    status="soon"
                  />
                  <VerifyRow
                    label="Address"
                    desc="A utility bill or bank statement (3 months)"
                    status="soon"
                  />
                </div>
                <Divider />
                <div className="flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 p-4">
                  <Shield size={18} className="mt-0.5 flex-shrink-0 text-brand-600" />
                  <div>
                    <div className="text-sm font-semibold text-ink">
                      Your trust score: {trustScore}/100
                    </div>
                    <div className="mt-0.5 text-xs text-ink2">
                      Email {emailDone ? "✓" : "·"} Phone {phoneDone ? "✓" : "·"} ID{" "}
                      {idDone ? "✓" : "·"} — ID verification is coming soon.
                    </div>
                  </div>
                </div>
              </SettingsCard>
            )}

            {tab === "deposits" && (
              <SettingsCard
                title="Deposits & wallet"
                desc="Refundable deposits held in escrow during tool exchanges."
              >
                <ComingSoon
                  icon={<Card size={20} />}
                  title="Payments & deposits"
                  desc="Connect a card to send and receive refundable deposits when you borrow or lend tools. Money never leaves escrow unless something goes wrong."
                />
              </SettingsCard>
            )}


            {tab === "connected" && (
              <SettingsCard
                title="Connected apps"
                desc="Apps that can talk to SkillSwap on your behalf."
              >
                <ComingSoon
                  icon={<Globe size={20} />}
                  title="Calendar & cloud sync"
                  desc="Sync availability with Google Calendar and let other apps post listings via the SkillSwap API."
                />
              </SettingsCard>
            )}

            {tab === "data" && (
              <SettingsCard title="Data & export" desc="Download or delete what we have.">
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-line p-3">
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-ink">Download your data</span>
                      <div className="text-xs text-ink3">
                        A JSON file with your profile, listings, messages, contracts and reviews
                        (GDPR Art. 15).
                      </div>
                    </div>
                    <button
                      onClick={handleExport}
                      disabled={exporting}
                      className="ml-3 h-8 flex-shrink-0 rounded-lg border border-line px-3 text-sm text-ink2 hover:bg-sunken hover:text-ink disabled:opacity-50"
                    >
                      {exporting ? "Preparing…" : "Download"}
                    </button>
                  </div>
                  {(
                    [
                      {
                        t: "Marketing preferences",
                        d: "Manage cookie preferences and ad personalisation.",
                      },
                      { t: "API tokens", d: "Programmatic access for connected apps." },
                    ] as const
                  ).map((row) => (
                    <div
                      key={row.t}
                      className="flex items-center justify-between rounded-lg border border-line p-3 opacity-70"
                    >
                      <div className="min-w-0">
                        <span className="text-sm font-medium text-ink">{row.t}</span>
                        <div className="text-xs text-ink3">{row.d}</div>
                      </div>
                      <span className="ml-3 flex-shrink-0 rounded-full border border-line bg-sunken px-2 py-0.5 text-[10px] text-ink3">
                        Soon
                      </span>
                    </div>
                  ))}
                </div>
              </SettingsCard>
            )}
          </div>
        </div>
      </div>

      {/* Delete account confirmation */}
      {deleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !deleting) setDeleteOpen(false);
          }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm rounded-2xl border border-line bg-surface shadow-2xl">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-[14px] font-semibold text-rose-700">Delete your account?</h2>
              <p className="mt-0.5 text-[12px] text-ink3">
                Your login, profile and notifications are removed and your listings are archived.
                This cannot be undone.
              </p>
            </div>
            <div className="px-5 py-4">
              <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-ink3">
                Type <span className="font-mono text-rose-600">DELETE</span> to confirm
              </div>
              <input
                className={inputCls}
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
              />
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3">
              <button
                onClick={() => setDeleteOpen(false)}
                disabled={deleting}
                className="inline-flex h-8 items-center rounded-lg border border-line bg-surface px-4 text-[12px] font-medium text-ink hover:bg-sunken disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirm !== "DELETE"}
                className="inline-flex h-8 items-center rounded-lg bg-rose-600 px-4 text-[12px] font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete forever"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AppFooter />
    </div>
  );
}
