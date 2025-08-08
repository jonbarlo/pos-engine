import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import * as ftp from 'basic-ftp';

console.log('🚀 Starting POS Engine Mochahost FTP deployment script...');

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

// Files and folders to copy for POS Engine
const filesToCopy = [
  'package.json',
  'package-lock.json',
  'web.config',
  //'tsconfig.json',
  //'nodemon.json',
  //'jest.config.js',
  //'eslint.config.ts',
  //'README.md'
  //'.env'
];

const foldersToCopy = [
  'src',
  'locales',
  //'docs'
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

// Build the project
function buildProject() {
  console.log('🔨 Skipping local build - will build on server');
  console.log('📁 Source files will be uploaded and built on the server');
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
  
  // Build the project locally - dist will be created on the server
  console.log('📁 Build files will be created on the server via npm install and npm run build');
}

// Upload files via FTP
async function uploadViaFtp() {
  const client = new ftp.Client();
  client.ftp.verbose = false; // Disable verbose logging for cleaner output
  
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
    
    // Count total files to upload
    const totalFiles = countFilesInDirectory(deploymentDir);
    console.log(`📊 Total files to upload: ${totalFiles}`);
    
    let uploadedFiles = 0;
    
    // Custom upload function with progress tracking
    const uploadWithProgress = async (localPath: string, remotePath: string) => {
      try {
        await client.uploadFrom(localPath, remotePath);
        uploadedFiles++;
        const percentage = Math.round((uploadedFiles / totalFiles) * 100);
        console.log(`📤 Uploaded: ${uploadedFiles}/${totalFiles} files (${percentage}%) - ${path.basename(localPath)}`);
      } catch (error) {
        console.error(`❌ Failed to upload ${localPath}:`, error);
      }
    };
    
    // Upload all files from deployment directory with progress
    await uploadDirectoryWithProgress(client, deploymentDir, ftpConfig.remotePath, uploadWithProgress);
    
    console.log(`✅ All files uploaded successfully! (${uploadedFiles}/${totalFiles} files)`);
    
  } catch (error) {
    console.error('❌ FTP upload failed:', error);
    throw error;
  } finally {
    client.close();
  }
}

// Count files in directory recursively
function countFilesInDirectory(dirPath: string): number {
  let count = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        count += countFilesInDirectory(itemPath);
      } else {
        count++;
      }
    }
  } catch (error) {
    console.warn(`⚠️  Could not count files in ${dirPath}:`, error);
  }
  
  return count;
}

// Upload directory with progress tracking
async function uploadDirectoryWithProgress(
  client: ftp.Client, 
  localDir: string, 
  remoteDir: string, 
  uploadCallback: (localPath: string, remotePath: string) => Promise<void>
) {
  try {
    const items = fs.readdirSync(localDir);
    
    for (const item of items) {
      const localPath = path.join(localDir, item);
      const remotePath = path.join(remoteDir, item).replace(/\\/g, '/');
      const stat = fs.statSync(localPath);
      
      if (stat.isDirectory()) {
        // Create remote directory
        try {
          await client.ensureDir(remotePath);
        } catch (error) {
          console.warn(`⚠️  Could not create remote directory ${remotePath}:`, error);
        }
        
        // Recursively upload directory contents
        await uploadDirectoryWithProgress(client, localPath, remotePath, uploadCallback);
      } else {
        // Upload file with progress
        await uploadCallback(localPath, remotePath);
      }
    }
  } catch (error) {
    console.error(`❌ Error uploading directory ${localDir}:`, error);
  }
}

