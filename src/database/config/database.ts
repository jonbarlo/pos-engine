import { Dialect } from 'sequelize';

const config = {
  development: {
    username: process.env.DB_USERNAME || 'sa',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'pos_engine_dev',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 1433,
    dialect: 'mssql' as Dialect,
    dialectOptions: {
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    },
    logging: false,
  },
  test: {
    dialect: 'sqlite' as Dialect,
    storage: ':memory:', // Use in-memory database for tests
    logging: false,
    // SQLite specific options
    dialectOptions: {
      // Enable foreign keys
      pragma: {
        foreign_keys: 'ON'
      }
    }
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 1433,
    dialect: 'mssql' as Dialect,
    dialectOptions: {
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    },
    logging: false,
  },
};

export default config; 