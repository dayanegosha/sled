"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, MapPinned, MessagesSquare, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ITEMS = [
  { href: '/map', key: 'nav.map', icon: MapPinned },
  { href: '/heatmap', key: 'nav.heatmap', icon: Flame },
  { href: '/community', key: 'nav.community', icon: MessagesSquare },
  { href: '/profile', key: 'nav.profile', icon: UserRound },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav className="pointer-events-none fixed bottom-0 left-0 right-0 z-[100] pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto mx-auto w-[min(560px,calc(100%-1rem))] rounded-2xl border border-white/12 p-1.5 shadow-2xl backdrop-blur-md mb-1 bg-[var(--rt-nav-bg)]">
        <ul className="grid grid-cols-4 gap-1">
          {ITEMS.map(({ href, key, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[11px] transition ${
                    active ? 'bg-blue-500/20 text-blue-300' : 'text-white/50 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{t(key)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
