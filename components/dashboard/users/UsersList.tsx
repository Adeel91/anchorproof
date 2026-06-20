// components/dashboard/users/UsersList.tsx
'use client';

import { useState, useEffect } from 'react';
import { Users, Mail, Calendar, AlertCircle, User, UserPlus } from 'lucide-react';

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
      <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${styles[role] || styles.viewer}`}>
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

  const getUserInitials = (user: User) => {
    if (user.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user.email.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 sm:p-6">
        <div className="animate-pulse space-y-3 sm:space-y-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-slate-800 rounded-full" />
            <div className="flex-1">
              <div className="h-3 sm:h-4 bg-slate-800 rounded w-24 sm:w-32" />
              <div className="h-2 sm:h-3 bg-slate-800 rounded w-32 sm:w-48 mt-1 sm:mt-2" />
            </div>
          </div>
          <div className="border-t border-slate-800/50 pt-3 sm:pt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 sm:gap-4 py-2 sm:py-3">
                <div className="h-7 w-7 sm:h-8 sm:w-8 bg-slate-800 rounded-full" />
                <div className="flex-1">
                  <div className="h-2 sm:h-3 bg-slate-800 rounded w-20 sm:w-24" />
                  <div className="h-2 bg-slate-800 rounded w-24 sm:w-32 mt-1 sm:mt-2" />
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
      <div className="bg-slate-900/50 border border-red-500/20 rounded-xl p-6 sm:p-8 text-center">
        <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 mx-auto mb-3 sm:mb-4" />
        <p className="text-base sm:text-lg font-medium text-white">Error Loading Users</p>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 sm:mt-2">{error}</p>
        <button
          onClick={fetchUsers}
          className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs sm:text-sm font-medium text-white transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-8 sm:p-12 text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <UserPlus className="w-6 h-6 sm:w-8 sm:h-8 text-slate-500" />
        </div>
        <p className="text-base sm:text-lg font-medium text-slate-400">No users yet</p>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Users will appear here once they join</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">Team Members</h3>
            <p className="text-[10px] sm:text-xs text-slate-500">{users.length} total user{users.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{users.filter(u => u.role === 'admin').length} Admin</span>
          </div>
          <span className="text-slate-700">•</span>
          <span>{users.filter(u => u.role === 'viewer').length} Viewer</span>
        </div>
      </div>

      {/* Users List */}
      <div className="divide-y divide-slate-800/30">
        {users.map((user) => (
          <div key={user.id} className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-slate-800/20 transition-colors group">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
                  <span className="text-xs sm:text-sm font-bold text-white">
                    {getUserInitials(user)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <p className="text-sm font-medium text-white truncate">
                      {user.name || 'Unnamed User'}
                    </p>
                    {getRoleBadge(user.role)}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-0.5 sm:mt-1">
                    <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                      <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="text-[10px] sm:text-xs text-slate-400 truncate max-w-[120px] sm:max-w-[180px] md:max-w-none">
                        {user.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="text-[10px] sm:text-xs text-slate-400 whitespace-nowrap">
                        Joined {formatDate(user.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-t border-slate-800/50 bg-slate-900/30">
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1.5 sm:gap-2">
          <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono">
            {users.length} user{users.length !== 1 ? 's' : ''} • Last updated {new Date().toLocaleDateString()}
          </span>
          <button
            onClick={fetchUsers}
            className="text-[9px] sm:text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}