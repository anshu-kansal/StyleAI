import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator';
import * as AuthController from '../controllers/auth.controller';

const router = Router();

router.post('/register', validate({ body: registerSchema }), AuthController.register);
router.post('/login', validate({ body: loginSchema }), AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/refresh', AuthController.refresh);
router.post('/forgot-password', validate({ body: forgotPasswordSchema }), AuthController.forgotPassword);
router.post('/reset-password', validate({ body: resetPasswordSchema }), AuthController.resetPassword);

export default router;
