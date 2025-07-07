import { Router } from 'express';
import { BusinessController } from '../controllers/businessController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all business routes
router.use(authenticateToken);

// Get all businesses
router.get('/', BusinessController.getAll);

// Get business by ID
router.get('/:id', BusinessController.getBusinessById);

// Get business by slug
router.get('/slug/:slug', BusinessController.getBusinessBySlug);

// Create new business
router.post('/', BusinessController.createBusiness);

// Update business
router.put('/:id', BusinessController.updateBusiness);

// Delete business
router.delete('/:id', BusinessController.deleteBusiness);

// Get business statistics
router.get('/:id/stats', BusinessController.getBusinessStats);

// Search businesses
router.get('/search', BusinessController.searchBusinesses);

// Get businesses by timezone
router.get('/timezone/:timezone', BusinessController.getBusinessesByTimezone);

// Get businesses by currency
router.get('/currency/:currency', BusinessController.getBusinessesByCurrency);

export default router; 