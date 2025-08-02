import i18next from 'i18next';
import i18nextMiddleware from 'i18next-http-middleware';
import Backend from 'i18next-fs-backend';
import path from 'path';

const i18nConfig = {
  backend: {
    loadPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.json'),
  },
  fallbackLng: 'es-CR',
  preload: ['en-US', 'es-CR'],
  ns: ['common', 'auth', 'errors', 'business', 'items', 'sales'],
  defaultNS: 'common',
  detection: {
    order: ['querystring', 'header', 'session'],
    lookupQuerystring: 'lang',
    lookupHeader: 'accept-language',
  },
};

export const initializeI18n = async () => {
  await i18next
    .use(Backend)
    .use(i18nextMiddleware.LanguageDetector)
    .init(i18nConfig);
};

export default i18next; 