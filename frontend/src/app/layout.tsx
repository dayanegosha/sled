import type { Metadata, Viewport } from 'next';
import './globals.css';
import I18nProvider from '@/i18n/provider';
import InstallBanner from '@/components/ui/InstallBanner';
import ThemeProvider from '@/components/ui/ThemeProvider';

export const metadata: Metadata = {
  title: 'След',
  description: 'Открывай Россию шаг за шагом',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'След',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0d0f14',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <head>
        <link rel="apple-touch-icon" href="/sled_png.png" />
      </head>
      <body className="min-h-[100dvh] w-full overflow-x-hidden">
        <ThemeProvider>
          <I18nProvider>
            <InstallBanner />
            {children}
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
