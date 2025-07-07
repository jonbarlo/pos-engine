import { Router } from 'express';
const itemRouter = Router();
import { ItemController } from "../controllers/itemController";
import { authenticateToken } from '../middleware/auth';

itemRouter.get('/items', authenticateToken, ItemController.getAll);
export default itemRouter;