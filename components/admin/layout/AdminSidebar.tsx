'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Wrench,
  Package,
  FolderOpen,
  Users,
  LogOut,
  X,
  Store,
  Settings2,
  BarChart3,
  MessageSquare,
  Smartphone,
} from 'lucide-react';
import { Profile } from '@/types';
import { signOut } from '@/lib/actions/auth';

interface AdminSidebarProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  {
    section: 'Main',
    items: [
      { label: 'Overview', href: '/admin', icon: LayoutDashboard },
      { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
      { label: 'Maintenance', href: '/admin/maintenance', icon: Wrench },
    ],
  },
  {
    section: 'Catalog',
    items: [
      { label: 'Products', href: '/admin/products', icon: Package },
      { label: 'Categories', href: '/admin/categories', icon: FolderOpen },
    ],
  },
  {
    section: 'System',
    adminOnly: true,
    items: [
      { label: 'User Management', href: '/admin/users', icon: Users },
      { label: 'Settings', href: '/admin/settings', icon: Settings2 },
      { label: 'Ads Analytics', href: '/admin/analytics', icon: BarChart3 },
      { label: 'WhatsApp Templates', href: '/admin/whatsapp-templates', icon: MessageSquare },
      { label: 'WA Sessions', href: '/admin/whatsapp-sessions', icon: Smartphone },
    ],
  },
];

export default function AdminSidebar({ profile, isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <div className="bg-orange-500 p-1.5 rounded-lg">
              <Store size={20} className="text-slate-900" />
            </div>
            <span>Jacob Store</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-slate-800 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          {navItems.map((section) => {
            if (section.adminOnly && profile.role !== 'ADMIN') return null;

            return (
              <div key={section.section}>
                <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                  {section.section}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => onClose()}
                        className={`
                          flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group
                          ${active 
                            ? 'bg-orange-500 text-slate-900 font-bold shadow-lg shadow-orange-500/20' 
                            : 'hover:bg-slate-800 hover:text-white'
                          }
                        `}
                      >
                        <item.icon size={20} className={active ? 'text-slate-900' : 'text-slate-400 group-hover:text-white'} />
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-2xl mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-orange-500 font-bold border border-slate-600">
              {profile.full_name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{profile.full_name}</p>
              <p className="text-xs text-slate-500 truncate uppercase">{profile.role}</p>
            </div>
          </div>
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
