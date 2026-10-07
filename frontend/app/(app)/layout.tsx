import { AppNavForLayout } from "@/components/AppNavForLayout";
import { SSEProvider } from "@/components/SSEProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SSEProvider>
      <AppNavForLayout />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </SSEProvider>
  );
}
