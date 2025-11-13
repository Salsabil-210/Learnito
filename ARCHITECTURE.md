# Rate Limiter Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Request                           │
│                     (IP: X.X.X.X, Email: user@example.com)      │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Rate Limiter Middleware                       │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 1. Extract key: getClientIp() + email                     │ │
│  │    → ratelimit:X.X.X.X:user@example.com                  │ │
│  │                                                            │ │
│  │ 2. Create time bucket: Math.floor(now / windowMs)         │ │
│  │    → ratelimit:X.X.X.X:user@example.com:12345            │ │
│  │                                                            │ │
│  │ 3. Check rate limit (Redis or In-Memory)                  │ │
│  │                                                            │ │
│  │ 4. Set response headers:                                  │ │
│  │    - X-RateLimit-Limit                                    │ │
│  │    - X-RateLimit-Remaining                                │ │
│  │    - X-RateLimit-Reset                                    │ │
│  └───────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                    ┌───────────┴──────────┐
                    │                      │
           count ≤ max                count > max
                    │                      │
                    ▼                      ▼
        ┌───────────────────┐   ┌──────────────────┐
        │ Allow Request     │   │ 429 Too Many     │
        │ next()            │   │ Requests         │
        └─────────┬─────────┘   └──────────────────┘
                  │
                  ▼
        ┌──────────────────────────────────────────┐
        │     Route Handler (authenticate)         │
        │  ┌────────────────────────────────────┐ │
        │  │ Verify JWT Token                   │ │
        │  │ Check user exists                  │ │
        │  └────────────────────────────────────┘ │
        └─────────┬────────────────────────────────┘
                  │
                  ▼
        ┌──────────────────────────────────────────┐
        │      Controller (authController)         │
        │  ┌────────────────────────────────────┐ │
        │  │ Process request                    │ │
        │  │ Call service layer                 │ │
        │  └────────────────────────────────────┘ │
        └─────────┬────────────────────────────────┘
                  │
                  ▼
        ┌──────────────────────────────────────────┐
        │      Service (authService)               │
        │  ┌────────────────────────────────────┐ │
        │  │ For refresh:                       │ │
        │  │   1. Verify refresh token          │ │
        │  │   2. CHECK USER EXISTS IN DB ✓    │ │
        │  │   3. Generate new access token     │ │
        │  └────────────────────────────────────┘ │
        └─────────┬────────────────────────────────┘
                  │
                  ▼
        ┌──────────────────────────────────────────┐
        │            Response                      │
        │  ┌────────────────────────────────────┐ │
        │  │ Skip requests logic:               │ │
        │  │   res.on('finish', () => {         │ │
        │  │     if (shouldSkip)                │ │
        │  │       decrement(key)               │ │
        │  │   })                               │ │
        │  └────────────────────────────────────┘ │
        └──────────────────────────────────────────┘
```

## Data Flow

### 1. Rate Limit Check Flow

```
Request
   │
   ├─→ Generate Key
   │      │
   │      ├─→ Extract IP (X-Forwarded-For or req.ip)
   │      ├─→ Extract Email (req.body.email)
   │      └─→ Key: "ratelimit:IP:EMAIL"
   │
   ├─→ Calculate Bucket
   │      │
   │      └─→ Bucket = Math.floor(Date.now() / windowMs)
   │          Full Key: "ratelimit:IP:EMAIL:BUCKET"
   │
   ├─→ Try Redis
   │      │
   │      ├─→ [SUCCESS] INCR fullKey
   │      │              EXPIRE fullKey (windowSeconds * 2)
   │      │              Return count
   │      │
   │      └─→ [FAILURE] Fallback to In-Memory
   │                     Return count from Map
   │
   ├─→ Check Limit
   │      │
   │      ├─→ count ≤ max → Continue (next())
   │      └─→ count > max → Return 429
   │
   └─→ Set Headers
          ├─→ X-RateLimit-Limit: maxRequests
          ├─→ X-RateLimit-Remaining: max(0, max - count)
          └─→ X-RateLimit-Reset: ISO timestamp
