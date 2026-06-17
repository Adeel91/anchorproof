'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { useDashboardData } from '@/providers/DashboardDataProvider';

export function Settings() {
  const { tenant, user, refetch } = useDashboardData();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    autoVerify: true,
    retentionDays: 365,
    notifications: true,
    twoFactorAuth: false,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save settings to your API
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refetch(); // Refresh data after save
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (!tenant || !user) {
    return (
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-8 text-center">
        <p className="text-gray-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Tenant Name</label>
            <input
              type="text"
              value={tenant.name}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              disabled
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Email Domain</label>
            <input
              type="text"
              value={tenant.emailDomain}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              disabled
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Subscription Tier</label>
            <input
              type="text"
              value={tenant.subscriptionTier}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              disabled
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Admin Email</label>
            <input
              type="text"
              value={user.email}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              disabled
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Verification Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Auto-Verify on Save</p>
              <p className="text-xs text-gray-500">Automatically verify conversations when saved</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, autoVerify: !settings.autoVerify })}
              className={`w-12 h-6 rounded-full transition-colors ${settings.autoVerify ? 'bg-indigo-600' : 'bg-gray-700'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.autoVerify ? 'translate-x-7' : 'translate-x-1'} mt-1`} />
            </button>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Data Retention (Days)</label>
            <input
              type="number"
              value={settings.retentionDays}
              onChange={(e) => setSettings({ ...settings, retentionDays: parseInt(e.target.value) })}
              className="w-32 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[10px] text-gray-500 mt-1">Conversations older than this will be automatically archived</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Security</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Two-Factor Authentication</p>
              <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, twoFactorAuth: !settings.twoFactorAuth })}
              className={`w-12 h-6 rounded-full transition-colors ${settings.twoFactorAuth ? 'bg-indigo-600' : 'bg-gray-700'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.twoFactorAuth ? 'translate-x-7' : 'translate-x-1'} mt-1`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Notifications</p>
              <p className="text-xs text-gray-500">Email notifications for verification events</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
              className={`w-12 h-6 rounded-full transition-colors ${settings.notifications ? 'bg-indigo-600' : 'bg-gray-700'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.notifications ? 'translate-x-7' : 'translate-x-1'} mt-1`} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
                      variant="primary"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-6 py-2.5 whitespace-nowrap"
                    >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}