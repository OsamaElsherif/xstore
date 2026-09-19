import { getAllMaintenanceRequests } from '@/lib/actions/maintenance';
import { getCurrentProfile } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import MaintenanceDashboard from '@/components/admin/maintenance/MaintenanceDashboard';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function AdminMaintenancePage() {
  const profile = await getCurrentProfile();
  
  if (!profile || profile.role === 'CUSTOMER') {
    redirect('/admin');
  }

  const initialRequests = await getAllMaintenanceRequests();

  return (
    <div className="min-h-screen bg-gray-50 space-y-6 p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-7xl mx-auto w-full">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Maintenance Management</h2>
          <p className="text-gray-500 text-sm">Track and manage device repairs and requests.</p>
        </div>
        
        {['ADMIN', 'CASHIER', 'ORDER_RECEIVER'].includes(profile.role) && (
          <Link 
            href="/admin/maintenance/new"
            className="px-6 py-3 bg-blue-500 text-slate-900 font-bold rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            <Plus size={20} />
            New Request
          </Link>
        )}
      </div>

      <div className="max-w-7xl mx-auto w-full">
        <MaintenanceDashboard initialRequests={initialRequests} userRole={profile.role} />
      </div>
    </div>
  );
}
