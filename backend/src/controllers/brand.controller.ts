import { Request, Response } from 'express';
import { BrandService } from '../services/brand.service';
import { ApiResponse } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import { asyncHandler } from '../middlewares/async-handler.middleware';
import { UserRole } from '../constants/enums';

export const createBrand = asyncHandler(async (req: Request, res: Response) => {
  const brand = await BrandService.create(req.body);
  res.status(HttpStatus.CREATED).json(
    ApiResponse.success(HttpStatus.CREATED, 'Brand created successfully', brand)
  );
});

export const listBrands = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user?.roles?.includes(UserRole.ADMIN);
  const filters: { isActive?: boolean } = {};

  if (!isAdmin) {
    filters.isActive = true;
  } else if (req.query.isActive !== undefined) {
    filters.isActive = req.query.isActive === 'true';
  }

  const brands = await BrandService.list(filters);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Brands retrieved successfully', brands)
  );
});

export const getBrandBySlug = asyncHandler(async (req: Request, res: Response) => {
  const brand = await BrandService.getBySlug(req.params.slug);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Brand retrieved successfully', brand)
  );
});

export const updateBrand = asyncHandler(async (req: Request, res: Response) => {
  const brand = await BrandService.update(req.params.id, req.body);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Brand updated successfully', brand)
  );
});

export const toggleBrandActive = asyncHandler(async (req: Request, res: Response) => {
  const brand = await BrandService.toggleActive(req.params.id);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(
      HttpStatus.OK,
      `Brand is now ${brand.isActive ? 'active' : 'inactive'}`,
      brand
    )
  );
});
