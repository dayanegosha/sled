"use client";

import { useTranslation } from 'react-i18next';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

type Props = {
  open: boolean;
  onClose: () => void;
  km: number;
};

const SITE = 'https://твой-след.рф';

export default function TodayExplorationModal({ open, onClose, km }: Props) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : i18n.language?.startsWith('zh') ? 'zh' : 'ru';

  const line =
    lang === 'en'
      ? `Today I explored ${km.toFixed(1)} km — ${SITE}`
      : lang === 'zh'
        ? `今天我探索了 ${km.toFixed(1)} 公里 — ${SITE}`
        : `Сегодня я исследовал ${km.toFixed(1)} км — ${SITE}`;

  const sharePng = async () => {
    const canvas = document.createElement('canvas');
    const w = 1080;
    const h = 600;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, '#0f172a');
    grd.addColorStop(1, '#1e3a5f');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 52px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('След', w / 2, 120);

    ctx.font = '36px Inter, system-ui, sans-serif';
    const words = line.split(' ');
    let y = 260;
    let lineBuf = '';
    for (const word of words) {
      const test = lineBuf ? `${lineBuf} ${word}` : word;
      if (ctx.measureText(test).width > w - 120) {
        ctx.fillText(lineBuf, w / 2, y);
        y += 48;
        lineBuf = word;
      } else {
        lineBuf = test;
      }
    }
    if (lineBuf) ctx.fillText(lineBuf, w / 2, y);

    ctx.font = '24px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#60a5fa';
    ctx.fillText(SITE, w / 2, h - 80);

    canvas.toBlob(async (blob) => {
      if (!blob || !navigator.share) {
        try {
          await navigator.clipboard.writeText(line);
        } catch {
          /* */
        }
        return;
      }
      try {
        const file = new File([blob], 'sled-today.png', { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: 'След',
          text: line,
        });
      } catch {
        try {
          await navigator.clipboard.writeText(line);
        } catch {
          /* */
        }
      }
    }, 'image/png');
  };

  return (
    <Modal open={open} onClose={onClose} title={t('map.today.title')} closeOnBackdrop={false}>
      <p className="text-sm text-white/70">{t('map.today.subtitle', { km: km.toFixed(1) })}</p>
      <p className="mt-3 whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white/85">
        {line}
      </p>
      <div className="mt-4 flex gap-2">
        <Button variant="ghost" className="flex-1" onClick={onClose}>
          {t('profile.cancel')}
        </Button>
        <Button className="flex-1" onClick={() => void sharePng()}>
          {t('map.today.share')}
        </Button>
      </div>
    </Modal>
  );
}
