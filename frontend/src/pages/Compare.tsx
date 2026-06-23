import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { compareProducts, clearComparison } from '../features/ai/aiSlice';
import { addToCart } from '../features/cart/cartSlice';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants';
import { Star, ShieldAlert, ShoppingBag, ArrowLeft, RefreshCw, Sparkles, Scale, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import axiosInstance from '../api/axios';
import { Product } from '../types';

export const Compare: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { comparison, comparisonLoading, error } = useAppSelector((state) => state.ai);

  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Load slugs on mount
  useEffect(() => {
    const slugs = JSON.parse(localStorage.getItem('styleai_compare_slugs') || '[]');
    setCompareSlugs(slugs);

    if (slugs.length > 0) {
      fetchProductsBySlugs(slugs);
    }

    return () => {
      dispatch(clearComparison());
    };
  }, [dispatch]);

  const fetchProductsBySlugs = async (slugs: string[]) => {
    setLoadingProducts(true);
    try {
      const fetched: Product[] = [];
      for (const slug of slugs) {
        const res = await axiosInstance.get(`/products/${slug}`);
        if (res.data?.data) {
          fetched.push(res.data.data);
        }
      }
      setProducts(fetched);

      // Trigger AI comparison if we have 2 or more products
      if (fetched.length >= 2) {
        const productIds = fetched.map((p) => p._id);
        dispatch(compareProducts(productIds));
      }
    } catch (err) {
      toast.error('Failed to load products for comparison');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleRemove = (slug: string) => {
    const updated = compareSlugs.filter((s) => s !== slug);
    localStorage.setItem('styleai_compare_slugs', JSON.stringify(updated));
    setCompareSlugs(updated);
    
    const updatedProducts = products.filter((p) => p.slug !== slug);
    setProducts(updatedProducts);

    if (updatedProducts.length >= 2) {
      dispatch(compareProducts(updatedProducts.map((p) => p._id)));
    } else {
      dispatch(clearComparison());
    }
  };

  const handleClearAll = () => {
    localStorage.setItem('styleai_compare_slugs', '[]');
    setCompareSlugs([]);
    setProducts([]);
    dispatch(clearComparison());
  };

  const handleAddToCart = (product: Product) => {
    const defaultVariant = product.variants[0];
    if (!defaultVariant || defaultVariant.stock === 0) {
      toast.error('Out of stock');
      return;
    }

    dispatch(
      addToCart({
        productId: product._id,
        name: product.name,
        slug: product.slug,
        sku: defaultVariant.sku,
        size: defaultVariant.size,
        color: defaultVariant.color,
        price: defaultVariant.price,
        originalPrice: defaultVariant.originalPrice,
        image: product.images[0] || defaultVariant.images[0],
        quantity: 1,
        stock: defaultVariant.stock,
      })
    );
    toast.success(`${product.name} added to shopping bag!`);
  };

  const loading = loadingProducts || comparisonLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back to collection */}
      <Link
        to={ROUTES.PRODUCTS}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-accent transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to collection</span>
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-950 text-white dark:bg-white dark:text-slate-950 rounded-2xl shadow-sm">
            <Scale className="h-6 w-6 text-brand-accent animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-black tracking-tight text-slate-900 dark:text-white">
              AI Product Comparison
            </h1>
            <p className="text-slate-400 text-xs font-semibold">Compare fashion items side-by-side with automated stylist verdict</p>
          </div>
        </div>

        {compareSlugs.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-3 py-2 rounded-xl transition-all cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear Comparison</span>
          </button>
        )}
      </div>

      {loadingProducts ? (
        <div className="py-16 text-center space-y-4">
          <RefreshCw className="h-8 w-8 text-slate-350 animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-bold">Loading compared items...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-slate-50 border border-slate-100 border-dashed rounded-3xl p-16 text-center text-slate-450 flex flex-col items-center justify-center gap-4 dark:bg-slate-900/10 dark:border-slate-800">
          <Scale className="h-12 w-12 text-slate-300" />
          <div>
            <h3 className="font-bold text-slate-700 dark:text-slate-350 text-sm">No items to compare</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed mt-1">
              Navigate back to the catalog and click the comparison icon on any product to add it here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main comparison grid */}
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 dark:border-slate-800">
                    <th className="p-4 bg-slate-50/50 dark:bg-slate-800/30 text-xs font-black text-slate-400 uppercase tracking-widest w-1/4">
                      Specification
                    </th>
                    {products.map((p) => (
                      <th key={p._id} className="p-6 relative group min-w-[250px] w-1/3">
                        <button
                          onClick={() => handleRemove(p.slug)}
                          className="absolute top-4 right-4 p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-450 hover:text-rose-500 rounded-lg dark:bg-slate-800 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                          title="Remove from comparison"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        
                        <div className="space-y-4">
                          <div className="w-24 aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 dark:border-slate-800">
                            {p.images && p.images[0] ? (
                              <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">No image</div>
                            )}
                          </div>
                          
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                              {p.brand?.name}
                            </span>
                            <Link
                              to={ROUTES.PRODUCT_DETAILS(p.slug)}
                              className="font-bold text-sm text-slate-900 dark:text-white hover:text-brand-accent transition-colors line-clamp-1 block mt-0.5"
                            >
                              {p.name}
                            </Link>
                            <span className="font-black text-sm text-slate-950 dark:text-white block mt-1">₹{p.variants[0]?.price.toFixed(2)}
                            </span>
                          </div>

                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleAddToCart(p)}
                            className="w-full flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <ShoppingBag className="h-3.5 w-3.5" />
                            <span>Add to Bag</span>
                          </Button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {/* SPECIFICATION ROWS */}
                  {comparison?.comparisonTable ? (
                    comparison.comparisonTable.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10">
                        <td className="p-4 bg-slate-50/50 dark:bg-slate-800/20 font-bold text-slate-500">
                          {row.criterion}
                        </td>
                        <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                          {row.value1}
                        </td>
                        {products.length > 1 && (
                          <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                            {row.value2}
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    // Default baseline rows if AI is still loading
                    <>
                      <tr>
                        <td className="p-4 bg-slate-50/50 dark:bg-slate-800/20 font-bold text-slate-500">Brand</td>
                        {products.map((p) => (
                          <td key={p._id} className="p-4 font-semibold text-slate-800 dark:text-slate-200">{p.brand?.name}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 bg-slate-50/50 dark:bg-slate-800/20 font-bold text-slate-500">Price</td>
                        {products.map((p) => (
                          <td key={p._id} className="p-4 font-semibold text-slate-850 dark:text-slate-200">₹{p.variants[0]?.price}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 bg-slate-50/50 dark:bg-slate-800/20 font-bold text-slate-500">Average Rating</td>
                        {products.map((p) => (
                          <td key={p._id} className="p-4 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span>{p.averageRating || 'New'}</span>
                          </td>
                        ))}
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Insights & Verdict */}
          {products.length >= 2 && (
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 dark:bg-slate-900/50 dark:border-slate-800 space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-150 dark:border-slate-800 pb-4">
                <Sparkles className="h-5 w-5 text-brand-accent animate-pulse" />
                <h3 className="font-serif font-black text-slate-900 dark:text-white text-lg">AI Stylist Insights</h3>
              </div>

              {loading ? (
                <div className="py-8 text-center space-y-3">
                  <RefreshCw className="h-6 w-6 text-slate-350 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400 font-bold">Synthesizing side-by-side comparisons...</p>
                </div>
              ) : error ? (
                <div className="text-xs text-slate-400">{error}</div>
              ) : comparison ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  {/* Side-by-side Pros/Cons lists */}
                  <div className="space-y-6">
                    {products.map((p) => {
                      const pPros = comparison.pros?.[p.slug] || [];
                      const pCons = comparison.cons?.[p.slug] || [];

                      return (
                        <div key={p._id} className="space-y-3">
                          <h4 className="font-bold text-xs text-brand-accent uppercase tracking-wider">
                            {p.name} Analyses
                          </h4>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Pros */}
                            <div className="bg-emerald-50/50 border border-emerald-100/30 p-4 rounded-2xl dark:bg-emerald-950/10 dark:border-emerald-950/20">
                              <span className="text-[10px] font-black text-emerald-600 block uppercase tracking-widest mb-2">Pros</span>
                              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc pl-4 leading-relaxed font-semibold">
                                {pPros.map((pro, i) => <li key={i}>{pro}</li>)}
                              </ul>
                            </div>

                            {/* Cons */}
                            <div className="bg-rose-50/50 border border-rose-100/30 p-4 rounded-2xl dark:bg-rose-950/10 dark:border-rose-950/20">
                              <span className="text-[10px] font-black text-rose-600 block uppercase tracking-widest mb-2">Cons</span>
                              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc pl-4 leading-relaxed font-semibold">
                                {pCons.map((con, i) => <li key={i}>{con}</li>)}
                              </ul>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Final Verdict */}
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3 leading-relaxed">
                    <span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest">AI Final Verdict</span>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {comparison.verdict}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Compare;
