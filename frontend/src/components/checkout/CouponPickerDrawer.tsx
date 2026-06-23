import React, { useEffect, useState } from 'react';
import { X, TicketPercent, Check, AlertCircle } from 'lucide-react';
import axiosInstance from '../../api/axios';
import Button from '../ui/Button';

export interface StorefrontCoupon {
  _id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number;
  validUntil: string;
  firstTimeOnly: boolean;
  usageLimitPerUser: number;
  applicableCategories?: string[];
  applicableProducts?: string[];
}

interface CouponPickerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartSubtotal: number;
  cartItems: { productId: string; sku: string; price: number; quantity: number }[];
  onApplyCoupon: (code: string) => void;
  appliedCouponCode?: string;
}

export const CouponPickerDrawer: React.FC<CouponPickerDrawerProps> = ({
  isOpen,
  onClose,
  cartSubtotal,
  cartItems,
  onApplyCoupon,
  appliedCouponCode,
}) => {
  const [coupons, setCoupons] = useState<StorefrontCoupon[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      axiosInstance
        .get('/coupons/storefront')
        .then((res) => {
          if (res.data?.success) {
            setCoupons(res.data.data);
          } else {
            setError('Failed to load coupons');
          }
        })
        .catch((err) => {
          setError(err.response?.data?.message || 'Failed to load coupons');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TicketPercent className="h-5 w-5 text-brand-accent animate-pulse" />
              <h2 className="text-base font-serif font-black tracking-tight text-slate-900 dark:text-white">
                Available Coupons
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <div className="h-8 w-8 border-4 border-slate-200 border-t-slate-900 dark:border-slate-800 dark:border-t-white rounded-full animate-spin" />
                <p className="text-xs text-slate-400 font-bold tracking-wider">FETCHING PROMOTIONS</p>
              </div>
            ) : error ? (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 rounded-2xl border border-rose-100 dark:border-rose-900/30 text-xs flex gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ) : coupons.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-bold text-xs space-y-2">
                <p>No promo codes active right now.</p>
                <p className="font-normal text-slate-500 dark:text-slate-500">Check back later for seasonal campaigns!</p>
              </div>
            ) : (
              coupons.map((coupon) => {
                const isApplied = appliedCouponCode === coupon.code;
                const minMet = cartSubtotal >= coupon.minOrderAmount;
                const difference = coupon.minOrderAmount - cartSubtotal;

                // Category or product restriction check
                const hasItemTargeting =
                  (coupon.applicableCategories && coupon.applicableCategories.length > 0) ||
                  (coupon.applicableProducts && coupon.applicableProducts.length > 0);

                return (
                  <div
                    key={coupon._id}
                    className={`relative border rounded-2xl p-4 transition-all duration-300 ₹{
                      isApplied
                        ? 'border-emerald-500 bg-emerald-50/20 dark:border-emerald-500/50 dark:bg-emerald-950/10'
                        : minMet
                        ? 'border-slate-200 bg-white hover:border-slate-400 dark:border-slate-800 dark:bg-slate-850 dark:hover:border-slate-700'
                        : 'border-slate-100 bg-slate-50/50 dark:border-slate-800/50 dark:bg-slate-900/30 opacity-75'
                    }`}
                  >
                    {/* Ticket design side notches */}
                    <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 rounded-full" />
                    <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 rounded-full" />

                    <div className="flex justify-between items-start pl-2 pr-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black tracking-wider bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-brand-accent">
                            {coupon.code}
                          </span>
                          {isApplied && (
                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                              <Check className="h-3 w-3" /> Applied
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-bold text-slate-850 dark:text-white pt-1">
                          {coupon.discountType === 'PERCENTAGE'
                            ? `${coupon.discountValue}% OFF`
                            : `₹${coupon.discountValue} OFF`}
                        </p>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                          {coupon.minOrderAmount > 0
                            ? `Valid on orders above ₹${coupon.minOrderAmount}`
                            : 'No minimum order required'}
                          {coupon.maxDiscount > 0 && ` (up to ₹${coupon.maxDiscount})`}
                        </p>

                        {hasItemTargeting && (
                          <p className="text-[10px] text-indigo-500 font-bold mt-0.5">
                            * Applies only to select categories/products
                          </p>
                        )}

                        {coupon.firstTimeOnly && (
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                            * Valid for your first purchase only
                          </p>
                        )}
                      </div>

                      <div className="flex-shrink-0">
                        {isApplied ? (
                          <span className="text-xs font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 rounded-xl">
                            ACTIVE
                          </span>
                        ) : minMet ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              onApplyCoupon(coupon.code);
                              onClose();
                            }}
                            className="cursor-pointer text-xs py-1.5 px-4"
                          >
                            Apply
                          </Button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-black tracking-wider uppercase bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl block border border-slate-150 dark:border-slate-700">
                            Locked
                          </span>
                        )}
                      </div>
                    </div>

                    {!minMet && (
                      <div className="mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-500 pl-2">
                        Add <span className="font-black text-brand-accent">₹{difference.toFixed(2)}</span> more to unlock
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
              * Valid coupon discount calculations are applied on checkout items subtotal. Cancelled order coupons will reset usage limit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponPickerDrawer;
