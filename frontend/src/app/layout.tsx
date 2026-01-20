import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'TWOTIER KEIR - Tracking Britain\'s Leadership Crisis',
  description: 'A satirical platform aggregating negative news coverage about UK Prime Minister Keir Starmer. Two Tier Keir at his finest.',
  keywords: ['Keir Starmer', 'Two Tier Keir', 'UK Politics', 'Labour', 'Satire', 'News'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
