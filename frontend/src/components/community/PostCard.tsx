"use client";

import GlassCard from '@/components/ui/GlassCard';
import { communityService, type CommunityPost } from '@/services/community.service';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export default function PostCard({ post }: { post: CommunityPost }) {
  const { t, i18n } = useTranslation();
  const [reported, setReported] = useState(false);

  const onReport = async () => {
    try {
      await communityService.report(post.id);
      setReported(true);
    } catch {
      /* */
    }
  };

  const date = new Date(post.createdAt).toLocaleString(
    i18n.language?.startsWith('ru') ? 'ru-RU' : i18n.language?.startsWith('zh') ? 'zh-CN' : 'en-US',
  );

  return (
    <GlassCard>
      <div className="flex items-start gap-3">
        {post.author.avatar_url ? (
          <img src={post.author.avatar_url} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/25 text-sm font-semibold text-blue-200">
            {post.author.display_name.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium">{post.author.display_name}</p>
              <p className="text-xs text-white/40">@{post.author.username}</p>
            </div>
            <span className="text-[11px] text-white/35">{date}</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-white/85">{post.content}</p>
          {(post.locationName || post.location) && (
            <p className="mt-2 text-xs text-cyan-300/80">
              📍 {post.locationName ?? `${post.location?.lat?.toFixed(3)}, ${post.location?.lng?.toFixed(3)}`}
            </p>
          )}
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              disabled={reported}
              onClick={() => void onReport()}
              className="text-[11px] text-white/40 underline-offset-2 hover:text-amber-300 hover:underline disabled:text-emerald-400/80"
            >
              {reported ? t('community.reported') : t('community.report')}
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
