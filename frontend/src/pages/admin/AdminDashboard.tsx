import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { fetchDashboardStats } from '../../features/admin/adminSlice';
import { Link } from 'react-router-dom';
import Skeleton from '../../components/ui/Skeleton';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TicketPercent,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  PACKED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  SHIPPED: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  DELIVERED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  CANCELLED: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  RETURNED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export const AdminDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { stats, statsLoading } = useAppSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (statsLoading || !stats) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-48" variant="text" />
          <Skeleton className="h-4 w-72 mt-1" variant="text" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-3">
              <Skeleton className="h-3 w-16" variant="text" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-4">
            <Skeleton className="h-4 w-32" variant="text" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-4">
            <Skeleton className="h-4 w-32" variant="text" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...stats.monthlyRevenue.map((m) => m.revenue), 1);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-serif font-black tracking-tight text-slate-900 dark:text-white">
          Dashboard Overview
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Welcome back. Here's what's happening with your store today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
          { label: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
          { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/20' },
          { label: 'Total Products', value: stats.totalProducts.toLocaleString(), icon: Package, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20' },
          { label: 'Active Coupons', value: stats.activeCoupons.toLocaleString(), icon: TicketPercent, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/20' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-slate-100 rounded-2xl p-5 dark:bg-slate-900 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {stat.label}
              </span>
              <div className={`p-2 rounded-xl ₹{stat.bg}`}>
                <stat.icon className={`h-4 w-4 ₹{stat.color}`} />
              </div>
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Revenue Chart + Order Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-accent" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Monthly Revenue</h3>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 h-48">
            {stats.monthlyRevenue.map((m, idx) => {
              const height = Math.max((m.revenue / maxRevenue) * 100, 4);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[8px] font-bold text-slate-400">₹{Math.round(m.revenue)}
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-brand-accent to-brand-accent/60 rounded-t-lg transition-all duration-500 hover:opacity-80"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                    title={`₹₹{m.revenue.toFixed(2)} (${m.count} orders)`}
                  />
                  <span className="text-[9px] font-bold text-slate-400 mt-1">
                    {MONTHS[m._id.month - 1]}
                  </span>
                </div>
              );
            })}
            {stats.monthlyRevenue.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-bold">
                No revenue data yet
              </div>
            )}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">Order Status Breakdown</h3>
          <div className="space-y-3">
            {stats.orderStatusDist.map((s) => (
              <div key={s._id} className="flex items-center justify-between">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ₹{STATUS_COLORS[s._id] || 'bg-slate-100 text-slate-700'}`}>
                  {s._id}
                </span>
                <span className="font-black text-sm text-slate-900 dark:text-white">{s.count}</span>
              </div>
            ))}
            {stats.orderStatusDist.length === 0 && (
              <p className="text-xs text-slate-400 font-bold text-center py-4">No orders yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-slate-100 rounded-2xl dark:bg-slate-900 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Orders</h3>
          <Link
            to="/admin/orders"
            className="text-[10px] font-bold text-brand-accent hover:underline flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-xs">
              {stats.recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10">
                  <td className="px-6 py-3.5 font-mono font-bold text-slate-500">
                    #{order._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                    {(order as any).user?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-3.5 font-black text-slate-900 dark:text-white">₹{order.totals.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ₹{STATUS_COLORS[order.orderStatus] || 'bg-slate-100 text-slate-700'}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`text-[10px] font-bold ₹{order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-500'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-400 font-semibold">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 font-bold">
                    No orders yet
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

export default AdminDashboard;
