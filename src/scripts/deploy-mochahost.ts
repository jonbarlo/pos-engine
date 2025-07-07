import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import * as ftp from 'basic-ftp';

console.log('🚀 Starting FTP deployment script...');

// Load environment variables
import dotenv from 'dotenv';
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// Configuration
const sourceDir = process.cwd();
const deploymentDir = path.join(sourceDir, 'deployment-ftp');

// FTP Configuration from environment variables
const ftpConfig = {
  host: process.env.FTP_HOST,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  port: parseInt(process.env.FTP_PORT || '21'),
  secure: process.env.FTP_SECURE === 'true', // true for FTPS
  remotePath: process.env.FTP_REMOTE_PATH || '/'
};

// Files and folders to copy
const filesToCopy = [
  'package.json',
  'package-lock.json',
  'web.config.minimal',
  'tsconfig.json',
  'nodemon.json',
  'jest.config.js',
  'eslint.config.ts',
  'README.md'
];

const foldersToCopy = [
  'src'
];

// Only exclude the deployment scripts themselves
const excludeFromSrc = [
  'src/scripts/deploy.ts',
  'src/scripts/deploy-full.ts',
  'src/scripts/deploy-mochahost.ts'
];

console.log('📁 Source directory:', sourceDir);
console.log('📁 Deployment directory:', deploymentDir);

// Validate FTP configuration
function validateFtpConfig() {
  console.log('🔧 Validating FTP configuration...');
  
  const required = ['FTP_HOST', 'FTP_USER', 'FTP_PASSWORD'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required FTP environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\nPlease add these to your .env file:');
    console.error('FTP_HOST=your-ftp-server.com');
    console.error('FTP_USER=your-username');
    console.error('FTP_PASSWORD=your-password');
    console.error('FTP_PORT=21 (optional, default: 21)');
    console.error('FTP_SECURE=false (optional, default: false)');
    console.error('FTP_REMOTE_PATH=/ (optional, default: /)');
    process.exit(1);
  }
  
  console.log('✅ FTP configuration validated');
  console.log(`   Host: ${ftpConfig.host}`);
  console.log(`   User: ${ftpConfig.user}`);
  console.log(`   Port: ${ftpConfig.port}`);
  console.log(`   Secure: ${ftpConfig.secure}`);
  console.log(`   Remote Path: ${ftpConfig.remotePath}`);
}

// Create deployment directory
function createDeploymentDir() {
  try {
    if (fs.existsSync(deploymentDir)) {
      console.log('🗑️  Removing existing deployment directory...');
      fs.rmSync(deploymentDir, { recursive: true, force: true });
    }
    
    console.log('📁 Creating deployment directory...');
    fs.mkdirSync(deploymentDir, { recursive: true });
    console.log('✅ Deployment directory created');
  } catch (error) {
    console.error('❌ Error creating deployment directory:', error);
    process.exit(1);
  }
}

// Copy a file
function copyFile(sourcePath: string, destPath: string) {
  try {
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✅ Copied: ${path.relative(sourceDir, sourcePath)}`);
  } catch (error) {
    console.error(`❌ Error copying ${sourcePath}:`, error);
  }
}

// Copy a directory recursively
function copyDirectory(sourcePath: string, destPath: string) {
  try {
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }

    const items = fs.readdirSync(sourcePath);
    
    for (const item of items) {
      const sourceItemPath = path.join(sourcePath, item);
      const destItemPath = path.join(destPath, item);
      
      // Check if this item should be excluded
      const relativePath = path.relative(sourceDir, sourceItemPath);
      if (excludeFromSrc.includes(relativePath)) {
        console.log(`⏭️  Skipped: ${relativePath}`);
        continue;
      }
      
      const stat = fs.statSync(sourceItemPath);
      
      if (stat.isDirectory()) {
        copyDirectory(sourceItemPath, destItemPath);
      } else {
        copyFile(sourceItemPath, destItemPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error copying directory ${sourcePath}:`, error);
  }
}

