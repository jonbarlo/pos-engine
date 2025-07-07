import { Router } from 'express';
const itemRouter = Router();
import { ItemController } from "../controllers/itemController";
import { authenticateToken } from '../middleware/auth';

// Protected routes - require authentication
itemRouter.get('/', authenticateToken, ItemController.getAll);
itemRouter.get('/:id', authenticateToken, ItemController.getItemById);
itemRouter.post('/', authenticateToken, ItemController.createItem);
itemRouter.put('/:id', authenticateToken, ItemController.updateItem);
itemRouter.delete('/:id', authenticateToken, ItemController.deleteItem);

// Additional item management routes
itemRouter.get('/category/:category', authenticateToken, ItemController.getItemsByCategory);
itemRouter.get('/search', authenticateToken, ItemController.searchItems);
itemRouter.put('/:id/stock', authenticateToken, ItemController.updateStock);

export default itemRouter;