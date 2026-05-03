import { getAllMaintenanceRequests } from '@/lib/actions/maintenance';
import { getCurrentProfile } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import MaintenanceDashboard from '@/components/admin/maintenance/MaintenanceDashboard';

export default async function AdminMaintenancePage() {
  const profile = await getCurrentProfile();
  
  if (!profile || profile.role === 'CUSTOMER') {
    redirect('/admin');
  }

  const initialRequests = await getAllMaintenanceRequests();

  return (
    <div className="min-h-screen bg-gray-50">
      <MaintenanceDashboard initialRequests={initialRequests} userRole={profile.role} />
    </div>
  );
}
