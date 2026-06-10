import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { suiAddress, email, name, emailDomain } = await request.json();

    if (!emailDomain || !suiAddress || !email) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    const domainPrefix = emailDomain.split('.')[0];
    const generatedSlug = emailDomain.replace(/\./g, '-');
    const capitalizedName =
      domainPrefix.charAt(0).toUpperCase() + domainPrefix.slice(1);

    let tenant = await prisma.tenant.findFirst({
      where: { emailDomain: emailDomain },
    });

    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: `${capitalizedName} Corp`,
          slug: generatedSlug,
          emailDomain: emailDomain,
          suiAddress: suiAddress,
          walrusNamespace: `ns-${domainPrefix.toLowerCase()}`,
          subscriptionTier: 'free',
        },
      });
    }

    const corporateUser = await prisma.user.upsert({
      where: { email: email },
      update: { name: name },
      create: {
        email: email,
        name: name || email.split('@')[0],
        tenantId: tenant.id,
        role: 'admin',
      },
    });

    return NextResponse.json({ tenant, user: corporateUser });
  } catch (error) {
    const err = error as Error;

    console.error('Tenant registration error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal database sync error' },
      { status: 500 }
    );
  }
}
