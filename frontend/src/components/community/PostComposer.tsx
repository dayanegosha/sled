"use client";

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import MapContainer from '@/components/map/MapContainer';
import { communityService } from '@/services/community.service';

export default function PostComposer({ onPosted }: { onPosted: () => void }) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locName, setLocName] = useState('');

  const submit = async () => {
    const content = text.trim();
    if (content.length < 1) return;
    setSending(true);
    try {
      await communityService.create({
        content,
        lat: lat ?? undefined,
        lng: lng ?? undefined,
        locationName: locName || undefined,
      });
      setText('');
      setLat(null);
      setLng(null);
      setLocName('');
      onPosted();
    } catch {
      /* */
    }
    setSending(false);
  };

  const geo = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      () => undefined,
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <>
      <GlassCard>
        <textarea
          className="min-h-24 w-full resize-none rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-blue-400/60"
          placeholder={t('community.placeholder')}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
        />
        {(lat != null && lng != null) || locName ? (
          <p className="mt-2 text-xs text-cyan-300/90">
            📍 {locName || `${lat?.toFixed(4)}, ${lng?.toFixed(4)}`}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMapOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10"
            >
              <MapPin size={14} />
              {t('community.pickOnMap')}
            </button>
            <button
              type="button"
              onClick={geo}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10"
            >
              GPS
            </button>
          </div>
          <Button
            variant="primary"
            className="px-4 py-2 text-sm"
            disabled={sending || text.trim().length < 1}
            onClick={() => void submit()}
          >
            {sending ? '…' : t('community.publish')}
          </Button>
        </div>
      </GlassCard>

      <Modal
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        title={t('community.pickOnMap')}
        closeOnBackdrop={false}
      >
        <p className="mb-2 text-xs text-white/50">{t('community.locationHint')}</p>
        <div className="h-64 w-full overflow-hidden rounded-xl border border-white/10">
          <MapContainer />
        </div>
        <p className="mt-2 text-[11px] text-white/40">{t('community.manualCoords')}</p>
        <div className="mt-2 flex gap-2">
          <input
            type="number"
            step="any"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm"
            placeholder="Lat"
            value={lat ?? ''}
            onChange={(e) => setLat(e.target.value ? Number(e.target.value) : null)}
          />
          <input
            type="number"
            step="any"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm"
            placeholder="Lng"
            value={lng ?? ''}
            onChange={(e) => setLng(e.target.value ? Number(e.target.value) : null)}
          />
        </div>
        <input
          className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
          placeholder={t('community.placeName')}
          value={locName}
          onChange={(e) => setLocName(e.target.value)}
        />
        <Button className="mt-4 w-full" onClick={() => setMapOpen(false)}>
          {t('community.confirmLocation')}
        </Button>
      </Modal>
    </>
  );
}
