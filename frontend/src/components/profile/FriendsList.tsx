"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { friendsService } from '@/services/friends.service';

type Friend = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  total_distance: number;
  status?: string;
};

export default function FriendsList() {
  const { t } = useTranslation();
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<Friend[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Friend[]>([]);
  const [importing, setImporting] = useState(false);
  const [tab, setTab] = useState<'friends' | 'requests'>('friends');

  const load = useCallback(() => {
    friendsService.list().then((d) => setFriends(d.items ?? [])).catch(() => {});
    friendsService.requests().then((d) => setRequests(d.items ?? [])).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSearch = () => {
    if (search.trim().length < 2) return;
    friendsService.search(search.trim()).then((d) => setResults(d.items ?? [])).catch(() => {});
  };

  const handleSend = async (id: string) => {
    try {
      await friendsService.send(id);
      setResults((prev) => prev.filter((r) => r.id !== id));
    } catch { /* */ }
  };

  const handleRespond = async (id: string, action: 'accept' | 'reject') => {
    try {
      await friendsService.respond(id, action);
      load();
    } catch { /* */ }
  };

  const handleRemove = async (id: string) => {
    try {
      await friendsService.remove(id);
      load();
    } catch { /* */ }
  };

  const handleImportVk = async () => {
    setImporting(true);
    try {
      await friendsService.importVk();
      load();
    } catch { /* */ }
    setImporting(false);
  };

  return (
    <>
      <GlassCard>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t('friends.title')}</h3>
          <div className="flex gap-2">
            {requests.length > 0 && (
              <button
                onClick={() => setTab(tab === 'requests' ? 'friends' : 'requests')}
                className="relative rounded-lg bg-blue-500/20 px-2.5 py-1 text-xs text-blue-300"
              >
                {t('friends.requests')}
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {requests.length}
                </span>
              </button>
            )}
            <button
              onClick={() => setAddOpen(true)}
              className="rounded-lg bg-blue-500/20 px-2.5 py-1 text-xs text-blue-300"
            >
              {t('friends.add')}
            </button>
          </div>
        </div>

        {tab === 'requests' && requests.length > 0 && (
          <ul className="mt-3 space-y-2">
            {requests.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.display_name}</p>
                  <p className="text-xs text-white/40">@{r.username}</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => void handleRespond(r.id, 'accept')}
                    className="rounded-lg bg-emerald-500/20 px-2 py-1 text-xs text-emerald-300"
                  >
                    {t('friends.accept')}
                  </button>
                  <button
                    onClick={() => void handleRespond(r.id, 'reject')}
                    className="rounded-lg bg-red-500/20 px-2 py-1 text-xs text-red-300"
                  >
                    {t('friends.reject')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {tab === 'friends' && (
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            {friends.length === 0 ? (
              <p className="py-4 text-center text-xs text-white/30">{t('friends.noFriends')}</p>
            ) : (
              friends.map((friend) => (
                <li
                  key={friend.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2"
                >
                  <button
                    onClick={() => router.push(`/profile/${friend.id}`)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate font-medium">{friend.display_name}</p>
                    <p className="text-xs text-white/40">
                      {(Number(friend.total_distance) / 1000).toFixed(1)} км
                    </p>
                  </button>
                  <button
                    onClick={() => void handleRemove(friend.id)}
                    className="shrink-0 rounded-lg bg-white/5 px-2 py-1 text-xs text-white/40 hover:text-red-300"
                  >
                    {t('friends.remove')}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </GlassCard>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={t('friends.add')}
        closeOnBackdrop={false}
      >
        <div className="space-y-3">
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => void handleImportVk()}
            disabled={importing}
          >
            {importing ? '...' : t('friends.importVk')}
          </Button>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder={t('friends.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              className="flex-1 rounded-xl border border-white/12 bg-white/5 px-3 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-blue-500/50"
            />
            <Button onClick={handleSearch}>{t('friends.find')}</Button>
          </div>

          {results.length > 0 && (
            <ul className="max-h-48 space-y-1.5 overflow-y-auto">
              {results.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{u.display_name}</p>
                    <p className="text-xs text-white/40">@{u.username}</p>
                  </div>
                  <button
                    onClick={() => void handleSend(u.id)}
                    className="rounded-lg bg-blue-500/20 px-2 py-1 text-xs text-blue-300"
                  >
                    {t('friends.sendRequest')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>
    </>
  );
}
