'use client';

import { useState } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  apiKey: string | null;
  onClose: () => void;
}

export function ApiKeyModal({ isOpen, apiKey, onClose }: ApiKeyModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !apiKey) return null;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-bold text-white mb-2">API Key Created</h3>
        <p className="text-gray-400 text-sm mb-4">
          <span className="text-amber-400 font-medium">Important:</span> This is
          your secret key. Copy it now - it will not be shown again.
        </p>
        <div className="bg-gray-950 border border-gray-700 rounded-lg p-3 mb-4">
          <code className="text-cyan-400 text-sm break-all font-mono">
            {apiKey}
          </code>
        </div>
        <button
          onClick={copyToClipboard}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg mb-3 transition-colors"
        >
          {copied ? '✓ Copied!' : 'Copy to Clipboard'}
        </button>
        <button
          onClick={onClose}
          className="w-full text-gray-400 hover:text-white text-sm transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
