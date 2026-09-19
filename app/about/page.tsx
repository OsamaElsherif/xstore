'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Smartphone, Wrench, Wind, ShieldCheck, MapPin, Phone, Store, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function About() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen flex flex-col bg-brand-light/30">
      <Navbar />
      
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 lg:py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-dark mb-6">About XStore</h1>
          <p className="text-lg text-brand-black leading-relaxed">
            Welcome to XStore, a premier destination engineered for scalable commerce. 
            We are dedicated to providing top-quality products, expert operational services, 
            and an exceptional user experience tailored for localized retail workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* Speciality 1: Mobile Phones & Covers */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-gray/10 text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-brand-light text-brand-orange rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Smartphone size={32} />
            </div>
            <h3 className="text-xl font-bold text-brand-dark mb-4">Mobile Phones & Covers</h3>
            <p className="text-brand-black">
              Discover the latest smartphones from top brands. We also specialize in a massive selection of premium covers, screen protectors, and accessories to keep your device safe and stylish.
            </p>
          </div>

          {/* Speciality 2: Maintenance Services */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-gray/10 text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-brand-light text-brand-orange rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Wrench size={32} />
            </div>
            <h3 className="text-xl font-bold text-brand-dark mb-4">Expert Maintenance</h3>
            <p className="text-brand-black">
              Is your phone damaged or malfunctioning? Our certified technicians provide fast, reliable, and affordable repair and maintenance services for all major mobile phone brands.
            </p>
          </div>

          {/* Speciality 3: Vapes & Liquids */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-gray/10 text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-brand-light text-brand-orange rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Wind size={32} />
            </div>
            <h3 className="text-xl font-bold text-brand-dark mb-4">Vapes & E-Liquids</h3>
            <p className="text-brand-black">
              Explore our extensive collection of high-quality vapes, pod systems, and a wide variety of premium e-liquids in every flavor imaginable.
            </p>
          </div>
        </div>

        {/* Our Mission */}
        <div className="bg-brand-dark text-brand-light rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <h2 className="text-3xl font-display font-bold mb-4">Our Mission</h2>
            <p className="text-brand-gray/80 leading-relaxed mb-6">
              At Jacob Store, we believe in combining technology with lifestyle. Whether you&apos;re looking to upgrade your smartphone, fix a broken screen, or find your new favorite vape flavor, our knowledgeable staff is here to help you make the best choice.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <ShieldCheck className="text-brand-orange" size={24} />
                <span>100% Authentic Products</span>
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="text-brand-orange" size={24} />
                <span>Professional Repair Warranty</span>
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="text-brand-orange" size={24} />
                <span>Expert Customer Support</span>
              </li>
            </ul>
          </div>
          <div className="flex-1 w-full relative aspect-video md:aspect-square max-h-[400px] rounded-2xl overflow-hidden">
            <Image 
              src="https://images.unsplash.com/photo-1601597111158-2fceff292cdc?q=80&w=1000&auto=format&fit=crop" 
              alt="Store interior" 
              fill 
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* How Our Service Works */}
        <div className="mt-20">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-display font-bold text-brand-dark mb-4">How Our Maintenance Service Works</h2>
            <p className="text-lg text-brand-black">We offer two convenient ways to get your devices repaired and maintained.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-brand-gray/10 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 ltr:right-0 rtl:left-0 w-32 h-32 bg-brand-light/50 rounded-bl-full -z-10"></div>
              <div className="w-16 h-16 bg-brand-orange text-brand-dark rounded-2xl flex items-center justify-center mb-6">
                <Store size={32} />
              </div>
              <h3 className="text-2xl font-bold text-brand-dark mb-4">1. Visit Our Store</h3>
              <p className="text-brand-black leading-relaxed">
                Prefer face-to-face service? Bring your device directly to our physical store in Alexandria. Our expert technicians will diagnose the issue on the spot and provide fast, reliable repairs while you wait or browse our products.
              </p>
            </div>
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-brand-gray/10 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 ltr:right-0 rtl:left-0 w-32 h-32 bg-brand-light/50 rounded-bl-full -z-10"></div>
              <div className="w-16 h-16 bg-brand-orange text-brand-dark rounded-2xl flex items-center justify-center mb-6">
                <Truck size={32} />
              </div>
              <h3 className="text-2xl font-bold text-brand-dark mb-4">2. Delivery Service</h3>
              <p className="text-brand-black leading-relaxed mb-6">
                Can&apos;t make it to the store? No problem. Simply fill out our maintenance request form with full information about your device and the kind of problem you&apos;re facing. Our delivery representative will come to your location to pick it up, and we&apos;ll return it to you once it&apos;s fully repaired.
              </p>
              <Link href="/maintenance" className="inline-block bg-brand-dark text-brand-light px-6 py-3 rounded-xl font-bold hover:bg-brand-orange hover:text-brand-dark transition-colors">
                Request Maintenance
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-20 bg-white rounded-3xl p-8 md:p-12 border border-brand-gray/10 shadow-sm text-center">
          <h2 className="text-3xl font-display font-bold text-brand-dark mb-8">Visit Our Store</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="flex flex-col items-center p-6 bg-brand-light/30 rounded-2xl">
              <div className="w-12 h-12 bg-white text-brand-orange rounded-full flex items-center justify-center mb-4 shadow-sm">
                <MapPin size={24} />
              </div>
              <h4 className="font-bold text-brand-dark mb-2">Location</h4>
              <p className="text-brand-black">City<br />Country</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-brand-light/30 rounded-2xl">
              <div className="w-12 h-12 bg-white text-brand-orange rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Phone size={24} />
              </div>
              <h4 className="font-bold text-brand-dark mb-2">Phone Number</h4>
              <p className="text-brand-black" dir="ltr">+00 00 00000000</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
