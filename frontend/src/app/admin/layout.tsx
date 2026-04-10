"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, LayoutDashboard, LogOut, Map, Menu, ShieldAlert, Users } from 'lucide-react';
import { api } from '@/services/api';
import AdminGate from '@/components/auth/AdminGate';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Пользователи', icon: Users },
  { href: '/admin/analytics', label: 'Аналитика', icon: BarChart3 },
  { href: '/admin/moderation', label: 'Модерация', icon: ShieldAlert },
  { href: '/admin/heatmap', label: 'Карта', icon: Map },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      <div className="border-b border-white/8 px-5 py-4 text-lg font-bold tracking-tight">
        След{' '}
        <span className="ml-1 rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-normal text-red-300">
          Admin
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active
                  ? 'bg-blue-600/20 font-medium text-blue-300'
                  : 'text-white/55 hover:bg-white/6 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/8 px-3 py-3">
        <button
          onClick={() => {
            void api.post('/auth/logout').finally(() => router.push('/szh-admin'));
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/40 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={16} />
          Выйти
        </button>
      </div>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AdminGate>
      <div className="flex h-dvh overflow-hidden bg-[#0d0f14] text-white">
        <aside className="hidden w-60 flex-col border-r border-white/8 bg-[#13151f] md:flex">
          <SidebarContent />
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="relative z-10 flex w-64 flex-col bg-[#13151f]">
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        <div className="flex flex-1 flex-col overflow-auto">
          <header className="flex items-center border-b border-white/8 px-4 py-3 md:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-white/60 hover:bg-white/8"
            >
              <Menu size={20} />
            </button>
            <span className="ml-3 text-sm font-semibold">След Admin</span>
          </header>
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </AdminGate>
  );
}
