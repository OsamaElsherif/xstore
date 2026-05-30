import { getAllOrders } from '@/lib/actions/orders';
import { getCurrentProfile } from '@/lib/actions/auth';
import AdminDashboardClient from '@/components/AdminDashboardClient';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function AdminOrdersPage() {
  const profile = await getCurrentProfile();
  
  if (!profile || profile.role === 'CUSTOMER') {
    redirect('/');
  }

  const orders = await getAllOrders();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
          <p className="text-gray-500 text-sm">Track and manage customer orders and payments.</p>
        </div>
        
        {['ADMIN', 'CASHIER'].includes(profile.role) && (
          <Link 
            href="/admin/orders/new"
            className="px-6 py-3 bg-orange-500 text-slate-900 font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2"
          >
            <Plus size={20} />
            Create New Order
          </Link>
        )}
      </div>
      
      <AdminDashboardClient 
        initialOrders={orders} 
        userRole={profile.role} 
      />
    </div>
  );
}
