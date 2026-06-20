// providers/DashboardDataProvider.tsx

'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useRef,
} from 'react';

export interface Conversation {
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
  metadata?: Record<string, unknown>;
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
    throw new Error(
      'useDashboardData must be used within DashboardDataProvider'
    );
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
  const isMounted = useRef(true);

  const fetchAllData = useCallback(async () => {
    if (fetchedRef.current || !isMounted.current) return;
    fetchedRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // ⚡ STEP 1: Get tenant first (needed for other calls)
      const tenantRes = await fetch('/api/tenant/current', {
        cache: 'no-store',
      });

      if (!isMounted.current) return;

      if (!tenantRes.ok) {
        if (tenantRes.status === 401) {
          setError('Session expired. Please login again.');
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch tenant');
      }

      const tenantData = await tenantRes.json();
      if (tenantData.tenant) {
        setTenant(tenantData.tenant);
        setUser(tenantData.user);
      }

      // ⚡ STEP 2: Fetch everything else in parallel with timeouts
      const fetchWithTimeout = (url: string, timeout = 5000) => {
        return Promise.race([
          fetch(url),
          new Promise<Response>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout: ${url}`)), timeout)
          ),
        ]);
      };

      const [convRes, walrusRes, keysRes] = await Promise.allSettled([
        fetchWithTimeout('/api/chat/list', 3000),
        fetchWithTimeout('/api/walrus/list', 3000),
        fetchWithTimeout('/api/keys/list', 2000),
      ]);

      if (!isMounted.current) return;

      // ⚡ STEP 3: Process conversations
      if (convRes.status === 'fulfilled' && convRes.value.ok) {
        const convData = await convRes.value.json();
        const conversationsData = convData.conversations || [];
        setConversations(conversationsData);

        if (convData.stats) {
          setStats((prev) => ({ ...prev, ...convData.stats }));
        }
      }

      // ⚡ STEP 4: Override with Walrus data if available
      if (walrusRes.status === 'fulfilled' && walrusRes.value.ok) {
        const walrusData = await walrusRes.value.json();
        if (walrusData.conversations) {
          setConversations(walrusData.conversations);
        }
        if (walrusData.stats) {
          setStats((prev) => ({ ...prev, ...walrusData.stats }));
        }
      }

      // ⚡ STEP 5: Process API keys
      if (keysRes.status === 'fulfilled' && keysRes.value.ok) {
        const keysData = await keysRes.value.json();
        setApiKeys(keysData.keys || []);
      }

      // ⚡ STEP 6: Calculate final stats
      setStats((prev) => {
        const finalConvs = conversations.length > 0 ? conversations : [];
        const total = finalConvs.length || prev.total;
        const verified =
          finalConvs.filter((c) => c.verifiedAt !== null).length ||
          prev.verified;
        const pending =
          finalConvs.filter(
            (c) => c.verifiedAt === null && c.status !== 'tampered'
          ).length || prev.pending;
        const tampered =
          finalConvs.filter(
            (c) => c.status === 'tampered' || c.integrity?.tampered === true
          ).length || prev.tampered;
        const totalMessages =
          finalConvs.reduce((acc, c) => acc + (c.messageCount || 0), 0) ||
          prev.totalMessages;

        return {
          total: total || prev.total,
          verified: verified || prev.verified,
          pending: pending || prev.pending,
          tampered: tampered || prev.tampered,
          totalMessages: totalMessages || prev.totalMessages,
          integrityRate: total > 0 ? Math.round((verified / total) * 100) : 100,
        };
      });

      setIsReady(true);
      setLoading(false);
    } catch (err) {
      if (!isMounted.current) return;

      // ⚡ If we have tenant but other calls failed, still show dashboard
      if (tenant) {
        console.warn('Partial data loaded:', err);
        setIsReady(true);
        setLoading(false);
        return;
      }

      setError('Failed to load dashboard data');
      console.error('Error fetching dashboard data:', err);
      setLoading(false);
    }
  }, [tenant]);

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
      }
    } catch (error) {
      console.error('Failed to refresh API keys:', error);
    }
  }, [tenant]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAllData();
    }, 0);

    return () => clearTimeout(timer);
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
