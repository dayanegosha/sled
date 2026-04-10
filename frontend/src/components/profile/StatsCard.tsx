"use client";

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GlassCard from '@/components/ui/GlassCard';
import { api } from '@/services/api';
import { plural } from '@/lib/plural';

type TrackStats = {
  totalDistance: number;
  regionsVisited: number;
  trackPoints: number;
};

export default function StatsCard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<TrackStats | null>(null);

  useEffect(() => {
    api
      .get('/tracks/stats')
      .then((r) => setStats(r.data?.data ?? r.data))
      .catch(() => {});
  }, []);

  const kmVal = stats ? Number((stats.totalDistance / 1000).toFixed(1)) : 0;
  const kmDisplay = stats ? kmVal.toLocaleString('ru-RU') : '—';
  const regionsVal = stats?.regionsVisited ?? 0;
  const regionsDisplay = stats ? String(regionsVal) : '—';
  const pointsVal = stats?.trackPoints ?? 0;
  const pointsDisplay = stats ? pointsVal.toLocaleString('ru-RU') : '—';

  return (
    <GlassCard>
      <h3 className="text-base font-semibold">{t('profile.stats')}</h3>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
          <p className="text-lg font-bold tabular-nums">{kmDisplay}</p>
          <p className="mt-0.5 text-[10px] uppercase text-white/40">
            {plural(Math.floor(kmVal), [t('profile.km_one'), t('profile.km_few'), t('profile.km_many')])}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
          <p className="text-lg font-bold tabular-nums">{regionsDisplay}</p>
          <p className="mt-0.5 text-[10px] uppercase text-white/40">
            {plural(regionsVal, [t('profile.regions_one'), t('profile.regions_few'), t('profile.regions_many')])}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
          <p className="text-lg font-bold tabular-nums">{pointsDisplay}</p>
          <p className="mt-0.5 text-[10px] uppercase text-white/40">
            {plural(pointsVal, [t('profile.points_one'), t('profile.points_few'), t('profile.points_many')])}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
