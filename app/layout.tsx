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

export const metadata: Metadata = {
  title: 'AnchorProof — Verifiable Cryptographic AI Memory for Enterprises',
  description:
    'Secure, tamper-proof, court-admissible audit trails for corporate AI conversations backed by Walrus Decentralized Storage and Sui Blockchain ledger anchoring.',
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