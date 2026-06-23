import { Request, Response } from 'express';
import { AddressService } from '../services/address.service';
import { ApiResponse } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import { asyncHandler } from '../middlewares/async-handler.middleware';
import { ApiError } from '../utils/api-error';

export const createAddress = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('User is not authenticated');
  }
  const address = await AddressService.create(req.user.id, req.body);
  res.status(HttpStatus.CREATED).json(
    ApiResponse.success(HttpStatus.CREATED, 'Address created successfully', address)
  );
});

export const listAddresses = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('User is not authenticated');
  }
  const addresses = await AddressService.list(req.user.id);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Addresses retrieved successfully', addresses)
  );
});

export const getAddressById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('User is not authenticated');
  }
  const address = await AddressService.getById(req.user.id, req.params.id);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Address retrieved successfully', address)
  );
});

export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('User is not authenticated');
  }
  const address = await AddressService.update(req.user.id, req.params.id, req.body);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Address updated successfully', address)
  );
});

export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('User is not authenticated');
  }
  const result = await AddressService.delete(req.user.id, req.params.id);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Address deleted successfully', result)
  );
});
