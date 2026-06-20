'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import { useDashboardData } from '@/providers/DashboardDataProvider';
import {
  Building2,
  Mail,
  Crown,
  Save,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export function Settings() {
  const { tenant, user, refetch } = useDashboardData();
  const [isSaving, setIsSaving] = useState(false);
  const [tenantName, setTenantName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const hasSetInitialName = useRef(false);

  useEffect(() => {
    if (tenant && !hasSetInitialName.current) {
      hasSetInitialName.current = true;
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
      await refetch();

      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Failed to update tenant:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to save settings'
      );
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
    <div className="space-y-4 sm:space-y-6 mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Settings</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage your tenant and account settings
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>All changes are audited</span>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">
              Tenant Settings
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-4 sm:mb-5">
            Update your tenant information
          </p>

          <div className="max-w-md">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Tenant Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={tenantName}
              onChange={(e) => {
                setTenantName(e.target.value);
                setError(null);
                setSuccess(null);
              }}
              className={`w-full px-3.5 py-2.5 bg-slate-800/50 border rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all ${
                error
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-slate-700 focus:border-indigo-500'
              }`}
              placeholder="Enter tenant name"
            />
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <p className="text-[10px] text-slate-500">
                This name will appear across your tenant dashboard
              </p>
              {tenantName !== tenant.name && tenantName.trim() && (
                <span className="text-[10px] text-amber-400 font-mono">
                  * Unsaved changes
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Tenant Details</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4 sm:mb-5">
            Read-only tenant information
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-slate-800/30 rounded-lg p-3 sm:p-4 border border-slate-700/30">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  Email Domain
                </span>
              </div>
              <p className="text-sm text-white font-mono truncate">
                {tenant.emailDomain}
              </p>
            </div>

            <div className="bg-slate-800/30 rounded-lg p-3 sm:p-4 border border-slate-700/30">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  Subscription
                </span>
              </div>
              <p className="text-sm text-white font-semibold">
                {tenant.subscriptionTier.charAt(0).toUpperCase() +
                  tenant.subscriptionTier.slice(1)}
              </p>
            </div>

            <div className="bg-slate-800/30 rounded-lg p-3 sm:p-4 border border-slate-700/30">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  Admin Email
                </span>
              </div>
              <p className="text-sm text-white font-mono truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-slate-800/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-white">
                  Audit Trail Enabled
                </p>
                <p className="text-[10px] text-slate-500">
                  All changes to settings are logged in the audit trail
                </p>
              </div>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              Immutable & Verifiable
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-400 font-medium">Error</p>
            <p className="text-xs text-red-400/80">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-3 sm:p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-2.5">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-emerald-400 font-medium">Success</p>
            <p className="text-xs text-emerald-400/80">{success}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="text-xs text-slate-500 order-2 sm:order-1">
          {tenantName !== tenant.name && tenantName.trim() && (
            <span className="text-amber-400">You have unsaved changes</span>
          )}
          {tenantName === tenant.name && (
            <span className="text-slate-500">No changes to save</span>
          )}
        </div>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={
            isSaving || tenantName === tenant.name || !tenantName.trim()
          }
          className="px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto text-sm font-semibold order-1 sm:order-2"
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Settings
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
