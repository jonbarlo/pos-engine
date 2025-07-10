import { seedDatabase } from './basic-seed';

console.log('🚀 Starting basic database seeder...');

seedDatabase()
    .then(() => {
        console.log('✅ Basic seeding completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Basic seeding failed:', error);
        process.exit(1);
    }); 