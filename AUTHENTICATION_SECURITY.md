# Authentication Security Features

This document describes the security features implemented for authentication in the Learnito application.

## Features

### 1. Token Blacklisting (Logout)

The logout functionality allows users to invalidate their refresh tokens, preventing them from being used even if they haven't expired yet.

#### Implementation Details

- **Endpoint**: `POST /api/auth/logout`
- **Request Body**: 
  ```json
  {
    "refreshToken": "your-refresh-token"
  }
  ```
  Or the token can be sent via cookies as `refreshToken`

- **Response**: 
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

- **How It Works**:
  1. The refresh token is verified to ensure it's valid
  2. The token is added to a Redis blacklist with a 7-day expiration
  3. When tokens are refreshed, the system checks the blacklist
  4. Blacklisted tokens are rejected with an error

- **Fallback**: If Redis is unavailable, the logout endpoint still succeeds (fail-safe), but tokens won't be actively blacklisted

### 2. Rate Limiting

Rate limiting prevents brute-force attacks and API abuse by limiting the number of requests from a single IP address or email within a time window.

#### Implementation Details

- **Protected Endpoints**:
  - `POST /api/auth/login` - 5 requests per minute
  - `POST /api/auth/signup` - 5 requests per minute
  - `POST /api/auth/gauth` - 10 requests per minute
  - `POST /api/auth/refresh` - 10 requests per minute
  - `POST /api/auth/logout` - 10 requests per minute

- **Rate Limit Response** (HTTP 429):
  ```json
  {
    "message": "Too many requests, please try again later.",
    "retryAfter": 45
  }
  ```

- **Response Headers**:
  - `X-RateLimit-Limit`: Maximum requests allowed in the window
  - `X-RateLimit-Remaining`: Remaining requests in the current window
  - `X-RateLimit-Reset`: Timestamp when the rate limit resets

- **How It Works**:
  1. Requests are tracked by IP address and email (if provided)
  2. Redis stores the request count with automatic expiration
  3. If Redis is unavailable, an in-memory store is used as fallback
  4. Exceeding the limit returns HTTP 429 with retry information

- **Fallback**: If both Redis and the in-memory store fail, the request is allowed through (fail-open) to prevent service disruption

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD=your-redis-password  # Optional
```

### Docker Setup

The application includes a Redis service in `docker-compose.yml`:

```yaml
redis:
  image: redis:7-alpine
  container_name: learnito-redis
  restart: always
  ports:
    - "6379:6379"
  volumes:
    - redis-data:/data
  command: redis-server --appendonly yes
```

## Usage Examples

### Logout Example

```bash
# Logout with refresh token in body
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "your-refresh-token-here"}'
```

### Rate Limiting Example

```bash
# Make multiple login requests to test rate limiting
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com", "password": "password"}' \
    -w "\nStatus: %{http_code}\n"
  echo "Request $i completed"
done

# The 6th request should return HTTP 429
```

## Security Considerations

### Token Blacklisting
- Tokens are stored in Redis with automatic expiration matching the token's TTL
- If Redis is down, logout succeeds but tokens remain valid (degraded security)
- Consider monitoring Redis uptime for production deployments

### Rate Limiting
- Rate limits are per IP + email combination
- Shared IPs (offices, schools) may hit limits faster
- Consider implementing user-specific rate limiting for better UX
- The in-memory fallback is not distributed, so each server instance has its own counter

### Best Practices
1. **Monitor Redis**: Ensure Redis is running and healthy in production
2. **Adjust Limits**: Tune rate limits based on your traffic patterns
3. **Log Attempts**: Monitor rate-limited requests for potential attacks
4. **Use HTTPS**: Always use HTTPS in production to protect tokens in transit
5. **Rotate Secrets**: Regularly rotate JWT secrets

## Troubleshooting

### Redis Connection Issues

If Redis fails to connect, check:
1. Redis service is running: `docker ps | grep redis`
2. Environment variables are set correctly
3. Firewall rules allow connection to port 6379

The application will log:
```
Redis connection failed (using in-memory fallback): <error message>
```

### Rate Limiting Not Working

If rate limiting isn't working:
1. Check that middleware is applied to routes in `auth.routes.ts`
2. Verify Redis or in-memory store is functioning
3. Check browser console for rate limit headers
4. Ensure requests are coming from the same IP/email combination

## Development vs Production

### Development
- Redis can be optional (uses in-memory fallback)
- Rate limits may be disabled or increased for testing
- Tokens may have longer expiration times

### Production
- Redis is **required** for proper token blacklisting
- Use strict rate limits to prevent abuse
- Set appropriate token expiration times (15min for access, 7d for refresh)
- Monitor rate limit violations for security threats
