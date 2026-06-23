import { Request, Response } from 'express';
import { StylistService } from '../services/stylist.service';
import { ApiResponse } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import { asyncHandler } from '../middlewares/async-handler.middleware';

export const getRecommendation = asyncHandler(async (req: Request, res: Response) => {
  const { occasion, gender, budget, aesthetic } = req.body;

  // Defaults & Sanitization
  const cleanedOccasion = String(occasion || 'Casual').trim();
  const cleanedGender = String(gender || 'unisex').trim();
  const cleanedBudget = Number(budget) || 0;
  const cleanedAesthetic = String(aesthetic || '').trim();

  const result = await StylistService.generateRecommendation(
    cleanedOccasion,
    cleanedGender,
    cleanedBudget,
    cleanedAesthetic
  );

  res.status(HttpStatus.OK).json(
    ApiResponse.success(
      HttpStatus.OK,
      'AI styling recommendation generated successfully',
      result
    )
  );
});
