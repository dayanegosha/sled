"use client";

import { useEffect, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { Flame, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '@/services/api';

const BANNER_KEY = 'sled_heatmap_intro_dismissed';

type TopItem = { name: string; users: number; score: number };

export default function HeatmapPage() {
  const { t, i18n } = useTranslation();
  const [banner, setBanner] = useState(false);
  const [items, setItems] = useState<TopItem[]>([]);

  const lang =
    i18n.language?.startsWith('en') ? 'en' : i18n.language?.startsWith('zh') ? 'zh' : 'ru';

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem(BANNER_KEY)) {
      setBanner(true);
    }
  }, []);

  useEffect(() => {
    api
      .get(`/heatmap/top-regions?lang=${lang}`)
      .then((r) => {
        const d = (r.data as { data?: { items?: TopItem[] } })?.data ?? r.data;
        setItems(d?.items ?? []);
      })
      .catch(() => setItems([]));
  }, [lang]);

  const dismissBanner = () => {
    localStorage.setItem(BANNER_KEY, '1');
    setBanner(false);
  };

  return (
    <div className="space-y-4">
      {banner ? (
        <GlassCard>
          <div className="relative">
          <button
            type="button"
            onClick={dismissBanner}
            className="absolute right-0 top-0 rounded-lg p-1 text-white/45 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
          <div className="flex items-start gap-3 pr-8">
            <div className="rounded-xl bg-orange-500/20 p-2 text-orange-300">
              <Flame size={18} />
            </div>
            <p className="text-sm leading-relaxed text-white/75">{t('heatmap.banner')}</p>
          </div>
          </div>
        </GlassCard>
      ) : null}

      <GlassCard>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-white/40">{t('heatmap.header')}</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">{t('heatmap.title')}</h2>
            <p className="mt-2 text-sm text-white/65">{t('heatmap.subtitle')}</p>
          </div>
          <div className="rounded-xl bg-orange-500/20 p-2 text-orange-300">
            <Flame size={18} />
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <p className="mb-3 text-sm font-medium">{t('heatmap.topRegions')}</p>
        {items.length === 0 ? (
          <p className="text-xs text-white/40">{t('heatmap.empty')}</p>
        ) : (
          <ul className="space-y-2">
            {items.map((spot) => (
              <li key={spot.name} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span>{spot.name}</span>
                  <span className="text-right text-xs text-white/55">
                    {spot.users} {t('heatmap.users')}
                    {spot.score > 0 ? (
                      <span className="ml-2 text-white/40">
                        · {Math.round(spot.score)} {t('heatmap.explored')}
                      </span>
                    ) : null}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      <GlassCard>
        <h3 className="mb-2 text-sm font-medium text-white/80">{t('heatmap.apiTitle')}</h3>
        <p className="text-xs leading-relaxed text-white/55">{t('heatmap.apiBody')}</p>
      </GlassCard>
    </div>
  );
}
