import { Request, Response } from 'express';
import User from '../models/user.model';
import Order from '../models/order.model';
import Product from '../models/product.model';
import Coupon from '../models/coupon.model';
import { ApiResponse } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import { asyncHandler } from '../middlewares/async-handler.middleware';
import { ApiError } from '../utils/api-error';
import { UserRole } from '../constants/enums';

/**
 * GET /admin/stats — Dashboard analytics overview
 */
export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  // Aggregate counts
  const [totalUsers, totalProducts, totalOrders, activeCoupons] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Coupon.countDocuments({ isActive: true }),
  ]);

  // Revenue aggregate
  const revenueAgg = await Order.aggregate([
    { $match: { paymentStatus: 'PAID' } },
    { $group: { _id: null, totalRevenue: { $sum: '$totals.total' } } },
  ]);
  const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

  // Monthly revenue for the past 12 months
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyRevenue = await Order.aggregate([
    {
      $match: {
        paymentStatus: 'PAID',
        createdAt: { $gte: twelveMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        revenue: { $sum: '$totals.total' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Order status distribution
  const orderStatusDist = await Order.aggregate([
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
  ]);

  // Recent orders (last 10)
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('user', 'name email');

  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Dashboard stats fetched', {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      activeCoupons,
      monthlyRevenue,
      orderStatusDist,
      recentOrders,
    })
  );
});

/**
 * GET /admin/users — List all users
 */
export const getAllUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Users fetched successfully', users)
  );
});

/**
 * PATCH /admin/users/:id/role — Update user role
 */
export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { roles } = req.body;
  if (!roles || !Array.isArray(roles)) {
    throw ApiError.badRequest('Roles array is required');
  }

  // Validate roles
  const validRoles = Object.values(UserRole);
  for (const role of roles) {
    if (!validRoles.includes(role)) {
      throw ApiError.badRequest(`Invalid role: ${role}`);
    }
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { roles },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'User role updated successfully', user)
  );
});
