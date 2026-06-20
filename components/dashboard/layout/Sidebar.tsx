'use client';

import { useMemo, useState, useEffect } from 'react';
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
  Users,
  FileBarChart,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { 
    id: 'overview', 
    label: 'Overview', 
    icon: LayoutDashboard, 
    href: '/dashboard',
    description: 'Dashboard overview',
  },
  { 
    id: 'conversations', 
    label: 'Conversations', 
    icon: MessageSquare, 
    href: '/dashboard/conversations',
    description: 'All conversations',
  },
  { 
    id: 'audit', 
    label: 'Audit Log', 
    icon: FileText, 
    href: '/dashboard/audit',
    description: 'Audit trail',
  },
  { 
    id: 'reports', 
    label: 'Reports', 
    icon: FileBarChart, 
    href: '/dashboard/reports',
    description: 'Compliance & conversation reports',
  },
  { 
    id: 'users', 
    label: 'Users', 
    icon: Users, 
    href: '/dashboard/users',
    description: 'Team members',
  },
  { 
    id: 'keys', 
    label: 'API Keys', 
    icon: Key, 
    href: '/dashboard/keys',
    description: 'API key management',
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: Settings, 
    href: '/dashboard/settings',
    description: 'Tenant settings',
  },
];

export function Sidebar({ tenantName }: { tenantName?: string }) {
  const pathname = usePathname();
  const { user } = useDashboardData();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

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

  // Mobile Toggle Button
  const MobileToggle = () => (
    <button
      onClick={() => setIsMobileOpen(!isMobileOpen)}
      className="lg:hidden fixed top-20 left-4 z-50 p-2 rounded-lg bg-[#0f0f1a] border border-slate-800/50 hover:bg-slate-800/50 transition-colors"
      aria-label="Toggle sidebar"
    >
      {isMobileOpen ? (
        <X className="w-5 h-5 text-slate-400" />
      ) : (
        <Menu className="w-5 h-5 text-slate-400" />
      )}
    </button>
  );

  // Overlay for mobile
  const Overlay = () => (
    <div
      className={`lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
        isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={() => setIsMobileOpen(false)}
    />
  );

  // Sidebar Content
  const SidebarContent = () => (
    <>
      {/* Tenant Section */}
      {tenantName && (
        <div className="px-4 py-3 border-b border-slate-800/50">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Tenant</p>
          <p className="text-sm font-medium text-white truncate">{tenantName}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {activeItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`group w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                item.isActive
                  ? 'bg-indigo-500/10 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.05)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
              title={item.description}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                item.isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
              }`} />
              <span className="flex-1">{item.label}</span>
              {item.isActive && (
                <span className="w-1 h-6 rounded-full bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800/50">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800/30 border border-slate-800/50 transition-colors hover:bg-slate-800/50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <span className="text-xs font-bold text-white">{getUserInitials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-white truncate">{getUserDisplayName}</p>
            <p className="text-[10px] text-slate-500 truncate">{userEmail}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <MobileToggle />

      {/* Overlay */}
      <Overlay />

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block fixed left-0 top-20 bottom-0 w-64 bg-[#0f0f1a] border-r border-slate-800/50 z-40 overflow-y-auto`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-20 left-0 bottom-0 w-64 bg-[#0f0f1a] border-r border-slate-800/50 z-40 overflow-y-auto transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}