"use client";

import { useEffect, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { api } from '@/services/api';

type SuspiciousUser = {
  id: string;
  username: string;
  display_name: string;
  flagged_points: string;
};

type Post = {
  id: string;
  content: string;
  username: string;
  display_name: string;
  is_hidden: boolean;
  created_at: string;
};

type ReportedPost = {
  report_id: string;
  reason: string | null;
  created_at: string;
  post_id: string;
  content: string;
  username: string;
  display_name: string;
  reporter_username: string;
};

export default function ModerationQueue() {
  const [suspicious, setSuspicious] = useState<SuspiciousUser[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reports, setReports] = useState<ReportedPost[]>([]);

  useEffect(() => {
    api.get('/admin/suspicious')
      .then((r) => setSuspicious((r.data?.data ?? r.data).items ?? []))
      .catch(() => {});
    api.get('/admin/posts')
      .then((r) => setPosts((r.data?.data ?? r.data).items ?? []))
      .catch(() => {});
    api.get('/admin/reports')
      .then((r) => setReports((r.data?.data ?? r.data).items ?? []))
      .catch(() => {});
  }, []);

  const hidePost = async (id: string) => {
    try {
      await api.patch(`/admin/posts/${id}/hide`);
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, is_hidden: true } : p)));
      setReports((prev) => prev.filter((r) => r.post_id !== id));
    } catch { /* */ }
  };

  return (
    <div className="space-y-4">
      <GlassCard>
        <h3 className="mb-3 text-sm font-semibold text-rose-300">Жалобы на посты</h3>
        {reports.length === 0 ? (
          <p className="text-xs text-white/40">Нет открытых жалоб</p>
        ) : (
          <ul className="space-y-2">
            {reports.map((r) => (
              <li
                key={r.report_id}
                className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-white/40">
                      @{r.username} · жалоба от @{r.reporter_username} ·{' '}
                      {new Date(r.created_at).toLocaleString('ru-RU')}
                    </p>
                    {r.reason ? (
                      <p className="mt-1 text-xs text-rose-200/80">Причина: {r.reason}</p>
                    ) : null}
                    <p className="mt-1 line-clamp-3 text-white/80">{r.content}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void hidePost(r.post_id)}
                    className="shrink-0 rounded-lg bg-red-500/25 px-2 py-1 text-[10px] text-red-200 hover:bg-red-500/35"
                  >
                    Скрыть пост
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      <GlassCard>
        <h3 className="mb-3 text-sm font-semibold text-amber-300">
          Подозрительные пользователи (GPS-спуфинг)
        </h3>
        {suspicious.length === 0 ? (
          <p className="text-xs text-white/40">Подозрительных пользователей не обнаружено</p>
        ) : (
          <ul className="space-y-2">
            {suspicious.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{u.display_name}</p>
                  <p className="text-xs text-white/40">@{u.username}</p>
                </div>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
                  {u.flagged_points} подозр. точек
                </span>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      <GlassCard>
        <h3 className="mb-3 text-sm font-semibold">Последние посты</h3>
        {posts.length === 0 ? (
          <p className="text-xs text-white/40">Нет постов</p>
        ) : (
          <ul className="space-y-2">
            {posts.slice(0, 20).map((p) => (
              <li
                key={p.id}
                className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-white/40">
                      @{p.username} &middot;{' '}
                      {new Date(p.created_at).toLocaleDateString('ru-RU')}
                    </p>
                    <p className="mt-1 line-clamp-2 text-white/80">{p.content}</p>
                  </div>
                  {p.is_hidden ? (
                    <span className="shrink-0 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] text-red-300">
                      скрыт
                    </span>
                  ) : (
                    <button
                      onClick={() => void hidePost(p.id)}
                      className="shrink-0 rounded-lg bg-red-500/20 px-2 py-1 text-[10px] text-red-300 hover:bg-red-500/30"
                    >
                      Скрыть
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
