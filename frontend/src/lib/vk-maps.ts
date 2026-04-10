const SCRIPT_ID = 'vk-maps-script';

declare global {
  interface Window {
    mappable?: any;
  }
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export async function loadVkMapsApi(): Promise<any> {
  if (typeof window === 'undefined') return null;
  if (window.mappable) {
    await window.mappable.ready;
    return window.mappable;
  }

  const key = process.env.NEXT_PUBLIC_VK_MAPS_API_KEY;
  if (!key) {
    throw new Error('NEXT_PUBLIC_VK_MAPS_API_KEY is not set');
  }

  const loadOnce = async () => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!existing) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = `https://js.api.mappable.world/v3/?apikey=${encodeURIComponent(key)}&lang=ru_RU`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);

      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load VK Maps API'));
      });
    } else {
      await new Promise<void>((resolve, reject) => {
        if (window.mappable) return resolve();
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener(
          'error',
          () => reject(new Error('Failed to load VK Maps API')),
          { once: true },
        );
      });
    }

    let wait = 0;
    while (!window.mappable && wait < 80) {
      await sleep(100);
      wait++;
    }

    if (!window.mappable) {
      throw new Error('VK Maps API was not initialized');
    }
    await window.mappable.ready;
    return window.mappable;
  };

  try {
    return await loadOnce();
  } catch {
    const el = document.getElementById(SCRIPT_ID);
    el?.remove();
    await sleep(200);
    return await loadOnce();
  }
}
