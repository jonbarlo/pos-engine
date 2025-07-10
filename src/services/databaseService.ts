import { Sequelize, Options } from 'sequelize';
import { Dialect } from 'sequelize';
import { getSequelize } from '../models/sequelize';

class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public getSequelize(): Sequelize {
    return getSequelize();
  }

  public async connect(): Promise<void> {
    try {
      const sequelize = getSequelize();
      await sequelize.authenticate();
      console.log('Database connection established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    const sequelize = getSequelize();
    await sequelize.close();
  }

  public async sync(force: boolean = false): Promise<void> {
    const sequelize = getSequelize();
    await sequelize.sync({ force });
  }
}

export default DatabaseService; 