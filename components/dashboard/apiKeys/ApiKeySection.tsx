'use client';

import { useState } from 'react';
import { useDashboardData } from '@/providers/DashboardDataProvider';
import { ApiKeyModal } from './ApiKeyModal';
import { CreateKeyModal } from './CreateKeyModal';
import Button from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Copy } from 'lucide-react';

interface NewKeyData {
  apiKey: string;
  publicKey: string;
  privateKey: string;
}

export function ApiKeySection() {
  const { apiKeys, refreshKeys, tenant } = useDashboardData();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyData, setNewKeyData] = useState<NewKeyData | null>(null);
  const [generating, setGenerating] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const handleGenerate = async (name: string) => {
    if (!tenant) {
      setToast({
        message: '❌ No tenant found. Please refresh the page.',
        type: 'error',
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setGenerating(true);
    setNewKeyData(null);

    try {
      const response = await fetch('/api/keys/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setNewKeyData(null);
          setShowCreateModal(false);
          setToast({
            message: '❌ Session expired. Please refresh the page.',
            type: 'error',
          });
          setTimeout(() => setToast(null), 3000);
          return;
        }
        throw new Error(data.error || 'Failed to generate key');
      }

      if (data.success) {
        setNewKeyData({
          apiKey: data.apiKey,
          publicKey: data.publicKey,
          privateKey: data.privateKey,
        });

        setShowCreateModal(false);

        setToast({
          message: `✅ API key "${name}" generated successfully`,
          type: 'success',
        });

        await refreshKeys();
      } else {
        throw new Error(data.error || 'Failed to generate key');
      }
    } catch (error) {
      console.error('Failed to generate key:', error);
      setToast({
        message: `❌ ${error instanceof Error ? error.message : 'Failed to generate API key'}`,
        type: 'error',
      });
      setNewKeyData(null);
    } finally {
      setGenerating(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleRevoke = async (keyId: string, keyName: string) => {
    if (!confirm(`Revoke API key "${keyName}"? This action cannot be undone.`))
      return;

    setRevoking(keyId);
    try {
      const response = await fetch(`/api/keys/revoke?id=${keyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await refreshKeys();
        setToast({
          message: `✅ API key "${keyName}" revoked successfully`,
          type: 'success',
        });
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to revoke key');
      }
    } catch (error) {
      console.error('Failed to revoke key:', error);
      setToast({
        message: `❌ ${error instanceof Error ? error.message : 'Failed to revoke API key'}`,
        type: 'error',
      });
    } finally {
      setRevoking(null);
      setTimeout(() => setToast(null), 3000);
    }
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

  const handleCloseKeyModal = () => {
    setNewKeyData(null);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  if (!tenant) {
    return (
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-8 text-center">
        <p className="text-yellow-400 text-sm">Loading tenant information...</p>
        <p className="text-gray-500 text-xs mt-2">
          Please refresh the page if this persists.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-lg overflow-hidden mb-12">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-white font-semibold">API Keys</h2>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            disabled={generating}
          >
            + Generate Key
          </Button>
        </div>

        <div className="p-6">
          {apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm mb-2">No API keys yet</p>
              <p className="text-gray-600 text-xs">
                Click Generate Key to create your first API key
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 text-gray-500 font-medium text-xs">
                      Name
                    </th>
                    <th className="text-left py-3 text-gray-500 font-medium text-xs">
                      Public Key
                    </th>
                    <th className="text-left py-3 text-gray-500 font-medium text-xs">
                      Created
                    </th>
                    <th className="text-left py-3 text-gray-500 font-medium text-xs">
                      Expires
                    </th>
                    <th className="text-left py-3 text-gray-500 font-medium text-xs">
                      Last Used
                    </th>
                    <th className="text-left py-3 text-gray-500 font-medium text-xs">
                      Status
                    </th>
                    <th className="text-right py-3 text-gray-500 font-medium text-xs">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((key) => (
                    <tr
                      key={key.id}
                      className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors"
                    >
                      <td className="py-3 text-white font-medium">
                        {key.name}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <code className="text-green-400 text-xs font-mono">
                            {key.publicKey
                              ? `${key.publicKey.slice(0, 20)}...`
                              : 'N/A'}
                          </code>
                          {key.publicKey && (
                            <button
                              onClick={() =>
                                copyToClipboard(key.publicKey!, key.name)
                              }
                              className="text-gray-500 hover:text-green-400 transition-colors"
                              title="Copy public key"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-gray-400 text-xs">
                        {formatDate(key.createdAt)}
                      </td>
                      <td className="py-3 text-gray-400 text-xs">
                        {formatDate(key.expiresAt)}
                      </td>
                      <td className="py-3 text-gray-500 text-xs">
                        {key.lastUsedAt ? formatDate(key.lastUsedAt) : 'Never'}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
                            key.lastUsedAt
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}
                        >
                          {key.lastUsedAt ? 'Active' : 'Never Used'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleRevoke(key.id, key.name)}
                          disabled={revoking === key.id}
                          className={`text-xs transition-colors ${
                            revoking === key.id
                              ? 'text-gray-500 cursor-not-allowed'
                              : 'text-red-400 hover:text-red-300'
                          }`}
                        >
                          {revoking === key.id ? 'Revoking...' : 'Revoke'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <CreateKeyModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewKeyData(null);
        }}
        onCreate={handleGenerate}
        isGenerating={generating}
        existingNames={apiKeys.map((k) => k.name)}
      />

      <ApiKeyModal
        isOpen={!!newKeyData && !!newKeyData.apiKey}
        apiKey={newKeyData?.apiKey || null}
        publicKey={newKeyData?.publicKey || null}
        privateKey={newKeyData?.privateKey || null}
        onClose={handleCloseKeyModal}
      />

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
