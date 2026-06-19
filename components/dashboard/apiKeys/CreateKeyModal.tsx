'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

interface CreateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
  isGenerating: boolean;
  existingNames?: string[];
}

export function CreateKeyModal({
  isOpen,
  onClose,
  onCreate,
  isGenerating,
  existingNames = [],
}: CreateKeyModalProps) {
  const [keyName, setKeyName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = keyName.trim();

    if (!trimmedName) {
      setError('Key name is required');
      return;
    }

    if (existingNames.includes(trimmedName)) {
      setError('A key with this name already exists');
      return;
    }

    setError('');
    await onCreate(trimmedName);
    setKeyName('');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyName(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-bold text-white mb-2">Create API Key</h3>
        <p className="text-gray-400 text-sm mb-4">
          Give your key a unique name to identify it later. This is a{' '}
          <span className="text-amber-400">secret key</span> - it will only be
          shown once.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-400 text-sm mb-2">Key Name</label>
            <input
              type="text"
              value={keyName}
              onChange={handleNameChange}
              placeholder="e.g., Production, Development, Staging"
              className={`w-full px-3 py-2 bg-gray-950 border rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 ${
                error ? 'border-red-500' : 'border-gray-700'
              }`}
              autoFocus
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              disabled={!keyName.trim() || isGenerating}
              className="flex-1"
            >
              {isGenerating ? 'Creating...' : 'Create Key'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setKeyName('');
                setError('');
                onClose();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}