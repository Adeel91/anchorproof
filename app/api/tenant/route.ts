import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLogAsync } from '@/lib/audit';

const PUBLIC_DOMAINS = ['gmail.com', 'googlemail.com'];

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

    const isPublicDomain = PUBLIC_DOMAINS.includes(emailDomain.toLowerCase());

    let tenant;
    let isNewTenant = false;

    if (isPublicDomain) {
      const emailPrefix = email.split('@')[0];
      const personalSlug = `personal-${emailPrefix}-${Date.now()}`;

      tenant = await prisma.tenant.findFirst({
        where: {
          suiAddress: suiAddress,
        },
      });

      if (!tenant) {
        isNewTenant = true;
        let uniqueSlug = personalSlug;
        let counter = 1;

        while (
          await prisma.tenant.findUnique({ where: { slug: uniqueSlug } })
        ) {
          uniqueSlug = `${personalSlug}-${counter}`;
          counter++;
        }

        tenant = await prisma.tenant.create({
          data: {
            name: `${name || emailPrefix}'s Enterprise`,
            slug: uniqueSlug,
            emailDomain: emailDomain,
            suiAddress: suiAddress,
            walrusNamespace: `ns-personal-${Date.now()}`,
            subscriptionTier: 'free',
          },
        });
      }
    } else {
      const domainPrefix = emailDomain.split('.')[0];
      const generatedSlug = emailDomain.replace(/\./g, '-');
      const capitalizedName =
        domainPrefix.charAt(0).toUpperCase() + domainPrefix.slice(1);

      tenant = await prisma.tenant.findFirst({
        where: {
          emailDomain: emailDomain,
        },
      });

      if (!tenant) {
        isNewTenant = true;
        let uniqueSlug = generatedSlug;
        let counter = 1;

        while (
          await prisma.tenant.findUnique({ where: { slug: uniqueSlug } })
        ) {
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

    createAuditLogAsync({
      action: isNewTenant ? 'TENANT_CREATED' : 'USER_LOGIN',
      tenantId: tenant.id,
      details: {
        email: email,
        name: name || email.split('@')[0],
        tenantName: tenant.name,
        tenantSlug: tenant.slug,
        requestSuiAddress: suiAddress,
        tenantSuiAddress: tenant.suiAddress,
        isNewTenant: isNewTenant,
        isPublicDomain: isPublicDomain,
        action: isNewTenant
          ? isPublicDomain
            ? 'Personal tenant created'
            : 'Enterprise tenant created'
          : 'User login',
      },
    });

    return NextResponse.json({
      success: true,
      tenant,
      user: corporateUser,
      isPublicDomain,
      isNewTenant,
      tenantSuiAddress: tenant.suiAddress,
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
