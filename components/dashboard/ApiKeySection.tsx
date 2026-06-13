'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { ApiKeyModal } from '@/components/dashboard/ApiKeyModal';
import { CreateKeyModal } from '@/components/dashboard/CreateKeyModal';

interface ApiKey {
  id: string;
  name: string;
  role: string;
  createdAt: string;
  expiresAt: string;
  lastUsedAt: string | null;
  publicKey?: string;
}

interface ApiKeySectionProps {
  apiKeys?: ApiKey[];
  onGenerate: (name: string) => Promise<{
    apiKey: string;
    publicKey: string;
    privateKey: string;
  } | void>;
  onRevoke: (keyId: string) => Promise<void>;
  generating: boolean;
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

export function ApiKeySection({
  apiKeys = [],
  onGenerate,
  onRevoke,
  generating,
}: ApiKeySectionProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyData, setNewKeyData] = useState<{
    apiKey: string;
    publicKey: string;
    privateKey: string;
  } | null>(null);
  const existingKeyNames = (apiKeys || []).map((key) => key.name);

  const handleGenerate = async (name: string) => {
    const result = await onGenerate(name);
    if (result && typeof result === 'object' && 'apiKey' in result) {
      setNewKeyData(
        result as { apiKey: string; publicKey: string; privateKey: string }
      );
    }
    setShowCreateModal(false);
  };

  return (
    <>
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden mb-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-white font-semibold">API Keys</h2>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            + Generate Key
          </Button>
        </div>

        <div className="p-6">
          {(apiKeys || []).length === 0 ? (
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
                    <th className="text-right py-3 text-gray-500 font-medium text-xs">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(apiKeys || []).map((key) => (
                    <tr
                      key={key.id}
                      className="border-b border-gray-800/50 hover:bg-gray-800/20"
                    >
                      <td className="py-3 text-white">{key.name} </td>
                      <td className="py-3 text-green-400 text-xs font-mono">
                        {key.publicKey
                          ? `${key.publicKey.slice(0, 20)}...`
                          : 'N/A'}
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
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onRevoke(key.id)}
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
        existingNames={existingKeyNames}
      />

      <ApiKeyModal
        isOpen={!!newKeyData}
        apiKey={newKeyData?.apiKey || null}
        publicKey={newKeyData?.publicKey || null}
        privateKey={newKeyData?.privateKey || null}
        onClose={() => setNewKeyData(null)}
      />
    </>
  );
}