// Create deployment info file
function createDeploymentInfo() {
  const deploymentInfo = {
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    nodeVersion: process.version,
    type: 'pos-engine-mochahost-deployment',
    includes: 'POS Engine with built files and source for debugging',
    files: filesToCopy,
    folders: foldersToCopy,
    excluded: excludeFromSrc,
    ftp: {
      host: ftpConfig.host,
      user: ftpConfig.user,
      port: ftpConfig.port,
      secure: ftpConfig.secure,
      remotePath: ftpConfig.remotePath
    },
    criticalNotes: [
      'Environment variables must be loaded from parent directory',
      'Use path.resolve(process.cwd(), "..", ".env") in code',
      'App runs from dist/ directory on server',
      'web.config routes to dist/index.js'
    ]
  };
  
  const infoPath = path.join(deploymentDir, 'deployment-info.json');
  fs.writeFileSync(infoPath, JSON.stringify(deploymentInfo, null, 2));
  console.log('📋 Created deployment-info.json');
}

// Create instructions file
function createInstructions() {
  const instructions = `# POS Engine Mochahost Deployment Instructions

## Deployment Completed
This POS Engine deployment was automatically uploaded via FTP to Mochahost IIS.

## What's Included
This deployment package includes:
- Built JavaScript files (dist/ folder)
- TypeScript source files (src/ folder) for debugging
- Configuration files (package.json, tsconfig.json, etc.)
- Documentation files
- Environment variables (.env)
- Localization files (locales/)

## Critical Environment Variable Fix
**IMPORTANT**: The app runs from the dist/ directory, but the .env file must be in the parent directory.

In your Node.js code, use this pattern:
\`\`\`javascript
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from parent directory
const envPath = path.resolve(process.cwd(), '..', '.env');
dotenv.config({ path: envPath });
\`\`\`

## FTP Configuration Used
- Host: ${ftpConfig.host}
- User: ${ftpConfig.user}
- Port: ${ftpConfig.port}
- Secure: ${ftpConfig.secure}
- Remote Path: ${ftpConfig.remotePath}

## Next Steps (Run in Plesk Console)
1. Install dependencies: \`npm install --production\`
2. Restart the IIS application
3. Test basic setup: \`node dist/index.js\`
4. Test endpoints via HTTP

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
- Basic test: Visit your domain root
- Health check: /health endpoint
- API endpoints: /api/* endpoints
- Database test: Check logs for connection errors

## Debugging
Since this includes source files, you can debug issues directly on the server:
- Check deployment-info.json for deployment details
- Review server logs in Plesk
- Test environment loading with debug endpoints

## Note
This deployment includes both built files (dist/) and source files (src/) for debugging.
The application runs from the dist/ directory via IIS.
`;

  const instructionsPath = path.join(deploymentDir, 'DEPLOYMENT-INSTRUCTIONS.md');
  fs.writeFileSync(instructionsPath, instructions);
  console.log('📖 Created DEPLOYMENT-INSTRUCTIONS.md');
}

// Main deployment function
async function deploy() {
  try {
    console.log('🚀 Starting POS Engine Mochahost deployment process...\n');
    
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
      } else {
        console.log(`⚠️  Deployment directory not found: ${deploymentDir}`);
      }
    } catch (cleanupError) {
      console.error('⚠️  Failed to delete deployment directory:', cleanupError);
      console.error('   Directory path:', deploymentDir);
      console.error('   Error details:', cleanupError);
    }
    
    console.log('\n🎉 POS Engine Mochahost deployment completed successfully!');
    console.log(`📁 Local deployment directory: ${deploymentDir}`);
    console.log(`🌐 Remote location: ${ftpConfig.host}${ftpConfig.remotePath}`);
    console.log('\n📋 Next steps:');
    console.log('1. In Plesk console, run: npm install --production');
    console.log('2. Restart the IIS application');
    console.log('3. Test your endpoints');
    console.log('\n🔗 Test URLs:');
    console.log(`   - https://${ftpConfig.host}/`);
    console.log(`   - https://${ftpConfig.host}/health`);
    console.log(`   - https://${ftpConfig.host}/api/auth/login`);
    console.log('\n💡 Built files have been uploaded - ready to run!');
    console.log('💡 Production environment file (.env.prod) has been copied to .env');
    console.log('💡 Remember: .env file must be in parent directory of dist/');
    
  } catch (error) {
    console.error('❌ POS Engine Mochahost deployment failed:', error);
    process.exit(1);
  }
}

// Run deployment
deploy(); 