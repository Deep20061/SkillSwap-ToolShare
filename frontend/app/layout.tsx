import type { Metadata } from "next";
import { Libre_Baskerville, DM_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/features/auth/AuthProvider";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-libre-baskerville",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: "SkillSwap & ToolShare — Exchange skills. Share tools. No money needed.",
  description:
    "A community platform where your talent and resources are the currency. Swap skills peer-to-peer, rent or exchange physical tools, and build trust through verified profiles and digital contracts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // suppressHydrationWarning: browser extensions (e.g. Tag Assistant) inject
  // attributes into <html> before React hydrates; only this element is affected.
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${libreBaskerville.variable} ${dmMono.variable} flex h-dvh flex-col overflow-hidden bg-surface text-ink`}
      >
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
