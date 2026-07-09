'use client';

import React, { useState } from 'react';
import { 
  MoreVertical, 
  Shield, 
  Key, 
  UserMinus, 
  Loader2,
  Check,
  AlertTriangle,
  X
} from 'lucide-react';
import { Profile } from '@/types';
import { resetUserPassword, deactivateStaffAccount } from '@/lib/actions/users';

interface UserActionsMenuProps {
  user: Profile;
  currentUserProfile: Profile;
  onEditRole: (user: Profile) => void;
}

export default function UserActionsMenu({ 
  user, 
  currentUserProfile, 
  onEditRole 
}: UserActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetInput, setShowResetInput] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSelf = user.id === currentUserProfile.id;

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 chars');
      return;
    }

    setIsResetting(true);
    setError(null);
    try {
      const result = await resetUserPassword(user.id, newPassword);
      if (result.success) {
        setShowResetInput(false);
        setNewPassword('');
        setIsOpen(false);
      } else {
        setError(result.error || 'Failed to reset password');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeactivate = async () => {
    setIsDeactivating(true);
    setError(null);
    try {
      const result = await deactivateStaffAccount(user.id);
      if (result.success) {
        setShowDeactivateConfirm(false);
        setIsOpen(false);
      } else {
        setError(result.error || 'Failed to deactivate account');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsDeactivating(false);
    }
  };

  if (isSelf) {
    return (
      <div className="text-xs text-gray-400 font-medium italic">
        (You)
      </div>
    );
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => {
              setIsOpen(false);
              setShowResetInput(false);
              setShowDeactivateConfirm(false);
            }}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
            {!showResetInput && !showDeactivateConfirm && (
              <>
                <button 
                  onClick={() => {
                    onEditRole(user);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Shield size={18} className="text-gray-400" />
                  <span>Change Role</span>
                </button>
                <button 
                  onClick={() => setShowResetInput(true)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Key size={18} className="text-gray-400" />
                  <span>Reset Password</span>
                </button>
                <div className="h-px bg-gray-100 my-1" />
                <button 
                  onClick={() => setShowDeactivateConfirm(true)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <UserMinus size={18} className="text-red-400" />
                  <span>Deactivate Account</span>
                </button>
              </>
            )}

            {showResetInput && (
              <div className="px-4 py-2 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">New Password</p>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
                {error && <p className="text-[10px] text-red-500 font-medium">{error}</p>}
                <div className="flex gap-2">
                  <button 
                    onClick={handleResetPassword}
                    disabled={isResetting}
                    className="flex-1 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {isResetting ? <Loader2 className="animate-spin mx-auto" size={14} /> : 'Save'}
                  </button>
                  <button 
                    onClick={() => setShowResetInput(false)}
                    className="flex-1 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {showDeactivateConfirm && (
              <div className="px-4 py-3 space-y-3 text-center">
                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Deactivate Account?</p>
                  <p className="text-[10px] text-gray-500 leading-tight">This will immediately block all staff access for {user.full_name}.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={handleDeactivate}
                    disabled={isDeactivating}
                    className="w-full py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {isDeactivating ? <Loader2 className="animate-spin mx-auto" size={14} /> : 'Yes, Deactivate'}
                  </button>
                  <button 
                    onClick={() => setShowDeactivateConfirm(false)}
                    className="w-full py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
