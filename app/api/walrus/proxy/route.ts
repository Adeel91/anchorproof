// app/api/walrus/proxy/route.ts

export const runtime = 'nodejs';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { blob } = await request.json();

    // Convert base64 back to binary
    const blobData = Buffer.from(blob, 'base64');

    // Upload to Walrus aggregator
    const response = await fetch(
      'https://aggregator.walrus-testnet.walrus.space/v1/blobs',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': blobData.length.toString(),
        },
        body: blobData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Walrus aggregator error:', response.status, errorText);
      return NextResponse.json(
        { error: `Walrus upload failed: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Walrus proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to upload via proxy' },
      { status: 500 }
    );
  }
}
