import { Router } from 'express';
import { LanguageController } from '../controllers/languageController';
import { authenticateToken as authenticate } from '../middleware/auth';

const router = Router();

router.put('/preference', authenticate, LanguageController.updateUserLanguage);
router.get('/preference', authenticate, LanguageController.getUserLanguage);

export default router; 