# Node.js API with TypeScript, Express, JWT, and Sequelize

A robust Node.js API built with TypeScript, Express.js, JWT authentication, and Sequelize ORM. Supports both MariaDB/MySQL (development) and MS SQL Server (production) databases.

##  Features

- **TypeScript** - Full type safety and modern JavaScript features
- **Express.js** - Fast, unopinionated web framework
- **JWT Authentication** - Secure token-based authentication
- **Sequelize ORM** - Database abstraction with migrations
- **Multi-Database Support** - MariaDB/MySQL for development, MS SQL Server for production
- **IIS Deployment Ready** - Configured for Windows IIS hosting
- **Comprehensive Testing** - Jest test suite with proper mocking
- **Environment Configuration** - Flexible environment variable management

##  Project Structure

\\\
node-js-api/
 src/
    config/
       database.ts          # Database configuration (Sequelize)
       config.ts            # Application configuration
    controllers/
       authController.ts    # Authentication logic
       userController.ts    # User management
       itemController.ts    # Item management
    middleware/
       auth.ts              # JWT authentication middleware
    migrations/
       *.ts                 # Database migrations
    models/
       UserModel.ts         # Sequelize models
    routes/
       auth.ts              # Authentication routes
       users.ts             # User routes
       items.ts             # Item routes
    scripts/
       createMigration.ts   # Create new migration
       runMigration.ts      # Run specific migration
       runAllMigrations.ts  # Run all pending migrations
       migrateStatus.ts     # Check migration status
       migrateUndo.ts       # Undo last migration
       initDatabase.ts      # Initialize database
    services/
       userService.ts       # Business logic layer
    utils/
       logger.ts            # Logging utility
    index.ts                 # Application entry point
 dist/                        # Compiled JavaScript (production)
 scripts/                     # Build and deployment scripts
 web.config                   # IIS configuration
 package.json                 # Dependencies and scripts
 tsconfig.json               # TypeScript configuration
 jest.config.js              # Jest test configuration
 .env                        # Environment variables (local)
 .env.development            # Development environment
 .env.production             # Production environment
 env.example                 # Environment variables template
\\\

##  Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Authentication**: JWT (JSON Web Tokens)
- **Database ORM**: Sequelize
- **Databases**: 
  - Development: MariaDB/MySQL
  - Production: MS SQL Server
- **Testing**: Jest
- **Deployment**: IIS (Windows)

##  Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MariaDB/MySQL** (for local development)
- **MS SQL Server** (for production)

##  Quick Start

### 1. Clone the Repository

\\\ash
git clone <repository-url>
cd node-js-api
\\\

### 2. Install Dependencies

\\\ash
npm install
\\\

### 3. Environment Setup

Copy the environment template and configure your local settings:

\\\ash
cp env.example .env
\\\

Edit \.env\ with your local database credentials:

\\\env
# Development Environment Configuration
APP_NAME=MyNodeAPI
VERSION=1.0.0
PORT=3031
NODE_ENV=development

# Local Database Configuration (MariaDB/MySQL)
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=nodejs_api_dev
DB_HOST=localhost
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_very_secure_jwt_secret_key_change_this_in_production
\\\

### 4. Database Setup

#### Option A: Using Migration Scripts (Recommended)

\\\ash
# Run all pending migrations
npm run migrate:run

# Check migration status
npm run migrate:status
\\\

#### Option B: Manual Database Creation

Create a database named \
odejs_api_dev\ in your MariaDB/MySQL instance.

### 5. Start Development Server

\\\ash
npm run dev
\\\

The API will be available at \http://localhost:3031\

##  Testing

### Run All Tests

\\\ash
npm test
\\\

### Run Tests in Watch Mode

\\\ash
npm run test:watch
\\\

### Run Tests with Coverage

\\\ash
npm run test:coverage
\\\

##  API Endpoints

### Authentication
- \POST /auth/register\ - Register a new user
- \POST /auth/login\ - Login user

### Users (Protected)
- \GET /users\ - Get all users
- \GET /users/:id\ - Get user by ID
- \PUT /users/:id\ - Update user
- \DELETE /users/:id\ - Delete user

### Items (Protected)
- \GET /items\ - Get all items
- \POST /items\ - Create new item
- \GET /items/:id\ - Get item by ID
- \PUT /items/:id\ - Update item
- \DELETE /items/:id\ - Delete item

##  Development Workflow

### Adding New Features

1. **Create Models** (if needed)
   \\\ash
   # Add new model in src/models/
   # Example: src/models/ProductModel.ts
   \\\

2. **Create Migrations**
   \\\ash
   npm run migrate:create -- --name create-products-table
   \\\

