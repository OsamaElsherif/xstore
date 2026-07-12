'use client';

import { useState } from 'react';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { updateWhatsappOptIn } from '@/lib/actions/profile';
import { toLocalDigits } from '@/lib/utils/phone';
import { useLanguage } from '@/contexts/LanguageContext';

export function WhatsAppPreferences({
  initialOptIn,
  initialPhone,
}: {
  initialOptIn: boolean;
  initialPhone: string | null;
}) {
  const { language, t } = useLanguage();
  const [optIn, setOptIn] = useState(initialOptIn);
  const [phone, setPhone] = useState(
    initialPhone ? toLocalDigits(initialPhone) : ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isMsgSent, setIsMsgSent] = useState(false);

  const handleSave = async () => {
    if (optIn && !phone) return;
    setIsSaving(true);
    await updateWhatsappOptIn({
      whatsapp_opted_in: optIn,
      whatsapp_phone: optIn ? phone : null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setIsSaving(false);
  };

  return (
    <div className="space-y-4 p-6 bg-white rounded-2xl border border-gray-100">
      <h3 className="font-bold text-gray-800">
        {t('whatsappPrefTitle')}
      </h3>

      <div className="space-y-3">
        <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
          optIn
            ? 'border-green-400 bg-green-50/50'
            : 'border-gray-200'
        }`}>
          <input
            type="radio"
             checked={optIn}
             onChange={() => {
               setOptIn(true);
               setIsMsgSent(false);
             }}
             className="accent-green-500"
          />
          <span className="text-sm font-medium text-gray-800">
            {t('whatsappPrefReceive')}
          </span>
        </label>

        <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
          !optIn
            ? 'border-red-400 bg-red-50/50'
            : 'border-gray-200'
        }`}>
          <input
            type="radio"
             checked={!optIn}
             onChange={() => {
               setOptIn(false);
               setPhone('');
               setIsMsgSent(false);
             }}
             className="accent-red-500"
          />
          <span className="text-sm font-medium text-gray-800">
            {t('whatsappPrefDoNotReceive')}
          </span>
        </label>
      </div>

      {optIn && (
        <div className="space-y-1.5 animate-in fade-in duration-200">
          <label className="text-sm font-medium text-gray-700">
            {t('whatsappPhone')}
          </label>
          <PhoneInput value={phone} onChange={setPhone} />
        </div>
      )}

      {optIn && (
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl animate-in fade-in duration-200 space-y-3">
          <p className="text-xs text-blue-700">
            {t('whatsappInfoNote')}
          </p>
          <a
            href={`https://wa.me/+201039142008?text=${language === 'ar' ? '%D8%A7%D8%B4%D8%B9%D8%A7%D8%B1' : 'Notification'}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMsgSent(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl transition-colors w-full text-center"
          >
            {t('whatsappMeAction')}
          </a>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={isSaving || (optIn && !phone) || (optIn && !isMsgSent)}
        className="w-full py-2.5 bg-brand-dark text-brand-light hover:bg-brand-orange hover:text-brand-dark transition-colors font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saved ? t('saved') : isSaving ? t('saving') : t('savePreferences')}
      </button>
    </div>
  );
}
export default WhatsAppPreferences;
