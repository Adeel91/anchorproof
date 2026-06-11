'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ApiKeySection } from '@/components/dashboard/ApiKeySection';
import { RecentVerifications } from '@/components/dashboard/RecentVerifications';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  suiAddress: string;
  walrusNamespace: string;
  subscriptionTier: string;
  emailDomain: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
}

interface ApiKey {
  id: string;
  name: string;
  role: string;
  createdAt: string;
  expiresAt: string;
  lastUsedAt: string | null;
}

export default function DashboardClient() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(
    null
  );
  const router = useRouter();

  const clearSessionAndRedirect = useCallback(() => {
    document.cookie =
      'anchorproof-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tenantRes, keysRes] = await Promise.all([
          fetch('/api/tenant/current'),
          fetch('/api/keys/list'),
        ]);

        if (tenantRes.status === 401) {
          clearSessionAndRedirect();
          return;
        }

        if (!tenantRes.ok) throw new Error('Failed to fetch tenant');
        const tenantData = await tenantRes.json();
        setTenant(tenantData.tenant);
        setUser(tenantData.user);

        if (keysRes.ok) {
          const keysData = await keysRes.json();
          setApiKeys(keysData.keys || []);
        }
      } catch (error) {
        console.error(error);
        clearSessionAndRedirect();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router, clearSessionAndRedirect]);

  const refreshApiKeys = async () => {
    try {
      const keysRes = await fetch('/api/keys/list', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const keysData = await keysRes.json();
      setApiKeys(keysData.keys || []);
    } catch (error) {
      console.error('Failed to refresh keys:', error);
      setApiKeys([]);
    }
  };

  const revokeApiKey = async (keyId: string) => {
    if (!confirm('Revoke this API key? This action cannot be undone.')) return;
    try {
      const response = await fetch(`/api/keys/revoke?id=${keyId}`, {
        method: 'DELETE',
        cache: 'no-store',
      });
      if (response.ok) {
        await refreshApiKeys();
      } else {
        const data = await response.json();
        console.error('Revoke failed:', data.error);
      }
    } catch (error) {
      console.error('Failed to revoke key:', error);
    }
  };

  const generateApiKey = async (name: string) => {
    setGenerating(true);
    try {
      const response = await fetch('/api/keys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();
      console.log('API response:', data);

      if (data.success) {
        setNewlyGeneratedKey(data.apiKey);
        await refreshApiKeys();
      } else {
        console.error('Generation failed:', data.error);
      }
    } catch (error) {
      console.error('Failed to generate key:', error);
    } finally {
      setGenerating(false);
    }
  };

  // Show loading shell while loading
  if (loading) {
    return <DashboardShell loading={true} />;
  }

  // If no tenant/user after loading, don't render dashboard content
  if (!tenant || !user) {
    return null;
  }

  return (
    <DashboardShell loading={false}>
      <DashboardHeader tenant={tenant} user={user} />
      <StatsCards
        tenantId={tenant.id}
        emailDomain={tenant.emailDomain}
        walrusNamespace={tenant.walrusNamespace}
      />
      <ApiKeySection
        apiKeys={apiKeys}
        onGenerate={generateApiKey}
        onRevoke={revokeApiKey}
        generating={generating}
        newKey={newlyGeneratedKey}
        onClearNewKey={() => setNewlyGeneratedKey(null)}
      />
      <RecentVerifications />
    </DashboardShell>
  );
}
