import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { fetchAllOrders, updateOrderStatus } from '../../features/admin/adminSlice';
import { RefreshCw, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Skeleton from '../../components/ui/Skeleton';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  PACKED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  SHIPPED: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  DELIVERED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  CANCELLED: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  RETURNED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];

export const AdminOrders: React.FC = () => {
  const dispatch = useAppDispatch();
  const { allOrders, allOrdersLoading } = useAppSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await dispatch(updateOrderStatus({ orderId, orderStatus: newStatus })).unwrap();
      toast.success('Order status updated');
    } catch (err: any) {
      toast.error(err || 'Failed to update status');
    }
  };

  const filtered = allOrders.filter((o) => {
    const matchesSearch =
      o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o as any).user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-black tracking-tight text-slate-900 dark:text-white">
          Manage Orders
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          View all customer orders and update their status
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order ID or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-900 dark:border-slate-800 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-900 dark:border-slate-800 dark:text-white"
          >
            <option value="ALL">All Statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-100 rounded-2xl dark:bg-slate-900 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-5 py-3">Order ID</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-xs">
              {allOrdersLoading ? (
                [...Array(5)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-5 py-4"><Skeleton className="h-3 w-16" variant="text" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-4 w-24" variant="text" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-3 w-12" variant="text" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-3 w-12" variant="text" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-3 w-16" variant="text" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-6 w-20 rounded-lg" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-3 w-16" variant="text" /></td>
                  </tr>
                ))
              ) : (
                filtered.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10">
                    <td className="px-5 py-3 font-mono font-bold text-slate-500">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-200">
                      {(order as any).user?.name || 'N/A'}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-5 py-3 font-black text-slate-900 dark:text-white">₹{order.totals.total.toFixed(2)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold ₹{order.paymentStatus === 'PAID' ? 'text-emerald-600' : order.paymentStatus === 'FAILED' ? 'text-rose-500' : 'text-amber-500'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`text-[10px] font-black px-2 py-1 rounded-lg border-0 focus:outline-none cursor-pointer ₹{STATUS_COLORS[order.orderStatus] || 'bg-slate-100 text-slate-700'}`}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-slate-400 font-semibold whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
              {filtered.length === 0 && !allOrdersLoading && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-bold">
                    {searchTerm || statusFilter !== 'ALL' ? 'No matching orders found' : 'No orders yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
