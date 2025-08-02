import { Request, Response, NextFunction } from 'express';
import i18next from '../config/i18n';

export const i18nMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Add translation function to request object
  (req as any).t = (key: string, options?: any) => {
    return (i18next as any).t(key, { lng: (req as any).language, ...options });
  };
  
  next();
};

export const detectLanguage = (req: Request, res: Response, next: NextFunction) => {
  // Language detection logic
  const supportedLanguages = ['en-US', 'es-CR'];
  let detectedLanguage = 'es-CR';
  
  // Check query parameter
  if (req.query.lang && supportedLanguages.includes(req.query.lang as string)) {
    detectedLanguage = req.query.lang as string;
  }
  // Check header
  else if (req.headers['accept-language']) {
    const acceptLanguage = req.headers['accept-language'];
    if (acceptLanguage) {
      const parts = acceptLanguage.split(',');
      if (parts.length > 0 && parts[0]) {
        const headerLang = parts[0].trim();
        if (supportedLanguages.includes(headerLang)) {
          detectedLanguage = headerLang;
        }
      }
    }
  }
  
  (req as any).language = detectedLanguage;
  next();
}; 