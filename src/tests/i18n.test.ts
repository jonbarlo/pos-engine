import request from 'supertest';
import express from 'express';
import { initializeI18n } from '../config/i18n';
import { i18nMiddleware, detectLanguage } from '../middleware/i18n';

describe('i18n Integration Tests', () => {
  let app: express.Application;

  beforeAll(async () => {
    await initializeI18n();
    
    app = express();
    app.use(express.json());
    app.use(detectLanguage);
    app.use(i18nMiddleware);
    
    // Test endpoint
    app.get('/test', (req: any, res) => {
      res.json({
        message: req.t('common.success'),
        language: req.language
      });
    });
  });

  describe('Language Detection', () => {
    it('should detect English from query parameter', async () => {
      const response = await request(app)
        .get('/test?lang=en-US')
        .expect(200);

      expect(response.body.language).toBe('en-US');
      expect(response.body.message).toBe('Success');
    });

    it('should detect Spanish from query parameter', async () => {
      const response = await request(app)
        .get('/test?lang=es-CR')
        .expect(200);

      expect(response.body.language).toBe('es-CR');
      expect(response.body.message).toBe('Éxito');
    });

    it('should default to English when no language specified', async () => {
      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.body.language).toBe('en-US');
      expect(response.body.message).toBe('Success');
    });

    it('should detect language from Accept-Language header', async () => {
      const response = await request(app)
        .get('/test')
        .set('Accept-Language', 'es-CR')
        .expect(200);

      expect(response.body.language).toBe('es-CR');
      expect(response.body.message).toBe('Éxito');
    });
  });

  describe('Translation Function', () => {
    it('should translate auth messages correctly', async () => {
      app.get('/test-auth', (req: any, res) => {
        res.json({
          loginSuccess: req.t('auth.login.success'),
          loginError: req.t('auth.login.invalidCredentials'),
          registerSuccess: req.t('auth.register.success')
        });
      });

      const response = await request(app)
        .get('/test-auth?lang=es-CR')
        .expect(200);

      expect(response.body.loginSuccess).toBe('Inicio de sesión exitoso');
      expect(response.body.loginError).toBe('Correo electrónico o contraseña inválidos');
      expect(response.body.registerSuccess).toBe('Registro exitoso');
    });

    it('should translate error messages correctly', async () => {
      app.get('/test-errors', (req: any, res) => {
        res.json({
          required: req.t('errors.validation.required'),
          email: req.t('errors.validation.email'),
          serverError: req.t('errors.server.internal')
        });
      });

      const response = await request(app)
        .get('/test-errors?lang=es-CR')
        .expect(200);

      expect(response.body.required).toBe('Este campo es requerido');
      expect(response.body.email).toBe('Formato de correo electrónico inválido');
      expect(response.body.serverError).toBe('Error interno del servidor');
    });
  });
}); 