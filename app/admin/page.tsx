import React from 'react';
import { getCurrentProfile } from '@/lib/actions/auth';
import { createClient } from '@/lib/supabase/server';
import {
  TrendingUp,
  ShoppingBag,
  Wrench,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const supabase = await createClient();

  // Fetch some basic stats based on role
  const { count: pendingMaint } = await supabase
    .from('maintenance_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'PENDING');

  const { count: activeOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'NOT_DONE');

  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  const role = profile.role;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome back, {profile.full_name?.split(' ')[0]}!</h2>
          <p className="text-gray-500 text-sm">Here is what is happening today.</p>
        </div>
        <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
          <Clock size={16} className="text-orange-500" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {role === 'ADMIN' && (
          <>
            <StatCard
              title="Monthly Revenue"
              value="EGP 0"
              subValue="0% from last month"
              icon={TrendingUp}
              color="purple"
            />
            <StatCard
              title="Total Orders"
              value={activeOrders?.toString() || '0'}
              subValue="Active orders"
              icon={ShoppingBag}
              color="blue"
            />
            <StatCard
              title="Pending Repairs"
              value={pendingMaint?.toString() || '0'}
              subValue="Waiting for review"
              icon={Wrench}
              color="orange"
            />
            <StatCard
              title="Products"
              value={totalProducts?.toString() || '0'}
              subValue="In stock"
              icon={Package}
              color="green"
            />
          </>
        )}

        {role === 'CASHIER' && (
          <>
            <StatCard
              title="Unpaid Orders"
              value="12"
              subValue="Pending payment"
              icon={AlertCircle}
              color="red"
            />
            <StatCard
              title="Paid Today"
              value="36"
              subValue="EGP 4,200 collected"
              icon={CheckCircle2}
              color="green"
            />
          </>
        )}

        {role === 'ORDER_RECEIVER' && (
          <>
            <StatCard
              title="New Requests"
              value={pendingMaint?.toString() || '0'}
              subValue="Pending check-in"
              icon={AlertCircle}
              color="orange"
            />
            <StatCard
              title="Under Repair"
              value="8"
              subValue="Currently in workshop"
              icon={Wrench}
              color="blue"
            />
            <StatCard
              title="Done Today"
              value="5"
              subValue="Ready for pickup"
              icon={CheckCircle2}
              color="green"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {role === 'ADMIN' && (
            <>
              <QuickActionCard title="Manage Products" href="/admin/products" description="Add, edit, or remove products from catalog" />
              <QuickActionCard title="Manage Categories" href="/admin/categories" description="Organize your shop structure" />
              <QuickActionCard title="User Management" href="/admin/users" description="Manage staff and customer accounts" />
              <QuickActionCard title="WA Sessions" href="/admin/whatsapp-sessions" description="Manage all Wasender WhatsApp sessions and connection status" />
              <QuickActionCard title="WhatsApp Templates" href="/admin/whatsapp-templates" description="Create and configure notification message templates" />
            </>
          )}
          {role === 'CASHIER' && (
            <QuickActionCard title="View All Orders" href="/admin/orders" description="Check order status and process payments" />
          )}
          {role === 'ORDER_RECEIVER' && (
            <QuickActionCard title="Repair Requests" href="/admin/maintenance" description="Handle new check-ins and updates" />
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subValue, icon: Icon, color }: any) {
  const colors: any = {
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl border ${colors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h4 className="text-3xl font-bold text-gray-900 mb-1">{value}</h4>
        <p className="text-xs text-gray-400 font-medium">{subValue}</p>
      </div>
    </div>
  );
}

function QuickActionCard({ title, href, description }: any) {
  return (
    <Link
      href={href}
      className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-orange-500/20 transition-all group"
    >
      <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors mb-2">{title}</h4>
      <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
    </Link>
  );
}
