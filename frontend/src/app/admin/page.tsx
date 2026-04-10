"use client";

import { useEffect, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { Activity, FileText, MapPinned, Route, Users } from 'lucide-react';
import { api } from '@/services/api';

type Stats = {
  totalUsers: number;
  activeToday: number;
  totalDistanceKm: number;
  totalTrackPoints: number;
  totalPosts: number;
};

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number }>;
}) {
  return (
    <GlassCard>
      <div className="inline-flex rounded-lg bg-blue-500/20 p-2 text-blue-300">
        <Icon size={16} />
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-sm text-white/55">{label}</p>
    </GlassCard>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api
      .get('/admin/stats')
      .then((r) => setStats(r.data?.data ?? r.data))
      .catch(() => {});
  }, []);

  const fmt = (n: number) => n.toLocaleString('ru-RU');

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-white/40">Панель управления</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Dashboard</h2>
      </header>
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Stat label="Пользователей" value={stats ? fmt(stats.totalUsers) : '—'} icon={Users} />
        <Stat label="Активных сегодня" value={stats ? fmt(stats.activeToday) : '—'} icon={Activity} />
        <Stat label="Дистанция (км)" value={stats ? fmt(stats.totalDistanceKm) : '—'} icon={Route} />
        <Stat label="GPS-точек" value={stats ? fmt(stats.totalTrackPoints) : '—'} icon={MapPinned} />
        <Stat label="Постов" value={stats ? fmt(stats.totalPosts) : '—'} icon={FileText} />
      </section>
    </div>
  );
}
