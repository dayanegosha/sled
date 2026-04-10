"use client";

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LANGS = [
  { id: 'ru', label: 'Русский', short: 'RU' },
  { id: 'en', label: 'English', short: 'EN' },
  { id: 'zh', label: '中文', short: 'ZH' },
] as const;

type LanguageSwitcherProps = {
  compact?: boolean;
  title?: boolean;
};

export default function LanguageSwitcher({ compact = false, title = true }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGS.find(
    (l) => i18n.resolvedLanguage === l.id || i18n.language.startsWith(l.id),
  ) ?? LANGS[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={`relative ${compact ? '' : 'space-y-2'}`}>
      {title && !compact ? (
        <p className="text-xs uppercase tracking-[0.14em] text-white/45">{t('settings.language')}</p>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white/70 transition hover:bg-white/10 ${
          compact ? 'px-2.5 py-1.5' : 'w-full justify-center px-4 py-2.5'
        }`}
      >
        <span className="text-base leading-none">🌐</span>
        {compact ? current.short : current.label}
        <svg className={`h-3 w-3 shrink-0 text-white/40 transition ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className={`absolute z-50 mt-1 overflow-hidden rounded-xl border border-white/10 bg-[#1a1d2e] shadow-2xl ${
          compact ? 'right-0 min-w-[140px]' : 'left-0 right-0'
        }`}>
          {LANGS.map((lang) => {
            const active = current.id === lang.id;
            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => {
                  void i18n.changeLanguage(lang.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition ${
                  active
                    ? 'bg-blue-500/15 text-blue-200'
                    : 'text-white/70 hover:bg-white/8'
                }`}
              >
                <span className="font-medium">{lang.short}</span>
                <span className="text-white/50">{lang.label}</span>
                {active && (
                  <svg className="ml-auto h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
