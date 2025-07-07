import { Router } from 'express';
const userRouter = Router();
import { UserController } from "../controllers/userController";
import { authenticateToken } from '../middleware/auth';

// Protected routes - require authentication
userRouter.get('/users', authenticateToken, UserController.getAll);
userRouter.get('/users/:id', authenticateToken, UserController.getUserById);
userRouter.post('/users', authenticateToken, UserController.createUser);
userRouter.put('/users/:id', authenticateToken, UserController.updateUser);
userRouter.delete('/users/:id', authenticateToken, UserController.deleteUser);

export default userRouter;