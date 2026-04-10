"use client";

import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import FriendsList from '@/components/profile/FriendsList';
import StatsCard from '@/components/profile/StatsCard';
import GlassCard from '@/components/ui/GlassCard';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';
import VkIcon from '@/components/icons/VkIcon';
import { Share2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { profileService } from '@/services/profile.service';

function EditProfileModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [displayName, setDisplayName] = useState(user?.display_name ?? '');
  const [username, setUsernameVal] = useState(user?.username ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setError('');
    const dto: Record<string, string> = {};
    if (displayName.trim() !== (user?.display_name ?? ''))
      dto.display_name = displayName.trim();
    if (username.trim().toLowerCase() !== (user?.username ?? ''))
      dto.username = username.trim().toLowerCase();
    if (bio.trim() !== (user?.bio ?? '')) dto.bio = bio.trim();

    if (Object.keys(dto).length === 0) { onClose(); return; }

    setSaving(true);
    try {
      const updated = await profileService.updateMe(dto);
      setUser({ ...user, ...updated });
      onClose();
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t('profile.editTitle')}>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-white/50">{t('profile.name')}</label>
          <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm outline-none focus:border-blue-500/50"
            maxLength={50} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/50">{t('profile.nickname')}</label>
          <input type="text" value={username} onChange={(e) => setUsernameVal(e.target.value)}
            className="w-full rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm outline-none focus:border-blue-500/50"
            maxLength={30} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/50">{t('profile.bio')}</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)}
            className="w-full resize-none rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm outline-none focus:border-blue-500/50"
            rows={3} maxLength={300} />
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      <div className="mt-4 flex gap-2">
        <Button variant="ghost" className="flex-1" onClick={onClose}>{t('profile.cancel')}</Button>
        <Button className="flex-1" onClick={() => void handleSave()} disabled={saving}>
          {saving ? t('profile.saving') : t('profile.save')}
        </Button>
      </div>
    </Modal>
  );
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [editOpen, setEditOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const updated = await profileService.uploadAvatar(file);
      setUser({ ...user, ...updated });
    } catch { /* */ }
    setUploading(false);
  };

  const avatarUrl = user?.avatar_url;

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="relative flex items-center gap-4">
          <button
            type="button"
            title={t('profile.shareProfile')}
            onClick={() => {
              const url = `${window.location.origin}/profile/${user?.id ?? ''}`;
              void navigator.clipboard.writeText(url).catch(() => undefined);
            }}
            className="absolute right-0 top-0 rounded-xl p-2 text-white/45 transition hover:bg-white/10 hover:text-white"
            aria-label={t('profile.shareProfile')}
          >
            <Share2 size={18} />
          </button>
          <div className="relative shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20 text-xl font-bold text-blue-300">
                {(user?.display_name ?? '?').charAt(0)}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white shadow-lg"
              title={t('profile.changeAvatar')}
            >
              {uploading ? '...' : '✎'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleAvatarChange(e)}
            />
          </div>
          <div className="min-w-0 flex-1 pr-10">
            <p className="text-xs uppercase tracking-[0.12em] text-white/40">{t('profile.title')}</p>
            <h2 className="mt-0.5 truncate text-xl font-semibold">
              {user?.display_name ?? 'Explorer'}
            </h2>
            <p className="text-sm text-white/50">@{user?.username ?? 'guest'}</p>
            {user?.bio && <p className="mt-1 text-sm text-white/55">{user.bio}</p>}
          </div>
        </div>
        <Button variant="ghost" className="mt-3 w-full" onClick={() => setEditOpen(true)}>
          {t('profile.edit')}
        </Button>
      </GlassCard>

      <StatsCard />
      <FriendsList />

      <GlassCard>
        <h3 className="text-base font-semibold">{t('profile.settings')}</h3>
        <div className="mt-3 space-y-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
          {user?.vk_id && (
            <a
              href={`https://vk.com/id${user.vk_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-blue-300 transition hover:bg-white/10"
            >
              <VkIcon className="h-4 w-4" />
              {t('profile.vkProfile')}
            </a>
          )}
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setAboutOpen(true)}
          >
            {t('profile.about')}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              void profileService.logout().finally(() => { window.location.href = '/login'; });
            }}
          >
            {t('profile.logout')}
          </Button>
        </div>
      </GlassCard>

      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />

      <Modal
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
        title={t('about.title')}
        closeOnBackdrop={false}
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 h-14 w-14">
            <Image
              src="/sled_png.png"
              alt="След"
              width={56}
              height={56}
              className="h-full w-full object-contain"
            />
          </div>
          <h3 className="text-xl font-bold">След</h3>
          <p className="mt-1 text-sm text-white/50">{t('about.version')} 1.0.0</p>
          <p className="mt-3 text-sm leading-relaxed text-white/60">{t('about.description')}</p>
          <div className="mt-4 flex w-full flex-col gap-2">
            <a href="/legal/terms" className="block rounded-xl border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/10">
              {t('auth.terms.termsLink')}
            </a>
            <a href="/legal/privacy" className="block rounded-xl border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/10">
              {t('auth.terms.privacyLink')}
            </a>
            <a href="https://vk.com/club237560758" target="_blank" rel="noopener noreferrer" className="block rounded-xl border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-blue-300/80 transition hover:bg-white/10">
              {t('about.vkCommunity')}
            </a>
          </div>
          <div className="mt-4 w-full border-t border-white/8 pt-3">
            <p className="text-xs text-white/30">&copy; 2025 След</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
