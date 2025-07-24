import { Sequelize } from 'sequelize';

// Database configuration for different environments
const getDatabaseConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  if (env === 'test') {
    return {
      dialect: 'sqlite' as const,
      storage: ':memory:',
      logging: false,
      dialectOptions: {},
      host: '',
      port: 0,
      username: '',
      password: '',
      database: ''
    };
  }
  
  // If DATABASE_URL is provided (Railway PostgreSQL), use it
  if (process.env.DATABASE_URL) {
    return {
      dialect: 'postgres' as const,
      url: process.env.DATABASE_URL,
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      host: '',
      port: 0,
      username: '',
      password: '',
      database: '',
      storage: ''
    };
  }
  
  // Production/development config for MS SQL Server
  const config = {
    dialect: 'mssql' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433'),
    username: process.env.DB_USERNAME || 'sa',
    password: process.env.DB_PASSWORD || 'YourStrong@Passw0rd',
    database: process.env.DB_NAME || 'pos_engine',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_CERT === 'true'
      }
    },
    storage: ''
  };
  
  return config;
};

// Create a lazy singleton for sequelize
let sequelizeInstance: Sequelize | null = null;

const getSequelize = (): Sequelize => {
  if (!sequelizeInstance) {
    const dbConfig = getDatabaseConfig();
    
    // Use DATABASE_URL if available (Railway PostgreSQL)
    if (process.env.DATABASE_URL) {
      sequelizeInstance = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        dialectOptions: {
          ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
          } : false
        },
        pool: {
          max: 20,
          min: 0,
          acquire: 60000,
          idle: 10000
        },
        retry: {
          max: 3,
          timeout: 30000
        }
      });
    } else {
      // Use individual connection parameters
      sequelizeInstance = new Sequelize(
        dbConfig.database,
        dbConfig.username,
        dbConfig.password,
        {
          dialect: dbConfig.dialect,
          host: dbConfig.host,
          port: dbConfig.port,
          storage: dbConfig.storage,
          logging: dbConfig.logging,
          dialectOptions: dbConfig.dialectOptions,
          pool: {
            max: 20,
            min: 0,
            acquire: 60000,
            idle: 10000
          },
          retry: {
            max: 3,
            timeout: 30000
          }
        }
      );
    }
  }
  return sequelizeInstance;
};

export { getSequelize };
export default getSequelize; 