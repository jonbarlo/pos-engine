import DatabaseService from '../services/databaseService';
import { initializeAllModels, setupAssociations } from '../models/index';

// Global test setup
beforeAll(async () => {
  // Initialize database service
  const dbService = DatabaseService.getInstance();
  
  // Initialize all models
  initializeAllModels();
  
  // Setup associations
  setupAssociations();
  
  // Connect and sync for tests
  await dbService.connect();
  await dbService.sync(true); // Force sync for tests
});

// Global test teardown
afterAll(async () => {
  // Disconnect database
  const dbService = DatabaseService.getInstance();
  await dbService.disconnect();
});

// Optional: Reset database between test suites for better isolation
// beforeEach(async () => {
//   const dbService = DatabaseService.getInstance();
//   await dbService.sync(true);
// }); 