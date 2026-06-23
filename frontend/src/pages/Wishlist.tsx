import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { removeFromWishlist } from '../features/wishlist/wishlistSlice';
import { addToCart } from '../features/cart/cartSlice';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';
import { Heart, Trash2, ShoppingBag, Star, ArrowRight, HelpCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import { Product } from '../types';

// Helper to determine price range of a product
const getPriceRange = (product: Product) => {
  if (!product.variants || product.variants.length === 0) return '₹0';
  const prices = product.variants.map((v) => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? `₹${min}` : `₹${min} - ₹${max}`;
};

export const Wishlist: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.wishlist);

  const handleRemove = (id: string, name: string) => {
    dispatch(removeFromWishlist(id));
    toast.success(`${name} removed from wishlist`);
  };

  const handleMoveToBag = (product: Product) => {
    // Select first variant to move to cart
    const firstVariant = product.variants[0];
    
    if (!firstVariant) {
      toast.error('No stock variants available for this product');
      return;
    }

    if (firstVariant.stock === 0) {
      toast.error('Product is out of stock and cannot be added to bag');
      return;
    }

    // Add to cart
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

    // Remove from wishlist
    dispatch(removeFromWishlist(product._id));
    
    toast.success(`${product.name} moved to shopping bag!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-serif font-black tracking-tight text-slate-900 dark:text-white">
          My Wishlist
        </h1>
        {items.length > 0 && (
          <span className="text-slate-400 font-bold text-sm bg-slate-50 dark:bg-slate-800 dark:text-slate-300 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        // Empty Wishlist View
        <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-full w-fit mx-auto text-brand-accent">
            <Heart className="h-12 w-12 fill-brand-accent/20" />
          </div>
          <div className="space-y-2 max-w-xs mx-auto">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your wishlist is empty</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Bookmark items you like to save them here. Browse our catalog to discover premium styles!
            </p>
          </div>
          <Link to={ROUTES.PRODUCTS} className="inline-block pt-2">
            <Button variant="secondary" size="lg" className="flex items-center gap-2">
              <span>Explore Collection</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ) : (
        // Wishlist Grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((prod) => {
            const hasDiscount = prod.variants[0]?.originalPrice && prod.variants[0].originalPrice > prod.variants[0].price;
            const discount = hasDiscount
              ? Math.round(100 - (prod.variants[0].price / prod.variants[0].originalPrice!) * 100)
              : 0;

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

                  {/* Badges */}
                  {discount > 0 && (
                    <span className="absolute top-2 left-2 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-lg shadow-sm">
                      {discount}% OFF
                    </span>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(prod._id, prod.name)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm hover:bg-rose-50 rounded-lg shadow-sm transition-all text-slate-500 hover:text-rose-500 cursor-pointer"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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

                    {/* Ratings */}
                    <div className="flex items-center gap-1 mt-1 text-slate-500">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-[11px] font-bold">{prod.averageRating || 'New'}</span>
                      <span className="text-slate-400 text-[10px]">({prod.numReviews || 0})</span>
                    </div>

                    <div className="flex items-baseline gap-2 mt-2 pt-2 border-t border-slate-50 dark:border-slate-800">
                      <span className="font-black text-slate-900 dark:text-white text-sm">
                        {getPriceRange(prod)}
                      </span>
                      {hasDiscount && (
                        <span className="text-[10px] text-slate-400 line-through">₹{prod.variants[0].originalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Move to bag CTA */}
                  <button
                    onClick={() => handleMoveToBag(prod)}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>Move to Bag</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
