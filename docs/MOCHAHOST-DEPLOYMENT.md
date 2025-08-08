# Mochahost IIS Node.js Deployment Guide

This guide explains how to deploy your Node.js API to Mochahost shared IIS hosting using iisnode, with the correct web.config and environment variable setup.

## Key Points
- Mochahost uses IIS with iisnode to run Node.js apps.
- You must use a custom `web.config` for full control.
- Environment variables can be set via `.env` file in your app root.
- Logging must be disabled in iisnode to avoid permission errors.
- **CRITICAL**: Your app runs from the `dist/` directory, but `.env` file must be in the parent directory.
- **CRITICAL**: Never bind to a port when running under IIS - use `process.env.IIS_NODE_VERSION` check.

## 1. web.config Example (Working)

Place this file in your app root:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <!-- Disable logging to avoid permission errors, enable dev errors for debugging -->
    <iisnode loggingEnabled="false" devErrorsEnabled="true" nodeProcessCommandLine="C:\Program Files\nodejs\node.exe"/>
    <!-- Register iisnode handler -->
    <handlers>
      <add name="iisnode" path="*.js" verb="*" modules="iisnode"/>
    </handlers>
    <!-- Rewrite rule - all requests go to main app entry point -->
    <rewrite>
      <rules>
        <rule name="MainApp">
          <action type="Rewrite" url="dist/index.js"/>
        </rule>
      </rules>
    </rewrite>
    <tracing>
      <traceFailedRequests>
        <clear/>
      </traceFailedRequests>
    </tracing>
  </system.webServer>
</configuration>
```

- This routes all requests to your main app (`dist/index.js`).
- Disables iisnode logging (fixes permission errors).
- Enables dev errors for easier debugging.
- Ensures the correct Node.js binary is used.

## 2. Environment Variables

**CRITICAL ISSUE RESOLVED:** Your Node.js app runs from the `dist/` directory, but the `.env` file must be in the parent directory.

**Recommended:** Use a `.env` file in your app root (same directory as `web.config`). Example:

```
NODE_ENV=production
DB_HOST=mssql001.use1.my-hosting-panel.com
DB_NAME=506software-mssqlserverdb-test
DB_USERNAME=defaultUser
DB_PASSWORD=your-password
DB_PORT=1433
APP_NAME=NodeJS-API-Production
VERSION=1.0.0
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h
```

**Environment Loading Fix:**
In your Node.js code, use this pattern to correctly load the `.env` file:

```javascript
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from parent directory
const envPath = path.resolve(process.cwd(), '..', '.env');
dotenv.config({ path: envPath });
```

**CRITICAL: Server Startup Logic**
When running under IIS, you must NOT bind to a port. Use this pattern:

```javascript
// Only start server if not running under IIS
if (process.env.NODE_ENV !== 'production' || !process.env.IIS_NODE_VERSION) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
```

**Why this matters:**
- IIS manages the port binding automatically
- If your app tries to bind to a port when running under IIS, it will cause a 500 error
- The `process.env.IIS_NODE_VERSION` check prevents this issue

**Directory Structure on Server:**
```
your-app-domain.com/
├── .env                    ← .env file here (app root)
├── package.json
├── web.config
└── dist/                   ← app runs from here
    └── index.js
