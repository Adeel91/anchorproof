import { NextRequest, NextResponse } from 'next/server';
import { decryptPrivateKey } from '@/lib/anchorproof/server';

export async function POST(request: NextRequest) {
  try {
    const { encryptedKey } = await request.json();
    const privateKey = decryptPrivateKey(encryptedKey);
    return NextResponse.json({ privateKey });
  } catch {
    return NextResponse.json({ error: 'Decryption failed' }, { status: 500 });
  }
}
