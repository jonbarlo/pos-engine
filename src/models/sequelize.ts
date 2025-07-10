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
  
  // Production/development config
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
        dialectOptions: dbConfig.dialectOptions
      }
    );
  }
  return sequelizeInstance;
};

export { getSequelize };
export default getSequelize; 