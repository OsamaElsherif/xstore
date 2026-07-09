import { getCurrentProfile } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import CreateMaintenanceForm from '@/components/admin/maintenance/CreateMaintenanceForm';

export default async function NewMaintenancePage() {
  const profile = await getCurrentProfile();
  
  if (!profile || !['ADMIN', 'CASHIER', 'ORDER_RECEIVER'].includes(profile.role)) {
    redirect('/admin');
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">New Maintenance Request</h1>
        <p className="text-gray-500 font-medium">Log a new maintenance or repair job for a customer.</p>
      </div>
      
      <CreateMaintenanceForm />
    </div>
  );
}
