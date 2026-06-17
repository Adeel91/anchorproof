'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDashboardData } from '@/providers/DashboardDataProvider';
import {
  LayoutDashboard,
  MessageSquare,
  CheckCircle,
  FileText,
  Shield,
  Key,
  Settings,
} from 'lucide-react';

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'conversations', label: 'Conversations', icon: MessageSquare, href: '/dashboard/conversations' },
  { id: 'verification', label: 'Verification', icon: CheckCircle, href: '/dashboard/verification' },
  { id: 'audit', label: 'Audit Log', icon: FileText, href: '/dashboard/audit' },
  { id: 'compliance', label: 'Compliance Reports', icon: Shield, href: '/dashboard/compliance' },
  { id: 'keys', label: 'API Keys', icon: Key, href: '/dashboard/keys' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

export function Sidebar({ tenantName }: { tenantName?: string }) {
  const pathname = usePathname();
  const { user } = useDashboardData();

  const activeItems = useMemo(() => {
    return navItems.map((item) => ({
      ...item,
      isActive: item.href === '/dashboard' 
        ? pathname === '/dashboard'
        : pathname?.startsWith(item.href) || false,
    }));
  }, [pathname]);

  const getUserInitials = useMemo(() => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'A';
  }, [user?.name, user?.email]);

  const getUserDisplayName = useMemo(() => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'Admin';
  }, [user?.name, user?.email]);

  const userEmail = useMemo(() => {
    return user?.email || 'user@company.com';
  }, [user?.email]);

  return (
    <aside className="fixed left-0 top-20 bottom-0 w-64 bg-[#0f0f1a] border-r border-slate-800/50 z-40 overflow-y-auto">
      {tenantName && (
        <div className="px-4 py-3 border-b border-slate-800/50">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Tenant</p>
          <p className="text-sm font-medium text-white truncate">{tenantName}</p>
        </div>
      )}

      <nav className="p-3 space-y-1">
        {activeItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                item.isActive
                  ? 'bg-indigo-500/10 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.05)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${
                item.isActive ? 'text-indigo-400' : 'text-slate-500'
              }`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800/50">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800/30 border border-slate-800/50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <span className="text-xs font-bold text-white">{getUserInitials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-white truncate">{getUserDisplayName}</p>
            <p className="text-[10px] text-slate-500 truncate">{userEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}