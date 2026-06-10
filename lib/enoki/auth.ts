import { getSession, type EnokiWallet } from '@mysten/enoki';

export interface EnokiUserProfile {
  email: string | null;
  name: string | null;
  picture: string | null;
  jwt: string | null;
}

export async function getEnokiProfile(
  activeWallet: EnokiWallet
): Promise<EnokiUserProfile | null> {
  try {
    if (!activeWallet) return null;

    const session = await getSession(activeWallet);
    if (!session || !session.jwt) return null;

    const tokenParts = session.jwt.split('.');
    if (tokenParts.length < 2) return null;

    const payloadSegment = tokenParts[1];
    const payloadBase64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const decodedClaims = JSON.parse(atob(payloadBase64));

    console.log('🎯 SUCCESS! Unpacked JWT Claims Matrix:', decodedClaims);

    return {
      email: decodedClaims.email || null,
      name: decodedClaims.name || null,
      picture: decodedClaims.picture || null,
      jwt: session.jwt,
    };
  } catch (error) {
    console.error('Failed unpacking login attributes:', error);
    return null;
  }
}
