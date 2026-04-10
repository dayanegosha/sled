"use client";

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GlassCard from '@/components/ui/GlassCard';
import { api } from '@/services/api';
import TodayExplorationModal from './TodayExplorationModal';

export default function DistanceCounter({ fullScreen }: { fullScreen?: boolean }) {
  const { t } = useTranslation();
  const [km, setKm] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api
      .get('/tracks/today')
      .then((r) => {
        const d = (r.data as { data?: { todayKm?: number } })?.data ?? r.data;
        setKm(Number(d?.todayKm ?? 0));
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <div
        className={`absolute left-3 top-3 z-20 w-44 ${fullScreen ? '' : 'pointer-events-none'}`}
      >
        <button
          type="button"
          onClick={() => fullScreen && setOpen(true)}
          className={`w-full text-left ${fullScreen ? 'pointer-events-auto cursor-pointer' : ''}`}
        >
          <GlassCard>
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">
              {t('map.distanceToday')}
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums">
              {km.toFixed(1)} {t('map.km')}
            </p>
            {fullScreen ? (
              <p className="mt-1 text-[10px] text-white/35">{t('map.tapForDetails')}</p>
            ) : null}
          </GlassCard>
        </button>
      </div>
      <TodayExplorationModal open={open} onClose={() => setOpen(false)} km={km} />
    </>
  );
}
