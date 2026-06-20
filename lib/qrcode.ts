import QRCode from 'qrcode';
import { activeNetwork } from './walrus/client';

export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 150,
      margin: 2,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff',
      },
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    return '';
  }
}

export function generateVerificationUrl(blobId: string): string {
  return `https://walruscan.com/${activeNetwork}/blob/${blobId}`;
}

export function generateConversationUrl(blobId: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/dashboard/conversations?blobId=${blobId}`;
}
