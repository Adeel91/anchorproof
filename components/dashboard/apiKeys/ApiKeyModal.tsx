'use client';

import { useState } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  apiKey: string | null;
  publicKey: string | null;
  privateKey: string | null;
  onClose: () => void;
}

export function ApiKeyModal({
  isOpen,
  apiKey,
  publicKey,
  privateKey,
  onClose,
}: ApiKeyModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = async (text: string, field: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (!apiKey && !publicKey && !privateKey) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-2xl w-full mx-4">
          <div className="flex items-center justify-center gap-3 py-8">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-400">Generating keys...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-white mb-2">API Key Created</h3>
        <p className="text-amber-400 text-sm mb-4">
          ⚠️ Save these keys now. The private key will not be shown again.
        </p>

        <div className="mb-4">
          <label className="block text-gray-400 text-xs mb-1">
            API Key (for authentication)
          </label>
          <div className="flex gap-2">
            <code className="flex-1 bg-gray-950 border border-gray-700 rounded-lg p-2 text-cyan-400 text-xs break-all font-mono">
              {apiKey || 'Loading...'}
            </code>
            {apiKey && (
              <button
                onClick={() => copyToClipboard(apiKey, 'apiKey')}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-xs transition-colors whitespace-nowrap"
              >
                {copiedField === 'apiKey' ? '✓ Copied!' : 'Copy'}
              </button>
            )}
          </div>
        </div>

        {publicKey && (
          <div className="mb-4">
            <label className="block text-gray-400 text-xs mb-1">
              Public Key (for verification)
            </label>
            <div className="flex gap-2">
              <code className="flex-1 bg-gray-950 border border-gray-700 rounded-lg p-2 text-green-400 text-xs break-all font-mono">
                {publicKey}
              </code>
              <button
                onClick={() => copyToClipboard(publicKey, 'publicKey')}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-xs transition-colors whitespace-nowrap"
              >
                {copiedField === 'publicKey' ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {privateKey && (
          <div className="mb-4">
            <label className="block text-amber-400 text-xs mb-1">
              ⚠️ Private Key (for signing - SAVE NOW)
            </label>
            <div className="flex gap-2">
              <code className="flex-1 bg-gray-950 border border-amber-700 rounded-lg p-2 text-amber-400 text-xs break-all font-mono">
                {privateKey}
              </code>
              <button
                onClick={() => copyToClipboard(privateKey, 'privateKey')}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-white text-xs transition-colors whitespace-nowrap"
              >
                {copiedField === 'privateKey' ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-amber-500 text-xs mt-1">
              This private key will never be shown again. Store it securely.
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full text-gray-400 hover:text-white text-sm transition-colors mt-2"
        >
          Close
        </button>
      </div>
    </div>
  );
}