// Skip build since we're uploading source files
function buildProject() {
  console.log('⏭️  Skipping build - uploading source files for server-side compilation');
}

// Create deployment package
function createDeploymentPackage() {
  console.log('\n📦 Creating deployment package...');
  
  // Copy individual files
  console.log('\n📄 Copying files...');
  for (const file of filesToCopy) {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(deploymentDir, file);
    
    if (fs.existsSync(sourcePath)) {
      copyFile(sourcePath, destPath);
    } else {
      console.log(`⚠️  File not found: ${file}`);
    }
  }
  
  // Handle environment file - copy .env.prod to .env
  console.log('\n🔧 Handling environment file...');
  const envProdPath = path.join(sourceDir, '.env.prod');
  const envDestPath = path.join(deploymentDir, '.env');
  
  if (fs.existsSync(envProdPath)) {
    copyFile(envProdPath, envDestPath);
    console.log('✅ Copied .env.prod to .env for production');
  } else {
    console.log('⚠️  .env.prod file not found - you may need to create it');
    console.log('   Expected location: .env.prod');
  }
  
  // Handle web.config - copy web.config to deployment directory
  console.log('\n🔧 Handling web.config...');
  const webConfigPath = path.join(sourceDir, 'web.config');
  const webConfigDestPath = path.join(deploymentDir, 'web.config');
  
  if (fs.existsSync(webConfigPath)) {
    copyFile(webConfigPath, webConfigDestPath);
    console.log('✅ Copied web.config for deployment');
  } else {
    console.log('⚠️  web.config not found');
  }
  
  // Copy folders
  console.log('\n📁 Copying folders...');
  for (const folder of foldersToCopy) {
    const sourcePath = path.join(sourceDir, folder);
    const destPath = path.join(deploymentDir, folder);
    
    if (fs.existsSync(sourcePath)) {
      console.log(`📁 Copying folder: ${folder}`);
      copyDirectory(sourcePath, destPath);
    } else {
      console.log(`⚠️  Folder not found: ${folder}`);
    }
  }
}

// Upload files via FTP
async function uploadViaFtp() {
  const client = new ftp.Client();
  client.ftp.verbose = true; // Enable verbose logging
  
  try {
    console.log('\n📤 Connecting to FTP server...');
    
    // Create a properly typed config object
    const config = {
      host: ftpConfig.host!,
      user: ftpConfig.user!,
      password: ftpConfig.password!,
      port: ftpConfig.port,
      secure: ftpConfig.secure
    };
    
    await client.access(config);
    console.log('✅ Connected to FTP server');
    
    // Navigate to remote directory
    if (ftpConfig.remotePath !== '/') {
      console.log(`📁 Navigating to remote path: ${ftpConfig.remotePath}`);
      await client.ensureDir(ftpConfig.remotePath);
    }
    
    // Remove remote dist and src folders before upload
    try {
      await client.removeDir(ftpConfig.remotePath + '/dist');
      console.log('🗑️  Removed remote dist directory');
    } catch (err) {
      console.warn('⚠️  Could not remove remote dist directory (may not exist):', (err as any).message);
    }
    try {
      await client.removeDir(ftpConfig.remotePath + '/src');
      console.log('🗑️  Removed remote src directory');
    } catch (err) {
      console.warn('⚠️  Could not remove remote src directory (may not exist):', (err as any).message);
    }
    
    console.log('📤 Starting file upload...');
    
    // Upload all files from deployment directory
    await client.uploadFromDir(deploymentDir);
    
    console.log('✅ All files uploaded successfully!');
    
  } catch (error) {
    console.error('❌ FTP upload failed:', error);
    throw error;
  } finally {
    client.close();
  }
}

