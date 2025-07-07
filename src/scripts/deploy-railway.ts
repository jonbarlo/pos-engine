import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚂 Railway Deployment Preparation Script');
console.log('==========================================');

// Check if we're in a Railway environment
const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID;

if (isRailway) {
  console.log('✅ Running in Railway environment');
} else {
  console.log('ℹ️  Running locally - preparing for Railway deployment');
}

// Check required files
const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'railway.json',
  '.railwayignore',
  'src/index.ts'
];

console.log('\n📋 Checking required files...');
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.error(`❌ ${file} - MISSING`);
    process.exit(1);
  }
}

// Check if build is needed
const distExists = fs.existsSync('dist');
const srcModified = fs.statSync('src').mtime;
const distModified = distExists ? fs.statSync('dist').mtime : new Date(0);

if (!distExists || srcModified > distModified) {
  console.log('\n🔨 Building project...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
} else {
  console.log('✅ Build is up to date');
}

// Check environment variables
console.log('\n🔧 Checking environment variables...');
const requiredEnvVars = ['NODE_ENV', 'PORT'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.log('⚠️  Missing environment variables:');
  missingEnvVars.forEach(varName => console.log(`   - ${varName}`));
  console.log('\n💡 Set these in Railway Dashboard > Variables');
} else {
  console.log('✅ All required environment variables are set');
}

// Check if dist/index.js exists
const mainFile = 'dist/index.js';
if (fs.existsSync(mainFile)) {
  console.log(`✅ Main file exists: ${mainFile}`);
} else {
  console.error(`❌ Main file missing: ${mainFile}`);
  console.log('💡 Run: npm run build');
  process.exit(1);
}

console.log('\n🎉 Railway deployment preparation completed!');
console.log('\n📝 Next steps:');
console.log('1. Push your code to GitHub');
console.log('2. Railway will automatically deploy');
console.log('3. Check Railway dashboard for deployment status');
console.log('4. Test your endpoints at: https://your-app-name.railway.app');

if (!isRailway) {
  console.log('\n💡 To test locally with Railway environment:');
  console.log('   npm run start');
} 