"use client";

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PostComposer from '@/components/community/PostComposer';
import PostCard from '@/components/community/PostCard';
import { communityService, type CommunityPost } from '@/services/community.service';

export default function CommunityPage() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  const load = useCallback(() => {
    communityService
      .list()
      .then((d) => setPosts(d.items ?? []))
      .catch(() => setPosts([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-white/40">{t('community.header')}</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">{t('community.title')}</h2>
      </header>
      <PostComposer onPosted={load} />
      <div className="space-y-3">
        {posts.length === 0 ? (
          <p className="py-8 text-center text-sm text-white/40">{t('community.empty')}</p>
        ) : (
          posts.map((p) => <PostCard key={p.id} post={p} />)
        )}
      </div>
    </div>
  );
}
