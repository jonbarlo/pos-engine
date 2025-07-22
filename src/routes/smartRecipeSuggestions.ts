import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
// import { checkBusinessAccess } from '../middleware/restaurantCheck';
import {
  getSmartSuggestions,
  getInventorySummary,
  updateTracking,
  getExpiringItems,
  getUnderperformingItems,
  generateWastePreventionSuggestions
} from '../controllers/smartRecipeSuggestionController';

const router = Router();

// Apply authentication and business access middleware to all routes
router.use(authenticateToken);
// router.use(checkBusinessAccess);

// Smart recipe suggestions based on inventory management
router.get('/smart-suggestions', getSmartSuggestions);

// Generate waste prevention suggestions based on expiring items
router.post('/waste-prevention-suggestions', generateWastePreventionSuggestions);

// Inventory summary for dashboard
router.get('/inventory-summary', getInventorySummary);

// Update tracking data
router.post('/update-tracking', updateTracking);

// Get expiring items
router.get('/expiring-items', getExpiringItems);

// Get underperforming items
router.get('/underperforming-items', getUnderperformingItems);

export default router; 