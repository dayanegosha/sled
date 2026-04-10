"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import VkIcon from '@/components/icons/VkIcon';

type Props = {
  nextPath: string;
  onError: (msg: string) => void;
};

export default function VkOneTapButton({ nextPath, onError }: Props) {
  const { t } = useTranslation();
  const mountRef = useRef<HTMLDivElement | null>(null);
  const initRef = useRef(false);
  const appId = process.env.NEXT_PUBLIC_VK_APP_ID;
  const redirectUrl = process.env.NEXT_PUBLIC_VK_REDIRECT_URL;

  const localNext = useMemo(
    () => (nextPath && nextPath.startsWith('/') ? nextPath : '/map'),
    [nextPath],
  );

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    if (!mountRef.current || !appId || !redirectUrl) {
      if (!appId || !redirectUrl) onError('VK SDK env is not configured');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@vkid/sdk@<3.0.0/dist-sdk/umd/index.js';
    script.async = true;
    script.onload = () => {
      try {
        const VKID = (window as any).VKIDSDK;
        if (!VKID || !mountRef.current) return;

        VKID.Config.init({
          app: Number(appId),
          redirectUrl,
          responseMode: VKID.ConfigResponseMode.Callback,
          source: VKID.ConfigSource.LOWCODE,
          scope: '',
        });

        const oneTap = new VKID.OneTap();
        oneTap
          .render({
            container: mountRef.current,
            showAlternativeLogin: true,
          })
          .on(VKID.WidgetEvents.ERROR, () => {
            onError('VK widget error');
          })
          .on(VKID.OneTapInternalEvents.LOGIN_SUCCESS, () => {
            window.location.href = `${apiUrl}/auth/vk?next=${encodeURIComponent(localNext)}`;
          });

        setSdkReady(true);
      } catch {
        /* */
      }
    };
    script.onerror = () => {};
    document.head.appendChild(script);
  }, [apiUrl, appId, localNext, onError, redirectUrl]);

  return (
    <div className="space-y-3">
      <div
        ref={mountRef}
        className={`flex min-h-[52px] w-full justify-center ${sdkReady ? '' : 'hidden'}`}
      />
      <a
        className="group relative inline-flex h-12 w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl border border-[#4c8dff]/40 bg-[#0077ff] px-4 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,119,255,0.35)] transition active:scale-[0.98] hover:-translate-y-0.5 hover:bg-[#0b7fff]"
        href={`${apiUrl}/auth/vk?next=${encodeURIComponent(localNext)}`}
      >
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/15 to-transparent opacity-80" />
        <VkIcon className="relative h-5 w-5" />
        <span className="relative">{t('auth.vkButton')}</span>
      </a>
    </div>
  );
}
