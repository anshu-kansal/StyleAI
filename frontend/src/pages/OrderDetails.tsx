import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import {
  fetchOrderById,
  cancelOrder,
  requestReturn,
  updateOrderStatus,
} from '../features/order/orderSlice';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Truck,
  MapPin,
  CheckCircle2,
  Trash2,
  Undo2,
  Loader2,
  Sliders,
} from 'lucide-react';
import Button from '../components/ui/Button';
import { toast } from 'react-hot-toast';

export const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { currentOrder, loading, error } = useAppSelector((state) => state.order);
  const { user } = useAppSelector((state) => state.auth);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  const isAdmin = user?.roles.includes('admin') || user?.roles.includes('ADMIN');

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderById(id));
    }
  }, [dispatch, id]);

  const handleCancelOrder = async () => {
    if (!currentOrder) return;
    if (window.confirm('Are you sure you want to cancel this order? This will restore inventory stock immediately.')) {
      try {
        await dispatch(cancelOrder(currentOrder._id)).unwrap();
        toast.success('Order cancelled successfully');
      } catch (err: any) {
        toast.error(err || 'Failed to cancel order');
      }
    }
  };

  const handleRequestReturn = async () => {
    if (!currentOrder) return;
    if (window.confirm('Are you sure you want to request a return for this delivered order?')) {
      try {
        await dispatch(requestReturn(currentOrder._id)).unwrap();
        toast.success('Return requested successfully');
      } catch (err: any) {
        toast.error(err || 'Failed to request return');
      }
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!currentOrder) return;
    const newStatus = e.target.value;
    setIsUpdatingStatus(true);
    try {
      await dispatch(updateOrderStatus({ orderId: currentOrder._id, orderStatus: newStatus })).unwrap();
      toast.success(`Order status updated to ₹{newStatus}`);
    } catch (err: any) {
      toast.error(err || 'Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading && !currentOrder) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-brand-accent mx-auto" />
          <p className="text-slate-400 text-xs font-semibold">Fetching tracking invoice details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 px-4 text-center">
        <p className="text-rose-500 font-bold">{error}</p>
        <Link to={ROUTES.ORDERS}>
          <Button variant="outline" size="sm">
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 px-4 text-center">
        <p className="text-slate-500 font-bold">Order not found</p>
        <Link to={ROUTES.ORDERS}>
          <Button variant="outline" size="sm">
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  // Tracking timeline steps status
  const statuses = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'];
  const currentStatusIndex = statuses.indexOf(currentOrder.orderStatus);

  const getStepStatus = (index: number) => {
    if (currentOrder.orderStatus === 'CANCELLED') return 'CANCELLED';
    if (currentOrder.orderStatus === 'RETURNED') return 'RETURNED';
    if (currentStatusIndex >= index) return 'COMPLETED';
    if (currentStatusIndex + 1 === index) return 'CURRENT';
    return 'PENDING';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-[90vh]">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to={ROUTES.ORDERS}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-brand-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Purchase History</span>
        </Link>

        {/* Admin status editor drawer */}
        {isAdmin && (
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 self-start">
            <Sliders className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Admin Status Tool:
            </span>
            <select
              value={currentOrder.orderStatus}
              onChange={handleStatusChange}
              disabled={isUpdatingStatus || currentOrder.orderStatus === 'CANCELLED'}
              className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-brand-accent dark:bg-slate-900 dark:border-slate-800"
            >
              {['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'].map(
                (status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                )
              )}
            </select>
            {isUpdatingStatus && <Loader2 className="h-4 w-4 animate-spin text-brand-accent" />}
          </div>
        )}
      </div>

      {/* Invoice Detail Box */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <h1 className="text-xl font-black text-slate-950 dark:text-white">
              Order Invoice Details
            </h1>
            <p className="text-slate-400 text-xs font-semibold">
              ID: <span className="font-mono">{currentOrder._id}</span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Ordered: {new Date(currentOrder.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Timeline Progress Tracker */}
        <div className="py-6">
          {currentOrder.orderStatus === 'CANCELLED' ? (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-center text-xs font-bold text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400">
              This order has been CANCELLED. Product inventory stocks have been restored.
            </div>
          ) : currentOrder.orderStatus === 'RETURNED' ? (
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-center text-xs font-bold text-purple-800 dark:bg-purple-950/20 dark:border-purple-900/30 dark:text-purple-400">
              This order has been marked as RETURNED.
            </div>
          ) : (
            <div className="relative">
              {/* Desktop Progress Bar Line */}
              <div className="absolute top-4 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 hidden md:block" />
              <div
                className="absolute top-4 left-0 h-1 bg-emerald-500 transition-all duration-500 hidden md:block"
                style={{
                  width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%`,
                }}
              />

              {/* Steps grid */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
                {statuses.map((status, index) => {
                  const stepStatus = getStepStatus(index);
                  return (
                    <div key={status} className="flex md:flex-col items-center gap-4 md:text-center">
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center font-black text-xs border z-10 transition-all duration-300 ₹{
                          stepStatus === 'COMPLETED'
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : stepStatus === 'CURRENT'
                            ? 'bg-white border-brand-accent text-brand-accent ring-4 ring-brand-accent/10 dark:bg-slate-900'
                            : 'bg-white border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-700'
                        }`}
                      >
                        {stepStatus === 'COMPLETED' ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                      </div>

                      <div className="text-left md:text-center space-y-0.5">
                        <span className="text-[10px] uppercase tracking-widest font-black block text-slate-800 dark:text-slate-200">
                          {status}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-400 block">
                          {index === 0
                            ? 'Order Created'
                            : index === 1
                            ? 'Stock Secured'
                            : index === 2
                            ? 'Packed at Hub'
                            : index === 3
                            ? 'On the Road'
                            : 'Delivered Home'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Address & Payment cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50 dark:border-slate-800">
          {/* Shipping Address */}
          <div className="border border-slate-100 dark:border-slate-800 p-5 rounded-2xl space-y-3">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span>Shipping Destination</span>
            </span>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pl-5">
              <p className="font-bold text-slate-900 dark:text-white">
                {currentOrder.shippingAddress.fullName}
              </p>
              <p>{currentOrder.shippingAddress.addressLine1}</p>
              {currentOrder.shippingAddress.addressLine2 && (
                <p>{currentOrder.shippingAddress.addressLine2}</p>
              )}
              <p>
                {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} -{' '}
                {currentOrder.shippingAddress.postalCode}
              </p>
              <p className="font-semibold text-slate-500 mt-2">
                Phone: {currentOrder.shippingAddress.phone}
              </p>
            </div>
          </div>

          {/* Payment Method / Summary */}
          <div className="border border-slate-100 dark:border-slate-800 p-5 rounded-2xl space-y-3">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="h-4 w-4" />
              <span>Billing Details</span>
            </span>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 pl-5">
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span className="font-bold text-slate-900 dark:text-white uppercase">
                  {currentOrder.paymentMethod === 'ONLINE' ? 'ONLINE (Razorpay)' : 'COD (Cash)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Transaction status:</span>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold text-[10px] uppercase text-slate-700 dark:text-slate-300">
                  {currentOrder.paymentStatus}
                </span>
              </div>
              {currentOrder.razorpayDetails?.paymentId && (
                <div className="flex justify-between border-t border-slate-50 dark:border-slate-800/80 pt-2">
                  <span>Payment reference:</span>
                  <span className="font-mono text-[10px] text-slate-500 font-semibold truncate">
                    {currentOrder.razorpayDetails.paymentId}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Purchased Items List */}
        <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
            Items in this order
          </span>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
            {currentOrder.items.map((item) => (
              <div key={item.sku} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col sm:flex-row justify-between gap-2">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      SKU: <span className="font-mono">{item.sku}</span>
                      {item.size && <span className="ml-3">Size: {item.size}</span>}
                      {item.color && <span className="ml-3">Color: {item.color}</span>}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-x-8 text-xs self-start sm:self-center w-full sm:w-auto">
                    <div className="text-slate-400">
                      <span>Price: ₹{item.price.toFixed(2)}</span>
                      <span className="mx-2">•</span>
                      <span>Qty: {item.quantity}</span>
                    </div>
                    <span className="font-black text-slate-950 dark:text-white">₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Billing Invoice Sum card */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-6 border-t border-slate-50 dark:border-slate-800">
          {/* Customer control actions cancellation / returns */}
          <div className="flex flex-wrap gap-2">
            {['PENDING', 'CONFIRMED'].includes(currentOrder.orderStatus) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelOrder}
                className="flex items-center gap-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 dark:border-rose-900/30 dark:text-rose-400 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Cancel Order</span>
              </Button>
            )}

            {currentOrder.orderStatus === 'DELIVERED' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRequestReturn}
                className="flex items-center gap-1 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 dark:border-purple-900/30 dark:text-purple-400 cursor-pointer"
              >
                <Undo2 className="h-4 w-4" />
                <span>Request Return</span>
              </Button>
            )}
          </div>

          {/* Pricing Totals breakdown */}
          <div className="w-full sm:w-80 space-y-3 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-50 dark:border-slate-800/80 self-end">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Subtotal:</span>
              <span className="font-bold text-slate-900 dark:text-white">₹{currentOrder.totals.subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Shipping Fee:</span>
              {currentOrder.totals.shippingFee === 0 ? (
                <span className="text-emerald-500 font-bold">Free</span>
              ) : (
                <span className="font-bold text-slate-900 dark:text-white">₹{currentOrder.totals.shippingFee.toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
              <span>Estimated Tax (8%):</span>
              <span className="font-bold text-slate-900 dark:text-white">₹{currentOrder.totals.estTax.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-sm font-black text-slate-950 dark:text-white border-t border-slate-100 dark:border-slate-800 pt-3">
              <span>Total Invoice:</span>
              <span>₹{currentOrder.totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
