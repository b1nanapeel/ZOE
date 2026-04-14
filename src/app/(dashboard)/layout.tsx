import { BottomNav } from "@/components/shared/BottomNav";
import { ToastProvider } from "@/components/ui/toast";
import { PWARegister } from "@/components/shared/PWARegister";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <main className="flex-1 mx-auto w-full max-w-2xl px-4 pb-24 pt-6">
          {children}
        </main>
        <BottomNav />
      </div>
      <PWARegister />
    </ToastProvider>
  );
}
