import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import {
  removeFromCart,
  updateQuantity,
  saveForLater,
  moveToCart,
  removeFromSaved,
} from '../features/cart/cartSlice';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants';
import { ShoppingBag, Trash2, Heart, ArrowRight, Minus, Plus, ShieldCheck, Bookmark } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';

export const Cart: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, savedItems } = useAppSelector((state) => state.cart);

  // Compute values
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const freeShippingThreshold = 150;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 15;
  const estTax = Math.round(subtotal * 0.08 * 100) / 100; // 8% tax
  const total = subtotal + shippingFee + estTax;

  const handleQtyChange = (sku: string, currentQty: number, change: number, stock: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    if (newQty > stock) {
      toast.error('Cannot exceed available stock limit');
      return;
    }
    dispatch(updateQuantity({ sku, quantity: newQty }));
  };

  const handleRemoveItem = (sku: string, name: string) => {
    dispatch(removeFromCart(sku));
    toast.success(`${name} removed from shopping bag`);
  };

  const handleSaveForLater = (sku: string, name: string) => {
    dispatch(saveForLater(sku));
    toast.success(`${name} saved for later`);
  };

  const handleMoveToCart = (sku: string, name: string) => {
    dispatch(moveToCart(sku));
    toast.success(`${name} moved back to bag`);
  };

  const handleRemoveFromSaved = (sku: string, name: string) => {
    dispatch(removeFromSaved(sku));
    toast.success(`${name} removed from saved list`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-serif font-black tracking-tight text-slate-900 dark:text-white mb-8">
        Shopping Bag
      </h1>

      {items.length === 0 ? (
        // Empty State View
        <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full w-fit mx-auto text-slate-400">
            <ShoppingBag className="h-12 w-12" />
          </div>
          <div className="space-y-2 max-w-xs mx-auto">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your bag is empty</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Once you add items to your shopping bag, they will appear here. Let's find some premium styles!
            </p>
          </div>
          <Link to={ROUTES.PRODUCTS} className="inline-block pt-2">
            <Button variant="secondary" size="lg" className="flex items-center gap-2">
              <span>Start Shopping</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ) : (
        // Shopping Bag Layout
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Active Items List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-6">
              {items.map((item) => (
                <div
                  key={item.sku}
                  className="flex gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 last:border-b-0 last:pb-0"
                >
                  {/* Thumbnail Image */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 dark:border-slate-800 flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Detail Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={ROUTES.PRODUCT_DETAILS(item.slug)}
                          className="font-bold text-slate-900 dark:text-white hover:text-brand-accent transition-colors sm:text-lg line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <span className="font-black text-slate-900 dark:text-white sm:text-lg">₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-slate-500 text-xs font-semibold">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                        <span>Price: ₹{item.price}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Modifier */}
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl px-1.5 py-1">
                        <button
                          onClick={() => handleQtyChange(item.sku, item.quantity, -1, item.stock)}
                          className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-black text-slate-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQtyChange(item.sku, item.quantity, 1, item.stock)}
                          className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Row Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveForLater(item.sku, item.name)}
                          className="p-2 text-slate-400 hover:text-brand-accent hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                          title="Save for Later"
                        >
                          <Bookmark className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.sku, item.name)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Order Summary Card */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Shipping Fee</span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-500 font-bold">Free</span>
                  ) : (
                    <span className="font-bold text-slate-900 dark:text-white">₹{shippingFee.toFixed(2)}</span>
                  )}
                </div>

                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{estTax.toFixed(2)}</span>
                </div>

                {shippingFee > 0 && (
                  <p className="text-xs text-brand-accent font-semibold pt-1">
                    Add ₹{(freeShippingThreshold - subtotal).toFixed(2)} more for Free Shipping!
                  </p>
                )}
              </div>

              <div className="flex justify-between text-base font-black text-slate-900 dark:text-white border-t border-slate-100 dark:border-slate-800 pt-4">
                <span>Total Amount</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate(ROUTES.CHECKOUT)}
                className="w-full flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Trust points info */}
            <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-4 flex gap-3 text-xs text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-300">
              <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="font-bold">Secured Transactions</h4>
                <p className="leading-relaxed opacity-90">
                  Your payments are processed safely through encrypted gateways (Razorpay Integration in test mode).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save For Later Section */}
      {savedItems.length > 0 && (
        <section className="border-t border-slate-100 dark:border-slate-800 mt-16 pt-12">
          <div className="flex items-center gap-2 mb-8">
            <Heart className="h-6 w-6 text-brand-accent fill-brand-accent/20" />
            <h2 className="text-2xl font-serif font-black tracking-tight text-slate-900 dark:text-white">
              Saved for Later
            </h2>
            <span className="text-slate-400 text-sm font-bold">({savedItems.length} items)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {savedItems.map((item) => (
              <div
                key={item.sku}
                className="flex flex-col bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all dark:bg-slate-900 dark:border-slate-800"
              >
                {/* Image Box */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 mb-3 border border-slate-100 dark:border-slate-800">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                      {item.name}
                    </h3>
                    <div className="flex flex-wrap gap-x-2 mt-0.5 text-slate-400 text-[10px] font-bold">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                    </div>
                    <span className="font-black text-slate-900 dark:text-white text-sm block mt-2">₹{item.price}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-50 dark:border-slate-800">
                    <button
                      onClick={() => handleMoveToCart(item.sku, item.name)}
                      className="flex-1 text-center py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Move to Bag
                    </button>
                    <button
                      onClick={() => handleRemoveFromSaved(item.sku, item.name)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Cart;
