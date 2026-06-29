"use client";

import { useState } from 'react';
import { useClientValue } from '@/hooks/useClientValue';

const LS_KEY = 'install_banner_dismissed';

function isStandalone() {
  if (typeof window === 'undefined') return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    nav.standalone === true
  );
}

function isIos() {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export default function InstallBanner() {
  const eligible = useClientValue(
    () => !isStandalone() && !localStorage.getItem(LS_KEY),
    false,
  );
  const [dismissed, setDismissed] = useState(false);

  if (!eligible || dismissed) return null;

  const dismiss = () => {
    localStorage.setItem(LS_KEY, '1');
    setDismissed(true);
  };

  const ios = isIos();

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9998] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-sm rounded-2xl border border-white/12 bg-[#13151f]/95 p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold">Установите След</p>
            {ios ? (
              <p className="mt-1 text-xs leading-relaxed text-white/60">
                Нажмите{' '}
                <span className="inline-block rounded bg-white/10 px-1.5 py-0.5 text-white/80">
                  Поделиться
                </span>{' '}
                внизу экрана, затем{' '}
                <span className="inline-block rounded bg-white/10 px-1.5 py-0.5 text-white/80">
                  На экран «Домой»
                </span>
              </p>
            ) : (
              <p className="mt-1 text-xs leading-relaxed text-white/60">
                Нажмите{' '}
                <span className="inline-block rounded bg-white/10 px-1.5 py-0.5 text-white/80">
                  ⋮
                </span>{' '}
                в браузере, затем{' '}
                <span className="inline-block rounded bg-white/10 px-1.5 py-0.5 text-white/80">
                  Установить приложение
                </span>
              </p>
            )}
          </div>
          <button
            onClick={dismiss}
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
