import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { fetchAddresses, addAddress, deleteAddress } from '../features/address/addressSlice';
import { clearCart } from '../features/cart/cartSlice';
import {
  placeCODOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
  clearOrderState,
} from '../features/order/orderSlice';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants';
import {
  MapPin,
  Plus,
  Trash2,
  Check,
  ShoppingBag,
  CreditCard,
  Truck,
  ShieldCheck,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Phone,
  TicketPercent,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import axiosInstance from '../api/axios';
import CouponPickerDrawer from '../components/checkout/CouponPickerDrawer';

export const Checkout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { items } = useAppSelector((state) => state.cart);
  const { items: addresses, loading: addressLoading } = useAppSelector((state) => state.address);
  const { user } = useAppSelector((state) => state.auth);
  const { currentOrder, loading: orderLoading } = useAppSelector((state) => state.order);

  // Steps active state
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
  const [orderPlaced, setOrderPlaced] = useState<boolean>(false);

  // Coupon states
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    discount: number;
    newTotal: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState<boolean>(false);
  const [isCouponDrawerOpen, setIsCouponDrawerOpen] = useState<boolean>(false);

  // Expandable form to add new address
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [formValues, setFormValues] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    isDefault: false,
  });

  // Dynamically load Razorpay SDK on checkout page mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    // Clear order state on mount to prevent stale values
    dispatch(clearOrderState());

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [dispatch]);

  // Fetch user addresses on mount
  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  // Set default selected address
  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddr = addresses.find((addr) => addr.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr._id);
    }
  }, [addresses]);

  // Redirect if cart is empty and order hasn't been placed yet
  useEffect(() => {
    if (items.length === 0 && !orderPlaced && !currentOrder) {
      navigate(ROUTES.CART);
    }
  }, [items.length, orderPlaced, currentOrder, navigate]);

  // Cart values
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = subtotal >= 150 || subtotal === 0 ? 0 : 15;
  const estTax = Math.round(subtotal * 0.08 * 100) / 100;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const total = Math.max(0, subtotal + shippingFee + estTax - discount);

  const handleApplyCoupon = async (e?: React.FormEvent, codeToApply?: string) => {
    if (e) e.preventDefault();
    const targetCode = codeToApply || couponCode;
    if (!targetCode.trim()) {
      return;
    }
    setIsValidatingCoupon(true);
    setCouponError(null);
    try {
      const checkoutItems = items.map((i) => ({
        productId: i.productId,
        sku: i.sku,
        price: i.price,
        quantity: i.quantity,
      }));
      const response = await axiosInstance.post('/coupons/validate', {
        code: targetCode.trim().toUpperCase(),
        items: checkoutItems,
      });
      if (response.data?.success) {
        setAppliedCoupon(response.data.data);
        setCouponCode(targetCode.trim().toUpperCase());
        toast.success(`Coupon "${targetCode.toUpperCase()}" applied successfully!`);
      } else {
        const errMsg = response.data?.message || 'Invalid coupon code';
        setCouponError(errMsg);
        toast.error(errMsg);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Invalid coupon code';
      setCouponError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
    toast.success('Coupon removed');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValues.fullName || !formValues.addressLine1 || !formValues.city || !formValues.state || !formValues.postalCode || !formValues.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const resultAction = await dispatch(addAddress(formValues)).unwrap();
      toast.success('Address added successfully!');
      setSelectedAddressId(resultAction._id);
      setShowAddForm(false);
      setFormValues({
        fullName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        phone: '',
        isDefault: false,
      });
    } catch (err: any) {
      toast.error(err || 'Failed to add address');
    }
  };

  const handleDeleteAddress = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this address?')) {
      dispatch(deleteAddress(id))
        .unwrap()
        .then(() => {
          toast.success('Address deleted');
          if (selectedAddressId === id) {
            setSelectedAddressId('');
          }
        })
        .catch((err) => toast.error(err || 'Failed to delete address'));
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a shipping address');
      return;
    }

    const checkoutItems = items.map((i) => ({
      productId: i.productId,
      sku: i.sku,
      quantity: i.quantity,
    }));

    if (paymentMethod === 'COD') {
      try {
        await dispatch(
          placeCODOrder({
            addressId: selectedAddressId,
            items: checkoutItems,
            couponCode: appliedCoupon?.code,
          })
        ).unwrap();
        
        setOrderPlaced(true);
        dispatch(clearCart());
        toast.success('Order placed successfully!');
      } catch (err: any) {
        toast.error(err || 'Failed to place order');
      }
    } else {
      // ONLINE PAYMENT VIA RAZORPAY
      try {
        // 1. Create Razorpay order on the backend
        const rzpOrder = await dispatch(
          createRazorpayOrder({
            addressId: selectedAddressId,
            items: checkoutItems,
            couponCode: appliedCoupon?.code,
          })
        ).unwrap();

        // 2. Configure and open Razorpay Checkout Modal
        const options = {
          key: rzpOrder.keyId,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          name: 'StyleAI',
          description: 'Secure Order Payment',
          order_id: rzpOrder.razorpayOrderId,
          handler: async (response: any) => {
            // 3. Send verification payload to backend on success
            try {
              await dispatch(
                verifyRazorpayPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  addressId: selectedAddressId,
                  items: checkoutItems,
                  couponCode: appliedCoupon?.code,
                })
              ).unwrap();

              setOrderPlaced(true);
              dispatch(clearCart());
              toast.success('Payment verified! Order placed.');
            } catch (err: any) {
              toast.error(err || 'Payment verification failed');
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
          },
          theme: {
            color: '#0f172a', // slate-900 (brand dark)
          },
          modal: {
            ondismiss: function () {
              toast.error('Payment cancelled by user');
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          toast.error('Payment failed: ' + resp.error.description);
        });
        rzp.open();
      } catch (err: any) {
        toast.error(err || 'Failed to initiate payment');
      }
    }
  };

  const getSelectedAddressDetails = () => {
    return addresses.find((a) => a._id === selectedAddressId);
  };

  if (orderPlaced && currentOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8">
        <div className="bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-10 shadow-sm space-y-6">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-full w-fit mx-auto text-emerald-500 animate-bounce">
            <Sparkles className="h-16 w-16 fill-emerald-500/10" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-serif font-black tracking-tight text-slate-900 dark:text-white">
              Thank you for your order!
            </h1>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Your order has been placed successfully. We are preparing it for shipment and will notify you soon.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
              <span className="text-slate-400 text-xs font-bold block uppercase tracking-widest">Order ID</span>
              <span className="text-slate-900 dark:text-white font-mono text-base font-bold">{currentOrder._id}</span>
            </div>
            {currentOrder.razorpayDetails?.paymentId && (
              <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 text-xs font-bold block uppercase tracking-widest">Payment ID</span>
                <span className="text-slate-950 dark:text-white font-mono text-base font-bold">{currentOrder.razorpayDetails.paymentId}</span>
              </div>
            )}
          </div>

          <div className="max-w-md mx-auto text-left border-t border-slate-100 dark:border-slate-800 pt-6 space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Shipping Details:</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              <span className="font-bold text-slate-700 dark:text-slate-300">{currentOrder.shippingAddress.fullName}</span>
              <br />
              {currentOrder.shippingAddress.addressLine1}
              {currentOrder.shippingAddress.addressLine2 && `, ₹{currentOrder.shippingAddress.addressLine2}`}
              <br />
              {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} - {currentOrder.shippingAddress.postalCode}
              <br />
              Phone: {currentOrder.shippingAddress.phone}
            </p>
          </div>
        </div>

        <Link to={ROUTES.PRODUCTS} className="inline-block">
          <Button variant="primary" size="lg" className="flex items-center gap-2">
            <span>Continue Shopping</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  const selectedAddr = getSelectedAddressDetails();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link to={ROUTES.CART} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-brand-accent transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Bag</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Checkout steps inputs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Shipping Address */}
          <div className={`bg-white border rounded-3xl p-6 dark:bg-slate-900 shadow-sm transition-all duration-300 ₹{
            activeStep === 1 ? 'border-slate-200 dark:border-slate-700' : 'border-slate-100 dark:border-slate-800 opacity-90'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <span className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-sm ₹{
                  selectedAddr ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                }`}>
                  {selectedAddr ? <Check className="h-4 w-4" /> : '1'}
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Delivery Address</h2>
                  <p className="text-slate-400 text-xs font-semibold">Select where you want your fashion delivered</p>
                </div>
              </div>
              
              {activeStep !== 1 && selectedAddr && (
                <button
                  onClick={() => setActiveStep(1)}
                  className="text-xs font-bold text-brand-accent hover:underline cursor-pointer"
                >
                  Change
                </button>
              )}
            </div>

            {activeStep === 1 ? (
              <div className="space-y-6">
                {addressLoading ? (
                  <div className="text-center py-4 text-sm text-slate-400">Loading addresses...</div>
                ) : addresses.length === 0 && !showAddForm ? (
                  <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                    <p className="text-slate-500 text-sm">No saved addresses found.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddForm(true)}
                      className="flex items-center gap-1.5 mx-auto"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add New Address</span>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr._id}
                        onClick={() => setSelectedAddressId(addr._id)}
                        className={`group relative p-4 border rounded-2xl cursor-pointer hover:border-slate-300 transition-all ₹{
                          selectedAddressId === addr._id
                            ? 'border-brand-dark bg-slate-50/50 dark:border-white dark:bg-slate-800/40'
                            : 'border-slate-100 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <MapPin className={`h-4 w-4 ₹{selectedAddressId === addr._id ? 'text-brand-accent' : 'text-slate-400'}`} />
                            <span className="font-bold text-sm text-slate-900 dark:text-white">{addr.fullName}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {addr.isDefault && (
                              <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold px-1.5 py-0.5 rounded-md">
                                Default
                              </span>
                            )}
                            <button
                              onClick={(e) => handleDeleteAddress(addr._id, e)}
                              className="p-1 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-md cursor-pointer"
                              title="Delete Address"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 space-y-1 pl-6">
                          <p>{addr.addressLine1}</p>
                          {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                          <p>{addr.city}, {addr.state} - {addr.postalCode}</p>
                          <p className="flex items-center gap-1 mt-1 font-semibold text-slate-600 dark:text-slate-300">
                            <Phone className="h-3 w-3" />
                            <span>{addr.phone}</span>
                          </p>
                        </div>

                        {selectedAddressId === addr._id && (
                          <div className="absolute bottom-3 right-3 bg-brand-dark dark:bg-white p-1 rounded-full text-white dark:text-brand-dark">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new address inline */}
                {!showAddForm ? (
                  addresses.length > 0 && (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="flex items-center gap-1.5 py-2 px-4 border border-dashed border-slate-200 dark:border-slate-800 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add New Address</span>
                    </button>
                  )
                ) : (
                  <form onSubmit={handleAddAddressSubmit} className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Add Shipping Address</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Full Name *</label>
                        <input
                          type="text"
                          name="fullName"
                          required
                          value={formValues.fullName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-800 dark:border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Phone Number *</label>
                        <input
                          type="text"
                          name="phone"
                          required
                          value={formValues.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-800 dark:border-slate-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Address Line 1 *</label>
                        <input
                          type="text"
                          name="addressLine1"
                          required
                          value={formValues.addressLine1}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-800 dark:border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Address Line 2 (Optional)</label>
                        <input
                          type="text"
                          name="addressLine2"
                          value={formValues.addressLine2}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-800 dark:border-slate-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">City *</label>
                        <input
                          type="text"
                          name="city"
                          required
                          value={formValues.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-800 dark:border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">State *</label>
                        <input
                          type="text"
                          name="state"
                          required
                          value={formValues.state}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-800 dark:border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Postal Code *</label>
                        <input
                          type="text"
                          name="postalCode"
                          required
                          value={formValues.postalCode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-accent dark:bg-slate-800 dark:border-slate-700"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isDefault"
                        name="isDefault"
                        checked={formValues.isDefault}
                        onChange={handleInputChange}
                        className="rounded text-brand-accent focus:ring-brand-accent"
                      />
                      <label htmlFor="isDefault" className="text-xs text-slate-600 dark:text-slate-300 font-bold select-none cursor-pointer">
                        Set as default shipping address
                      </label>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button type="submit" variant="secondary" size="sm" className="cursor-pointer">
                        Save Address
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddForm(false)}
                        className="cursor-pointer"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                {selectedAddr && !showAddForm && (
                  <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      variant="primary"
                      onClick={() => setActiveStep(2)}
                      className="flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Continue to Summary</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              // Collapsed state Address details
              selectedAddr && (
                <div className="pl-11 mt-2 text-sm text-slate-600 dark:text-slate-400">
                  <p className="font-bold text-slate-800 dark:text-slate-200">{selectedAddr.fullName}</p>
                  <p>{selectedAddr.addressLine1}{selectedAddr.addressLine2 ? `, ₹{selectedAddr.addressLine2}` : ''}</p>
                  <p>{selectedAddr.city}, {selectedAddr.state} - {selectedAddr.postalCode}</p>
                  <p className="text-xs text-slate-400 mt-1">Phone: {selectedAddr.phone}</p>
                </div>
              )
            )}
          </div>

          {/* Step 2: Order Items Summary */}
          <div className={`bg-white border rounded-3xl p-6 dark:bg-slate-900 shadow-sm transition-all duration-300 ₹{
            activeStep === 2 ? 'border-slate-200 dark:border-slate-700' : 'border-slate-100 dark:border-slate-800 opacity-90'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <span className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-sm ₹{
                  activeStep > 2 ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                }`}>
                  {activeStep > 2 ? <Check className="h-4 w-4" /> : '2'}
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Review Items</h2>
                  <p className="text-slate-400 text-xs font-semibold">Verify products and quantities in your order</p>
                </div>
              </div>
              
              {activeStep !== 2 && activeStep > 2 && (
                <button
                  onClick={() => setActiveStep(2)}
                  className="text-xs font-bold text-brand-accent hover:underline cursor-pointer"
                >
                  Change
                </button>
              )}
            </div>

            {activeStep === 2 && (
              <div className="space-y-6">
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div key={item.sku} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 dark:border-slate-800 flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">No Image</div>
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{item.name}</h4>
                          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                            {item.size && <span className="mr-2">Size: {item.size}</span>}
                            {item.color && <span>Color: {item.color}</span>}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="text-slate-400">Qty: {item.quantity}</span>
                          <span className="font-black text-slate-900 dark:text-white">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="outline"
                    onClick={() => setActiveStep(1)}
                    className="cursor-pointer"
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setActiveStep(3)}
                    className="flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Continue to Payment</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {activeStep !== 2 && (
              <div className="pl-11 mt-2 text-xs text-slate-500">
                {items.length} {items.length === 1 ? 'item' : 'items'} in order bag.
              </div>
            )}
          </div>

          {/* Step 3: Payment Options */}
          <div className={`bg-white border rounded-3xl p-6 dark:bg-slate-900 shadow-sm transition-all duration-300 ₹{
            activeStep === 3 ? 'border-slate-200 dark:border-slate-700' : 'border-slate-100 dark:border-slate-800 opacity-90'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-full flex items-center justify-center font-black text-sm bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  3
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Payment Method</h2>
                  <p className="text-slate-400 text-xs font-semibold">Select your preferred payment method</p>
                </div>
              </div>
            </div>

            {activeStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  {/* COD Option */}
                  <label className={`flex items-start gap-4 p-4 border rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ₹{
                    paymentMethod === 'COD' ? 'border-brand-dark dark:border-white' : 'border-slate-100 dark:border-slate-800'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="mt-1 text-brand-accent focus:ring-brand-accent"
                    />
                    <div className="space-y-1">
                      <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Truck className="h-4 w-4 text-slate-500" />
                        <span>Cash on Delivery (COD)</span>
                      </span>
                      <p className="text-xs text-slate-500">Pay in cash or digital wallet upon delivery of your items.</p>
                    </div>
                  </label>

                  {/* Online Payment Option */}
                  <label className={`flex items-start gap-4 p-4 border rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ₹{
                    paymentMethod === 'ONLINE' ? 'border-brand-dark dark:border-white' : 'border-slate-100 dark:border-slate-800'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ONLINE"
                      checked={paymentMethod === 'ONLINE'}
                      onChange={() => setPaymentMethod('ONLINE')}
                      className="mt-1 text-brand-accent focus:ring-brand-accent"
                    />
                    <div className="space-y-1">
                      <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        <CreditCard className="h-4 w-4 text-slate-500" />
                        <span>Pay Online (Razorpay Test Mode)</span>
                      </span>
                      <p className="text-xs text-slate-500">
                        Pay securely using Credit/Debit Card, UPI, NetBanking. (Online payment sandbox is prepared).
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="outline"
                    onClick={() => setActiveStep(2)}
                    className="cursor-pointer"
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}

            {activeStep !== 3 && (
              <div className="pl-11 mt-2 text-xs text-slate-500">
                Payment selection pending next steps.
              </div>
            )}
          </div>
        </div>

        {/* Right column: Order Totals & Placement Summary */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">
              Payment Summary
            </h2>

            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Shipping & Handling</span>
                {shippingFee === 0 ? (
                  <span className="text-emerald-500 font-bold">Free</span>
                ) : (
                  <span className="font-bold text-slate-900 dark:text-white">₹{shippingFee.toFixed(2)}</span>
                )}
              </div>

              <div className="flex justify-between pb-2">
                <span>Estimated Tax (8%)</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{estTax.toFixed(2)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold border-t border-dashed border-slate-100 dark:border-slate-800 pt-2">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-₹₹{discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Coupon input form */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              {!appliedCoupon ? (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo / Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-accent dark:bg-slate-800 dark:border-slate-700"
                    />
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      className="cursor-pointer text-xs"
                    >
                      {isValidatingCoupon ? 'Applying...' : 'Apply'}
                    </Button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCouponDrawerOpen(true)}
                    className="text-[11px] font-bold text-brand-accent hover:underline flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <TicketPercent className="h-3.5 w-3.5" />
                    <span>View Available Coupons</span>
                  </button>
                  {couponError && (
                    <p className="text-[10px] text-rose-500 font-semibold">{couponError}</p>
                  )}
                </form>
              ) : (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-xs flex justify-between items-center">
                  <div>
                    <p className="font-bold">Coupon Applied: {appliedCoupon.code}</p>
                    <p className="opacity-90">Saved ₹{discount.toFixed(2)} on this order</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-rose-500 font-bold hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between text-base font-black text-slate-900 dark:text-white border-t border-slate-100 dark:border-slate-800 pt-4">
              <span>Total Amount</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            {selectedAddr && (
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Delivery To:</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{selectedAddr.fullName}</p>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {selectedAddr.addressLine1}, {selectedAddr.city}, {selectedAddr.state} - {selectedAddr.postalCode}
                </p>
              </div>
            )}

            <Button
              variant="secondary"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={!selectedAddressId}
              isLoading={orderLoading}
              className="w-full flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Place Order (₹{total.toFixed(2)})</span>
            </Button>
          </div>

          {/* Secure transaction lock info */}
          <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-4 flex gap-3 text-xs text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-300">
            <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <div className="space-y-1">
              <h4 className="font-bold">Encrypted Connection</h4>
              <p className="leading-relaxed opacity-90">
                Your order security is our priority. Your billing detail credentials and addresses are encrypted during transfer.
              </p>
            </div>
          </div>
        </div>
      </div>
      <CouponPickerDrawer
        isOpen={isCouponDrawerOpen}
        onClose={() => setIsCouponDrawerOpen(false)}
        cartSubtotal={subtotal}
        cartItems={items.map((i) => ({
          productId: i.productId,
          sku: i.sku,
          price: i.price,
          quantity: i.quantity,
        }))}
        onApplyCoupon={(code) => handleApplyCoupon(undefined, code)}
        appliedCouponCode={appliedCoupon?.code}
      />
    </div>
  );
};

export default Checkout;
