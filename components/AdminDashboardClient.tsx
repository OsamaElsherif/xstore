'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Edit, Check, X, Calendar, DollarSign, Package, Clock, CheckCircle, AlertCircle, ShoppingBag, Layers, Eye, Wrench } from 'lucide-react';
import { OrderWithItems, OrderStatus, PaymentStatus, UserRole, Order } from '@/types';
import { updateOrderStatus, updatePaymentStatus, getAllOrders } from '@/lib/actions/orders';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import OrderActionsMenu from './admin/orders/OrderActionsMenu';
import OrderDetailDrawer from './admin/orders/OrderDetailDrawer';

interface AdminDashboardClientProps {
  initialOrders: OrderWithItems[];
  userRole: UserRole;
}

export default function AdminDashboardClient({ initialOrders, userRole }: AdminDashboardClientProps) {
  const [orders, setOrders] = useState<OrderWithItems[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "All">("All");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const { t, language } = useLanguage();
  const supabase = createClient();

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async () => {
        const updatedOrders = await getAllOrders();
        setOrders(updatedOrders);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Handlers
  const handleOrderUpdate = (orderId: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  // Derived data
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = (o.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        o.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const done = orders.filter(o => o.status === "DONE").length;
    const underRepair = orders.filter(o => o.status === "UNDER_REPAIR").length;
    const notDone = orders.filter(o => o.status === "NOT_DONE").length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.payment_status === "PAID" ? Number(o.total_price) : 0), 0);
    return { totalOrders, done, underRepair, notDone, totalRevenue };
  }, [orders]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Stats - Only for Admin */}
        {userRole === "ADMIN" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Package size={24} /></div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{t('adminTotalOrders')}</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-lg"><CheckCircle size={24} /></div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{t('statusDONE')}</p>
                  <p className="text-2xl font-bold">{stats.done}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg"><Clock size={24} /></div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{t('statusUNDER_REPAIR')}</p>
                  <p className="text-2xl font-bold">{stats.underRepair}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg"><DollarSign size={24} /></div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{t('adminRevenue')}</p>
                  <p className="text-2xl font-bold">{t('egp')} {stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('adminSearchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="NOT_DONE">{t('statusNOT_DONE')}</option>
            <option value="UNDER_REPAIR">{t('statusUNDER_REPAIR')}</option>
            <option value="DONE">{t('statusDONE')}</option>
          </select>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Items</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Payment</th>
                {userRole === "ADMIN" && <th className="p-4 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer group"
                  onClick={() => setSelectedOrder(order)}
                >
                  <td className="p-4 font-medium text-indigo-600">{order.order_number}</td>
                  <td className="p-4">
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="text-xs text-gray-500">{order.customer_phone}</p>
                  </td>
                  <td className="p-4">
                    {order.order_items.map((item, i) => (
                      <p key={i} className="text-sm">{item.quantity}x {item.snapshot_name}</p>
                    ))}
                  </td>
                  <td className="p-4 font-medium">{t('egp')} {order.total_price.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${order.status === 'DONE' ? 'bg-green-100 text-green-700' :
                      order.status === 'UNDER_REPAIR' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                      {t(`status${order.status}` as any)}
                    </span>
                  </td>
                  <td className="p-4 font-medium">{new Date(order.order_date || '').toLocaleDateString('en-GB')}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${order.payment_status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                      {t(`payment${order.payment_status}` as any)}
                    </span>
                  </td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <OrderActionsMenu
                        order={order}
                        role={userRole}
                        onUpdated={(updates) => handleOrderUpdate(order.id, updates)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order Detail Drawer */}
        <OrderDetailDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          role={userRole}
          onUpdated={(updates) => handleOrderUpdate(selectedOrder!.id, updates)}
        />
      </div>
    </div>
  );
}
