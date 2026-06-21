import { Metadata } from 'next';
import { Suspense } from 'react';
import { VerifyForm } from '@/components/verify/VerifyForm';
import { Loader2 } from 'lucide-react';
import Container from '@/components/ui/Container';

export const metadata: Metadata = {
  title: 'Verify Conversation | AnchorProof',
  description:
    'Verify the authenticity and integrity of any AnchorProof verified conversation on the Sui blockchain',
  openGraph: {
    title: 'Verify Conversation | AnchorProof',
    description: 'Cryptographically verify conversations on the Sui blockchain',
    type: 'website',
  },
};

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <Container className="py-12 sm:py-16 md:py-20">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                <p className="text-slate-400 text-sm">
                  Loading verification...
                </p>
              </div>
            </div>
          }
        >
          <VerifyForm />
        </Suspense>
      </Container>
    </div>
  );
}