```

### 2. User Validation Flow (Refresh Token)

```
POST /api/auth/refresh
   │
   ├─→ Rate Limiter (10 req / 15 min)
   │      │
   │      └─→ count ≤ 10 → Continue
   │
   ├─→ Authenticate Middleware
   │      │
   │      └─→ Verify JWT format
   │
   ├─→ Auth Controller
   │      │
   │      └─→ Extract refreshToken from body
   │
   ├─→ Auth Service
   │      │
   │      ├─→ verifyRefreshToken(token)
   │      │      │
   │      │      ├─→ [INVALID] → Error: "Invalid refresh token"
   │      │      └─→ [VALID] → decoded = { userId, email }
   │      │
   │      ├─→ ✓ userRepository.findById(decoded.userId)
   │      │      │
   │      │      ├─→ [NOT FOUND] → Error: "User not found"
   │      │      └─→ [FOUND] → Continue
   │      │
   │      └─→ generateAccessToken({ userId, email })
   │
   └─→ Response
          │
          └─→ { accessToken: "..." }
```

## Storage Architecture

### Redis Store (Primary)

```
┌─────────────────────────────────────────────────────┐
│                   Redis Server                      │
│                                                     │
│  Key: "ratelimit:1.2.3.4:user@example.com:12345"  │
│  Value: 3                                          │
│  TTL: 1800 seconds                                 │
│                                                     │
│  Commands:                                         │
│  • INCR key     → Returns new count                │
│  • EXPIRE key   → Set TTL                          │
│  • DECR key     → Decrease count (skip requests)   │
└─────────────────────────────────────────────────────┘
```

### In-Memory Store (Fallback)

```
┌─────────────────────────────────────────────────────┐
│                  InMemoryStore                      │
│                                                     │
│  Map<string, { count: number, resetTime: number }> │
│                                                     │
│  Entry:                                            │
│  {                                                 │
│    key: "ratelimit:1.2.3.4:user@ex.com:12345",   │
│    value: {                                       │
│      count: 3,                                    │
│      resetTime: 1699886400000                     │
│    }                                              │
│  }                                                │
│                                                     │
│  Cleanup: Every 5 minutes via setInterval()        │
│  • Remove entries where now >= resetTime           │
│  • Runs automatically on module load               │
└─────────────────────────────────────────────────────┘
```

## Time-Bucketed Window Approach

### Traditional Approach (BROKEN)
```
Request 1 (t=0s)  → INCR → count=1, EXPIRE 60s
Request 2 (t=30s) → INCR → count=2, EXPIRE 60s (TTL reset!)
Request 3 (t=50s) → INCR → count=3, EXPIRE 60s (TTL reset!)
Request 4 (t=70s) → INCR → count=4, EXPIRE 60s (TTL reset!)
...
Counter never resets under continuous traffic!
```

### Fixed-Window with Buckets (CORRECT)
```
Window 1: [0-60s]    → bucket=0  → key:0
  Request at t=10s   → INCR key:0 → count=1
  Request at t=30s   → INCR key:0 → count=2
  Request at t=50s   → INCR key:0 → count=3
  
Window 2: [60-120s]  → bucket=1  → key:1  (New bucket, fresh count!)
  Request at t=70s   → INCR key:1 → count=1
  Request at t=90s   → INCR key:1 → count=2
  
Window boundaries reset naturally!
```

### Calculation
```javascript
const windowMs = 60000; // 60 seconds
const now = Date.now(); // e.g., 1699886450000

// Calculate which bucket we're in
const bucket = Math.floor(now / windowMs);
// bucket = Math.floor(1699886450000 / 60000) = 28331440

// Full key includes bucket
const fullKey = `ratelimit:1.2.3.4:user@ex.com:${bucket}`;
// fullKey = "ratelimit:1.2.3.4:user@ex.com:28331440"

// Window resets at bucket boundary
const resetTime = (bucket + 1) * windowMs;
// resetTime = 28331441 * 60000 = 1699886460000
```

## Request Flow by Endpoint

### `/api/auth/login`
```
Client → loginRateLimiter (5 req / 15 min)
      → authenticate (verify JWT)
      → authController.login
      → authService.login
         ├─→ Find user by email
         ├─→ Compare password
         ├─→ Generate access token
         └─→ Generate refresh token
      → Response { user, accessToken, refreshToken }
```

### `/api/auth/refresh`
```
Client → refreshTokenRateLimiter (10 req / 15 min)
      → authenticate (verify JWT)
      → authController.refreshToken
      → authService.refreshToken
         ├─→ Verify refresh token
         ├─→ ✓ Check user exists (NEW!)
         └─→ Generate new access token
      → Response { accessToken }
```

### `/api/auth/signup`
```
Client → signupRateLimiter (3 req / 1 hour)
      → authController.signup
      → authService.signup
         ├─→ Check if user exists
         ├─→ Create new user
         └─→ Return user data
      → Response { user }
