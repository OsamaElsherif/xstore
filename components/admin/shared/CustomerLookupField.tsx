'use client';

import React, { useState, useEffect } from 'react';
import { Search, User, Mail, Phone, CheckCircle2, UserPlus, Loader2, UserCircle2 } from 'lucide-react';
import { checkCustomerExists } from '@/lib/actions/customers';
import { PhoneInput } from '@/components/ui/PhoneInput';

interface CustomerLookupFieldProps {
  onResolved: (customer: { full_name: string; phone: string; email?: string; exists: boolean } | null) => void;
}

export default function CustomerLookupField({ onResolved }: CustomerLookupFieldProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [lookupStatus, setLookupStatus] = useState<'idle' | 'existing' | 'new' | 'guest'>('idle');
  const [foundName, setFoundName] = useState<string | null>(null);

  const handleLookup = async () => {
    if (!email) {
      setLookupStatus('guest');
      onResolved({ full_name: fullName, phone, email: undefined, exists: false });
      return;
    }

    setIsChecking(true);
    try {
      const result = await checkCustomerExists(email);
      if (result.exists) {
        setLookupStatus('existing');
        setFoundName(result.full_name || null);
        if (result.full_name) setFullName(result.full_name);
        onResolved({ full_name: result.full_name || fullName, phone, email, exists: true });
      } else {
        setLookupStatus('new');
        setFoundName(null);
        onResolved({ full_name: fullName, phone, email, exists: false });
      }
    } catch (error) {
      console.error('Lookup failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // Reset status when email changes to force a re-lookup
  useEffect(() => {
    setLookupStatus('idle');
  }, [email]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email - Primary Lookup */}
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-2 px-1 flex items-center gap-2">
            <Mail size={16} className="text-gray-400" />
            Email Address (for Account Lookup)
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="email"
                placeholder="customer@email.com (Leave blank for Guest)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
            <button
              type="button"
              onClick={handleLookup}
              disabled={isChecking}
              className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isChecking ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
              <span>Confirm</span>
            </button>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 px-1 flex items-center gap-2">
            <User size={16} className="text-gray-400" />
            Full Name*
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Ahmed Mohamed"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              onResolved(null); // Force re-confirm if name changes manually after confirm
            }}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 px-1 flex items-center gap-2">
            <Phone size={16} className="text-gray-400" />
            Phone Number*
          </label>
          <PhoneInput
            required
            placeholder="1012345678"
            value={phone}
            onChange={(phoneValue) => {
              setPhone(phoneValue);
              onResolved(null);
            }}
            className="bg-gray-50"
          />
        </div>
      </div>

      {/* Lookup Status Feedback */}
      {lookupStatus !== 'idle' && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200 ${
          lookupStatus === 'existing' ? 'bg-green-50 border-green-100 text-green-800' :
          lookupStatus === 'new' ? 'bg-blue-50 border-blue-100 text-blue-800' :
          'bg-gray-50 border-gray-200 text-gray-600'
        }`}>
          {lookupStatus === 'existing' && (
            <>
              <CheckCircle2 className="text-green-500" size={24} />
              <div>
                <p className="text-sm font-bold">Existing account found: {foundName}</p>
                <p className="text-xs opacity-80">This order will be linked to their profile.</p>
              </div>
            </>
          )}
          {lookupStatus === 'new' && (
            <>
              <UserPlus className="text-blue-500" size={24} />
              <div>
                <p className="text-sm font-bold">New account will be created</p>
                <p className="text-xs opacity-80">A password will be generated for {email}.</p>
              </div>
            </>
          )}
          {lookupStatus === 'guest' && (
            <>
              <UserCircle2 className="text-gray-400" size={24} />
              <div>
                <p className="text-sm font-bold">Placing order as Guest</p>
                <p className="text-xs opacity-80">No account will be created for this customer.</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
