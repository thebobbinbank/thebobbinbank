import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import { Geist_Mono, Source_Serif_4 } from 'next/font/google';
import './globals.css';

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: '--font-serif'
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: '--font-mono'
});

export const metadata: Metadata = {
  title: 'The Bobbin Bank - Share Sewing Patterns',
  description: 'A community for sewers to browse, share, and download sewing patterns. Find your next project or share your creations with fellow crafters.',
  generator: 'esorinas',
  keywords: ['sewing', 'patterns', 'crafts', 'diy', 'handmade', 'community'],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${sourceSerif.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