```

- Do **not** commit `.env` to version control.
- Mochahost will load this file if your app uses `dotenv` correctly.

## 3. Deployment Steps

1. **Deploy using the automated script:**
   ```bash
   npm run deploy:mochahost
   ```
   This will:
   - Upload source files (`src/` folder)
   - Upload configuration files (`package.json`, `web.config`, `.env`)
   - Show progress tracking for all uploaded files

2. **On the server (Plesk console):**
   ```bash
   npm install --production
   npm run build
   ```
   This creates the `dist/` folder with compiled JavaScript files that the `web.config` expects.

3. **Restart the IIS application in Plesk**
4. **Test your endpoints:**
   - `/` (root)
   - `/health`
   - `/env-test`
   - `/db-test`

**CRITICAL: TypeScript Compilation**
- IIS runs compiled JavaScript files, not TypeScript files directly
- The `web.config` points to `dist/index.js` (compiled version)
- TypeScript imports (like `./utils/logger`) will fail if running `.ts` files directly
- Always build on the server to create the `dist/` folder before testing

## 4. Testing and Debugging

**CRITICAL: Environment Variable Loading Fix**

The application runs from the `dist/` directory on the server, but the `.env` file is in the root directory. This requires explicit path resolution:

```javascript
// Always look in parent directory since app runs from dist/ but .env is in root
const envPath = path.resolve(process.cwd(), '..', '.env');
dotenv.config({ path: envPath });
```

**CRITICAL: TypeScript Import Issues**
- TypeScript imports (like `./utils/logger`) will fail if running `.ts` files directly
- IIS needs compiled JavaScript files from the `dist/` folder
- The `web.config` points to `dist/index.js`, not `src/index.ts`
- Always ensure `npm run build` has been run on the server before testing

**Debug Information:**
- Server `cwd`: `C:\Inetpub\vhosts\506software.com\pos-engine.506software.com\dist`
- Correct `.env` path: `C:\Inetpub\vhosts\506software.com\pos-engine.506software.com\.env`
- The app runs from `dist/` but `.env` is in the parent directory
- Compiled JavaScript files are in `dist/` folder

**Create Test Endpoints for Validation:**
Add these endpoints to your API for deployment validation:

```javascript
// Environment variables test
app.get('/env-test', (req, res) => {
  res.json({
    success: true,
    message: 'Environment variables check',
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      DB_HOST: process.env.DB_HOST,
      DB_NAME: process.env.DB_NAME,
      DB_USERNAME: process.env.DB_USERNAME,
      DB_PASSWORD: process.env.DB_PASSWORD ? '***set***' : 'not set',
      DB_PORT: process.env.DB_PORT,
      PORT: process.env.PORT,
    },
    debug: {
      envPath: path.resolve(process.cwd(), '..', '.env'),
      envExists: fs.existsSync(path.resolve(process.cwd(), '..', '.env')),
      cwd: process.cwd(),
    }
  });
});

// Database connection test
app.get('/db-test', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query('SELECT 1 as test');
    await pool.close();
    res.json({
      success: true,
      message: 'Database connection successful',
      result: result.recordset[0]
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});
```

**Validation Checklist:**
- ✅ Server responds to `/` endpoint
- ✅ Environment variables load correctly (`/env-test`)
- ✅ Database connection works (`/db-test`)
- ✅ All required endpoints function properly

## 5. Troubleshooting

**Environment Variables Not Loading:**
- **Symptom**: Database connection fails with "localhost" or default values
- **Cause**: `.env` file not found or not loaded correctly
- **Solution**: Ensure `.env` file is in app root (parent of `dist/`) and use correct path in code

**Common Issues:**
- If you see 500 errors and no logs, check that `loggingEnabled="false"` in `web.config`.
- If only `/` and `/health` work, make sure you are deploying the latest build and that `dist/index.js` is your main entry point.
- If environment variables are missing, check your `.env` file and ensure it is in the app root (not in `dist/`).
- If you get permission errors, contact Mochahost support and ask them to ensure the IIS application pool identity has read/write access to your app directory.

**Debugging Environment Issues:**
Add this debugging code to identify environment loading problems:

```javascript
import fs from 'fs';

const envPath = path.resolve(process.cwd(), '..', '.env');
const envExists = fs.existsSync(envPath);

console.log('🔧 Loading environment from:', envPath);
console.log('🔧 .env file exists:', envExists);
console.log('🔧 Current working directory:', process.cwd());
console.log('🔧 DB_HOST:', process.env.DB_HOST ? 'SET' : 'NOT SET');
```

## 6. Security Notes
- Never commit `.env` files to version control.
- Use strong, unique passwords for database and JWT secrets.
- Regularly rotate secrets and credentials.

---

**This guide reflects the current, working Mochahost IIS Node.js deployment process as confirmed by support and validated through test API deployment.** 