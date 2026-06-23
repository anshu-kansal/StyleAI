import { Router } from 'express';
import * as AiController from '../controllers/ai.controller';

const router = Router();

// AI endpoints are public to keep exploration easy
router.post('/chat', AiController.chatWithAssistant);
router.post('/outfit', AiController.generateOutfit);
router.post('/compare', AiController.compareProducts);

export default router;
