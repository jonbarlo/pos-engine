# Windows PowerShell Scripts for POS Engine API Testing

This folder contains PowerShell scripts for testing the POS Engine API on Windows systems.

## Scripts Overview

### 1. `test-login.ps1` - Comprehensive Login Testing
A complete test suite that validates all login scenarios including:
- ✅ Admin user login
- ✅ Regular user login  
- ✅ Invalid credentials handling
- ✅ Missing business context validation
- ✅ Invalid business slug handling
- ✅ BusinessId vs businessSlug functionality

**Usage:**
```powershell
# Test with default localhost:3031
.\test-login.ps1

# Test with custom server URL
.\test-login.ps1 -BaseUrl "http://your-server:3031"
```

### 2. `quick-login.ps1` - Quick Reference Commands
Displays ready-to-copy PowerShell commands for quick API testing.

**Usage:**
```powershell
.\quick-login.ps1
```

## Prerequisites

1. **Server Running**: Ensure your POS Engine server is running on the target URL (default: `http://localhost:3031`)

2. **Database Seeded**: Run the database seed script to create test data:
   ```bash
   npm run seed
   # or
   node src/scripts/seed.ts
   ```

3. **Test Credentials**: The scripts use these default test credentials:
   - **Admin**: `admin@demo.com` / `admin123`
   - **User**: `user@demo.com` / `user123`
   - **Business**: `demo-business` (slug) or `1` (ID)

## Quick Commands

### Admin Login
```powershell
Invoke-WebRequest -Uri "http://localhost:3031/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@demo.com","password":"admin123","businessSlug":"demo-business"}'
```

### User Login
```powershell
Invoke-WebRequest -Uri "http://localhost:3031/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"user@demo.com","password":"user123","businessSlug":"demo-business"}'
```

### Login with BusinessId
```powershell
Invoke-WebRequest -Uri "http://localhost:3031/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@demo.com","password":"admin123","businessId":1}'
```

## Expected Response Format

Successful login returns:
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@demo.com",
    "role": "admin",
    "businessId": 1,
    "isActive": true
  },
  "business": {
    "id": 1,
    "name": "Demo Business",
    "slug": "demo-business",
    "primaryColor": "#007bff",
    "secondaryColor": "#6c757d",
    "currency": "USD",
    "taxRate": 8.5,
    "timezone": "America/New_York"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Error Handling

The scripts include comprehensive error handling for:
- ❌ Invalid credentials (401)
- ❌ Missing business context (400)
- ❌ Business not found (404)
- ❌ Server connection issues
- ❌ JSON parsing errors

## Troubleshooting

### Common Issues

1. **"Server is not responding"**
   - Check if the server is running on the correct port
   - Verify the BaseUrl parameter

2. **"Business not found"**
   - Ensure the database is seeded with test data
   - Check that the business slug/ID is correct

3. **"Invalid credentials"**
   - Verify the test credentials are correct
   - Check if the user exists in the database

4. **PowerShell Execution Policy**
   - If scripts won't run, check execution policy:
   ```powershell
   Get-ExecutionPolicy
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

## Integration with Other Scripts

These scripts complement the existing test infrastructure:
- `scripts/win/test-api.ps1` - Full API test suite
- `src/controllers/authController.spec.ts` - Unit tests
- `src/services/userService.spec.ts` - Service tests

## Security Notes

⚠️ **Important**: These scripts use hardcoded test credentials. In production:
- Never use these credentials
- Use environment variables for sensitive data
- Implement proper credential management
- Use HTTPS for all API calls 