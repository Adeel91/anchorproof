'use client';

import { useState } from 'react';
import { useDashboardData } from '@/providers/DashboardDataProvider';
import { Key, Plus, Copy, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';

export function ApiKeyOverview() {
  const { apiKeys, loading } = useDashboardData();
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const recentKeys = apiKeys.slice(0, 3);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const copyToClipboard = async (text: string, keyName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast({
        message: `✅ "${keyName}" API key copied to clipboard`,
        type: 'success',
      });
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast({
        message: '❌ Failed to copy API key',
        type: 'error',
      });
      setTimeout(() => setToast(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between">
            <div className="h-5 bg-slate-800 rounded w-32" />
            <div className="h-8 bg-slate-800 rounded w-28" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-800/50 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-400" />
              API Keys Overview
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {apiKeys.length} active key{apiKeys.length !== 1 ? 's' : ''} for
              your applications
            </p>
          </div>
          <Link href="/dashboard/keys">
            <Button
              variant="outline"
              size="sm"
              className="text-xs flex items-center gap-1.5"
            >
              Manage Keys
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>

        <div className="p-6">
          {apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-indigo-500/10 flex items-center justify-center">
                <Key className="w-6 h-6 text-indigo-400" />
              </div>
              <p className="text-sm text-slate-400">No API keys configured</p>
              <p className="text-xs text-slate-500 mt-1">
                Generate your first API key to integrate with AnchorProof
              </p>
              <Link href="/dashboard/keys">
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4 flex items-center gap-1.5 mx-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Generate Key
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentKeys.map((key) => {
                const displayKey = key.publicKey
                  ? `${key.publicKey.slice(0, 8)}...${key.publicKey.slice(-8)}`
                  : `${key.id.slice(0, 8)}...${key.id.slice(-8)}`;

                return (
                  <div
                    key={key.id}
                    className="group relative bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 hover:border-indigo-500/30 hover:bg-slate-800/50 transition-all duration-300"
                  >
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
                          key.lastUsedAt
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}
                      >
                        {key.lastUsedAt ? 'Active' : 'Never Used'}
                      </span>
                    </div>

                    <div className="mb-3 pr-16">
                      <h4 className="text-sm font-medium text-white truncate">
                        {key.name}
                      </h4>
                      <code className="text-xs font-mono text-slate-400 block truncate mt-1">
                        {displayKey}
                      </code>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>Created {formatDate(key.createdAt)}</span>
                      </div>
                      {key.lastUsedAt && (
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                          <CheckCircle className="w-3 h-3" />
                          <span>Last used {formatDate(key.lastUsedAt)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span>
                          Role:{' '}
                          <span className="text-slate-300 font-medium">
                            {key.role || 'Admin'}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/30">
                      <button
                        onClick={() =>
                          copyToClipboard(key.publicKey || key.id, key.name)
                        }
                        className="text-slate-500 hover:text-indigo-400 transition-colors text-xs flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                      <span className="w-px h-4 bg-slate-700/50" />
                      <Link
                        href="/dashboard/keys"
                        className="text-slate-500 hover:text-indigo-400 transition-colors text-xs"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}

              {apiKeys.length > 3 && (
                <Link
                  href="/dashboard/keys"
                  className="group relative bg-slate-800/20 border border-slate-700/30 rounded-xl p-4 hover:border-indigo-500/20 hover:bg-slate-800/30 transition-all duration-300 flex items-center justify-center min-h-[140px]"
                >
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-slate-800/50 flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors">
                      <Plus className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <p className="text-xs text-slate-400 group-hover:text-white transition-colors">
                      View all {apiKeys.length} keys
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Manage your API keys
                    </p>
                  </div>
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-slate-800/50 bg-slate-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-slate-400 font-mono">
                All keys encrypted at rest with AES-256
              </span>
            </div>
            <Link
              href="/dashboard/keys"
              className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Manage API Keys →
            </Link>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
