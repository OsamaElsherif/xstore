'use client';

import React, { useState, useMemo } from 'react';
import { Profile, UserRole } from '@/types';
import { 
  Search, 
  UserPlus, 
  Users as UsersIcon, 
  ShieldCheck, 
  MoreVertical,
  Filter,
  Mail,
  Calendar
} from 'lucide-react';
import UserActionsMenu from './UserActionsMenu';
import CreateStaffForm from './CreateStaffForm';
import EditRoleModal from './EditRoleModal';

interface UserManagementProps {
  initialStaff: Profile[];
  initialAll: Profile[];
  currentUserProfile: Profile;
}

export default function UserManagement({ 
  initialStaff, 
  initialAll,
  currentUserProfile 
}: UserManagementProps) {
  const [activeTab, setActiveTab] = useState<'staff' | 'all'>('staff');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);

  const currentData = activeTab === 'staff' ? initialStaff : initialAll;

  const filteredUsers = useMemo(() => {
    return currentData.filter((user) => {
      const matchesSearch = 
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        // If we had email in profile, we'd check it here. 
        // For now, we'll just check full name.
        false;
      
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [currentData, searchQuery, roleFilter]);

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'CASHIER': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ORDER_RECEIVER': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header & Controls */}
      <div className="p-6 border-b border-gray-100 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('staff')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'staff' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Staff Accounts
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Users
            </button>
          </div>

          <button 
            onClick={() => setShowCreateForm(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 text-slate-900 font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
          >
            <UserPlus size={20} />
            Add Staff Member
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="CASHIER">Cashier</option>
              <option value="ORDER_RECEIVER">Order Receiver</option>
              <option value="CUSTOMER">Customer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Joined</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold border border-gray-200 group-hover:border-orange-200 group-hover:bg-orange-50 transition-colors">
                        {user.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{user.full_name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <ShieldCheck size={12} className={user.role === 'ADMIN' ? 'text-purple-500' : 'text-gray-400'} />
                          {user.role}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                      <Calendar size={14} className="text-gray-400" />
                      {new Date(user.created_at || '').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <UserActionsMenu 
                      user={user} 
                      currentUserProfile={currentUserProfile}
                      onEditRole={(user) => setEditingUser(user)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <UsersIcon size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium">No users found</p>
                    <p className="text-sm">Try adjusting your search or filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showCreateForm && (
        <CreateStaffForm onClose={() => setShowCreateForm(false)} />
      )}

      {editingUser && (
        <EditRoleModal 
          user={editingUser} 
          onClose={() => setEditingUser(null)} 
        />
      )}
    </div>
  );
}
