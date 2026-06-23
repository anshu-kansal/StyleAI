import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { getRecommendationSchema } from '../validators/stylist.validator';
import * as StylistController from '../controllers/stylist.controller';

const router = Router();

// Retrieve styling recommendations (accessible to public and registered users)
router.post('/', validate({ body: getRecommendationSchema }), StylistController.getRecommendation);

export default router;
