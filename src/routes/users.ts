import { Router } from 'express';
const userRouter = Router();
import { UserController } from "../controllers/userController";
import { authenticateToken } from '../middleware/auth';

// Protected routes - require authentication
userRouter.get('/', authenticateToken, UserController.getAll);
userRouter.get('/:id', authenticateToken, UserController.getUserById);
userRouter.post('/', authenticateToken, UserController.createUser);
userRouter.put('/:id', authenticateToken, UserController.updateUser);
userRouter.delete('/:id', authenticateToken, UserController.deleteUser);

export default userRouter;