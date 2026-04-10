"use client";

import { useEffect, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { api } from '@/services/api';

type DayData = {
  day: string;
  newUsers: number;
  activeUsers: number;
  trackPoints: number;
};

export default function AnalyticsChart() {
  const [data, setData] = useState<DayData[]>([]);

  useEffect(() => {
    api
      .get('/admin/analytics')
      .then((r) => {
        const d = r.data?.data ?? r.data;
        setData(d.daily ?? []);
      })
      .catch(() => {});
  }, []);

  const maxActive = Math.max(...data.map((d) => d.activeUsers), 1);
  const maxNew = Math.max(...data.map((d) => d.newUsers), 1);

  const formatDay = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-4">
      <GlassCard>
        <p className="mb-1 text-sm font-medium">Активные пользователи (14 дней)</p>
        <p className="mb-3 text-xs text-white/40">Кол-во уникальных пользователей в день</p>
        <div className="flex h-44 items-end gap-1.5 overflow-x-auto">
          {data.map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[9px] tabular-nums text-white/50">{d.activeUsers}</span>
              <div
                className="w-full min-w-[18px] rounded-t-md bg-blue-500/60"
                style={{ height: `${Math.max((d.activeUsers / maxActive) * 100, 2)}%` }}
              />
              <span className="text-[8px] text-white/30">{formatDay(d.day)}</span>
            </div>
          ))}
          {data.length === 0 && (
            <p className="w-full py-12 text-center text-xs text-white/30">Нет данных</p>
          )}
        </div>
      </GlassCard>

      <GlassCard>
        <p className="mb-1 text-sm font-medium">Новые регистрации (14 дней)</p>
        <div className="flex h-36 items-end gap-1.5 overflow-x-auto">
          {data.map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[9px] tabular-nums text-white/50">{d.newUsers}</span>
              <div
                className="w-full min-w-[18px] rounded-t-md bg-emerald-500/60"
                style={{ height: `${Math.max((d.newUsers / maxNew) * 100, 2)}%` }}
              />
              <span className="text-[8px] text-white/30">{formatDay(d.day)}</span>
            </div>
          ))}
          {data.length === 0 && (
            <p className="w-full py-12 text-center text-xs text-white/30">Нет данных</p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
