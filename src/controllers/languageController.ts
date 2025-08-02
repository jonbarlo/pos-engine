import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { UserService } from '../services/userService';

export class LanguageController {
    public static updateUserLanguage = asyncHandler(async (req: Request, res: Response) => {
        const { language } = req.body;
        const userId = (req as any).user?.userId;

        if (!userId) {
            return res.status(401).json({
                error: req.t('errors.server.unauthorized'),
                code: 'UNAUTHORIZED'
            });
        }

        const supportedLanguages = ['en-US', 'es-CR'];
        if (!supportedLanguages.includes(language)) {
            return res.status(400).json({
                error: req.t('errors.validation.invalidLanguage'),
                code: 'INVALID_LANGUAGE'
            });
        }

        await UserService.updateLanguage(userId, language);

        return res.json({
            message: req.t('common.success'),
            language
        });
    });

    public static getUserLanguage = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.userId;

        if (!userId) {
            return res.status(401).json({
                error: req.t('errors.server.unauthorized'),
                code: 'UNAUTHORIZED'
            });
        }

        const user = await UserService.getUserByIdForLanguage(userId);
        
        return res.json({
            language: user?.language || 'es-CR',
            supportedLanguages: ['en-US', 'es-CR']
        });
    });
} 