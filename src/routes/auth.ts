import { Router } from 'express';
const authRouter = Router();
import { AuthController } from '../controllers/authController';

// Register route
authRouter.post('/register', AuthController.register);

// Login route
authRouter.post('/login', AuthController.login);

export default authRouter; 