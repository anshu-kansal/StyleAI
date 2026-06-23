import { Request, Response } from 'express';
import { AuthService, parseDuration } from '../services/auth.service';
import { ApiResponse } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import { config } from '../config/app.config';
import { asyncHandler } from '../middlewares/async-handler.middleware';

const isProduction = config.env === 'production';

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict' as const,
  path: '/',
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);
  res.status(HttpStatus.CREATED).json(
    ApiResponse.success(HttpStatus.CREATED, 'User registered successfully', result)
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const deviceInfo = req.headers['user-agent'];
  const { accessToken, refreshToken, user } = await AuthService.login(req.body, deviceInfo);

  // Set HTTP-Only cookies
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: parseDuration(config.jwt.accessExpiration),
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: parseDuration(config.jwt.refreshExpiration),
  });

  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Login successful', {
      token: accessToken,
      refreshToken, // Return in response body for non-browser clients (APIs/Mobile)
      user,
    })
  );
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  // Try to extract refresh token from body or cookie
  let token = req.body.refreshToken;
  if (!token && req.cookies) {
    token = req.cookies.refreshToken;
  }

  if (!token) {
    res.status(HttpStatus.UNAUTHORIZED).json(
      ApiResponse.error(HttpStatus.UNAUTHORIZED, 'Refresh token is missing')
    );
    return;
  }

  const deviceInfo = req.headers['user-agent'];
  const { accessToken, refreshToken, user } = await AuthService.refresh(token, deviceInfo);

  // Set rotated tokens back to cookies
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: parseDuration(config.jwt.accessExpiration),
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: parseDuration(config.jwt.refreshExpiration),
  });

  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Token refreshed successfully', {
      token: accessToken,
      refreshToken,
      user,
    })
  );
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  let token = req.body.refreshToken;
  if (!token && req.cookies) {
    token = req.cookies.refreshToken;
  }

  if (token) {
    await AuthService.logout(token);
  }

  // Clear HTTP-Only cookies
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);

  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Logout successful')
  );
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  await AuthService.forgotPassword(email);

  res.status(HttpStatus.OK).json(
    ApiResponse.success(
      HttpStatus.OK,
      'If a user with that email exists, a password reset link has been sent.'
    )
  );
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  await AuthService.resetPassword(token, password);

  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Password reset successful')
  );
});
