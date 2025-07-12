import { Sequelize } from 'sequelize';
import config from '../src/config';

async function cleanDatabase(): Promise<void> {
  const sequelize = new Sequelize(config.database);
  
  try {
    console.log('🔍 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    console.log('🧹 Dropping all tables...');
    await sequelize.drop();
    console.log('✅ All tables dropped successfully');
    
    console.log('🔄 Syncing database...');
    await sequelize.sync({ force: true });
    console.log('✅ Database synced successfully');
    
    console.log('🎉 Database cleaned successfully!');
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  cleanDatabase()
    .then(() => {
      console.log('✅ Cleanup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error(`❌ Cleanup failed: ${error}`);
      process.exit(1);
    });
}

export { cleanDatabase }; 