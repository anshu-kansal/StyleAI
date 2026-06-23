import { Router } from 'express';
import { ApiResponse } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import authRouter from './auth.routes';
import categoryRouter from './category.routes';
import brandRouter from './brand.routes';
import productRouter from './product.routes';
import addressRouter from './address.routes';
import orderRouter from './order.routes';
import stylistRouter from './stylist.routes';
import aiRouter from './ai.routes';
import couponRouter from './coupon.routes';
import adminRouter from './admin.routes';
import reviewRouter from './review.routes';
import qaRouter from './qa.routes';

const router = Router();

// Health check route
router.get('/health', (_req, res) => {
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Server is healthy', {
      timestamp: new Date(),
      uptime: process.uptime(),
    })
  );
});

// Routes mounting
router.use('/auth', authRouter);
router.use('/categories', categoryRouter);
router.use('/brands', brandRouter);
router.use('/products', productRouter);
router.use('/addresses', addressRouter);
router.use('/orders', orderRouter);
router.use('/stylist', stylistRouter);
router.use('/ai', aiRouter);
router.use('/coupons', couponRouter);
router.use('/admin', adminRouter);
router.use('/reviews', reviewRouter);
router.use('/qa', qaRouter);

export default router;


