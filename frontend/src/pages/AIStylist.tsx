import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { getStylistRecommendations, clearStylistState } from '../features/stylist/stylistSlice';
import { addToCart } from '../features/cart/cartSlice';
import { toggleWishlist } from '../features/wishlist/wishlistSlice';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';
import {
  Sparkles,
  Heart,
  ShoppingBag,
  ArrowRight,
  HelpCircle,
  Sliders,
  DollarSign,
  Shirt,
  Compass,
  Loader2,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import { Product } from '../types';

const getPriceRange = (product: Product) => {
  if (!product.variants || product.variants.length === 0) return '$0';
  const prices = product.variants.map((v) => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? `$${min}` : `$${min} - $${max}`;
};

export const AIStylist: React.FC = () => {
  const dispatch = useAppDispatch();
  const { advice, products, loading, error } = useAppSelector((state) => state.stylist);
  const wishlistItems = useAppSelector((state) => state.wishlist.items);

  // Form State
  const [occasion, setOccasion] = useState<string>('Casual');
  const [gender, setGender] = useState<string>('unisex');
  const [budget, setBudget] = useState<number>(150);
  const [aesthetic, setAesthetic] = useState<string>('');

  useEffect(() => {
    // Clear recommendations on mount
    dispatch(clearStylistState());
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      getStylistRecommendations({
        occasion,
        gender,
        budget,
        aesthetic,
      })
    )
      .unwrap()
      .then(() => {
        toast.success('Stylist recommendations loaded!');
      })
      .catch((err) => {
        toast.error(err || 'Failed to get styling suggestions');
      });
  };

  const handleAddToCart = (product: Product) => {
    const firstVariant = product.variants[0];
    if (!firstVariant) {
      toast.error('No stock variants available for this product');
      return;
    }
    if (firstVariant.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    dispatch(
      addToCart({
        productId: product._id,
        name: product.name,
        slug: product.slug,
        sku: firstVariant.sku,
        size: firstVariant.size || undefined,
        color: firstVariant.color || undefined,
        price: firstVariant.price,
        originalPrice: firstVariant.originalPrice,
        image: product.images[0] || firstVariant.images[0] || undefined,
        quantity: 1,
        stock: firstVariant.stock,
      })
    );
    toast.success(`${product.name} added to shopping bag!`);
  };

  const isProductInWishlist = (productId: string) => {
    return wishlistItems.some((item) => item._id === productId);
  };

  const handleWishlistToggle = (product: Product) => {
    const wasInWishlist = isProductInWishlist(product._id);
    dispatch(toggleWishlist(product));
    if (wasInWishlist) {
      toast.success(`${product.name} removed from wishlist`);
    } else {
      toast.success(`${product.name} bookmarked to wishlist`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-xs font-semibold animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Generative AI Stylist</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-slate-900 dark:text-white">
          AI Outfit Generator
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Provide your occasion, budget constraints, and aesthetic vibe to receive customized outfit advice and matched catalog items instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form panel */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-50 dark:border-slate-800/80 pb-3">
            <Sliders className="h-4 w-4 text-brand-accent" />
            <span>Styling Parameters</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Occasion */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Occasion *
              </label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-800 dark:border-slate-700"
              >
                {['Casual', 'Formal', 'Business', 'Party', 'Date Night', 'Vacation', 'Gym/Sports'].map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender / Style preference */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Style Fit Preference *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'men', label: 'Men' },
                  { value: 'women', label: 'Women' },
                  { value: 'unisex', label: 'Unisex' },
                ].map((g) => (
                  <label
                    key={g.value}
                    className={`flex flex-col items-center justify-center p-3 border rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all ${
                      gender === g.value
                        ? 'border-brand-dark dark:border-white bg-slate-50/50 dark:bg-slate-800/40 font-bold'
                        : 'border-slate-100 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={g.value}
                      checked={gender === g.value}
                      onChange={() => setGender(g.value)}
                      className="sr-only"
                    />
                    <Shirt className="h-4 w-4 mb-1.5 opacity-80" />
                    <span className="text-[11px]">{g.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Budget Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Maximum Budget
                </label>
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  ${budget === 0 ? 'No Limit' : `$${budget}`}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="flex-1 accent-brand-accent h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer dark:bg-slate-800"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Slider at 0 signifies no budget filters will be applied.
              </p>
            </div>

            {/* Aesthetic Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Aesthetic description (optional)
              </label>
              <textarea
                placeholder="Minimalist, warm camel coat, classic street wear, white leather sneakers, elegant beige layers..."
                value={aesthetic}
                onChange={(e) => setAesthetic(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent resize-none dark:bg-slate-800 dark:border-slate-700"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="secondary"
              size="lg"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 cursor-pointer py-3 rounded-2xl"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating Style Advice...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Style Outfit</span>
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-2 space-y-8">
          {loading ? (
            <div className="h-80 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 bg-white/40 dark:bg-slate-900/10">
              <div className="p-4 bg-brand-accent/5 rounded-full text-brand-accent animate-spin duration-3000">
                <Compass className="h-10 w-10" />
              </div>
              <p className="text-slate-400 text-xs font-semibold">
                Running semantic fashion checks on catalog collections...
              </p>
            </div>
          ) : advice ? (
            <div className="space-y-8">
              {/* Advice Card */}
              <div className="relative overflow-hidden bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-lg">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_50%_at_80%_-10%,rgba(14,165,233,0.15),transparent_100%)] pointer-events-none" />
                <div className="flex items-center gap-2 text-brand-accent">
                  <Sparkles className="h-5 w-5 fill-brand-accent/10" />
                  <span className="text-xs font-black uppercase tracking-widest">
                    Stylist Recommendation
                  </span>
                </div>
                <p className="text-slate-200 text-sm leading-relaxed font-medium">
                  {advice}
                </p>
              </div>

              {/* Recommended items */}
              <div className="space-y-4">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider pl-1">
                  Selected Pieces
                </h3>

                {products.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 text-xs">
                    No products matched these filters. Try adjusting your styling options or raising the budget!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {products.map((prod) => {
                      const inWishlist = isProductInWishlist(prod._id);
                      return (
                        <div
                          key={prod._id}
                          className="group relative flex flex-col bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all dark:bg-slate-900 dark:border-slate-800"
                        >
                          {/* Image Box */}
                          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 mb-3 border border-slate-100 dark:border-slate-800">
                            {prod.images && prod.images[0] ? (
                              <img
                                src={prod.images[0]}
                                alt={prod.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                                No Image
                              </div>
                            )}

                            {/* Wishlist toggle */}
                            <button
                              onClick={() => handleWishlistToggle(prod)}
                              className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm hover:bg-slate-50 rounded-lg shadow-sm transition-all text-slate-500 hover:text-rose-500 cursor-pointer"
                              title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                            >
                              {inWishlist ? (
                                <BookmarkCheck className="h-4 w-4 text-emerald-500 fill-emerald-500/20" />
                              ) : (
                                <Bookmark className="h-4 w-4 text-slate-400" />
                              )}
                            </button>
                          </div>

                          {/* Meta details */}
                          <div className="flex-grow flex flex-col justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {prod.brand?.name}
                              </span>
                              <Link
                                to={ROUTES.PRODUCT_DETAILS(prod.slug)}
                                className="font-bold text-slate-900 dark:text-white group-hover:text-brand-accent transition-colors text-sm line-clamp-1 mt-0.5"
                              >
                                {prod.name}
                              </Link>
                              <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                                {prod.description}
                              </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800/80 flex items-center justify-between gap-4">
                              <span className="font-black text-slate-900 dark:text-white text-sm">
                                {getPriceRange(prod)}
                              </span>
                              <button
                                onClick={() => handleAddToCart(prod)}
                                className="flex items-center gap-1 py-1.5 px-3 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                              >
                                <ShoppingBag className="h-3.5 w-3.5" />
                                <span>Add to Bag</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Intro State (No request made yet) */
            <div className="text-center py-20 border border-slate-100 rounded-3xl dark:bg-slate-900/50 dark:border-slate-800 space-y-6 max-w-xl mx-auto">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-full w-fit mx-auto text-slate-400">
                <Compass className="h-12 w-12 text-slate-400/80" />
              </div>
              <div className="space-y-2 max-w-xs mx-auto">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Design Your Style
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Enter your event parameters on the left. Our AI algorithms will analyze category alignments and generate styling combinations.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIStylist;
