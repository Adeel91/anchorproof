// components/dashboard/apiKeys/ApiKeySection.tsx
'use client';

import { useState } from 'react';
import { useDashboardData } from '@/providers/DashboardDataProvider';
import { ApiKeyModal } from './ApiKeyModal';
import { CreateKeyModal } from './CreateKeyModal';
import Button from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Copy, CheckCircle } from 'lucide-react';

export function ApiKeySection() {
  const { apiKeys, refetch } = useDashboardData();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyData, setNewKeyData] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleGenerate = async (name: string) => {
    setGenerating(true);
    try {
      const response = await fetch('/api/keys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (data.success) {
        setNewKeyData(data);
        await refetch();
        setToast({ 
          message: `✅ API key "${name}" generated successfully`, 
          type: 'success' 
        });
        setTimeout(() => setToast(null), 3000);
      }
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to generate key:', error);
      setToast({ 
        message: '❌ Failed to generate API key', 
        type: 'error' 
      });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (keyId: string, keyName: string) => {
    if (!confirm(`Revoke API key "${keyName}"? This action cannot be undone.`)) return;
    try {
      const response = await fetch(`/api/keys/revoke?id=${keyId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await refetch();
        setToast({ 
          message: `✅ API key "${keyName}" revoked successfully`, 
          type: 'success' 
        });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Failed to revoke key:', error);
      setToast({ 
        message: '❌ Failed to revoke API key', 
        type: 'error' 
      });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const copyToClipboard = async (text: string, keyName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast({ 
        message: `✅ "${keyName}" API key copied to clipboard`, 
        type: 'success' 
      });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({ 
        message: '❌ Failed to copy API key', 
        type: 'error' 
      });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <>
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-lg overflow-hidden mb-12">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-white font-semibold">API Keys</h2>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
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
                    <th className="text-left py-3 text-gray-500 font-medium text-xs">Name</th>
                    <th className="text-left py-3 text-gray-500 font-medium text-xs">Public Key</th>
                    <th className="text-left py-3 text-gray-500 font-medium text-xs">Created</th>
                    <th className="text-left py-3 text-gray-500 font-medium text-xs">Expires</th>
                    <th className="text-left py-3 text-gray-500 font-medium text-xs">Last Used</th>
                    <th className="text-left py-3 text-gray-500 font-medium text-xs">Status</th>
                    <th className="text-right py-3 text-gray-500 font-medium text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((key) => (
                    <tr
                      key={key.id}
                      className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors"
                    >
                      <td className="py-3 text-white font-medium">{key.name}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <code className="text-green-400 text-xs font-mono">
                            {key.publicKey ? `${key.publicKey.slice(0, 20)}...` : 'N/A'}
                          </code>
                          {key.publicKey && (
                            <button
                              onClick={() => copyToClipboard(key.publicKey!, key.name)}
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
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
                          key.lastUsedAt 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}>
                          {key.lastUsedAt ? 'Active' : 'Never Used'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleRevoke(key.id, key.name)}
                          className="text-red-400 hover:text-red-300 text-xs transition-colors"
                        >
                          Revoke
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
        onClose={() => setShowCreateModal(false)}
        onCreate={handleGenerate}
        isGenerating={generating}
        existingNames={apiKeys.map(k => k.name)}
      />

      <ApiKeyModal
        isOpen={!!newKeyData}
        apiKey={newKeyData?.apiKey || null}
        publicKey={newKeyData?.publicKey || null}
        privateKey={newKeyData?.privateKey || null}
        onClose={() => setNewKeyData(null)}
      />

      {/* Toast */}
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