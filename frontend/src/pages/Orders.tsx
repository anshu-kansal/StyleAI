import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { fetchMyOrders, fetchAllOrders } from '../features/order/orderSlice';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';
import {
  ShoppingBag,
  Calendar,
  CreditCard,
  Truck,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';

export const Orders: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { orders, loading, error } = useAppSelector((state) => state.order);

  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const isAdmin = user?.roles.includes('admin') || user?.roles.includes('ADMIN');

  useEffect(() => {
    if (isAdminView && isAdmin) {
      dispatch(fetchAllOrders());
    } else {
      dispatch(fetchMyOrders());
    }
  }, [dispatch, isAdminView, isAdmin]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'SHIPPED':
        return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
      case 'PACKED':
      case 'CONFIRMED':
        return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
      case 'PENDING':
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
      case 'RETURNED':
        return 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  // Filter & Search Logic
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === 'ALL' || order.orderStatus === filterStatus;
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[80vh]">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-black tracking-tight text-slate-900 dark:text-white">
            {isAdminView ? 'Customer Orders Panel' : 'My Purchase History'}
          </h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            {isAdminView
              ? 'Monitor client checkout updates, full order logs, and system logistics.'
              : 'Track shipping status, view payment invoices, and manage return requests.'}
          </p>
        </div>

        {/* Admin Switch Toggle */}
        {isAdmin && (
          <div className="flex items-center bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700 self-start">
            <button
              onClick={() => {
                setIsAdminView(false);
                setFilterStatus('ALL');
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ₹{
                !isAdminView
                  ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              My Orders
            </button>
            <button
              onClick={() => {
                setIsAdminView(true);
                setFilterStatus('ALL');
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ₹{
                isAdminView
                  ? 'bg-brand-dark dark:bg-white text-white dark:text-brand-dark shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <ShieldAlert className="h-3 w-3" />
              <span>Admin Oversight</span>
            </button>
          </div>
        )}
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by Order ID, name, or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-brand-accent focus:bg-white transition-all dark:bg-slate-800 dark:border-slate-700"
          />
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
        </div>

        {/* Filter Status Selector */}
        <div className="flex flex-wrap gap-2 items-center">
          <SlidersHorizontal className="h-4 w-4 text-slate-400 mr-1 hidden sm:block" />
          {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ₹{
                  filterStatus === status
                    ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900'
                    : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {/* Orders List Container */}
      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800/60 rounded-3xl p-6 space-y-6 shadow-sm animate-pulse"
            >
              <div className="flex flex-wrap justify-between items-center pb-4 border-b border-slate-50 dark:border-slate-800">
                <div className="flex gap-6">
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16" variant="text" />
                    <Skeleton className="h-4 w-32" variant="text" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16" variant="text" />
                    <Skeleton className="h-4 w-24" variant="text" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="flex gap-4 items-center">
                <Skeleton className="h-16 w-16 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" variant="text" />
                  <Skeleton className="h-3 w-1/4" variant="text" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="py-12 text-center text-rose-500 font-semibold">{error}</div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-full w-fit mx-auto text-slate-400">
            <ShoppingBag className="h-10 w-10" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">No orders found</h3>
            <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed">
              We couldn't find any orders matching your selection. Try changing the status filter or search parameters.
            </p>
          </div>
          {!isAdminView && (
            <Link to={ROUTES.PRODUCTS} className="inline-block mt-2">
              <Button variant="secondary" size="sm">
                Shop Our Collection
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800/60 rounded-3xl shadow-sm hover:shadow-md transition-all p-6 space-y-6"
            >
              {/* Card Top Information */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-800 pb-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">
                      Order ID
                    </span>
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                      {order._id}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">
                      Placed Date
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  {isAdminView && (
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">
                        Customer
                      </span>
                      <span className="text-slate-600 dark:text-slate-300 text-xs font-semibold">
                        {(order.user as any)?.name || 'Unknown User'} ({(order.user as any)?.email})
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ₹{getStatusColor(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>

                  <Link to={`${ROUTES.ORDERS}/${order._id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 hover:border-slate-300 transition-colors cursor-pointer"
                    >
                      <span>{isAdminView ? 'Manage Order' : 'Track Status'}</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Card Middle: Items List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2 space-y-4">
                  {order.items.slice(0, 2).map((item) => (
                    <div key={item.sku} className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-[9px]">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          SKU: {item.sku}
                          {item.size && <span className="ml-3">Size: {item.size}</span>}
                          {item.color && <span className="ml-3">Color: {item.color}</span>}
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-[10px] font-bold text-brand-accent pl-1">
                      + {order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''} in bag
                    </p>
                  )}
                </div>

                {/* Totals & Payment method card right aligned */}
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-50 dark:border-slate-800/80 p-4 rounded-2xl flex items-center justify-between md:justify-self-end w-full md:w-64">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                      Payment Details
                    </span>
                    <span className="text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5">
                      {order.paymentMethod === 'ONLINE' ? (
                        <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                      ) : (
                        <Truck className="h-3.5 w-3.5 text-slate-400" />
                      )}
                      {order.paymentMethod} • <span className="text-[10px] uppercase font-bold">{order.paymentStatus}</span>
                    </span>
                  </div>

                  <div className="text-right space-y-0.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                      Grand Total
                    </span>
                    <span className="text-slate-950 dark:text-white font-black text-sm block">₹{order.totals.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
