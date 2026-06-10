'use client';

import React from 'react';
import { EnokiFlowProvider } from '@mysten/enoki/react';

interface WrapperProps {
  children: React.ReactNode;
}

export default function EnokiWrapper({ children }: WrapperProps) {
  // Grab your key out of the environment variables setup smoothly
  const apiKey = process.env.NEXT_PUBLIC_ENOKI_PUBLIC_KEY || '';

  return (
    /* 💡 The SDK strictly requires "apiKey" passed directly onto EnokiFlowProvider */
    <EnokiFlowProvider apiKey={apiKey}>{children}</EnokiFlowProvider>
  );
}
