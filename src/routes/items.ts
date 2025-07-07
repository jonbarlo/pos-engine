import { Router } from 'express';
const itemRouter = Router();
import { ItemController } from "../controllers/itemController";
import { authenticateToken } from '../middleware/auth';

// Protected routes - require authentication
itemRouter.get('/items', authenticateToken, ItemController.getAll);
itemRouter.get('/items/:id', authenticateToken, ItemController.getItemById);
itemRouter.post('/items', authenticateToken, ItemController.createItem);
itemRouter.put('/items/:id', authenticateToken, ItemController.updateItem);
itemRouter.delete('/items/:id', authenticateToken, ItemController.deleteItem);

// Additional item management routes
itemRouter.get('/items/category/:category', authenticateToken, ItemController.getItemsByCategory);
itemRouter.get('/items/search', authenticateToken, ItemController.searchItems);
itemRouter.put('/items/:id/stock', authenticateToken, ItemController.updateStock);

export default itemRouter;