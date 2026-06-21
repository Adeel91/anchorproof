import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import EnokiWrapper from '@/components/auth/EnokiWrapper';
import '@mysten/dapp-kit/dist/index.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const basePath = process.env.NEXT_PUBLIC_APP_URL || '';

export const metadata: Metadata = {
  metadataBase: new URL(basePath),
  title: {
    default: 'AnchorProof | Verifiable Cryptographic AI Memory',
    template: '%s | AnchorProof',
  },
  description:
    'Secure, tamper-proof, court-admissible audit trails for corporate AI conversations backed by Walrus Decentralized Storage and Sui Blockchain ledger anchoring.',
  icons: {
    icon: [
      { url: '/static/favicons/favicon.ico', sizes: 'any' },
      {
        url: '/static/favicons/favicon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
    apple: '/static/favicons/apple-touch-icon.png',
    shortcut: '/static/favicons/favicon.ico',
  },
  manifest: '/static/favicons/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="scroll-smooth"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className={`${inter.variable} ${poppins.variable} antialiased bg-slate-950 text-slate-100 font-sans min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <EnokiWrapper>
          <Header />
          <div className="flex-1 pt-16">{children}</div>
          <Footer />
        </EnokiWrapper>
      </body>
    </html>
  );
}
