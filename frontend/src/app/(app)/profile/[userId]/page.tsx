"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import GlassCard from '@/components/ui/GlassCard';
import { api } from '@/services/api';
import { plural } from '@/lib/plural';

type UserProfile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  total_distance: number;
  created_at: string;
  vk_id?: string | number | null;
};

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/users/${userId}`)
      .then((r) => setProfile(r.data?.data ?? r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center text-sm text-white/60">
        Загрузка...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="grid min-h-[40vh] place-items-center text-sm text-white/40">
        Пользователь не найден
      </div>
    );
  }

  const kmVal = Number((Number(profile.total_distance) / 1000).toFixed(1));

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20 text-xl font-bold text-blue-300">
              {profile.display_name.charAt(0)}
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold">{profile.display_name}</h2>
            <p className="text-sm text-white/50">@{profile.username}</p>
            {profile.bio && (
              <p className="mt-1 text-sm text-white/60">{profile.bio}</p>
            )}
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="mb-3 text-base font-semibold">{t('profile.stats')}</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
            <p className="text-lg font-bold tabular-nums">{kmVal.toLocaleString('ru-RU')}</p>
            <p className="text-[10px] uppercase text-white/40">
              {plural(Math.floor(kmVal), [t('profile.km_one'), t('profile.km_few'), t('profile.km_many')])}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
            <p className="text-lg font-bold tabular-nums">
              {new Date(profile.created_at).toLocaleDateString('ru-RU')}
            </p>
            <p className="text-[10px] uppercase text-white/40">{t('profile.memberSince') || 'с нами с'}</p>
          </div>
        </div>
      </GlassCard>

      {profile.vk_id && (
        <a
          href={`https://vk.com/id${profile.vk_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#111420]/70 px-4 py-3 text-sm font-medium text-blue-300 backdrop-blur-xl transition hover:bg-white/10"
        >
          <svg className="h-5 w-5" viewBox="0 0 28 28" fill="currentColor">
            <path d="M14.88 19.32h1.21s.37-.04.55-.24c.17-.18.17-.53.17-.53s-.02-1.62.73-1.86c.74-.24 1.7 1.57 2.71 2.27.77.52 1.35.41 1.35.41l2.71-.04s1.42-.09.74-1.21c-.05-.09-.39-.83-2.03-2.35-1.71-1.59-1.48-1.33.58-4.08 1.25-1.67 1.75-2.69 1.6-3.13-.15-.42-1.07-.31-1.07-.31l-3.05.02s-.22-.03-.39.07c-.17.1-.27.33-.27.33s-.49 1.29-1.13 2.39c-1.37 2.32-1.91 2.45-2.14 2.3-.52-.34-.39-1.36-.39-2.08 0-2.26.34-3.2-.67-3.45-.33-.08-.58-.13-1.44-.14-.17 0-1.1.01-1.1.01-.48 0-.8.15-1 .28-.14.1-.1.32-.1.32s.15.59-.18.99c-.3.36-.79-.07-.79-.07-1.47-1.11-2.55.01-2.55.01l.52.77s.55-.2 1.02.24c.42.39.21 1.19.21 1.19s.29 3.34-1.37 2.89c-1.13-.3-2.57-3.24-2.57-3.24s-.15-.32-.33-.41c-.21-.11-.51-.15-.51-.15l-2.68.02s-.4.01-.55.19c-.13.15-.01.48-.01.48s2.28 5.33 4.87 8.02c2.37 2.47 5.06 2.3 5.06 2.3z"/>
          </svg>
          {t('profile.vkProfile')}
        </a>
      )}
    </div>
  );
}
