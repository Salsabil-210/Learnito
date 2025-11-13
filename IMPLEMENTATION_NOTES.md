# User Validation During Refresh - Implementation Notes

## Overview
This document describes the implementation of user validation during the refresh token flow to prevent zombie sessions and improve security.

## Problem Statement
Previously, the refresh token endpoint relied solely on the decoded token payload (userId, email) without re-fetching the user from the database. This created potential security issues:
- **Zombie Sessions**: If a user was deleted or deactivated after a refresh token was issued, the refresh would still succeed
- **Stale Data**: Token refresh used cached data from the token instead of fresh database data
- **No Audit Trail**: Lack of logging made it difficult to track authentication events

## Solution Implemented

### 1. Database Schema Changes
Added `isActive` field to the User model:
```prisma
model User {
  // ... existing fields
  isActive        Boolean   @default(true)
  // ... rest of fields
}
```

**Migration**: `src/prisma/migrations/20251113140805_add_is_active_field/migration.sql`

### 2. Enhanced Refresh Token Flow
The `refreshToken` method in `auth.service.ts` now:

1. **Validates Token**: Verifies the refresh token signature
2. **Database Lookup**: Fetches user from database using `userId` from token
3. **Existence Check**: Throws `UnauthorizedError` if user not found
4. **Active Status Check**: Throws `UnauthorizedError` if user is inactive
5. **Fresh Data Usage**: Uses current user data from DB for new access token

**Code**:
```typescript
async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    logger.warn('Invalid refresh token provided');
    throw new UnauthorizedError('Invalid refresh token');
  }

  // Validate user exists and is active
  const user = await userRepository.findById(decoded.userId);
  if (!user) {
    logger.warn('Refresh token for non-existent user', { userId: decoded.userId });
    throw new UnauthorizedError('User not found');
  }

  if (!user.isActive) {
    logger.warn('Refresh token for inactive user', { userId: user.id });
    throw new UnauthorizedError('User account is inactive');
  }

  // Use fresh user data for token generation
  const accessToken = generateAccessToken({ 
    userId: user.id, 
    email: user.email 
  });

  return { accessToken };
}
```

### 3. Custom Error Classes
Created `src/utils/errors.ts` with standardized error types:
- `AppError` - Base error class with statusCode and isOperational flag
- `UnauthorizedError` (401) - Authentication failures
- `ForbiddenError` (403) - Authorization failures
- `NotFoundError` (404) - Missing resources
- `BadRequestError` (400) - Validation errors
- `ConflictError` (409) - Conflicts (e.g., duplicate users)

**Benefits**:
- Consistent error responses across the API
- Appropriate HTTP status codes
- Better error handling in middleware
- Type-safe error handling

### 4. Structured Logging
Created `src/utils/logger.ts` with:
- **Log Levels**: info, warn, error, debug
- **Structured Format**: ISO timestamps, log level, message, context
- **Environment Aware**: No debug logs in production, no logs in test
- **Context Support**: Attach additional data to logs for better debugging

**Usage**:
```typescript
logger.info('User logged in successfully', { userId: user.id, email });
logger.warn('Login attempt for inactive user', { userId: user.id, email });
logger.error('Database connection failed', { error: err.message });
```

### 5. Global Error Handler
Created `src/middlewares/errorHandler.ts` that:
- Catches all errors from routes and controllers
- Logs errors with request context (path, method, stack)
- Returns appropriate HTTP status codes
- Handles both custom AppError instances and unexpected errors
- Prevents sensitive information leakage

**Integration** in `src/index.ts`:
```typescript
// Must be defined after all routes
app.use(errorHandler);
```

### 6. Enhanced Authentication Methods
All authentication methods (`login`, `googleAuth`, `signup`) now:
- Check `isActive` status before allowing access
- Log security-relevant events for audit trail
- Use custom errors for better error handling
- Validate user data freshness

## Security Benefits

### ✅ Prevents Zombie Sessions
- Deleted users cannot refresh their tokens
- Deactivated users are immediately blocked
- No reliance on token expiration alone

### ✅ Fresh Data Usage
- Access tokens generated with current database state
- Email changes reflected in new tokens
- No stale data from old tokens

### ✅ Better Audit Trail
- All authentication events logged
- Failed attempts tracked with context
- Easier to investigate security incidents

### ✅ Proper Error Handling
- Consistent error responses
- No sensitive information exposed
- Appropriate HTTP status codes

## Configuration
Updated `.env.example` with required environment variables:
```bash
# JWT Configuration
JWT_ACCESS_SECRET=your-access-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
```

## Migration Instructions

### For Existing Databases
Run the migration to add the `isActive` field:
```bash
npx prisma migrate deploy --schema=src/prisma/schema.prisma
```

All existing users will have `isActive=true` by default.

### For New Databases
Run all migrations:
```bash
npx prisma migrate deploy --schema=src/prisma/schema.prisma
```

## Usage Examples

### Deactivating a User
```typescript
await authService.updateUser(userId, { isActive: false });
```

After deactivation:
- User cannot login
- User cannot refresh tokens (gets 401)
- Existing access tokens remain valid until expiry (keep them short-lived)

### Reactivating a User
```typescript
await authService.updateUser(userId, { isActive: true });
```

### Checking Logs
```bash
# View authentication events
grep "logged in" logs/app.log

# View security warnings
grep "WARN" logs/app.log | grep "inactive\|invalid"
```

## Future Enhancements (Not Implemented)

### Redis Token Blacklisting
For immediate access token revocation:
- Store blacklisted tokens in Redis
- Check blacklist in auth middleware
- Expire entries after token TTL

### Multi-Device Logout
To revoke all tokens for a user:
- Track refresh tokens per user
- Blacklist all tokens on logout
- Implement session management

### Rate Limiting
To prevent brute force attacks:
- Limit login attempts per IP/user
- Implement exponential backoff
- Add CAPTCHA after failed attempts

## Testing Recommendations

### Manual Testing
1. Create a user and login to get tokens
2. Deactivate the user in the database
3. Try to refresh the token - should get 401
4. Try to login - should get 401
5. Reactivate the user
6. Login should work again

### Automated Testing (Future)
- Unit tests for auth.service methods
- Integration tests for auth endpoints
- Mock Redis for blacklist tests
- Test error handling edge cases

## Notes
- The implementation follows the principle of minimal changes
- All changes are backward compatible
- Existing functionality is preserved
- Security is enhanced without breaking changes
