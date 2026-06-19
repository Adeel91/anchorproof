import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const { suiAddress, email, name, emailDomain } = await request.json();

    if (!emailDomain || !suiAddress || !email) {
      return NextResponse.json(
        {
          error:
            'Required fields missing: emailDomain, suiAddress, and email are required',
        },
        { status: 400 }
      );
    }

    const domainPrefix = emailDomain.split('.')[0];
    const generatedSlug = emailDomain.replace(/\./g, '-');
    const capitalizedName =
      domainPrefix.charAt(0).toUpperCase() + domainPrefix.slice(1);

    let tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { emailDomain: emailDomain },
          { slug: generatedSlug },
          { suiAddress: suiAddress },
        ],
      },
    });

    let isNewTenant = false;

    if (!tenant) {
      isNewTenant = true;
      let uniqueSlug = generatedSlug;
      let counter = 1;

      while (await prisma.tenant.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${generatedSlug}-${counter}`;
        counter++;
      }

      tenant = await prisma.tenant.create({
        data: {
          name: `${capitalizedName} Corp`,
          slug: uniqueSlug,
          emailDomain: emailDomain,
          suiAddress: suiAddress,
          walrusNamespace: `ns-${domainPrefix.toLowerCase()}-${Date.now()}`,
          subscriptionTier: 'free',
        },
      });
    }

    const corporateUser = await prisma.user.upsert({
      where: { email: email },
      update: {
        name: name || email.split('@')[0],
        tenantId: tenant.id,
        role: 'admin',
      },
      create: {
        email: email,
        name: name || email.split('@')[0],
        tenantId: tenant.id,
        role: 'admin',
      },
    });

    // ✅ AUDIT LOG: Tenant created or user login
    await createAuditLog({
      action: 'USER_LOGIN',
      details: {
        email: email,
        name: name || email.split('@')[0],
        tenantId: tenant.id,
        tenantName: tenant.name,
        isNewTenant: isNewTenant,
      },
    });

    return NextResponse.json({
      success: true,
      tenant,
      user: corporateUser,
    });
  } catch (error) {
    console.error('Tenant registration error:', error);

    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          {
            error:
              'Tenant already exists with this email domain or Sui address',
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: error.message || 'Internal database sync error' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal database sync error' },
      { status: 500 }
    );
  }
}