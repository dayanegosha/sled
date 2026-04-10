"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'ok' | 'denied'>('loading');

  useEffect(() => {
    api
      .get('/auth/me')
      .then((r) => {
        const user = (r.data as { data?: { is_admin?: boolean } })?.data ?? r.data;
        if (user?.is_admin) {
          setStatus('ok');
        } else {
          setStatus('denied');
        }
      })
      .catch(() => {
        setStatus('denied');
      });
  }, []);

  useEffect(() => {
    if (status === 'denied') {
      router.replace('/szh-admin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="grid h-dvh place-items-center text-sm text-white/60">
        Проверка доступа...
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="grid h-dvh place-items-center text-sm text-white/40">
        Доступ запрещён
      </div>
    );
  }

  return <>{children}</>;
}
