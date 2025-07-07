import dotenv from 'dotenv';
import path from 'path';
import { Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';
import { initializeModels, BusinessModel, UserModel } from '../models';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');
        // Create Sequelize instance
        const sequelize = new Sequelize(
            process.env.DB_NAME!,
            process.env.DB_USERNAME!,
            process.env.DB_PASSWORD!,
            {
                host: process.env.DB_HOST!,
                port: parseInt(process.env.DB_PORT!),
                dialect: 'mssql',
                dialectOptions: {
                    options: {
                        encrypt: false,
                        trustServerCertificate: true,
                        enableArithAbort: true,
                        requestTimeout: 30000,
                        connectionTimeout: 30000,
                        useUTC: false,
                        dateStrings: true,
                    },
                },
                logging: console.log,
                pool: {
                    max: 5,
                    min: 0,
                    acquire: 30000,
                    idle: 10000
                }
            }
        );

        // Test connection
        await sequelize.authenticate();
        console.log('✅ Database connection established.');

        // Initialize models
        initializeModels(sequelize);
        console.log('✅ Models initialized.');

        // Manual drop of tables in correct order to avoid FK issues
        const tables = ['order_items', 'sales', 'items', 'users', 'businesses'];
        for (const table of tables) {
            try {
                await sequelize.query(`IF OBJECT_ID('[${table}]', 'U') IS NOT NULL DROP TABLE [${table}];`);
                console.log(`✅ Dropped table if existed: ${table}`);
            } catch (err) {
                console.warn(`⚠️ Could not drop table ${table}:`, err);
            }
        }

        // Sync database
        await sequelize.sync({ force: true });
        console.log('✅ Database synchronized.');



        // Create initial business
        const business = await BusinessModel.create({
            name: 'Demo Business',
            slug: 'demo-business',
            description: 'A demo business for testing',
            taxRate: 8.5,
            currency: 'USD',
            timezone: 'America/New_York',
            isActive: true
        });
        console.log('✅ Initial business created:', business.name);

        // Create admin user
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('admin123', saltRounds);
        
        const adminUser = await UserModel.create({
            name: 'Admin User',
            email: 'admin@demo.com',
            password: hashedPassword,
            businessId: business.id,
            role: 'admin',
            isActive: true
        });
        console.log('✅ Admin user created:', adminUser.email);

        // Create a regular user
        const regularPassword = await bcrypt.hash('user123', saltRounds);
        
        const regularUser = await UserModel.create({
            name: 'Regular User',
            email: 'user@demo.com',
            password: regularPassword,
            businessId: business.id,
            role: 'cashier',
            isActive: true
        });
        console.log('✅ Regular user created:', regularUser.email);

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📋 Test Credentials:');
        console.log('Business: Demo Business (demo-business)');
        console.log('Admin: admin@demo.com / admin123');
        console.log('User: user@demo.com / user123');
        console.log('\n🔗 Test URLs:');
        console.log('Health: http://localhost:3031/health');
        console.log('Login: POST http://localhost:3031/api/auth/login');
        console.log('Register: POST http://localhost:3031/api/auth/register');

        await sequelize.close();
        console.log('✅ Database connection closed.');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run the seed function
seedDatabase(); 