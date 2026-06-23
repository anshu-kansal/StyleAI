import { Request, Response } from 'express';
import { ProductService, IProductFilters } from '../services/product.service';
import { ReviewService } from '../services/review.service';
import { AiService } from '../services/ai.service';
import { ApiResponse } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import { asyncHandler } from '../middlewares/async-handler.middleware';
import { UserRole } from '../constants/enums';

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await ProductService.create(req.body);
  res.status(HttpStatus.CREATED).json(
    ApiResponse.success(HttpStatus.CREATED, 'Product created successfully', product)
  );
});

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user?.roles?.includes(UserRole.ADMIN);
  
  // Extract query filters
  const filters: IProductFilters = {};
  
  // Force isActive to true for non-admin users
  if (!isAdmin) {
    filters.isActive = true;
  } else if (req.query.isActive !== undefined) {
    filters.isActive = req.query.isActive === 'true';
  }

  if (req.query.isFeatured !== undefined) {
    filters.isFeatured = req.query.isFeatured === 'true';
  }

  if (req.query.category) {
    filters.category = req.query.category as string;
  }

  if (req.query.brand) {
    filters.brand = req.query.brand as string;
  }

  if (req.query.gender) {
    filters.gender = req.query.gender as string;
  }

  if (req.query.size) {
    filters.size = req.query.size as string;
  }

  if (req.query.minPrice !== undefined) {
    filters.minPrice = Number(req.query.minPrice);
  }

  if (req.query.maxPrice !== undefined) {
    filters.maxPrice = Number(req.query.maxPrice);
  }

  if (req.query.keyword) {
    filters.keyword = req.query.keyword as string;
  }

  // Extract pagination and sorting options
  const options = {
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 10,
    sort: req.query.sort as string | undefined,
  };

  const result = await ProductService.list(filters, options);
  
  res.status(HttpStatus.OK).json(
    ApiResponse.success(
      HttpStatus.OK,
      'Products retrieved successfully',
      result.products,
      {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.pages,
      }
    )
  );
});

export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const product = await ProductService.getBySlug(req.params.slug);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Product retrieved successfully', product)
  );
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await ProductService.update(req.params.id, req.body);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Product updated successfully', product)
  );
});

export const toggleProductActive = asyncHandler(async (req: Request, res: Response) => {
  const product = await ProductService.toggleActive(req.params.id);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(
      HttpStatus.OK,
      `Product is now ${product.isActive ? 'active' : 'inactive'}`,
      product
    )
  );
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await ProductService.delete(req.params.id);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Product deleted successfully')
  );
});

export const getRelatedProducts = asyncHandler(async (req: Request, res: Response) => {
  const related = await ProductService.getRelated(req.params.id);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Related products retrieved successfully', related)
  );
});

export const createProductReview = asyncHandler(async (req: Request, res: Response) => {
  const { rating, comment } = req.body;
  const review = await ReviewService.createReview(req.params.id, req.user!.id, rating, comment);
  res.status(HttpStatus.CREATED).json(
    ApiResponse.success(HttpStatus.CREATED, 'Review added successfully', review)
  );
});

export const getProductReviews = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await ReviewService.getProductReviews(req.params.id);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Product reviews retrieved successfully', reviews)
  );
});

export const getProductReviewsSummary = asyncHandler(async (req: Request, res: Response) => {
  const summary = await AiService.summarizeReviews(req.params.id);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'AI Review summary generated successfully', { summary })
  );
});
