import { Dialect } from 'sequelize';

export interface DatabaseConfig {
  dialect: Dialect;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  logging: boolean;
  dialectOptions: {
    options: {
      encrypt: boolean;
      trustServerCertificate: boolean;
    };
  };
}

export const getDatabaseConfig = (): DatabaseConfig => {
  const env = process.env.NODE_ENV || 'development';
  
  if (env === 'test') {
    return {
      dialect: 'sqlite' as Dialect,
      host: '',
      port: 0,
      username: '',
      password: '',
      database: '',
      logging: false,
      dialectOptions: {
        options: {
          encrypt: false,
          trustServerCertificate: false
        }
      }
    };
  }
  
  // Production/development config
  return {
    dialect: 'mssql' as Dialect,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433'),
    username: process.env.DB_USERNAME || 'sa',
    password: process.env.DB_PASSWORD || 'YourStrong@Passw0rd',
    database: process.env.DB_NAME || 'pos_engine',
    logging: process.env.NODE_ENV === 'development',
    dialectOptions: {
      options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_CERT === 'true'
      }
    }
  };
}; 