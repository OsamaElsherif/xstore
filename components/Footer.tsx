'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-brand-dark text-brand-light pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand & About */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-orange rounded-md flex items-center justify-center font-display font-bold text-brand-dark">
                J
              </div>
              <span className="font-display font-bold text-xl tracking-tight">
                JACOB STORE
              </span>
            </Link>
            <p className="text-brand-gray/80 leading-relaxed text-sm">
              {t('footerDesc')}
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-brand-gray/80 text-sm">
                <MapPin size={18} className="text-brand-orange shrink-0 mt-0.5" />
                <span>Alexandria City, Egypt</span>
              </div>
              <div className="flex items-center gap-3 text-brand-gray/80 text-sm">
                <Phone size={18} className="text-brand-orange shrink-0" />
                <span dir="ltr">+20 10 11501507</span>
              </div>
            </div>
            <div className="flex gap-4 pt-2">
              <a href="#" className="text-brand-gray hover:text-brand-orange transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-brand-gray hover:text-brand-orange transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-brand-gray hover:text-brand-orange transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-brand-gray hover:text-brand-orange transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-brand-orange">{t('quickLinks')}</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-brand-gray hover:text-white transition-colors">{t('home')}</Link></li>
              <li><Link href="#" className="text-brand-gray hover:text-white transition-colors">{t('shop')}</Link></li>
              <li><Link href="/maintenance" className="text-brand-gray hover:text-white transition-colors">{t('maintenance')}</Link></li>
              <li><Link href="/about" className="text-brand-gray hover:text-white transition-colors">{t('aboutUs')}</Link></li>
              <li><Link href="/admin" className="text-brand-gray hover:text-brand-orange transition-colors">Admin Dashboard</Link></li>
              <li><Link href="#" className="text-brand-gray hover:text-white transition-colors">{t('contact')}</Link></li>
              <li><Link href="#" className="text-brand-gray hover:text-white transition-colors">{t('faq')}</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-brand-orange">{t('customerService')}</h4>
            <ul className="space-y-4">
              <li><Link href="/track?type=order" className="text-brand-gray hover:text-white transition-colors">{t('trackOrder')}</Link></li>
              <li><Link href="/track?type=maintenance" className="text-brand-gray hover:text-white transition-colors">Track Repair</Link></li>
              <li><Link href="/maintenance" className="text-brand-gray hover:text-white transition-colors">Request Maintenance</Link></li>
              <li><Link href="#" className="text-brand-gray hover:text-white transition-colors">{t('shippingPolicy')}</Link></li>
              <li><Link href="#" className="text-brand-gray hover:text-white transition-colors">{t('returns')}</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-brand-orange">{t('newsletter')}</h4>
            <p className="text-brand-gray/80 text-sm mb-4">
              {t('newsletterDesc')}
            </p>
            <form className="flex flex-col gap-3">
              <div className="relative">
                <Mail className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-brand-gray" size={18} />
                <input 
                  type="email" 
                  placeholder={t('enterEmail')} 
                  className="w-full bg-brand-light/10 border border-brand-gray/20 rounded-lg py-3 px-4 ltr:pl-10 rtl:pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange text-brand-light placeholder:text-brand-gray/60"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-brand-orange text-brand-dark font-bold py-3 rounded-lg hover:bg-opacity-90 transition-colors"
              >
                {t('subscribe')}
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-brand-gray/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-brand-gray/60 text-sm">
            &copy; {new Date().getFullYear()} JACOB STORE. {t('allRightsReserved')}
          </p>
          <div className="flex gap-4 text-sm text-brand-gray/60">
            <Link href="#" className="hover:text-brand-orange transition-colors">{t('termsOfService')}</Link>
            <Link href="#" className="hover:text-brand-orange transition-colors">{t('privacyPolicy')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
