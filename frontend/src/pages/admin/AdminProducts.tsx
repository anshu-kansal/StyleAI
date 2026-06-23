import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { fetchProducts } from '../../features/catalog/catalogSlice';
import axiosInstance from '../../api/axios';
import Skeleton from '../../components/ui/Skeleton';
import { RefreshCw, Search, Plus, Pencil, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Product } from '../../types';

export const AdminProducts: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((state) => state.catalog);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchProducts({ limit: 100 }));
  }, [dispatch]);

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await axiosInstance.patch(`/products/${id}/toggle`);
      toast.success(`Product ₹{currentActive ? 'deactivated' : 'activated'}`);
      dispatch(fetchProducts({ limit: 100 }));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to toggle product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    try {
      await axiosInstance.delete(`/products/${id}`);
      toast.success('Product deleted');
      dispatch(fetchProducts({ limit: 100 }));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete product');
    }
  };

  const filtered = products.filter((p: Product) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-black tracking-tight text-slate-900 dark:text-white">
            Manage Products
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            {products.length} products in catalog
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search products by name or brand..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-900 dark:border-slate-800 dark:text-white"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-100 rounded-2xl dark:bg-slate-900 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Brand</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3">Rating</th>
                <th className="px-5 py-3">Active</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-xs">
              {loading ? (
                [...Array(5)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-xl" />
                        <Skeleton className="h-4 w-32" variant="text" />
                      </div>
                    </td>
                    <td className="px-5 py-4"><Skeleton className="h-3 w-16" variant="text" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-3 w-16" variant="text" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-3 w-12" variant="text" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-3 w-8" variant="text" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-3 w-16" variant="text" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-6 w-12 rounded-full" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-8 w-8 rounded-lg" /></td>
                  </tr>
                ))
              ) : (
                <>
                  {filtered.map((product: Product) => {
                  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
                  return (
                    <tr key={product._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 dark:border-slate-800 flex-shrink-0">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[8px] text-slate-400">N/A</div>
                            )}
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white line-clamp-1 max-w-[200px]">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400 font-medium">
                        {product.brand?.name || 'N/A'}
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400 font-medium">
                        {product.category?.name || 'N/A'}
                      </td>
                      <td className="px-5 py-3 font-black text-slate-900 dark:text-white">₹{product.variants[0]?.price?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`font-bold ₹{totalStock === 0 ? 'text-rose-500' : totalStock < 10 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {totalStock}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400 font-semibold">
                        ⭐ {product.averageRating || 'New'}
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => handleToggleActive(product._id, product.isActive)}
                          className="cursor-pointer"
                          title={product.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {product.isActive ? (
                            <ToggleRight className="h-6 w-6 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="h-6 w-6 text-slate-300" />
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                            title="Delete product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400 font-bold">
                      {searchTerm ? 'No matching products found' : 'No products in catalog'}
                    </td>
                  </tr>
                )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
