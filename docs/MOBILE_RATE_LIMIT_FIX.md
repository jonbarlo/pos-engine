# Mobile App Rate Limit Fix

## Issue Description

The mobile app was getting **429 status code** (Too Many Requests) when trying to authenticate. This was caused by overly restrictive rate limiting on the authentication endpoints.

### Error Details
```
[2025-07-16T05:24:52.823Z] Request failed: {
  "method":"POST",
  "url":"/api/auth/login",
  "statusCode":429,
  "duration":"1ms",
  "ip":"::1",
  "userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
  "businessId":"unauthenticated"
}
```

## Root Cause

The `authLimiter` in `src/middleware/security.ts` was configured with:
- **5 login attempts per 15 minutes** - Too restrictive for mobile app development
- No differentiation between development and production environments
- No handling for successful logins (they were still counted against the limit)

## Solution Implemented

### 1. Increased Rate Limits
Updated `src/middleware/security.ts`:

```typescript
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 100 : 20, // More lenient in development
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: (req: any, res) => {
    logger(`Rate limit exceeded for auth endpoint from IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many login attempts',
      message: 'Please wait 15 minutes before trying again',
      retryAfter: 900 // 15 minutes in seconds
    });
  }
});
```

### 2. Environment-Specific Limits
- **Development**: 100 login attempts per 15 minutes
- **Production**: 20 login attempts per 15 minutes

### 3. Improved API Rate Limits
Also increased general API rate limits:
- **Development**: 500 requests per 15 minutes
- **Production**: 200 requests per 15 minutes

### 4. Better Error Handling
- Added custom error handlers with proper JSON responses
- Added `skipSuccessfulRequests: true` to not count successful logins
- Added proper logging for rate limit violations

## Testing

Created `api-test/mobile-auth-test.http` to verify:
1. Login works without hitting rate limits
2. Floor plan endpoints are accessible
3. Table endpoints are accessible
4. Multiple login attempts work in development

## Mobile App Integration

The mobile app should now be able to:
1. **Authenticate** without hitting rate limits during development
2. **Access floor plans** using existing endpoints:
   - `GET /api/floor-plans` - Get all floor plans
   - `GET /api/floor-plans/:id` - Get specific floor plan
   - `GET /api/floor-plans/:id/tables` - Get floor plan with table positions
   - `GET /api/floor-plans/:id/available-tables` - Get available tables
3. **Access tables** using existing endpoints:
   - `GET /api/tables` - Get all tables
   - `GET /api/tables?status=available` - Get available tables

## Authentication Requirements

The mobile app must:
1. Send login request with email, password, and businessSlug or businessId
2. Include the returned JWT token in Authorization header: `Bearer <token>`
3. The token automatically includes the business context

## Next Steps

1. Test the mobile app authentication
2. Verify floor plan data is accessible
3. Monitor rate limit logs to ensure they're working correctly
4. Consider implementing mobile-specific endpoints if needed for performance 