```

### `/api/auth/gauth`
```
Client → authRateLimiter (5 req / 15 min)
      → authController.googleAuth
      → authService.googleAuth
         ├─→ Verify Google ID token
         ├─→ Find or create user
         ├─→ Generate access token
         └─→ Generate refresh token
      → Response { user, accessToken, refreshToken }
```

## Error Handling Flow

```
Request
   │
   ├─→ Rate Limiter
   │      │
   │      ├─→ Try Redis
   │      │      │
   │      │      ├─→ [Connection Failed]
   │      │      │      │
   │      │      │      └─→ Fallback to In-Memory
   │      │      │             Log: "Redis not ready"
   │      │      │
   │      │      └─→ [Command Failed]
   │      │             │
   │      │             └─→ Fallback to In-Memory
   │      │                    Log: "Redis command error, falling back"
   │      │
   │      └─→ Try In-Memory
   │             │
   │             ├─→ [Success] → Continue
   │             │
   │             └─→ [Error]
   │                    │
   │                    └─→ Fail-Open: Allow request
   │                           Log: "Rate limiting error"
   │                           next() ← Request proceeds
   │
   └─→ Continue to handler
```

## Skip Requests Feature

```
Request → Rate Limiter (count=3)
       → Handler
       → Response
          │
          └─→ res.on('finish')
                 │
                 ├─→ statusCode < 400 && skipSuccessfulRequests
                 │      │
                 │      └─→ DECR count → count=2
                 │
                 └─→ statusCode >= 400 && skipFailedRequests
                        │
                        └─→ DECR count → count=2

Examples:
• Login failed (401) with skipFailedRequests → Decrement
• Login success (200) with skipSuccessfulRequests → Decrement
• Server error (500) with skipFailedRequests → Decrement
```

## Configuration Matrix

| Endpoint    | Window  | Max | Purpose                  |
|-------------|---------|-----|--------------------------|
| `/login`    | 15 min  | 5   | Brute force protection   |
| `/refresh`  | 15 min  | 10  | More frequent refreshes  |
| `/signup`   | 1 hour  | 3   | Spam account prevention  |
| `/gauth`    | 15 min  | 5   | OAuth rate limiting      |

## Performance Characteristics

### Redis Performance
```
Operation    | Latency  | Throughput
-------------|----------|------------
INCR         | ~1ms     | 50k ops/sec
EXPIRE       | ~1ms     | 50k ops/sec
DECR         | ~1ms     | 50k ops/sec
```

### In-Memory Performance
```
Operation    | Latency  | Throughput
-------------|----------|------------
increment    | ~0.01ms  | 100k ops/sec
decrement    | ~0.01ms  | 100k ops/sec
cleanup      | ~10ms    | Once per 5 min
```

### Memory Usage
```
Redis:       ~100 bytes per key
In-Memory:   ~100 bytes per key + Map overhead
Cleanup:     Removes expired entries to prevent memory leaks
```

## Security Features

1. **IP-based limiting**: Prevents attacks from single source
2. **Email-based limiting**: Prevents credential stuffing across IPs
3. **User validation**: Ensures deleted users can't refresh tokens
4. **Proxy support**: X-Forwarded-For for cloud deployments
5. **Rate limit headers**: Clients can self-throttle
6. **Fail-open**: High availability during outages
7. **Time-bucketed keys**: Prevents TTL manipulation
8. **Automatic cleanup**: Prevents memory leaks

## Monitoring Points

1. **429 Response Rate**: Track rate limit violations
2. **Redis Health**: Connection status, command errors
3. **Fallback Frequency**: How often in-memory is used
4. **Response Times**: Impact of rate limiting on latency
5. **Memory Usage**: In-memory store size
6. **User Validation Failures**: Track deleted user attempts
7. **Skip Request Events**: Frequency of decrements

## Deployment Architecture

```
                    ┌─────────────────┐
                    │   Load Balancer │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
         ┌────▼────┐    ┌────▼────┐   ┌────▼────┐
         │  App 1  │    │  App 2  │   │  App 3  │
         │  Node   │    │  Node   │   │  Node   │
         └────┬────┘    └────┬────┘   └────┬────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
                    ┌────────▼────────┐
                    │  Redis Cluster  │
                    │  (Shared State) │
                    └─────────────────┘

Each App Node:
• Has own InMemoryStore (fallback)
• Connects to shared Redis
• Handles rate limiting independently
• Falls back gracefully on Redis failure
```

This architecture ensures consistent rate limiting across multiple application instances while maintaining high availability through local fallback stores.
