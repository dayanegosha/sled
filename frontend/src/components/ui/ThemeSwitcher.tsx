"use client";

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { applyTheme, getStoredTheme, type AppTheme } from '@/components/ui/ThemeProvider';
import { useClientValue } from '@/hooks/useClientValue';

const THEMES: { id: AppTheme; key: string }[] = [
  { id: 'dark-blue', key: 'theme.darkBlue' },
  { id: 'dark-red', key: 'theme.darkRed' },
  { id: 'light-cyan', key: 'theme.lightCyan' },
  { id: 'light-pink', key: 'theme.lightPink' },
];

export default function ThemeSwitcher() {
  const { t } = useTranslation();
  const storedTheme = useClientValue<AppTheme>(getStoredTheme, 'dark-blue');
  const [picked, setPicked] = useState<AppTheme | null>(null);
  const current = picked ?? storedTheme;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="mb-2 text-xs text-white/50">{t('settings.theme')}</p>
      <div className="grid grid-cols-2 gap-2">
        {THEMES.map(({ id, key }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              applyTheme(id);
              setPicked(id);
            }}
            className={`rounded-lg border px-2 py-2 text-xs transition ${
              current === id
                ? 'border-[var(--rt-accent)]/60 bg-[var(--rt-accent)]/15 text-[var(--rt-text)]'
                : 'border-white/10 bg-black/20 text-white/70 hover:bg-white/10'
            }`}
          >
            {t(key)}
          </button>
        ))}
      </div>
    </div>
  );
}
