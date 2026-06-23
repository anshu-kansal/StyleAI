import Coupon, { ICoupon } from '../models/coupon.model';
import Order from '../models/order.model';
import Product from '../models/product.model';
import { ApiError } from '../utils/api-error';

export class CouponService {
  /**
   * Create a new coupon
   */
  static async create(data: Partial<ICoupon>) {
    const existing = await Coupon.findOne({ code: data.code });
    if (existing) {
      throw ApiError.conflict('A coupon with this code already exists');
    }
    const coupon = new Coupon(data);
    await coupon.save();
    return coupon;
  }

  /**
   * List all coupons (admin)
   */
  static async list() {
    return await Coupon.find().sort({ createdAt: -1 });
  }

  /**
   * List active coupons for storefront
   */
  static async listStorefront() {
    const now = new Date();
    return await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    }).sort({ createdAt: -1 });
  }

  /**
   * Get coupon by ID
   */
  static async getById(id: string) {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      throw ApiError.notFound('Coupon not found');
    }
    return coupon;
  }

  /**
   * Update a coupon
   */
  static async update(id: string, data: Partial<ICoupon>) {
    const coupon = await Coupon.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!coupon) {
      throw ApiError.notFound('Coupon not found');
    }
    return coupon;
  }

  /**
   * Delete a coupon
   */
  static async delete(id: string) {
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      throw ApiError.notFound('Coupon not found');
    }
    return coupon;
  }

  /**
   * Validate and apply a coupon code to checkout items/totals.
   * Returns the validation and calculated discount details.
   */
  static async applyCoupon(
    code: string,
    orderTotal: number,
    userId: string,
    items?: { productId: string; sku: string; price: number; quantity: number }[]
  ) {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      throw ApiError.notFound('Invalid coupon code');
    }

    if (!coupon.isActive) {
      throw ApiError.badRequest('This coupon is no longer active');
    }

    const now = new Date();
    if (now < coupon.validFrom) {
      throw ApiError.badRequest('This coupon is not yet valid');
    }
    if (now > coupon.validUntil) {
      throw ApiError.badRequest('This coupon has expired');
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      throw ApiError.badRequest('This coupon has reached its usage limit');
    }

    // User restrictions check
    if (coupon.userRestrictions && coupon.userRestrictions.length > 0) {
      const isRestricted = !coupon.userRestrictions.some(
        (restrictedId) => restrictedId.toString() === userId.toString()
      );
      if (isRestricted) {
        throw ApiError.badRequest('This coupon code is not eligible for your account');
      }
    }

    // First time only check
    if (coupon.firstTimeOnly) {
      const confirmedOrders = await Order.countDocuments({
        user: userId,
        orderStatus: { $ne: 'CANCELLED' },
      });
      if (confirmedOrders > 0) {
        throw ApiError.badRequest('This coupon is only valid for your first order');
      }
    }

    // Per user usage limit check
    if (coupon.usageLimitPerUser > 0) {
      const userUsageCount = await Order.countDocuments({
        user: userId,
        couponCode: coupon.code,
        orderStatus: { $ne: 'CANCELLED' },
      });
      if (userUsageCount >= coupon.usageLimitPerUser) {
        throw ApiError.badRequest(
          `You have already used this coupon code the maximum of ${coupon.usageLimitPerUser} time(s)`
        );
      }
    }

    // Calculate subtotal and eligible items subtotal
    let totalSubtotal = 0;
    let eligibleSubtotal = 0;

    if (items && items.length > 0) {
      for (const item of items) {
        totalSubtotal += item.price * item.quantity;
        
        let isEligible = false;
        if (
          (!coupon.applicableProducts || coupon.applicableProducts.length === 0) &&
          (!coupon.applicableCategories || coupon.applicableCategories.length === 0)
        ) {
          isEligible = true;
        } else {
          if (
            coupon.applicableProducts &&
            coupon.applicableProducts.some((pId) => pId.toString() === item.productId.toString())
          ) {
            isEligible = true;
          }
          if (!isEligible && coupon.applicableCategories && coupon.applicableCategories.length > 0) {
            const prod = await Product.findById(item.productId);
            if (
              prod &&
              prod.category &&
              coupon.applicableCategories.some((catId) => catId.toString() === prod.category.toString())
            ) {
              isEligible = true;
            }
          }
        }

        if (isEligible) {
          eligibleSubtotal += item.price * item.quantity;
        }
      }
    } else {
      totalSubtotal = orderTotal;
      eligibleSubtotal = orderTotal;
    }

    if (totalSubtotal < coupon.minOrderAmount) {
      throw ApiError.badRequest(
        `Minimum order amount of $${coupon.minOrderAmount} is required to use this coupon`
      );
    }

    if (eligibleSubtotal <= 0) {
      throw ApiError.badRequest('None of the items in your cart are eligible for this coupon');
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = Math.round(((eligibleSubtotal * coupon.discountValue) / 100) * 100) / 100;
      if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    if (discount > eligibleSubtotal) {
      discount = eligibleSubtotal;
    }

    return {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount: Math.round(discount * 100) / 100,
      newTotal: Math.max(0, Math.round((totalSubtotal - discount) * 100) / 100),
      eligibleSubtotal: Math.round(eligibleSubtotal * 100) / 100,
      totalSubtotal: Math.round(totalSubtotal * 100) / 100,
    };
  }
}

export default CouponService;