3. **Create Services**
   \\\ash
   # Add business logic in src/services/
   # Example: src/services/productService.ts
   \\\

4. **Create Controllers**
   \\\ash
   # Add request handling in src/controllers/
   # Example: src/controllers/productController.ts
   \\\

5. **Create Routes**
   \\\ash
   # Add routing in src/routes/
   # Example: src/routes/products.ts
   \\\

6. **Register Routes**
   \\\ash
   # Add route registration in src/index.ts
   \\\

### Database Migrations

\\\ash
# Create new migration
npm run migrate:create -- --name migration-name

# Run all pending migrations
npm run migrate:run

# Check migration status
npm run migrate:status

# Undo last migration
npm run migrate:undo

# Run specific migration
npm run migrate:run -- --name migration-name
\\\

##  Deployment

### IIS Deployment (Windows)

#### 1. Build the Application

\\\ash
npm run build
\\\

#### 2. Prepare Deployment Package

Create a deployment folder with:
- \dist/\ folder (compiled JavaScript)
- \web.config\ file
- \package.json\
- \package-lock.json\
- \
ode_modules/\ (or run \
pm install --production\ on server)

#### 3. Configure IIS

1. **Install IIS Node.js Handler**
   - Download and install [iisnode](https://github.com/Azure/iisnode)

2. **Set Environment Variables**
   - Open IIS Manager
   - Select your Application Pool
   - Right-click  Advanced Settings
   - Add environment variables:
     \\\
     NODE_ENV=production
     DB_HOST=your_sql_server_host
     DB_NAME=your_database_name
     DB_USERNAME=your_username
     DB_PASSWORD=your_password
     DB_PORT=1433
     APP_NAME=MyNodeAPI
     VERSION=1.0.0
     JWT_SECRET=your_jwt_secret
     \\\

3. **Configure Application Pool**
   - Set .NET CLR Version to \"No Managed Code\"
   - Set Identity to appropriate user with database access

#### 4. Deploy Files

Upload your deployment package to the IIS website directory.

#### 5. Run Migrations

\\\ash
# On the server, navigate to your app directory
npm run migrate:run
\\\

### Alternative: Environment Variables in web.config

You can also set environment variables directly in \web.config\:

\\\xml
<aspNetCore>
  <environmentVariables>
    <environmentVariable name=\"NODE_ENV\" value=\"production\" />
    <environmentVariable name=\"DB_HOST\" value=\"your_host\" />
    <environmentVariable name=\"DB_NAME\" value=\"your_database\" />
    <environmentVariable name=\"DB_USERNAME\" value=\"your_username\" />
    <environmentVariable name=\"DB_PASSWORD\" value=\"your_password\" />
  </environmentVariables>
</aspNetCore>
\\\

##  Troubleshooting

### Common Issues

#### 1. Environment Variables Not Loading
- Ensure \.env\ file exists in project root
- Check file encoding (should be UTF-8 without BOM)
- Verify line endings (prefer LF over CRLF)

#### 2. Database Connection Issues
- Verify database credentials in \.env\
- Ensure database server is running
- Check firewall settings
- Verify database user permissions

#### 3. IIS Deployment Issues
- Ensure IIS Node.js handler is installed
- Check Application Pool configuration
- Verify environment variables are set
- Check IIS logs for detailed error messages

#### 4. Migration Issues
- Ensure database exists
- Check user permissions for database operations
- Verify migration files are in correct format

### Debug Mode

Enable debug logging by setting \NODE_ENV=development\ and check console output for detailed error messages.

##  Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| \NODE_ENV\ | Environment mode | \development\ | Yes |
| \PORT\ | Server port | \3031\ (dev), \80\ (prod) | No |
| \DB_HOST\ | Database host | \localhost\ | Yes |
| \DB_PORT\ | Database port | \3306\ (dev), \1433\ (prod) | No |
| \DB_NAME\ | Database name | \
odejs_api_dev\ | Yes |
| \DB_USERNAME\ | Database username | \
oot\ | Yes |
| \DB_PASSWORD\ | Database password | - | Yes |
| \JWT_SECRET\ | JWT signing secret | - | Yes |
| \APP_NAME\ | Application name | \MyNodeAPI\ | No |
| \VERSION\ | Application version | \1.0.0\ | No |

##  Contributing

1. Fork the repository
2. Create a feature branch (\git checkout -b feature/amazing-feature\)
3. Commit your changes (\git commit -m 'Add amazing feature'\)
4. Push to the branch (\git push origin feature/amazing-feature\)
5. Open a Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Support

For support and questions:
- Check the troubleshooting section above
- Review the logs for error details
- Ensure all prerequisites are met
- Verify environment configuration

---

**Happy Coding! **
