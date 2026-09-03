import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: {
    template: '%s | Sistem SPRIN Puslitbang',
    default: 'Sistem SPRIN Puslitbang',
  },
  description: 'Sistem Manajemen Surat Perintah (Sprin) Pusat Penelitian dan Pengembangan Polri',
  icons: {
    icon: '/logo-puslitbang.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen antialiased">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
