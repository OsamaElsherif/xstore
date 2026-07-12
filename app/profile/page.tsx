import { getCurrentProfile, getCurrentUser } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppPreferences from '@/components/account/WhatsAppPreferences';
import { Mail, Shield } from 'lucide-react';

export default async function Page() {
  const user = await getCurrentUser();
  const profile = await getCurrentProfile();

  if (!user || !profile) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen flex flex-col bg-brand-light/30">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-brand-orange text-brand-dark rounded-full flex items-center justify-center font-display font-bold text-2xl flex-shrink-0">
            {profile.full_name?.charAt(0).toUpperCase()}
          </div>
          <div className="text-center md:text-start flex-1 space-y-1">
            <h1 className="text-2xl font-bold text-gray-800">{profile.full_name}</h1>
            <p className="text-brand-gray text-sm flex items-center justify-center md:justify-start gap-2">
              <Mail size={16} />
              {user.email}
            </p>
            <p className="text-brand-gray text-sm flex items-center justify-center md:justify-start gap-2">
              <Shield size={16} />
              <span className="capitalize">{profile.role.toLowerCase()}</span>
            </p>
          </div>
        </div>

        <WhatsAppPreferences
          initialOptIn={profile.whatsapp_opted_in ?? false}
          initialPhone={profile.whatsapp_phone}
        />
      </div>
      <Footer />
    </main>
  );
}
