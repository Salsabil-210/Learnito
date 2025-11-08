# Security Setup - HttpOnly Cookies

## Why HttpOnly Cookies Instead of LocalStorage?

### ❌ LocalStorage Problems:
1. **Vulnerable to XSS attacks** - JavaScript can access tokens
2. **Can be stolen** via malicious scripts
3. **Not secure** for sensitive data like JWT tokens

### ✅ HttpOnly Cookies Benefits:
1. **Cannot be accessed via JavaScript** - Protected from XSS attacks
2. **Automatically sent** with every request to the same domain
3. **Secure flag** for HTTPS in production
4. **SameSite protection** against CSRF attacks

## Backend Setup

### 1. Install Required Packages
```bash
cd src
npm install cookie-parser
npm install @types/cookie-parser --save-dev
```

### 2. Update `index.ts` to use cookie-parser
```typescript
import cookieParser from 'cookie-parser';

app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true, // Allow cookies
}));
```

### 3. Auth Controller Changes
- **Signup/Login**: Set tokens in httpOnly cookies
- **Refresh**: Read refresh token from cookie
- **Logout**: Clear cookies

### 4. Auth Middleware Changes
- Read `accessToken` from `req.cookies` instead of Authorization header

## Frontend Setup

### 1. Install Axios
```bash
cd frontend
npm install axios
```

### 2. API Config Features
- `withCredentials: true` - Sends cookies with requests
- Automatic token refresh on 401 errors
- No manual token management needed

### 3. Login Flow
```typescript
// Just call the API, cookies are handled automatically
const response = await api.post('/api/auth/login', { email, password });
// Tokens are now in httpOnly cookies
```

## Cookie Configuration

```typescript
res.cookie('accessToken', token, {
  httpOnly: true,           // Cannot be accessed via JavaScript
  secure: true,             // Only sent over HTTPS (production)
  sameSite: 'strict',       // CSRF protection
  maxAge: 15 * 60 * 1000,   // 15 minutes
});
```

## Security Benefits

1. **XSS Protection**: Even if attacker injects script, they can't steal tokens
2. **CSRF Protection**: SameSite=strict prevents cross-site requests
3. **Automatic Expiry**: maxAge ensures cookies expire
4. **HTTPS Only** (production): Tokens only sent over encrypted connection

## Development vs Production

**Development** (HTTP):
- `secure: false` (works on localhost)

**Production** (HTTPS):
- `secure: true` (requires HTTPS)
- Set `NODE_ENV=production`

## Migration Steps

1. ✅ Update backend to use cookie-parser
2. ✅ Update auth.controller to set cookies
3. ✅ Update auth.middleware to read from cookies
4. ✅ Update frontend apiconfig with `withCredentials: true`
5. ✅ Remove all localStorage token management
6. ✅ Test login/logout/refresh flows

## Testing

```bash
# Backend
npm run dev

# Frontend
npm run dev

# Test login at: http://localhost:5173
# Check cookies in browser DevTools > Application > Cookies
```

You should see `accessToken` and `refreshToken` cookies marked as HttpOnly ✅
