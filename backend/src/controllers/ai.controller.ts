import { Request, Response } from 'express';
import { AiService } from '../services/ai.service';
import { ApiResponse } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import { asyncHandler } from '../middlewares/async-handler.middleware';

export const chatWithAssistant = asyncHandler(async (req: Request, res: Response) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    res.status(HttpStatus.BAD_REQUEST).json(
      ApiResponse.error(HttpStatus.BAD_REQUEST, 'Messages array is required')
    );
    return;
  }

  const response = await AiService.chatWithAssistant(messages);

  // Resolve recommended product slugs to full populated products
  if (response.recommendations && Array.isArray(response.recommendations)) {
    const ProductModel = require('../models/product.model').default;
    const products = await ProductModel.find({
      slug: { $in: response.recommendations },
      isActive: true
    }).populate('brand category');
    response.recommendations = products;
  }

  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'AI Assistant response generated successfully', response)
  );
});

export const generateOutfit = asyncHandler(async (req: Request, res: Response) => {
  const { gender, occasion, budget, season } = req.body;
  if (!gender || !occasion || !budget || !season) {
    res.status(HttpStatus.BAD_REQUEST).json(
      ApiResponse.error(HttpStatus.BAD_REQUEST, 'gender, occasion, budget, and season are required')
    );
    return;
  }

  const outfit = await AiService.generateOutfit(gender, occasion, Number(budget), season);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Outfit generated successfully', outfit)
  );
});

export const compareProducts = asyncHandler(async (req: Request, res: Response) => {
  const { productIds } = req.body;
  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    res.status(HttpStatus.BAD_REQUEST).json(
      ApiResponse.error(HttpStatus.BAD_REQUEST, 'productIds array is required and cannot be empty')
    );
    return;
  }

  const comparison = await AiService.compareProducts(productIds);
  res.status(HttpStatus.OK).json(
    ApiResponse.success(HttpStatus.OK, 'Product comparison generated successfully', comparison)
  );
});
