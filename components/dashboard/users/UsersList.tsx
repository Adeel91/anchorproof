// components/dashboard/users/UsersList.tsx
'use client';

import { useState, useEffect } from 'react';
import { Users, Mail, Calendar, AlertCircle } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  tenantId: string;
}

export function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/users/list');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError(error instanceof Error ? error.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      manager: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      viewer: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
    };
    const labels: Record<string, string> = {
      admin: 'Admin',
      manager: 'Manager',
      viewer: 'Viewer',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[role] || styles.viewer}`}>
        {labels[role] || role}
      </span>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-slate-800 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-slate-800 rounded w-32" />
              <div className="h-3 bg-slate-800 rounded w-48 mt-2" />
            </div>
          </div>
          <div className="border-t border-slate-800/50 pt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 py-3">
                <div className="h-8 w-8 bg-slate-800 rounded-full" />
                <div className="flex-1">
                  <div className="h-3 bg-slate-800 rounded w-24" />
                  <div className="h-2 bg-slate-800 rounded w-32 mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900/50 border border-red-500/20 rounded-xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-white">Error Loading Users</p>
        <p className="text-sm text-slate-400 mt-2">{error}</p>
        <button
          onClick={fetchUsers}
          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-12 text-center">
        <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-lg font-medium text-slate-400">No users yet</p>
        <p className="text-sm text-slate-500 mt-1">Users will appear here once they join</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">Team Members</h3>
            <p className="text-xs text-slate-500">{users.length} total users</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-800/30">
        {users.map((user) => (
          <div key={user.id} className="px-6 py-4 hover:bg-slate-800/20 transition-colors group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
                  <span className="text-sm font-bold text-white">
                    {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : user.email.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-white">
                      {user.name || 'Unnamed User'}
                    </p>
                    {getRoleBadge(user.role)}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs text-slate-400">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs text-slate-400">Joined {formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}