// Create deployment info file
function createDeploymentInfo() {
  const deploymentInfo = {
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    nodeVersion: process.version,
    type: 'ftp-deployment',
    includes: 'All files including test scripts for debugging',
    files: filesToCopy,
    folders: foldersToCopy,
    excluded: excludeFromSrc,
    ftp: {
      host: ftpConfig.host,
      user: ftpConfig.user,
      port: ftpConfig.port,
      secure: ftpConfig.secure,
      remotePath: ftpConfig.remotePath
    }
  };
  
  const infoPath = path.join(deploymentDir, 'deployment-info.json');
  fs.writeFileSync(infoPath, JSON.stringify(deploymentInfo, null, 2));
  console.log('📋 Created deployment-info.json');
}

// Create instructions file
function createInstructions() {
  const instructions = `# FTP Deployment Instructions

## Deployment Completed
This deployment was automatically uploaded via FTP.

## What's Included
This deployment package includes:
- TypeScript source files (src/ folder)
- Configuration files (package.json, tsconfig.json, etc.)
- Documentation files
- Environment variables (.env)

## FTP Configuration Used
- Host: ${ftpConfig.host}
- User: ${ftpConfig.user}
- Port: ${ftpConfig.port}
- Secure: ${ftpConfig.secure}
- Remote Path: ${ftpConfig.remotePath}

## Next Steps (Run in Plesk Console)
1. Install dependencies: \`npm install\`
2. Build the project: \`npm run build\`
3. Test basic setup: \`npm run test:basic\`
4. Test database: \`npm run test:db\`
5. Start application: \`npm start\`

## Environment Variables
The deployment automatically copies \`.env.prod\` to \`.env\` on the server.
Make sure your \`.env.prod\` file contains:
- NODE_ENV=production
- DB_HOST=your-mssql-host
- DB_NAME=your-database-name
- DB_USERNAME=your-username
- DB_PASSWORD=your-password
- DB_PORT=1433

## Testing & Debugging
- Basic test: \`npm run test:basic\`
- Database test: \`npm run test:db\`
- Start app: \`npm start\`

## Debugging
Since this includes test scripts, you can debug issues directly on the server:
- Check DEBUG-STEPS.md for troubleshooting
- Use the test scripts to isolate problems
- Check deployment-info.json for deployment details

## Note
This deployment uploads TypeScript source files. The project will be compiled on the server using \`npm run build\`.
`;

  const instructionsPath = path.join(deploymentDir, 'DEPLOYMENT-INSTRUCTIONS.md');
  fs.writeFileSync(instructionsPath, instructions);
  console.log('📖 Created DEPLOYMENT-INSTRUCTIONS.md');
}

// Main deployment function
async function deploy() {
  try {
    console.log('🚀 Starting FTP deployment process...\n');
    
    // Validate FTP configuration
    validateFtpConfig();
    
    // Build the project first
    buildProject();
    
    // Create deployment directory
    createDeploymentDir();
    
    // Create deployment package
    createDeploymentPackage();
    
    // Create additional files
    createDeploymentInfo();
    createInstructions();
    
    // Upload via FTP
    await uploadViaFtp();
    
    // Delete deployment directory after upload
    try {
      if (fs.existsSync(deploymentDir)) {
        fs.rmSync(deploymentDir, { recursive: true, force: true });
        console.log(`🗑️  Deleted deployment directory: ${deploymentDir}`);
      }
    } catch (cleanupError) {
      console.error('⚠️  Failed to delete deployment directory:', cleanupError);
    }
    
    console.log('\n🎉 FTP deployment completed successfully!');
    console.log(`📁 Local deployment directory: ${deploymentDir}`);
    console.log(`🌐 Remote location: ${ftpConfig.host}${ftpConfig.remotePath}`);
    console.log('\n📋 Next steps:');
    console.log('1. In Plesk console, run: npm install');
    console.log('2. In Plesk console, run: npm run build');
    console.log('3. Test with npm run test:basic');
    console.log('4. Test with npm run test:db');
    console.log('5. Start your application with npm start');
    console.log('\n💡 Source files have been uploaded - compile on server!');
    console.log('💡 Production environment file (.env.prod) has been copied to .env');
    
  } catch (error) {
    console.error('❌ FTP deployment failed:', error);
    process.exit(1);
  }
}

// Run deployment
deploy(); 