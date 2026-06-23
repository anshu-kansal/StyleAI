import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';
import { ApiResponse } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import { asyncHandler } from '../middlewares/async-handler.middleware';
import { UserRole } from '../constants/enums';

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await CategoryService.create(req.body);
  res.status(HttpStatus.CREATED).json(
    ApiResponse.success(HttpStatus.CREATED, 'Category created successfully', category)
  );
});

export const listCategories = asyncHandler(async (req: Request, res: Response) => {
  // If user is not admin, only show active categories
  const isAdmin = req.user?.roles?.includes(UserRole.ADMIN);
  const filters: { isActive?: boolean } = {};
  
  if (!isAdmin) {
    filters.isActive = true;
  } else if (req.query.isActive !== undefined) {
    filters.isActive = req.query.isActive === 'true';
  }

  const categories = await CategoryService.list(filters);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Categories retrieved successfully', categories)
  );
});

export const getCategoryBySlug = asyncHandler(async (req: Request, res: Response) => {
  const category = await CategoryService.getBySlug(req.params.slug);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Category retrieved successfully', category)
  );
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await CategoryService.update(req.params.id, req.body);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Category updated successfully', category)
  );
});

export const toggleCategoryActive = asyncHandler(async (req: Request, res: Response) => {
  const category = await CategoryService.toggleActive(req.params.id);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(
      HttpStatus.OK,
      `Category is now ${category.isActive ? 'active' : 'inactive'}`,
      category
    )
  );
});
