import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
// import { checkBusinessAccess } from '../middleware/restaurantCheck';
import {
  cookRecipe,
  getCookingHistory,
  getCookingAnalytics
} from '../controllers/recipeCookingController';

const router = Router();

// Apply authentication and business access middleware to all routes
router.use(authenticateToken);
// router.use(checkBusinessAccess);

// Cook a recipe and consume inventory items
router.post('/cook-recipe', cookRecipe);

// Get cooking history for the business
router.get('/cooking-history', getCookingHistory);

// Get cooking analytics for the business
router.get('/cooking-analytics', getCookingAnalytics);

export default router; 