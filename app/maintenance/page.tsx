import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MaintenanceForm from '@/components/maintenance/MaintenanceForm';

export default function MaintenancePage() {
  return (
    <main className="min-h-screen flex flex-col bg-brand-light/30">
      <Navbar />
      <div className="flex-1 py-12 px-6">
        <MaintenanceForm />
      </div>
      <Footer />
    </main>
  );
}
