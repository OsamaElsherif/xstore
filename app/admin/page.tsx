import { getAllOrders } from '@/lib/actions/orders';
import { getCurrentProfile } from '@/lib/actions/auth';
import AdminDashboardClient from '@/components/AdminDashboardClient';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const profile = await getCurrentProfile();
  
  if (!profile || profile.role === 'CUSTOMER') {
    redirect('/');
  }

  const orders = await getAllOrders();

  return (
    <AdminDashboardClient 
      initialOrders={orders} 
      userRole={profile.role} 
    />
  );
}
