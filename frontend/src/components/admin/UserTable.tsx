"use client";

import { useCallback, useEffect, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { api } from '@/services/api';

type User = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  total_distance: number;
  is_admin: boolean;
  is_banned: boolean;
  ban_reason: string | null;
  created_at: string;
};

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [banModal, setBanModal] = useState<{ id: string; name: string } | null>(null);
  const [banReason, setBanReason] = useState('');

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set('search', search);
    api
      .get(`/admin/users?${params}`)
      .then((r) => {
        const d = r.data?.data ?? r.data;
        setUsers(d.items ?? []);
        setTotal(d.total ?? 0);
      })
      .catch(() => {});
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleBan = async () => {
    if (!banModal) return;
    try {
      await api.patch(`/admin/users/${banModal.id}/ban`, { reason: banReason || 'Нарушение правил' });
      setBanModal(null);
      setBanReason('');
      load();
    } catch { /* */ }
  };

  const handleUnban = async (id: string) => {
    try {
      await api.patch(`/admin/users/${id}/unban`);
      load();
    } catch { /* */ }
  };

  return (
    <>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Поиск по имени..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full rounded-xl border border-white/12 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-blue-500/50 sm:max-w-xs"
        />
        <p className="text-xs text-white/40">Всего: {total}</p>
      </div>

      <GlassCard>
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="text-xs text-white/50">
              <tr>
                <th className="pb-3">Пользователь</th>
                <th className="pb-3">Дистанция</th>
                <th className="pb-3">Статус</th>
                <th className="pb-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="text-white/85">
              {users.map((u) => (
                <tr key={u.id} className="border-t border-white/8">
                  <td className="py-3">
                    <p className="font-medium">{u.display_name}</p>
                    <p className="text-xs text-white/40">@{u.username}</p>
                  </td>
                  <td className="py-3">{(Number(u.total_distance) / 1000).toFixed(1)} км</td>
                  <td className="py-3">
                    {u.is_banned ? (
                      <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">забанен</span>
                    ) : u.is_admin ? (
                      <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">админ</span>
                    ) : (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">активен</span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    {!u.is_admin && (
                      u.is_banned ? (
                        <button
                          onClick={() => void handleUnban(u.id)}
                          className="rounded-lg bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300 hover:bg-emerald-500/30"
                        >
                          Разбанить
                        </button>
                      ) : (
                        <button
                          onClick={() => setBanModal({ id: u.id, name: u.display_name })}
                          className="rounded-lg bg-red-500/20 px-3 py-1 text-xs text-red-300 hover:bg-red-500/30"
                        >
                          Забанить
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-white/40">Нет пользователей</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {total > 50 && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg bg-white/5 px-3 py-1 text-xs disabled:opacity-30"
            >
              Назад
            </button>
            <span className="text-xs text-white/50">Стр. {page}</span>
            <button
              disabled={page * 50 >= total}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg bg-white/5 px-3 py-1 text-xs disabled:opacity-30"
            >
              Далее
            </button>
          </div>
        )}
      </GlassCard>

      {banModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/12 bg-[#13151f] p-5">
            <h3 className="text-base font-semibold">Забанить {banModal.name}?</h3>
            <textarea
              placeholder="Причина бана..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className="mt-3 w-full resize-none rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              rows={2}
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => { setBanModal(null); setBanReason(''); }}
                className="flex-1 rounded-xl border border-white/12 bg-white/5 py-2 text-sm"
              >
                Отмена
              </button>
              <button
                onClick={() => void handleBan()}
                className="flex-1 rounded-xl bg-red-500/80 py-2 text-sm font-medium hover:bg-red-500"
              >
                Забанить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
