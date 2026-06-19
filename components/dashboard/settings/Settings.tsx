// components/dashboard/settings/Settings.tsx
'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { useDashboardData } from '@/providers/DashboardDataProvider';

export function Settings() {
  const { tenant, user, refetch } = useDashboardData();
  const [isSaving, setIsSaving] = useState(false);
  const [tenantName, setTenantName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (tenant) {
      setTenantName(tenant.name);
    }
  }, [tenant]);

  const handleSave = async () => {
    if (!tenantName.trim()) {
      setError('Tenant name is required');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/tenant/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tenantName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update tenant');
      }

      setSuccess('Tenant name updated successfully!');
      await refetch(); // Refresh data after save
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Failed to update tenant:', error);
      setError(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (!tenant || !user) {
    return (
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-8 text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Tenant Settings</h3>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Tenant Name</label>
            <input
              type="text"
              value={tenantName}
              onChange={(e) => {
                setTenantName(e.target.value);
                setError(null);
                setSuccess(null);
              }}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Enter tenant name"
            />
            <p className="text-[10px] text-slate-500 mt-1">This name will appear across your tenant dashboard</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/50">
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Email Domain</label>
            <input
              type="text"
              value={tenant.emailDomain}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-400 focus:outline-none cursor-not-allowed"
              disabled
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Subscription Tier</label>
            <input
              type="text"
              value={tenant.subscriptionTier.charAt(0).toUpperCase() + tenant.subscriptionTier.slice(1)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-400 focus:outline-none cursor-not-allowed"
              disabled
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Admin Email</label>
            <input
              type="text"
              value={user.email}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-400 focus:outline-none cursor-not-allowed"
              disabled
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
            {success}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isSaving || tenantName === tenant.name}
          className="px-6 py-2.5 whitespace-nowrap"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>
    </div>
  );
}