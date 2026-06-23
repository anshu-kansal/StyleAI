import Order from '../models/order.model';
import Product from '../models/product.model';
import Address from '../models/address.model';
import Coupon from '../models/coupon.model';
import CouponService from './coupon.service';
import { ApiError } from '../utils/api-error';
import { config } from '../config/app.config';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay SDK
const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

export class OrderService {
  /**
   * Helper to validate shipping address and cart items, calculating totals securely.
   */
  static async validateAndGetTotals(
    items: { productId: string; sku: string; quantity: number }[],
    addressId: string,
    userId: string,
    couponCode?: string
  ) {
    // 1. Fetch and validate address
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
      throw ApiError.notFound('Shipping address not found or unauthorized');
    }

    // 2. Fetch and validate items/stock
    let subtotal = 0;
    const verifiedItems: any[] = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw ApiError.notFound(`Product with ID ${item.productId} not found`);
      }

      const variant = product.variants.find((v) => v.sku === item.sku);
      if (!variant) {
        throw ApiError.notFound(`Product variant with SKU ${item.sku} not found`);
      }

      if (variant.stock < item.quantity) {
        throw ApiError.badRequest(`Insufficient stock for product ${product.name} (SKU: ${item.sku})`);
      }

      subtotal += variant.price * item.quantity;
      verifiedItems.push({
        product: product._id,
        name: product.name,
        sku: item.sku,
        size: variant.size,
        color: variant.color,
        price: variant.price,
        quantity: item.quantity,
        image: product.images[0] || variant.images[0],
      });
    }

    let discount = 0;
    if (couponCode) {
      // Map verifiedItems to format expected by applyCoupon
      const checkoutItems = verifiedItems.map((v) => ({
        productId: v.product.toString(),
        sku: v.sku,
        price: v.price,
        quantity: v.quantity,
      }));
      
      const couponResult = await CouponService.applyCoupon(couponCode, subtotal, userId, checkoutItems);
      discount = couponResult.discount;
    }

    const shippingFee = subtotal >= 150 || subtotal === 0 ? 0 : 15;
    const estTax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.max(0, Math.round((subtotal - discount + shippingFee + estTax) * 100) / 100);

    return {
      address,
      verifiedItems,
      totals: {
        subtotal,
        shippingFee,
        estTax,
        discount,
        total,
      },
    };
  }

  /**
   * Create Razorpay order on Razorpay servers.
   */
  static async createRazorpayOrder(
    userId: string,
    items: { productId: string; sku: string; quantity: number }[],
    addressId: string,
    couponCode?: string
  ) {
    const { totals } = await this.validateAndGetTotals(items, addressId, userId, couponCode);

    // Convert total to INR (USD * 80) since Razorpay test credentials default to INR
    const inrAmount = Math.round(totals.total * 80);
    const paiseAmount = inrAmount * 100; // Razorpay expects amount in paise

    const options = {
      amount: paiseAmount,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}_${userId.toString().slice(-4)}`,
    };

    try {
      const razorpayOrder = await razorpay.orders.create(options);
      return {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: config.razorpay.keyId,
        checkoutAmount: totals.total, // Return original USD amount for frontend display
      };
    } catch (err: any) {
      throw ApiError.internal(`Razorpay order creation failed: ${err.message || err}`);
    }
  }

  /**
   * Cryptographically verify Razorpay payment and place the order.
   */
  static async verifyPaymentAndPlaceOrder(
    userId: string,
    verifyData: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      addressId: string;
      items: { productId: string; sku: string; quantity: number }[];
      couponCode?: string;
    }
  ) {
    // 1. Verify Razorpay Signature
    const body = verifyData.razorpay_order_id + '|' + verifyData.razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== verifyData.razorpay_signature) {
      throw ApiError.badRequest('Invalid payment signature. Transaction rejected.');
    }

    // 2. Validate items and get totals
    const { address, verifiedItems, totals } = await this.validateAndGetTotals(
      verifyData.items,
      verifyData.addressId,
      userId,
      verifyData.couponCode
    );

    // 3. Create Order in Database
    const order = new Order({
      user: userId,
      items: verifiedItems,
      shippingAddress: {
        fullName: address.fullName,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phone: address.phone,
      },
      paymentMethod: 'ONLINE',
      paymentStatus: 'PAID',
      orderStatus: 'CONFIRMED',
      totals,
      couponCode: verifyData.couponCode ? verifyData.couponCode.toUpperCase() : undefined,
      razorpayDetails: {
        orderId: verifyData.razorpay_order_id,
        paymentId: verifyData.razorpay_payment_id,
        signature: verifyData.razorpay_signature,
      },
    });

    await order.save();

    // 3.5 Increment Coupon usedCount if applied
    if (verifyData.couponCode) {
      await Coupon.updateOne(
        { code: verifyData.couponCode.toUpperCase() },
        { $inc: { usedCount: 1 } }
      );
    }

    // 4. Decrement Stock
    for (const item of verifyData.items) {
      await Product.updateOne(
        { _id: item.productId, 'variants.sku': item.sku },
        { $inc: { 'variants.$.stock': -item.quantity } }
      );
    }

    return order;
  }

  /**
   * Place Cash on Delivery order directly.
   */
  static async placeCODOrder(
    userId: string,
    items: { productId: string; sku: string; quantity: number }[],
    addressId: string,
    couponCode?: string
  ) {
    const { address, verifiedItems, totals } = await this.validateAndGetTotals(items, addressId, userId, couponCode);

    const order = new Order({
      user: userId,
      items: verifiedItems,
      shippingAddress: {
        fullName: address.fullName,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phone: address.phone,
      },
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      orderStatus: 'CONFIRMED',
      totals,
      couponCode: couponCode ? couponCode.toUpperCase() : undefined,
    });

    await order.save();

    // Increment Coupon usedCount if applied
    if (couponCode) {
      await Coupon.updateOne(
        { code: couponCode.toUpperCase() },
        { $inc: { usedCount: 1 } }
      );
    }

    // Decrement Stock
    for (const item of items) {
      await Product.updateOne(
        { _id: item.productId, 'variants.sku': item.sku },
        { $inc: { 'variants.$.stock': -item.quantity } }
      );
    }

    return order;
  }

  /**
   * Fetch all orders for a user.
   */
  static async getMyOrders(userId: string) {
    return await Order.find({ user: userId }).sort({ createdAt: -1 });
  }

  /**
   * Fetch a single order by ID with auth check.
   */
  static async getOrderById(orderId: string, userId: string, userRoles: string[]) {
    const order = await Order.findById(orderId).populate('user', 'name email');
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    const isAdmin = userRoles.includes('ADMIN') || userRoles.includes('admin');
    const orderUserId = (order.user as any)._id ? (order.user as any)._id.toString() : order.user.toString();
    
    if (orderUserId !== userId && !isAdmin) {
      throw ApiError.forbidden('You are not authorized to view this order');
    }

    return order;
  }

  /**
   * Cancel an order (user or admin) and restore variant stocks.
   */
  static async cancelOrder(orderId: string, userId: string, userRoles: string[]) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    const isAdmin = userRoles.includes('ADMIN') || userRoles.includes('admin');
    const orderUserId = order.user.toString();
    
    if (orderUserId !== userId && !isAdmin) {
      throw ApiError.forbidden('You are not authorized to cancel this order');
    }

    if (order.orderStatus === 'CANCELLED') {
      throw ApiError.badRequest('Order is already cancelled');
    }

    if (!['PENDING', 'CONFIRMED'].includes(order.orderStatus)) {
      throw ApiError.badRequest(`Order cannot be cancelled once it is ${order.orderStatus.toLowerCase()}`);
    }

    // Restore stock
    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.product, 'variants.sku': item.sku },
        { $inc: { 'variants.$.stock': item.quantity } }
      );
    }

    order.orderStatus = 'CANCELLED';
    await order.save();

    // Decrement Coupon usedCount if applied
    if (order.couponCode) {
      await Coupon.updateOne(
        { code: order.couponCode.toUpperCase() },
        { $inc: { usedCount: -1 } }
      );
    }

    return order;
  }

  /**
   * Request a return for a delivered order.
   */
  static async requestReturn(orderId: string, userId: string) {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      throw ApiError.notFound('Order not found or unauthorized');
    }

    if (order.orderStatus !== 'DELIVERED') {
      throw ApiError.badRequest('Only delivered orders can be returned');
    }

    order.orderStatus = 'RETURNED';
    await order.save();
    return order;
  }

  /**
   * Fetch all orders (Admin only).
   */
  static async getAllOrders() {
    return await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
  }

  /**
   * Update order status manually (Admin only).
   */
  static async updateOrderStatus(orderId: string, status: string) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    const oldStatus = order.orderStatus;
    if (oldStatus === 'CANCELLED') {
      throw ApiError.badRequest('Cannot update status of a cancelled order');
    }

    if (status === 'CANCELLED') {
      // Restore stock
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.product, 'variants.sku': item.sku },
          { $inc: { 'variants.$.stock': item.quantity } }
        );
      }
    }

    order.orderStatus = status as any;

    // COD order is marked PAID when delivered
    if (status === 'DELIVERED') {
      order.paymentStatus = 'PAID';
    }

    if (status === 'CANCELLED' && order.couponCode) {
      await Coupon.updateOne(
        { code: order.couponCode.toUpperCase() },
        { $inc: { usedCount: -1 } }
      );
    }

    await order.save();
    return order;
  }
}
export default OrderService;
