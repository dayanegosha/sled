"use client";

import { usePathname } from 'next/navigation';
import AuthGate from '@/components/auth/AuthGate';
import BottomNav from '@/components/ui/BottomNav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMap = pathname === '/map';

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[var(--rt-bg)]">
      <main
        className={
          isMap
            ? 'relative min-h-0 flex-1 overflow-hidden p-0'
            : 'mx-auto min-h-0 w-full max-w-3xl flex-1 overflow-y-auto px-4 py-4 pb-28'
        }
      >
        <AuthGate>{children}</AuthGate>
      </main>
      <BottomNav />
    </div>
  );
}
