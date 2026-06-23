import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { UserRole } from '../constants/enums';
import {
  createOrderSchema,
  verifyPaymentSchema,
  updateOrderStatusSchema,
} from '../validators/order.validator';
import * as OrderController from '../controllers/order.controller';

const router = Router();

// All order routes require user authentication
router.use(authMiddleware);

// Customer & Shared Order Routes
router.get('/my-orders', OrderController.getMyOrders);
router.post('/razorpay', validate({ body: createOrderSchema }), OrderController.createRazorpayOrder);
router.post('/verify', validate({ body: verifyPaymentSchema }), OrderController.verifyPayment);
router.post('/cod', validate({ body: createOrderSchema }), OrderController.placeCODOrder);

router.get('/:id', OrderController.getOrderById);
router.patch('/:id/cancel', OrderController.cancelOrder);
router.patch('/:id/return', OrderController.requestReturn);

// Admin-Only Order Routes
router.get('/', requireRole(UserRole.ADMIN), OrderController.getAllOrders);
router.patch(
  '/:id/status',
  requireRole(UserRole.ADMIN),
  validate({ body: updateOrderStatusSchema }),
  OrderController.updateOrderStatus
);

export default router;
