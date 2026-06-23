import request from 'supertest';
import { app } from '../server';
import Coupon from '../models/coupon.model';
import Order from '../models/order.model';

// Mock the Auth Middleware to auto-login a test user
jest.mock('../middlewares/auth.middleware', () => {
  return {
    authMiddleware: (req: any, _res: any, next: any) => {
      req.user = {
        id: '64af82a392b451c098a58f4c',
        email: 'testuser@example.com',
        roles: ['USER'],
        name: 'Test User',
      };
      next();
    },
  };
});

// Mock Mongoose Models
jest.mock('../models/coupon.model');
jest.mock('../models/order.model');

describe('Coupon Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/coupons/validate', () => {
    it('should successfully validate a valid PERCENTAGE coupon', async () => {
      const mockCoupon = {
        code: 'SAVE20',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderAmount: 50,
        maxDiscount: 100,
        validFrom: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
        isActive: true,
        usageLimit: 0,
        usedCount: 0,
        usageLimitPerUser: 0,
        applicableProducts: [],
        applicableCategories: [],
        userRestrictions: [],
        firstTimeOnly: false,
      };

      (Coupon.findOne as jest.Mock).mockResolvedValue(mockCoupon);

      const res = await request(app)
        .post('/api/v1/coupons/validate')
        .send({
          code: 'SAVE20',
          items: [
            {
              productId: '64af82a392b451c098a58f4d',
              sku: 'SKU-SHIRT-M',
              price: 100,
              quantity: 1,
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe('SAVE20');
      expect(res.body.data.discount).toBe(20);
      expect(res.body.data.newTotal).toBe(80);
    });

    it('should fail if coupon is expired', async () => {
      const mockExpiredCoupon = {
        code: 'OLDCODE',
        discountType: 'FIXED',
        discountValue: 10,
        minOrderAmount: 0,
        maxDiscount: 0,
        validFrom: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        validUntil: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // expired 2 days ago
        isActive: true,
        usageLimit: 0,
        usedCount: 0,
        usageLimitPerUser: 0,
      };

      (Coupon.findOne as jest.Mock).mockResolvedValue(mockExpiredCoupon);

      const res = await request(app)
        .post('/api/v1/coupons/validate')
        .send({
          code: 'OLDCODE',
          items: [
            {
              productId: '64af82a392b451c098a58f4d',
              sku: 'SKU-SHIRT-M',
              price: 50,
              quantity: 1,
            },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('expired');
    });

    it('should fail if user usage limit is exceeded', async () => {
      const mockLimitedCoupon = {
        code: 'ONETIME',
        discountType: 'FIXED',
        discountValue: 15,
        minOrderAmount: 0,
        maxDiscount: 0,
        validFrom: new Date(Date.now() - 24 * 60 * 60 * 1000),
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isActive: true,
        usageLimit: 0,
        usedCount: 0,
        usageLimitPerUser: 1, // limit 1 per user
      };

      (Coupon.findOne as jest.Mock).mockResolvedValue(mockLimitedCoupon);
      (Order.countDocuments as jest.Mock).mockResolvedValue(1); // User already used it once

      const res = await request(app)
        .post('/api/v1/coupons/validate')
        .send({
          code: 'ONETIME',
          items: [
            {
              productId: '64af82a392b451c098a58f4d',
              sku: 'SKU-SHIRT-M',
              price: 50,
              quantity: 1,
            },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('maximum');
    });

    it('should fail if coupon is not found in database', async () => {
      (Coupon.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/coupons/validate')
        .send({
          code: 'NOCOUPON',
          items: [
            {
              productId: '64af82a392b451c098a58f4d',
              sku: 'SKU-SHIRT-M',
              price: 50,
              quantity: 1,
            },
          ],
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
