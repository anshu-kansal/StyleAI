import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { fetchCoupons, createCoupon, deleteCoupon, Coupon } from '../../features/admin/adminSlice';
import { RefreshCw, Plus, Trash2, Check, X, TicketPercent, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../api/axios';

export const AdminCoupons: React.FC = () => {
  const dispatch = useAppDispatch();
  const { coupons, couponsLoading } = useAppSelector((state) => state.admin);

  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: 10,
    minOrderAmount: 0,
    maxDiscount: 0,
    validFrom: '',
    validUntil: '',
    usageLimit: 0,
    firstTimeOnly: false,
    usageLimitPerUser: 0,
    applicableCategories: [] as string[],
    applicableProductsStr: '',
    userRestrictionsStr: '',
  });

  useEffect(() => {
    dispatch(fetchCoupons());
    // Fetch categories for targeting checkboxes
    axiosInstance.get('/categories')
      .then((res) => {
        if (res.data?.success) {
          setCategories(res.data.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load categories for targeting', err);
      });
  }, [dispatch]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) {
      toast.error('Coupon code is required');
      return;
    }
    if (!form.validFrom || !form.validUntil) {
      toast.error('Valid from and valid until dates are required');
      return;
    }

    const payload = {
      ...form,
      applicableProducts: form.applicableProductsStr
        ? form.applicableProductsStr.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      userRestrictions: form.userRestrictionsStr
        ? form.userRestrictionsStr.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    };
    delete (payload as any).applicableProductsStr;
    delete (payload as any).userRestrictionsStr;

    try {
      await dispatch(createCoupon(payload)).unwrap();
      toast.success('Coupon created successfully');
      setShowForm(false);
      setForm({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderAmount: 0,
        maxDiscount: 0,
        validFrom: '',
        validUntil: '',
        usageLimit: 0,
        firstTimeOnly: false,
        usageLimitPerUser: 0,
        applicableCategories: [],
        applicableProductsStr: '',
        userRestrictionsStr: '',
      });
    } catch (err: any) {
      toast.error(err || 'Failed to create coupon');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await dispatch(deleteCoupon(id)).unwrap();
      toast.success('Coupon deleted');
    } catch (err: any) {
      toast.error(err || 'Failed to delete coupon');
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await axiosInstance.patch(`/coupons/${id}`, { isActive: !currentActive });
      if (response.data?.success) {
        toast.success(`Coupon status updated`);
        dispatch(fetchCoupons());
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update coupon status');
    }
  };

  const handleCategoryChange = (catId: string, checked: boolean) => {
    setForm((prev) => {
      const list = checked
        ? [...prev.applicableCategories, catId]
        : prev.applicableCategories.filter((id) => id !== catId);
      return { ...prev, applicableCategories: list };
    });
  };

  const isExpired = (date: string) => new Date(date) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-black tracking-tight text-slate-900 dark:text-white">
            Manage Coupons
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            {coupons.length} coupon codes configured
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-950 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all cursor-pointer dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
        >
          <Plus className="h-4 w-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Create Coupon Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-slate-200 rounded-2xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-4 max-w-4xl"
        >
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <TicketPercent className="h-4 w-4 text-brand-accent" />
            <span>New Coupon Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Code
              </label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="SUMMER25"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-800 dark:border-slate-700 dark:text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Discount Type
              </label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value as 'PERCENTAGE' | 'FIXED' })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Discount Value
              </label>
              <input
                type="number"
                min="1"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Min Order Amount
              </label>
              <input
                type="number"
                min="0"
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Max Discount Cap
              </label>
              <input
                type="number"
                min="0"
                value={form.maxDiscount}
                onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Global Usage Limit
              </label>
              <input
                type="number"
                min="0"
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
                placeholder="0 = unlimited"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Limit Per User
              </label>
              <input
                type="number"
                min="0"
                value={form.usageLimitPerUser}
                onChange={(e) => setForm({ ...form, usageLimitPerUser: Number(e.target.value) })}
                placeholder="0 = unlimited"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Valid From
              </label>
              <input
                type="date"
                value={form.validFrom}
                onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Valid Until
              </label>
              <input
                type="date"
                value={form.validUntil}
                onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Applicable Products (Comma-separated IDs)
              </label>
              <input
                type="text"
                value={form.applicableProductsStr}
                onChange={(e) => setForm({ ...form, applicableProductsStr: e.target.value })}
                placeholder="Product ObjectIds e.g. 64af82a392b451c098a58f4a"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-800 dark:border-slate-700 dark:text-white font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                User Restrictions (Comma-separated IDs)
              </label>
              <input
                type="text"
                value={form.userRestrictionsStr}
                onChange={(e) => setForm({ ...form, userRestrictionsStr: e.target.value })}
                placeholder="Specific User ObjectIds who can use this coupon"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-800 dark:border-slate-700 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Applicable Categories
            </label>
            <div className="flex flex-wrap gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl max-h-40 overflow-y-auto">
              {categories.map((cat) => (
                <label key={cat._id} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-350 cursor-pointer font-semibold select-none">
                  <input
                    type="checkbox"
                    checked={form.applicableCategories.includes(cat._id)}
                    onChange={(e) => handleCategoryChange(cat._id, e.target.checked)}
                    className="rounded text-brand-accent focus:ring-brand-accent border-slate-300 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
              {categories.length === 0 && (
                <span className="text-slate-400 text-xs font-semibold">No categories found</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 select-none">
            <input
              type="checkbox"
              id="firstTimeOnly"
              checked={form.firstTimeOnly}
              onChange={(e) => setForm({ ...form, firstTimeOnly: e.target.checked })}
              className="rounded text-brand-accent focus:ring-brand-accent"
            />
            <label htmlFor="firstTimeOnly" className="text-xs text-slate-700 dark:text-slate-300 font-bold cursor-pointer">
              First Time Buyers Only
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-accent text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Create Coupon</span>
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex items-center gap-1.5 px-5 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <X className="h-3.5 w-3.5" />
              <span>Cancel</span>
            </button>
          </div>
        </form>
      )}

      {/* Coupons Table */}
      {couponsLoading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="h-8 w-8 text-slate-300 animate-spin" />
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl dark:bg-slate-900 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Discount</th>
                  <th className="px-5 py-3">Min Order</th>
                  <th className="px-5 py-3">Usage</th>
                  <th className="px-5 py-3">Valid Until</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Active Toggle</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-xs">
                {coupons.map((coupon) => {
                  const expired = isExpired(coupon.validUntil);
                  return (
                    <tr key={coupon._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10">
                      <td className="px-5 py-3.5 font-mono font-black text-brand-accent">
                        {coupon.code}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                        {coupon.discountType === 'PERCENTAGE'
                          ? `${coupon.discountValue}%`
                          : `₹${coupon.discountValue}`}
                        {coupon.maxDiscount > 0 && (
                          <span className="text-slate-400 ml-1">(max ₹{coupon.maxDiscount})</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                        {coupon.minOrderAmount > 0 ? `₹${coupon.minOrderAmount}` : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                        {coupon.usedCount}
                        {coupon.usageLimit > 0 ? ` / ₹{coupon.usageLimit}` : ' / ∞'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 font-semibold whitespace-nowrap">
                        {new Date(coupon.validUntil).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5">
                        {expired ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                            EXPIRED
                          </span>
                        ) : coupon.isActive ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            INACTIVE
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleToggleActive(coupon._id, coupon.isActive)}
                          className="text-slate-400 hover:text-brand-accent transition-all cursor-pointer"
                        >
                          {coupon.isActive ? (
                            <ToggleRight className="h-6 w-6 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="h-6 w-6 text-slate-300 dark:text-slate-700" />
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                          title="Delete coupon"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {coupons.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400 font-bold">
                      No coupons created yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
