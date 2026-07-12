'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { signUp } from '@/lib/actions/auth';
import { PhoneInput } from '@/components/ui/PhoneInput';

type SignupStep = 'credentials' | 'whatsapp';

export default function Signup() {
  const { language, t } = useLanguage();
  const [step, setStep] = useState<SignupStep>('credentials');

  // Step 1 data
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 data
  const [optIn, setOptIn] = useState<boolean | null>(null); // null = not chosen yet
  const [waPhone, setWaPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 → Step 2
  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName || !email || !password) return;
    if (password.length < 8) {
      setError(t('passwordLengthError'));
      return;
    }
    setStep('whatsapp');
  };

  // Final submit
  const handleSubmit = async () => {
    if (optIn === null) {
      setError(t('notChosenError'));
      return;
    }
    if (optIn && !waPhone) {
      setError(t('enterWhatsAppPhoneError'));
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set('fullName', fullName);
    formData.set('email', email);
    formData.set('password', password);
    formData.set('whatsapp_opt_in', String(optIn));
    formData.set('whatsapp_phone', optIn ? waPhone : '');

    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-brand-light/30">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-brand-gray/10">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-brand-orange rounded-xl flex items-center justify-center font-display font-bold text-brand-dark mx-auto mb-4 text-2xl">
              J
            </div>
            <h1 className="text-2xl font-display font-bold text-brand-dark mb-2">
              {t('welcomeTitleSignup')}
            </h1>
            <p className="text-brand-gray text-sm">
              {t('welcomeSubtitleSignup')}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                step === 'credentials'
                  ? 'bg-brand-dark text-white'
                  : 'bg-green-500 text-white'
              }`}>
                {step === 'credentials' ? '1' : '✓'}
              </div>
              <span className={`text-xs font-semibold ${
                step === 'credentials' ? 'text-brand-dark font-bold' : 'text-brand-gray'
              }`}>
                {t('accountInfo')}
              </span>
            </div>
            <div className={`flex-1 h-0.5 ${
              step === 'whatsapp' ? 'bg-brand-dark' : 'bg-gray-200'
            }`} />
            <div className="flex items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                step === 'whatsapp'
                  ? 'bg-brand-dark text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}>
                2
              </div>
              <span className={`text-xs font-semibold ${
                step === 'whatsapp' ? 'text-brand-dark font-bold' : 'text-gray-400'
              }`}>
                {t('notifications')}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-100 text-red-700 text-sm font-medium border border-red-200">
              {error}
            </div>
          )}

          {/* STEP 1: CREDENTIALS */}
          {step === 'credentials' && (
            <form onSubmit={handleStep1} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-1.5">
                  {t('fullName')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 ltr:left-0 rtl:right-0 ltr:pl-3 rtl:pr-3 flex items-center pointer-events-none text-brand-gray">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-brand-light/20 border border-brand-gray/20 rounded-xl py-2.5 ltr:pl-10 rtl:pr-10 ltr:pr-4 rtl:pl-4 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"
                    placeholder="Ahmed Mohamed"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-dark mb-1.5">
                  {t('email')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 ltr:left-0 rtl:right-0 ltr:pl-3 rtl:pr-3 flex items-center pointer-events-none text-brand-gray">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-brand-light/20 border border-brand-gray/20 rounded-xl py-2.5 ltr:pl-10 rtl:pr-10 ltr:pr-4 rtl:pl-4 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"
                    placeholder="ahmed@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-dark mb-1.5">
                  {t('password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 ltr:left-0 rtl:right-0 ltr:pl-3 rtl:pr-3 flex items-center pointer-events-none text-brand-gray">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-brand-light/20 border border-brand-gray/20 rounded-xl py-2.5 ltr:pl-10 rtl:pr-10 ltr:pr-10 rtl:pl-10 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 ltr:right-0 rtl:left-0 ltr:pr-3 rtl:pl-3 flex items-center text-brand-gray hover:text-brand-dark transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-dark text-brand-light hover:bg-brand-orange hover:text-brand-dark transition-colors py-3 rounded-xl font-medium flex items-center justify-center gap-2 group mt-2"
              >
                {t('continue')}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform rtl:rotate-180" />
              </button>
            </form>
          )}

          {/* STEP 2: WHATSAPP OPT-IN */}
          {step === 'whatsapp' && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <p className="text-2xl">📱</p>
                <h3 className="font-bold text-gray-800 text-lg">
                  {t('whatsappNotificationsTitle')}
                </h3>
                <p className="text-sm text-gray-500">
                  {t('whatsappNotificationsQuestionAr')}
                </p>
                <p className="text-sm text-gray-500">
                  {t('whatsappNotificationsQuestionEn')}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {/* Agree */}
                <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  optIn === true
                    ? 'border-green-500 bg-green-50/50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="whatsapp_opt_in"
                    value="true"
                    checked={optIn === true}
                    onChange={() => setOptIn(true)}
                    className="mt-0.5 accent-green-500"
                  />
                  <div>
                    <p className="font-bold text-gray-800 text-sm">
                      {t('whatsappAgree')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('whatsappAgreeDesc')}
                    </p>
                  </div>
                </label>

                {/* Disagree */}
                <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  optIn === false
                    ? 'border-red-400 bg-red-50/50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="whatsapp_opt_in"
                    value="false"
                    checked={optIn === false}
                    onChange={() => {
                      setOptIn(false);
                      setWaPhone('');
                    }}
                    className="mt-0.5 accent-red-500"
                  />
                  <div>
                    <p className="font-bold text-gray-800 text-sm">
                      {t('whatsappDisagree')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('whatsappDisagreeDesc')}
                    </p>
                  </div>
                </label>
              </div>

              {/* Phone number field — only shown when agreed */}
              {optIn === true && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <label className="text-sm font-medium text-gray-700">
                    {t('whatsappNumberLabel')}
                  </label>
                  <PhoneInput
                    value={waPhone}
                    onChange={setWaPhone}
                    required
                    placeholder="1012345678"
                  />
                  <p className="text-xs text-brand-gray">
                    {t('whatsappNumberDesc')}
                  </p>
                </div>
              )}

              {/* Info note */}
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
                <p className="text-xs text-blue-700">
                  {t('whatsappInfoNote')}
                </p>
                <a
                  href={`https://wa.me/+201039142008?text=${language === 'ar' ? '%D8%A7%D8%B4%D8%B9%D8%A7%D8%B1' : 'Notification'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl transition-colors w-full text-center"
                >
                  {t('whatsappMeAction')}
                </a>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('credentials')}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {t('back')}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || optIn === null}
                  className="flex-1 py-2.5 bg-brand-dark text-brand-light font-bold rounded-xl hover:bg-brand-orange hover:text-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? t('creatingAccount') : t('createAccountChecked')}
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 text-center text-sm text-brand-gray">
            {t('alreadyHaveAccount')}{' '}
            <Link href="/login" className="text-brand-orange font-medium hover:underline">
              {t('signIn')}
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
