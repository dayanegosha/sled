"use client";

import { useEffect } from 'react';

export type AppTheme = 'dark-blue' | 'dark-red' | 'light-cyan' | 'light-pink';

const LS_KEY = 'sled_theme';

export function getStoredTheme(): AppTheme {
  if (typeof window === 'undefined') return 'dark-blue';
  const v = localStorage.getItem(LS_KEY) as AppTheme | null;
  if (v === 'dark-red' || v === 'light-cyan' || v === 'light-pink' || v === 'dark-blue') return v;
  return 'dark-blue';
}

export function applyTheme(theme: AppTheme) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(LS_KEY, theme);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyTheme(getStoredTheme());
  }, []);
  return <>{children}</>;
}
