import { AppFooter } from "@/components/AppFooter";

export function ProfilePageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-surface">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-6 md:py-8 lg:px-8">
        {children}
      </div>
      <AppFooter />
    </div>
  );
}
