import { EnokiFlow } from '@mysten/enoki';

export const enokiFlow = new EnokiFlow({
  apiKey: process.env.NEXT_PUBLIC_ENOKI_PUBLIC_KEY || '',
});

/**
 * Handles the OAuth redirection flow for zkLogin using Google Directory Services
 */
export async function handleGoogleSSORedirect(windowObj: Window) {
  const redirectUrl = `${windowObj.location.origin}/dashboard`;

  const authUrl = await enokiFlow.createAuthorizationURL({
    provider: 'google',
    redirectUrl: redirectUrl,
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    network: 'testnet',
  });

  windowObj.location.href = authUrl;
}
