"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { profileService } from '@/services/profile.service';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

function NicknameModal() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const open = !!user?.needs_username;

  const handleSubmit = async () => {
    setError('');
    const trimmed = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,30}$/.test(trimmed)) {
      setError('Никнейм: 3-30 символов, a-z, 0-9, _');
      return;
    }
    setSaving(true);
    try {
      const updated = await profileService.updateMe({ username: trimmed });
      setUser({ ...user, ...updated, needs_username: false });
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title="Выберите никнейм">
      <p className="mb-3 text-sm text-white/60">
        Придумайте уникальный никнейм для вашего профиля
      </p>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="your_nickname"
        className="w-full rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-blue-500/50"
        maxLength={30}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') void handleSubmit();
        }}
      />
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      <Button
        className="mt-4 w-full"
        onClick={() => void handleSubmit()}
        disabled={saving}
      >
        {saving ? 'Сохранение...' : 'Сохранить'}
      </Button>
    </Modal>
  );
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, pathname, router, user]);

  if (loading) {
    return <div className="grid min-h-[40vh] place-items-center text-sm text-white/60">Loading profile...</div>;
  }

  if (!user) {
    return <div className="grid min-h-[40vh] place-items-center text-sm text-white/60">Redirecting to login...</div>;
  }

  return (
    <>
      <NicknameModal />
      {children}
    </>
  );
}
