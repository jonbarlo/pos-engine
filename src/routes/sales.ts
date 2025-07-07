import { Router } from 'express';
import { SaleController } from '../controllers/saleController';
import { authenticateToken } from '../middleware/auth';

const salesRouter = Router();

// All sales routes require authentication
salesRouter.use(authenticateToken);

// Advanced operations (specific routes first)
salesRouter.get('/stats', SaleController.getSalesStats);
salesRouter.get('/date-range', SaleController.getSalesByDateRange);
salesRouter.post('/with-items', SaleController.createSaleWithItems);

// Basic CRUD operations
salesRouter.post('/', SaleController.createSale);
salesRouter.get('/', SaleController.getAllSales);

// User-specific routes
salesRouter.get('/user/:userId', SaleController.getSalesByUser);

// ID-specific routes (must come after specific routes)
salesRouter.get('/:id/with-items', SaleController.getSaleWithItems);
salesRouter.get('/:id', SaleController.getSaleById);
salesRouter.put('/:id', SaleController.updateSale);
salesRouter.delete('/:id', SaleController.deleteSale);

export default salesRouter; 