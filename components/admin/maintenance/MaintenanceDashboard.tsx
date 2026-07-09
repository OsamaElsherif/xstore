'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Wrench, Clock, CheckCircle, AlertCircle, Package, DollarSign, Eye, MoreVertical } from 'lucide-react';
import { MaintenanceRequest, UserRole, MaintenanceStatus } from '@/types';
import { getAllMaintenanceRequests } from '@/lib/actions/maintenance';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import MaintenanceActionsMenu from './MaintenanceActionsMenu';
import MaintenanceDetailDrawer from './MaintenanceDetailDrawer';

interface MaintenanceDashboardProps {
  initialRequests: MaintenanceRequest[];
  userRole: UserRole;
}

export default function MaintenanceDashboard({ initialRequests, userRole }: MaintenanceDashboardProps) {
  const [requests, setRequests] = useState<MaintenanceRequest[]>(initialRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | "All">("All");
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const { t } = useLanguage();
  const supabase = createClient();

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-maintenance')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_requests' }, async () => {
        const updatedRequests = await getAllMaintenanceRequests();
        setRequests(updatedRequests);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Handlers
  const handleRequestUpdate = (requestId: string, updates: Partial<MaintenanceRequest>) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, ...updates } : r));
    if (selectedRequest?.id === requestId) {
      setSelectedRequest(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  // Derived data
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchesSearch = (r.request_number?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                            r.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.device_type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'PENDING').length,
      inProgress: requests.filter(r => r.status === 'IN_PROGRESS').length,
      done: requests.filter(r => r.status === 'DONE').length,
    };
  }, [requests]);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Maintenance Requests</h1>
            <p className="text-gray-500 mt-1">Manage and track device repair requests</p>
          </div>
          <div className="text-sm font-medium px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg mt-4 md:mt-0">
            Role: {userRole.replace('_', ' ')}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Package />} label="Total" value={stats.total} color="blue" />
          <StatCard icon={<Clock />} label="Pending" value={stats.pending} color="gray" />
          <StatCard icon={<Wrench />} label="In Progress" value={stats.inProgress} color="yellow" />
          <StatCard icon={<CheckCircle />} label="Done" value={stats.done} color="green" />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by ID, name, or device..."
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
            <option value="PENDING">Pending</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING_PARTS">Waiting Parts</option>
            <option value="DONE">Done</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                <th className="p-4 font-medium">Req No.</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Device</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Payment</th>
                <th className="p-4 font-medium">Cost</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(request => (
                <tr 
                  key={request.id} 
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer group"
                  onClick={() => setSelectedRequest(request)}
                >
                  <td className="p-4 font-medium text-indigo-600">{request.request_number}</td>
                  <td className="p-4">
                    <p className="font-medium">{request.customer_name}</p>
                    <p className="text-xs text-gray-500">{request.customer_phone}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-medium">{request.device_brand}</p>
                    <p className="text-xs text-gray-500">{request.device_type}</p>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={request.status as MaintenanceStatus} />
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      request.payment_status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {request.payment_status}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-medium">
                      {request.actual_cost ? `EGP ${request.actual_cost.toLocaleString()}` : 
                       request.estimated_cost ? `Est. EGP ${request.estimated_cost.toLocaleString()}` : '—'}
                    </p>
                  </td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedRequest(request)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                      <MaintenanceActionsMenu 
                        request={request} 
                        role={userRole} 
                        onUpdated={(updates) => handleRequestUpdate(request.id, updates)} 
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRequests.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No maintenance requests found matching your filters.
            </div>
          )}
        </div>

        {/* Detail Drawer */}
        <MaintenanceDetailDrawer 
          request={selectedRequest} 
          onClose={() => setSelectedRequest(null)} 
          role={userRole} 
          onUpdated={(updates) => handleRequestUpdate(selectedRequest!.id, updates)}
        />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) {
  const colors: any = {
    blue: 'bg-blue-100 text-blue-600',
    gray: 'bg-gray-100 text-gray-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: MaintenanceStatus }) {
  const styles: any = {
    PENDING: 'bg-gray-100 text-gray-700',
    REVIEWED: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
    WAITING_PARTS: 'bg-orange-100 text-orange-700',
    DONE: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
