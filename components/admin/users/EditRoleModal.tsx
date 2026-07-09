'use client';

import React, { useState } from 'react';
import { X, Shield, Loader2, Check } from 'lucide-react';
import { Profile, UserRole } from '@/types';
import { updateUserRole } from '@/lib/actions/users';

interface EditRoleModalProps {
  user: Profile;
  onClose: () => void;
}

const roles: { label: string; value: UserRole; description: string }[] = [
  { 
    label: 'Admin', 
    value: 'ADMIN', 
    description: 'Full access to all settings, users, and business data.' 
  },
  { 
    label: 'Cashier', 
    value: 'CASHIER', 
    description: 'Can manage orders and process payments.' 
  },
  { 
    label: 'Order Receiver', 
    value: 'ORDER_RECEIVER', 
    description: 'Can manage maintenance requests and intake.' 
  },
  { 
    label: 'Customer', 
    value: 'CUSTOMER', 
    description: 'Standard customer access. No admin panel access.' 
  },
];

export default function EditRoleModal({ user, onClose }: EditRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (selectedRole === user.role) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await updateUserRole(user.id, selectedRole);
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Failed to update role');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-slate-900">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Change Role</h3>
                <p className="text-sm text-gray-500">{user.full_name}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-2xl text-gray-400 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl">
              {error}
            </div>
          )}

          <div className="space-y-3 mb-8">
            {roles.map((role) => (
              <button
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                className={`
                  w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all
                  ${selectedRole === role.value 
                    ? 'bg-purple-50 border-purple-200 ring-2 ring-purple-500/10' 
                    : 'bg-white border-gray-100 hover:border-purple-200 hover:bg-gray-50/50'
                  }
                `}
              >
                <div className={`
                  mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-all
                  ${selectedRole === role.value 
                    ? 'bg-purple-600 border-purple-600 shadow-sm shadow-purple-500/40' 
                    : 'bg-white border-gray-300'
                  }
                `}>
                  {selectedRole === role.value && <Check size={12} className="text-white" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${selectedRole === role.value ? 'text-purple-900' : 'text-gray-900'}`}>
                    {role.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {role.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-[2] py-3 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
