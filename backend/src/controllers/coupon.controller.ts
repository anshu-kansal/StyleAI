import { Request, Response } from 'express';
import { CouponService } from '../services/coupon.service';
import { ApiResponse } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import { asyncHandler } from '../middlewares/async-handler.middleware';

export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await CouponService.create(req.body);
  res.status(HttpStatus.CREATED).json(
    ApiResponse.success(HttpStatus.CREATED, 'Coupon created successfully', coupon)
  );
});

export const listCoupons = asyncHandler(async (_req: Request, res: Response) => {
  const coupons = await CouponService.list();
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Coupons fetched successfully', coupons)
  );
});

export const getCouponById = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await CouponService.getById(req.params.id);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Coupon details fetched', coupon)
  );
});

export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await CouponService.update(req.params.id, req.body);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Coupon updated successfully', coupon)
  );
});

export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
  await CouponService.delete(req.params.id);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Coupon deleted successfully')
  );
});

export const validateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { code, items } = req.body;
  const result = await CouponService.applyCoupon(
    code,
    0,
    req.user!.id,
    items
  );
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Coupon applied successfully', result)
  );
});

export const getStorefrontCoupons = asyncHandler(async (_req: Request, res: Response) => {
  const coupons = await CouponService.listStorefront();
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Storefront coupons fetched successfully', coupons)
  );
});
