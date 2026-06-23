import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { ApiResponse } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import { asyncHandler } from '../middlewares/async-handler.middleware';
import { ApiError } from '../utils/api-error';

export const createRazorpayOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('User is not authenticated');
  }

  const { items, addressId, couponCode } = req.body;
  if (!items || !addressId) {
    throw ApiError.badRequest('Missing order items or shipping address ID');
  }

  const result = await OrderService.createRazorpayOrder(req.user.id, items, addressId, couponCode);
  res.status(HttpStatus.CREATED).json(
    ApiResponse.success(HttpStatus.CREATED, 'Razorpay order created successfully', result)
  );
});

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('User is not authenticated');
  }

  const order = await OrderService.verifyPaymentAndPlaceOrder(req.user.id, req.body);
  res.status(HttpStatus.CREATED).json(
    ApiResponse.success(HttpStatus.CREATED, 'Payment verified and order placed successfully', order)
  );
});

export const placeCODOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('User is not authenticated');
  }

  const { items, addressId, couponCode } = req.body;
  if (!items || !addressId) {
    throw ApiError.badRequest('Missing order items or shipping address ID');
  }

  const order = await OrderService.placeCODOrder(req.user.id, items, addressId, couponCode);
  res.status(HttpStatus.CREATED).json(
    ApiResponse.success(HttpStatus.CREATED, 'COD Order placed successfully', order)
  );
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('User is not authenticated');
  }

  const orders = await OrderService.getMyOrders(req.user.id);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'My orders fetched successfully', orders)
  );
});

export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('User is not authenticated');
  }

  const order = await OrderService.getOrderById(req.params.id, req.user.id, req.user.roles);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Order details fetched successfully', order)
  );
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('User is not authenticated');
  }

  const order = await OrderService.cancelOrder(req.params.id, req.user.id, req.user.roles);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Order cancelled successfully', order)
  );
});

export const requestReturn = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('User is not authenticated');
  }

  const order = await OrderService.requestReturn(req.params.id, req.user.id);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Return requested successfully', order)
  );
});

export const getAllOrders = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await OrderService.getAllOrders();
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'All customer orders fetched successfully', orders)
  );
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { orderStatus } = req.body;
  const order = await OrderService.updateOrderStatus(req.params.id, orderStatus);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Order status updated successfully', order)
  );
});
