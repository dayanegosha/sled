import { PropsWithChildren } from 'react';

export default function GlassCard({ children }: PropsWithChildren) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
      {children}
    </div>
  );
}
