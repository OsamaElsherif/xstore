'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { signIn } from '@/lib/actions/auth';

export default function Login() {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    const result = await signIn(formData);
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
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-brand-orange rounded-xl flex items-center justify-center font-display font-bold text-brand-dark mx-auto mb-4 text-2xl">
              J
            </div>
            <h1 className="text-2xl font-display font-bold text-brand-dark mb-2">Welcome Back</h1>
            <p className="text-brand-gray text-sm">Sign in to continue to Jacob Store</p>
          </div>

          <form action={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-100 text-red-700 text-sm font-medium border border-red-200">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1.5">{t('email')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 ltr:left-0 rtl:right-0 ltr:pl-3 rtl:pr-3 flex items-center pointer-events-none text-brand-gray">
                  <User size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  className="w-full bg-brand-light/20 border border-brand-gray/20 rounded-xl py-2.5 ltr:pl-10 rtl:pr-10 ltr:pr-4 rtl:pl-4 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-brand-dark">{t('password')}</label>
                <Link href="#" className="text-xs text-brand-orange hover:underline font-medium">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 ltr:left-0 rtl:right-0 ltr:pl-3 rtl:pr-3 flex items-center pointer-events-none text-brand-gray">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
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
              disabled={isLoading}
              className="w-full bg-brand-dark text-brand-light hover:bg-brand-orange hover:text-brand-dark transition-colors py-3 rounded-xl font-medium flex items-center justify-center gap-2 group mt-2 disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : t('signIn')}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform rtl:rotate-180" />
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-brand-gray">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-brand-orange font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
