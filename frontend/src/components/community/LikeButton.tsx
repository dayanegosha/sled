"use client";

import { useState } from 'react';
import { Heart } from 'lucide-react';

export default function LikeButton() {
  const [liked, setLiked] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setLiked((v) => !v)}
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition ${
        liked ? 'bg-pink-500/20 text-pink-300' : 'bg-white/8 text-white/70 hover:bg-white/12'
      }`}
    >
      <Heart size={13} fill={liked ? 'currentColor' : 'none'} />
      {liked ? 'Liked' : 'Like'}
    </button>
  );
}
