'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  Bell, 
  User, 
  ChevronDown,
  LogOut,
  Settings,
  Search
} from 'lucide-react';
import { Profile } from '@/types';
import { signOut } from '@/lib/actions/auth';
import { createClient } from '@/lib/supabase/client';

interface AdminTopbarProps {
  profile: Profile;
  onMenuClick: () => void;
}

const pageTitles: Record<string, string> = {
  '/admin': 'Overview',
  '/admin/orders': 'Orders Management',
  '/admin/maintenance': 'Maintenance Requests',
  '/admin/products': 'Product Catalog',
  '/admin/categories': 'Categories',
  '/admin/users': 'User Management',
};

export default function AdminTopbar({ profile, onMenuClick }: AdminTopbarProps) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const supabase = createClient();

  const getPageTitle = () => {
    return pageTitles[pathname] || 'Admin Dashboard';
  };

  useEffect(() => {
    const fetchPendingCounts = async () => {
      // Pending maintenance requests
      const { count: maintenanceCount } = await supabase
        .from('maintenance_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDING');

      // Unpaid orders (or similar "new" status if applicable)
      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'NOT_DONE');

      setPendingCount((maintenanceCount || 0) + (orderCount || 0));
    };

    fetchPendingCounts();
    const interval = setInterval(fetchPendingCounts, 60000); // Every 60s
    return () => clearInterval(interval);
  }, [supabase]);

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-500"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800 hidden sm:block">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Search - Placeholder for now */}
        <div className="hidden md:flex items-center bg-gray-100 rounded-xl px-3 py-1.5 border border-transparent focus-within:border-orange-500 transition-all">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none focus:ring-0 text-sm w-48"
          />
        </div>

        {/* Notifications */}
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg relative">
          <Bell size={22} />
          {pendingCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
              {pendingCount > 99 ? '99+' : pendingCount}
            </span>
          )}
        </button>

        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 md:p-1.5 hover:bg-gray-100 rounded-xl transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold border border-orange-200">
              {profile.full_name?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-start">
              <p className="text-xs font-bold text-gray-800 leading-none mb-0.5">{profile.full_name}</p>
              <p className="text-[10px] text-gray-500 uppercase leading-none">{profile.role}</p>
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-800">{profile.full_name}</p>
                  <p className="text-xs text-gray-500 uppercase">{profile.role}</p>
                </div>
                
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <User size={18} className="text-gray-400" />
                  <span>My Profile</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <Settings size={18} className="text-gray-400" />
                  <span>Settings</span>
                </button>
                
                <div className="h-px bg-gray-100 my-2" />
                
                <button 
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} className="text-red-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
