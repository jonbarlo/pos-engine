import { Router } from 'express';
const itemRouter = Router();
import { ItemController } from "../controllers/itemController";
import { authenticateToken } from '../middleware/auth';

// Protected routes - require authentication
itemRouter.get('/', authenticateToken, ItemController.getAll);

// Additional item management routes (must come before /:id routes)
itemRouter.get('/category/:category', authenticateToken, ItemController.getItemsByCategory);
itemRouter.get('/search', authenticateToken, ItemController.searchItems);

// ID-specific routes
itemRouter.get('/:id', authenticateToken, ItemController.getItemById);
itemRouter.post('/', authenticateToken, ItemController.createItem);
itemRouter.put('/:id', authenticateToken, ItemController.updateItem);
itemRouter.delete('/:id', authenticateToken, ItemController.deleteItem);
itemRouter.put('/:id/stock', authenticateToken, ItemController.updateStock);

export default itemRouter;