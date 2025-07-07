import dotenv from 'dotenv';
import path from 'path';

// Load environment variables once at startup
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });



// Configuration interface
interface AppConfig {
  // Environment
  NODE_ENV: string;
  APP_NAME: string;
  VERSION: string;
  
  // Database
  DB_HOST: string;
  DB_NAME: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_PORT: number;
  
  // Server
  PORT: number;
  
  // JWT (optional)
  JWT_SECRET?: string | undefined;
  JWT_EXPIRES_IN?: string;
}

// Validate required environment variables
function validateConfig(): AppConfig {
  const requiredVars = [
    'NODE_ENV',
    'DB_HOST',
    'DB_NAME', 
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_PORT'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.warn('ConfigService: Missing environment variables:', missing);
  }

  return {
    // Environment
    NODE_ENV: process.env.NODE_ENV || 'development',
    APP_NAME: process.env.APP_NAME || 'Node.js API',
    VERSION: process.env.VERSION || '1.0.0',
    
    // Database
    DB_HOST: process.env.DB_HOST || '',
    DB_NAME: process.env.DB_NAME || '',
    DB_USERNAME: process.env.DB_USERNAME || '',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_PORT: parseInt(process.env.DB_PORT || '1433'),
    
    // Server
    PORT: parseInt(process.env.PORT || '3000'),
    
    // JWT (optional)
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h'
  };
}

// Create and export the configuration
const config = validateConfig();



// Export the configuration
export default config;

// Export individual getters for backward compatibility
export const getConfig = () => config;
export const getDatabaseConfig = () => ({
  host: config.DB_HOST,
  database: config.DB_NAME,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  port: config.DB_PORT
});
export const getServerConfig = () => ({
  port: config.PORT,
  environment: config.NODE_ENV
}); 