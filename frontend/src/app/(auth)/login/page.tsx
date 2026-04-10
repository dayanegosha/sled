"use client";

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import VkOneTapButton from '@/components/auth/VkOneTapButton';
import { api } from '@/services/api';
import { plural } from '@/lib/plural';

type PublicStats = { explorers: number; totalKm: number; regions: number };

function LoginContent() {
  const params = useSearchParams();
  const error = params.get('error');
  const next = params.get('next') ?? '';
  const { t } = useTranslation();
  const [stats, setStats] = useState<PublicStats>({ explorers: 0, totalKm: 0, regions: 0 });

  const nextPath = useMemo(() => (next && next.startsWith('/') ? next : '/map'), [next]);

  useEffect(() => {
    api
      .get('/auth/public-stats')
      .then((r) => {
        const data = r.data?.data ?? r.data;
        setStats({
          explorers: Number(data?.explorers ?? 0),
          totalKm: Number(data?.totalKm ?? 0),
          regions: Number(data?.regions ?? 0),
        });
      })
      .catch(() => undefined);
  }, []);

  return (
    <main className="relative mx-auto flex h-dvh w-full max-w-md flex-col justify-center overflow-hidden px-5">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-16 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />
        <div className="absolute -right-20 top-24 h-64 w-64 rounded-full bg-violet-500/25 blur-3xl" />
        <div className="absolute left-8 top-1/2 h-52 w-52 rounded-full bg-cyan-400/20 blur-3xl" />
      </div>

      <div className="relative w-full rounded-[28px] border border-white/12 bg-[#111420]/75 p-7 shadow-[0_32px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
        <div className="absolute right-5 top-5 z-10">
          <LanguageSwitcher compact title={false} />
        </div>

        <div className="flex items-center gap-4 pr-20">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-blue-500/25 to-violet-500/25 p-2.5 shadow-[0_12px_40px_rgba(61,127,255,0.3)]">
            <Image
              src="/sled_png.png"
              alt="След"
              width={80}
              height={80}
              className="h-full w-full object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]"
              priority
            />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">{t('auth.appName')}</h1>
            <p className="mt-1 text-sm text-white/55">{t('auth.tagline')}</p>
          </div>
        </div>

        <div className="mx-auto mt-6 grid max-w-xs grid-cols-3 gap-2">
          {[
            { value: stats.explorers, key: 'explorers' },
            { value: stats.totalKm, key: 'km' },
            { value: stats.regions, key: 'regions' },
          ].map((s) => (
            <div key={s.key} className="flex flex-col rounded-xl border border-white/10 bg-white/5 px-2 py-2.5 text-center">
              <p className="flex-1 text-lg font-bold tabular-nums">{s.value.toLocaleString('ru-RU')}</p>
              <p className="mt-auto text-[10px] uppercase leading-tight tracking-[0.06em] text-white/50">
                {plural(s.value, [
                  t(`auth.stats.${s.key}_one`),
                  t(`auth.stats.${s.key}_few`),
                  t(`auth.stats.${s.key}_many`),
                ])}
              </p>
            </div>
          ))}
        </div>

        {error ? <p className="mt-4 rounded-xl border border-red-400/20 bg-red-500/15 px-3 py-2 text-center text-sm text-red-200">{t('auth.error')}: {error}</p> : null}

        <div className="mt-7">
          <p className="mb-2.5 text-center text-xs text-white/40">{t('auth.title')}</p>
          <VkOneTapButton nextPath={nextPath} onError={() => {}} />
        </div>

        <p className="mt-5 text-center text-[11px] leading-relaxed text-white/35">
          {t('auth.terms.prefix')}{' '}
          <a href="/legal/terms" className="text-blue-300/70 hover:text-blue-200">{t('auth.terms.termsLink')}</a>{' '}
          {t('auth.terms.and')}{' '}
          <a href="/legal/privacy" className="text-blue-300/70 hover:text-blue-200">{t('auth.terms.privacyLink')}</a>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="grid min-h-dvh place-items-center text-sm text-white/60">Loading...</main>}>
      <LoginContent />
    </Suspense>
  );
}
