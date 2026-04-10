"use client";

import { useEffect, useState } from 'react';
import { api } from '@/services/api';

export default function ExplorationRing() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    api
      .get('/tracks/stats')
      .then((r) => {
        const d = r.data?.data ?? r.data;
        const km = Number(d?.totalDistance ?? 0) / 1000;
        const approxPct = Math.min((km / 17100000) * 100, 100);
        setPct(Math.round(approxPct * 100) / 100);
      })
      .catch(() => {});
  }, []);

  const display = pct < 0.01 ? '0%' : pct < 1 ? `${pct.toFixed(2)}%` : `${pct.toFixed(1)}%`;

  return (
    <div className="relative grid h-20 w-20 shrink-0 place-items-center rounded-full border border-blue-400/30 bg-gradient-to-br from-blue-500/20 to-cyan-400/10">
      <div className="grid h-14 w-14 place-items-center rounded-full border border-white/20 bg-[#0d0f14]">
        <div className="text-center">
          <p className="text-sm font-semibold tabular-nums">{display}</p>
          <p className="text-[8px] uppercase tracking-[0.08em] text-white/40">России</p>
        </div>
      </div>
    </div>
  );
}
