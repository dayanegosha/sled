"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import Image from 'next/image';

export default function AdminLoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/admin-login', { login, password });
      router.push('/admin');
    } catch {
      setError('Неверный логин или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#0d0f14] px-4">
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="w-full max-w-sm rounded-2xl border border-white/12 bg-[#13151f] p-6"
      >
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 h-12 w-12">
            <Image
              src="/sled_png.png"
              alt="След"
              width={48}
              height={48}
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="text-lg font-semibold text-white">Панель управления</h1>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Логин"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="w-full rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-blue-500/50"
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-blue-500/50"
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="mt-3 text-center text-xs text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-blue-500/85 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </main>
  );
}
