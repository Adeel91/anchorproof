'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';

interface Conversation {
  id: string;
  conversationId: string;
  blobId: string;
  customerId: string;
  agentId: string;
  messageCount: number;
  verifiedAt: string | null;
  createdAt: string;
}

interface ApiKey {
  id: string;
  name: string;
  role: string;
  createdAt: string;
  expiresAt: string;
  lastUsedAt: string | null;
  publicKey?: string;
}

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

interface DashboardData {
  tenant: Tenant | null;
  user: User | null;
  conversations: Conversation[];
  apiKeys: ApiKey[];
  stats: {
    total: number;
    verified: number;
    pending: number;
    totalMessages: number;
  };
  loading: boolean;
  error: string | null;
  isReady: boolean;
  refetch: () => Promise<void>;
}

const DashboardContext = createContext<DashboardData | undefined>(undefined);

export function useDashboardData() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardData must be used within DashboardDataProvider');
  }
  return context;
}

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const fetchedRef = useRef(false);

  const fetchAllData = useCallback(async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const [tenantRes, convRes, keysRes] = await Promise.all([
        fetch('/api/tenant/current', { cache: 'no-store' }),
        fetch('/api/walrus/list'),
        fetch('/api/keys/list'),
      ]);

      if (tenantRes.ok) {
        const tenantData = await tenantRes.json();
        if (tenantData.tenant) {
          setTenant(tenantData.tenant);
          setUser(tenantData.user);
        }
      } else if (tenantRes.status === 401) {
        window.location.href = '/login';
        return;
      }

      const convData = await convRes.json();
      setConversations(convData.conversations || []);

      if (keysRes.ok) {
        const keysData = await keysRes.json();
        setApiKeys(keysData.keys || []);
      }

      setIsReady(true);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const stats = {
    total: conversations.length,
    verified: conversations.filter((c) => c.verifiedAt).length,
    pending: conversations.filter((c) => !c.verifiedAt).length,
    totalMessages: conversations.reduce((acc, c) => acc + (c.messageCount || 0), 0),
  };

  const value = {
    tenant,
    user,
    conversations,
    apiKeys,
    stats,
    loading,
    error,
    isReady,
    refetch: async () => {
      fetchedRef.current = false;
      await fetchAllData();
    },
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}