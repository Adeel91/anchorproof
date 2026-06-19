// providers/DashboardDataProvider.tsx
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
  suiTxHash?: string | null;
  modelUsed?: string | null;
  metadata?: any;
  status?: 'verified' | 'pending' | 'tampered';
  integrity?: {
    verified: boolean;
    tampered: boolean;
    exists: boolean;
    error?: string | null;
  };
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
    tampered?: number;
    totalMessages: number;
    integrityRate?: number;
  };
  loading: boolean;
  error: string | null;
  isReady: boolean;
  refetch: () => Promise<void>;
  refreshKeys: () => Promise<void>;
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
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    tampered: 0,
    totalMessages: 0,
    integrityRate: 100,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const fetchedRef = useRef(false);

  const fetchAllData = useCallback(async () => {
    // Don't refetch if already fetched
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const [tenantRes, convRes, walrusRes, keysRes] = await Promise.all([
        fetch('/api/tenant/current', { cache: 'no-store' }),
        fetch('/api/chat/list'),
        fetch('/api/walrus/list'),
        fetch('/api/keys/list'),
      ]);

      // Handle tenant - DON'T redirect here, let the component handle it
      if (tenantRes.ok) {
        const tenantData = await tenantRes.json();
        if (tenantData.tenant) {
          setTenant(tenantData.tenant);
          setUser(tenantData.user);
        }
      } else if (tenantRes.status === 401) {
        // Don't redirect here - let the component handle it
        console.warn('Unauthorized to fetch tenant data');
        setError('Session expired. Please login again.');
        setLoading(false);
        return;
      }

      // Handle conversations
      const convData = await convRes.json();
      const conversationsData = convData.conversations || [];
      
      const walrusData = await walrusRes.json();
      
      let finalConversations = conversationsData;
      let finalStats = convData.stats || {
        total: 0,
        verified: 0,
        pending: 0,
        totalMessages: 0,
      };

      if (walrusRes.ok && walrusData.conversations) {
        finalConversations = walrusData.conversations;
        finalStats = walrusData.stats || finalStats;
      }

      setConversations(finalConversations);

      setStats({
        total: finalStats.total || finalConversations.length,
        verified: finalStats.verified || finalConversations.filter((c: any) => c.verifiedAt).length,
        pending: finalStats.pending || finalConversations.filter((c: any) => !c.verifiedAt && c.status !== 'tampered').length,
        tampered: finalStats.tampered || finalConversations.filter((c: any) => c.status === 'tampered' || c.integrity?.tampered).length,
        totalMessages: finalStats.totalMessages || finalConversations.reduce((acc: number, c: any) => acc + (c.messageCount || 0), 0),
        integrityRate: finalStats.integrityRate || (finalConversations.length > 0
          ? Math.round((finalConversations.filter((c: any) => c.status === 'verified' || c.verifiedAt).length / finalConversations.length) * 100)
          : 100),
      });

      // Handle API keys
      if (keysRes.ok) {
        const keysData = await keysRes.json();
        setApiKeys(keysData.keys || []);
      } else if (keysRes.status === 401) {
        console.warn('Unauthorized to fetch API keys');
      }

      setIsReady(true);
      setLoading(false);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error fetching dashboard data:', err);
      setLoading(false);
    }
  }, []);

  // Separate function to refresh only API keys
  const refreshKeys = useCallback(async () => {
    try {
      if (!tenant) {
        console.warn('No tenant available, skipping keys refresh');
        return;
      }

      const keysRes = await fetch('/api/keys/list', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (keysRes.ok) {
        const keysData = await keysRes.json();
        setApiKeys(keysData.keys || []);
      } else if (keysRes.status === 401) {
        console.warn('Unauthorized to refresh API keys');
      } else {
        console.error('Failed to refresh API keys:', keysRes.status);
      }
    } catch (error) {
      console.error('Failed to refresh API keys:', error);
    }
  }, [tenant]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

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
    refreshKeys,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}