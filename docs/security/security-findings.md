# Security Findings — Agri AI Application

> **Audit Date:** 2025-07-23  
> **Auditor:** EthicalHacker Agent  
> **Scope:** Full-stack (Node.js/TypeScript Backend + React Native Mobile)  
> **Methodology:** Static code analysis, dependency scanning, configuration review, OWASP Top 10 evaluation  
> **Status:** Report Only — No code changes made

---

## Executive Summary

| Severity  | Count |
|-----------|-------|
| 🔴 Critical | 2 |
| 🟠 High     | 5 |
| 🟡 Medium   | 6 |
| 🔵 Low      | 4 |
| **Total**   | **17** |

**Overall Risk Score: 6.8 / 10 (High)**

The application has a solid foundation — Helmet, Joi validation, bcrypt with cost factor 12, Keychain token storage, and ORM-based queries that prevent raw SQL injection. However, several critical and high-severity issues must be resolved before any production deployment, particularly around secret management, authentication hardening, and mobile network security.

---

## 🔴 CRITICAL Findings

---

### FINDING-001: Sensitive Secrets Use Weak Hardcoded Fallback Defaults

- **Severity:** Critical
- **OWASP Category:** A02 – Cryptographic Failures / A05 – Security Misconfiguration
- **Files:**
  - `backend/src/config/env.ts` — lines 30, 37
  - `backend/.env.example` — lines 10, 17

**Description:**  
The `env.ts` config module defines a helper `requireEnv()` (line 9) that throws on missing variables, but **it is never used** for any sensitive secret. Instead, `getEnv()` is used with weak hardcoded fallback defaults for the two most critical secrets:

```typescript
// backend/src/config/env.ts
password: getEnv('DB_PASSWORD', 'agriaipassword'),   // line 30
secret:   getEnv('JWT_SECRET', 'dev-secret-change-in-production'),  // line 37
```

If `JWT_SECRET` or `DB_PASSWORD` environment variables are absent at runtime (e.g., misconfigured deployment), the application **silently boots with known, public weak credentials**. An attacker who reads `env.ts` or `.env.example` (both committed to git) can immediately:
1. Sign arbitrary JWT tokens to impersonate any user.
2. Potentially connect to the database if it is network-accessible.

The `.env.example` file committed to git contains the **identical** weak values, making them fully public.

**Recommended Fix:**
```typescript
// Use requireEnv() for ALL secrets — throw at startup if missing
jwt: {
  secret: requireEnv('JWT_SECRET'),
  expiresIn: getEnv('JWT_EXPIRES_IN', '24h'),
},
db: {
  password: requireEnv('DB_PASSWORD'),
  // ...
}
```
Also add a startup validation check that `JWT_SECRET` meets a minimum entropy requirement (≥32 characters).

---

### FINDING-002: Plaintext Database Credentials Hardcoded in Version-Controlled docker-compose.yml

- **Severity:** Critical
- **OWASP Category:** A02 – Cryptographic Failures / A05 – Security Misconfiguration
- **File:** `docker-compose.yml` — lines 8–10

**Description:**  
Production-style database credentials are hardcoded directly in `docker-compose.yml`, which is committed to the git repository:

```yaml
# docker-compose.yml
environment:
  POSTGRES_USER: agriai
  POSTGRES_PASSWORD: agriaipassword   # line 9 — hardcoded, committed to git
  POSTGRES_DB: agri_ai_db
```

Additionally, the database port is bound to `0.0.0.0:5432` (all network interfaces), making the PostgreSQL instance reachable from outside the host when Docker networking is used in a cloud/server environment — combined with the public credentials, this is a critical database exposure risk.

**Recommended Fix:**
1. Replace hardcoded values with Docker secrets or an env file reference:
   ```yaml
   environment:
     POSTGRES_USER: ${DB_USER}
     POSTGRES_PASSWORD: ${DB_PASSWORD}
     POSTGRES_DB: ${DB_NAME}
   env_file: .env
   ```
2. Bind the port to localhost only:
   ```yaml
   ports:
     - '127.0.0.1:5432:5432'
   ```

---

## 🟠 HIGH Findings

---

### FINDING-003: No Account Lockout or Per-Route Brute Force Protection on Auth Endpoints

- **Severity:** High
- **OWASP Category:** A07 – Identification and Authentication Failures
- **Files:**
  - `backend/src/app.ts` — lines 31–41
  - `backend/src/routes/onboarding.routes.ts` — lines 12–13

**Description:**  
The application applies a single global rate limiter of **100 requests per minute per IP** across all endpoints. There is no tighter, auth-specific rate limit on `POST /api/v1/auth/login` or `POST /api/v1/auth/register`. There is also no account lockout mechanism (no `failed_login_count` column in the `users` table, no lockout logic in `auth.controller.ts`).

At 100 req/min, an attacker can attempt **144,000 login attempts per day** against any email address, with no slowdown or lockout.

**Recommended Fix:**
```typescript
// Stricter limiter specifically for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // max 10 attempts per window per IP
  message: { error: 'Too Many Requests', message: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login',    authLimiter, validate(loginSchema),    login);
router.post('/register', authLimiter, validate(registerSchema), register);
```
Also add per-user progressive lockout in `auth.controller.ts` by tracking failed attempts.

---

### FINDING-004: JWT Tokens Are Never Invalidated Server-Side (No Logout Blacklist)

- **Severity:** High
- **OWASP Category:** A07 – Identification and Authentication Failures
- **Files:**
  - `backend/src/` — no logout endpoint exists
  - `mobile/src/hooks/useAuth.ts` — line 62 (logout only clears Keychain)

**Description:**  
The `logout()` function in `useAuth.ts` only removes the token from Keychain and clears Redux state. **The backend has no logout endpoint and no token blacklist/revocation mechanism.** A token stolen between issuance and logout (e.g., via MITM, memory dump, or compromised device) remains valid for the full 24-hour `JWT_EXPIRES_IN` window with zero ability to invalidate it.

Additionally, since `JWT_EXPIRES_IN=24h` is relatively long, a stolen token provides extended access.

**Recommended Fix:**
1. Create `POST /api/v1/auth/logout` that stores the token's `jti` (JWT ID) in a Redis/DB blacklist until its `exp` timestamp.
2. Add a `jti: uuidv4()` claim when signing JWTs.
3. Check the blacklist in `authenticateJWT` middleware.
4. Alternatively, shorten `JWT_EXPIRES_IN` to `1h` and implement refresh tokens.

---

### FINDING-005: JWT Algorithm Not Explicitly Specified in Verification

- **Severity:** High
- **OWASP Category:** A02 – Cryptographic Failures
- **File:** `backend/src/middleware/auth.middleware.ts` — line 35

**Description:**  
The JWT verification call does not specify an `algorithms` option:

```typescript
// auth.middleware.ts — line 35
const decoded = jwt.verify(token, env.jwt.secret) as jwt.JwtPayload;
```

While `jsonwebtoken` v9.x rejects `alg: none` by default, not pinning the algorithm leaves the door open for algorithm-confusion attacks (e.g., RS256→HS256 confusion if a public key is ever introduced). It also means any future upgrade or configuration change could inadvertently accept weaker algorithms. The `jwt.sign()` call also does not explicitly set `algorithm: 'HS256'`.

**Recommended Fix:**
```typescript
// In auth.middleware.ts
const decoded = jwt.verify(token, env.jwt.secret, {
  algorithms: ['HS256'],
}) as jwt.JwtPayload;

// In auth.controller.ts for both sign() calls
const token = jwt.sign(
  { sub: userId, email: email.toLowerCase() },
  env.jwt.secret,
  { expiresIn: env.jwt.expiresIn, algorithm: 'HS256' }
);
```

---

### FINDING-006: Mobile API Base URL Is HTTP and Hardcoded (No HTTPS, No Environment Config)

- **Severity:** High
- **OWASP Category:** A02 – Cryptographic Failures / A05 – Security Misconfiguration
- **File:** `mobile/src/services/api.ts` — line 25

**Description:**  
The API base URL is hardcoded as a plain HTTP endpoint pointing to a development Android emulator host:

```typescript
// mobile/src/services/api.ts — line 25
const BASE_URL = 'http://10.0.2.2:3000/api/v1';
```

There is **no `.env` file for the mobile app** and no runtime environment-switching mechanism. This means:
1. All API traffic (including JWT tokens, user credentials, and GPS coordinates) is sent **unencrypted over HTTP** when this address is used on a real network.
2. If this build is deployed to production or testing environments, it will continue using HTTP and the emulator address.
3. Credentials submitted on the login/register screen travel in plaintext.

**Recommended Fix:**
1. Use `react-native-config` or `@env` to inject `API_BASE_URL` from separate `.env.development` / `.env.production` files.
2. Production `API_BASE_URL` must be `https://`.
3. Add an iOS `NSExceptionDomain` entry for the production HTTPS domain (not arbitrary).

```typescript
// mobile/src/services/api.ts
import Config from 'react-native-config';
const BASE_URL = Config.API_BASE_URL ?? 'http://10.0.2.2:3000/api/v1';
```

---

### FINDING-007: `ip` Package — SSRF Vulnerability (CVE / GHSA-2p57-rm9w-gvfp)

- **Severity:** High
- **OWASP Category:** A06 – Vulnerable and Outdated Components
- **File:** `mobile/package.json` — `react-native@0.73.4` dependency chain

**Description:**  
`npm audit` in the mobile project reports a **high-severity SSRF vulnerability** in the `ip` package (GHSA-2p57-rm9w-gvfp) via the `@react-native-community/cli` → `@react-native-community/cli-doctor`/`cli-hermes` → `ip` dependency chain:

```
ip  *  (Severity: HIGH)
SSRF improper categorization in isPublic
https://github.com/advisories/GHSA-2p57-rm9w-gvfp
```

5 high-severity vulnerabilities total in the mobile dependency tree.

**Recommended Fix:**
```bash
# In mobile/
npm audit fix --force
# This will upgrade react-native to 0.73.11 or later
```
Evaluate the upgrade impact on RN 0.73.x compatibility before applying.

---

## 🟡 MEDIUM Findings

---

### FINDING-008: Password Complexity Requirements Are Insufficient

- **Severity:** Medium
- **OWASP Category:** A07 – Identification and Authentication Failures
- **Files:**
  - `backend/src/validators/profile.validator.ts` — line 119
  - `mobile/src/utils/validation.ts` — lines 25–29

**Description:**  
Password validation only enforces a minimum length of 8 characters with no complexity rules:

```typescript
// backend/src/validators/profile.validator.ts — line 119
password: Joi.string().min(8).max(128).required(),
```

No requirement for uppercase, lowercase, numbers, or special characters. This allows trivially guessable passwords like `password`, `12345678`, or `aaaaaaaa`. With no account lockout (FINDING-003), weak passwords are particularly dangerous.

**Recommended Fix:**
```typescript
password: Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  .required()
  .messages({
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  }),
```
Mirror this in the mobile Yup schema.

---

### FINDING-009: `saved_data` Accepts Unbounded, Deeply Nested JSON Objects

- **Severity:** Medium
- **OWASP Category:** A03 – Injection / A05 – Security Misconfiguration
- **Files:**
  - `backend/src/validators/profile.validator.ts` — line 111
  - `backend/src/app.ts` — line 44

**Description:**  
The onboarding progress `saved_data` field accepts any arbitrary JSON object with no depth or key count limits:

```typescript
// profile.validator.ts — line 111
saved_data: Joi.object().optional().allow(null),
```

Combined with the 10MB JSON body limit (`express.json({ limit: '10mb' })` on line 44 of `app.ts`), an authenticated user can POST a deeply-nested 10MB JSON object to `POST /api/v1/profile/progress`. This data is stored directly to PostgreSQL as JSONB, which can cause:
- Memory exhaustion during JSON parsing (prototype pollution risk with deeply nested objects)
- Database storage bloat

The 10MB limit is also excessively large for this API — the largest legitimate payload (farm profile + 5 crops) would be under 5KB.

**Recommended Fix:**
```typescript
// Reduce body limit
app.use(express.json({ limit: '100kb' }));

// Add depth and key constraints to saved_data
saved_data: Joi.object().max(20).optional().allow(null),
// Or use a strict schema for known onboarding step shapes
```

---

### FINDING-010: No Token Expiry Handling in Mobile — Silent 401 Errors

- **Severity:** Medium
- **OWASP Category:** A07 – Identification and Authentication Failures
- **File:** `mobile/src/services/api.ts` — lines 27–39

**Description:**  
The RTK Query `fetchBaseQuery` does not have any error interceptor or middleware to handle `401 Unauthorized` responses. When the 24-hour JWT token expires:
1. Keychain still holds the expired token.
2. Every API call silently fails with a 401.
3. The user sees broken screens rather than being redirected to login.
4. The expired token is never cleared from Keychain until the user manually logs out.

**Recommended Fix:**  
Implement a `baseQueryWithReauth` wrapper using RTK Query's `fetchBaseQuery` with an `onError` handler that, on receiving a 401, dispatches `clearCredentials()` and clears the Keychain token:

```typescript
const baseQueryWithReauth: BaseQueryFn = async (args, api, extra) => {
  const result = await baseQuery(args, api, extra);
  if (result.error?.status === 401) {
    await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
    api.dispatch(clearCredentials());
  }
  return result;
};
```

---

### FINDING-011: Health Endpoint Exposes Application Version

- **Severity:** Medium
- **OWASP Category:** A05 – Security Misconfiguration
- **File:** `backend/src/routes/index.ts` — line 19

**Description:**  
The public `/api/v1/health` endpoint returns the application's `npm_package_version`:

```typescript
// routes/index.ts — line 19
version: process.env.npm_package_version ?? '1.0.0',
```

Exposing version information aids attackers in targeting known CVEs for that specific version. There is also a duplicate health endpoint at `/health` in `app.ts` (line 54), both publicly accessible without authentication.

**Recommended Fix:**
```typescript
// Remove version from public health response
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});
```
If version exposure is desired for internal monitoring, protect this behind an internal network or admin auth header.

---

### FINDING-012: No Email Verification on User Registration

- **Severity:** Medium
- **OWASP Category:** A07 – Identification and Authentication Failures
- **File:** `backend/src/controllers/auth.controller.ts` — lines 15–64

**Description:**  
User registration (`POST /api/v1/auth/register`) creates an active, immediately-authenticatable account with no email verification step. This allows:
- Registration with arbitrary or fake email addresses
- Potential abuse for spam/enumeration (the 409 conflict response on duplicate email enables email enumeration)
- No confirmation that the user owns the provided email address

The auth controller is also explicitly marked as a stub: `// Stub implementation — full auth to be completed in FEAT-009`.

**Recommended Fix:**
1. Add an `is_verified` boolean column to the `users` table.
2. Send a verification email with a time-limited token on registration.
3. Block login for unverified accounts (or allow with limited permissions).
4. Return the same generic message for both registered-but-unverified and unregistered emails to prevent enumeration.

---

### FINDING-013: `LOG_LEVEL` Defaults to `debug` — Verbose Logging in Production

- **Severity:** Medium
- **OWASP Category:** A09 – Security Logging and Monitoring Failures
- **File:** `backend/src/config/env.ts` — line 50

**Description:**  
The log level defaults to `debug` if `LOG_LEVEL` is not explicitly set:

```typescript
// env.ts — line 50
logLevel: getEnv('LOG_LEVEL', 'debug'),
```

Debug-level logs include full request error context, database query details, and operational metadata (e.g., `userId`, `email` in login/register logs at `logger.info` level). If this is accidentally left at `debug` in production:
- Detailed internal information is written to stdout/logs
- Log aggregators could capture and store PII (user IDs, emails)
- Stack traces from development format may leak in non-production environments that misconfigure `NODE_ENV`

**Recommended Fix:**
```typescript
logLevel: getEnv('LOG_LEVEL', env.isProduction ? 'warn' : 'debug'),
```
Also consider using `requireEnv('LOG_LEVEL')` or at minimum asserting a safe default for production builds in a startup validation function.

---

## 🔵 LOW Findings

---

### FINDING-014: Android Debug Build Enables Cleartext Traffic (`usesCleartextTraffic=true`)

- **Severity:** Low (Medium if release builds inherit this)
- **OWASP Category:** A02 – Cryptographic Failures
- **File:** `mobile/android/app/src/debug/AndroidManifest.xml` — line 6

**Description:**  
The debug Android manifest enables cleartext (HTTP) traffic:
```xml
<application android:usesCleartextTraffic="true" ... />
```

This is **intentional for debug builds** (to connect to the local emulator). However, there is no explicit **release manifest** at `mobile/android/app/src/release/AndroidManifest.xml` that disables this. Without a release override, there is a risk that a release build accidentally inherits this setting. The `android:debuggable="true"` flag is also present in the built debug manifests under `build/` (expected for debug builds).

**Recommended Fix:**  
Create `mobile/android/app/src/release/AndroidManifest.xml` explicitly setting:
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <application
    android:usesCleartextTraffic="false"
    android:networkSecurityConfig="@xml/network_security_config" />
</manifest>
```
And create `res/xml/network_security_config.xml` to pin to the production domain.

---

### FINDING-015: No SSL/TLS Certificate Pinning on Mobile

- **Severity:** Low
- **OWASP Category:** A02 – Cryptographic Failures
- **File:** `mobile/src/services/api.ts`

**Description:**  
The mobile app performs no certificate pinning for connections to the backend API. An attacker with network access (corporate proxy, compromised WiFi, or MITM on shared network) could intercept HTTPS traffic using a custom CA certificate installed on the device. This is especially relevant since the app collects GPS coordinates and personal farm data.

**Recommended Fix:**  
Implement certificate pinning using `react-native-ssl-pinning` or OkHttp pinning in the Android build. For iOS, configure `NSAppTransportSecurity` with a specific `NSExceptionDomain` + `NSPinnedDomains`. At minimum, enforce that production builds use HTTPS (see FINDING-006).

---

### FINDING-016: Placeholder User Object Restored from Keychain May Cause Unexpected Behavior

- **Severity:** Low
- **OWASP Category:** A07 – Identification and Authentication Failures
- **File:** `mobile/src/hooks/useAuth.ts` — lines 79–83

**Description:**  
When restoring a session token from Keychain on app boot, an empty placeholder user object is injected into Redux state:

```typescript
// useAuth.ts — lines 79–83
dispatch(setCredentials({
  token: credentials.password,
  user: { id: '', email: '' },  // placeholder — empty strings
}));
```

Any component that reads `user.id` or `user.email` from Redux during the brief window between token restore and profile data load will receive empty strings rather than `null`/`undefined`, potentially causing silent failures in conditional logic, analytics events, or access control checks that compare user IDs.

**Recommended Fix:**
```typescript
// Use null for the user placeholder to make the incomplete state explicit
dispatch(setCredentials({
  token: credentials.password,
  user: null,  // explicitly null; AuthState.user should be User | null
}));
```
Update `AuthState.user` type to `User | null` and add null-guards in consuming components.

---

### FINDING-017: Unauthenticated Crops Endpoint Enables Full Data Enumeration

- **Severity:** Low (Informational)
- **OWASP Category:** A01 – Broken Access Control
- **File:** `backend/src/routes/crops.routes.ts` — line 11

**Description:**  
`GET /api/v1/crops` is a public, unauthenticated endpoint with pagination up to 100 rows per request. While crop reference data is non-sensitive, any unauthenticated client can fully enumerate the entire crops database with sequential offset requests. The global rate limiter (100 req/min) provides minimal protection.

**Recommended Fix:**  
If crop data is only needed by authenticated app users, add `authenticateJWT` middleware to the crops route. If the public endpoint is intentional (e.g., for onboarding preview), add a lower dedicated rate limit (e.g., 30 req/min per IP for unauthenticated paths).

---

## Dependency Vulnerabilities Summary

| Package | Severity | CVE / Advisory | Project |
|---------|----------|----------------|---------|
| `ip` (via `@react-native-community/cli`) | High | GHSA-2p57-rm9w-gvfp — SSRF improper categorization | Mobile |

**Backend:** 0 vulnerabilities found (`npm audit` clean).  
**Mobile:** 5 high-severity vulnerabilities (all in `ip` transitive dependency chain).

---

## OWASP Top 10 Compliance Checklist

| # | OWASP Category | Status | Related Findings |
|---|---------------|--------|-----------------|
| A01 | Broken Access Control | ✅ Mostly OK | FINDING-017 (Low) |
| A02 | Cryptographic Failures | ❌ Issues Found | FINDING-001, 005, 006, 014, 015 |
| A03 | Injection | ✅ OK (ORM used, parameterized queries) | FINDING-009 (body size) |
| A04 | Insecure Design | ⚠️ Partial | FINDING-003, 004, 012 |
| A05 | Security Misconfiguration | ❌ Issues Found | FINDING-001, 002, 011, 013 |
| A06 | Vulnerable Components | ❌ Issues Found | FINDING-007 |
| A07 | Auth Failures | ❌ Issues Found | FINDING-003, 004, 010, 012, 016 |
| A08 | Software Integrity | ✅ OK | — |
| A09 | Logging & Monitoring | ⚠️ Partial | FINDING-013 |
| A10 | SSRF | ✅ OK (Open-Meteo URL is hardcoded, not user-controlled) | — |

---

## Security Positives (What's Done Well)

The following security controls are correctly implemented and should be preserved:

| ✅ Control | Location |
|-----------|---------|
| Passwords hashed with bcrypt, cost factor 12 | `auth.controller.ts:34` |
| All protected routes require JWT via `authenticateJWT` middleware | `profile.routes.ts`, `weather.routes.ts` |
| Joi input validation with `stripUnknown: true` on all request bodies | `validate.middleware.ts:19` |
| Helmet security headers applied globally | `app.ts:18` |
| CORS restricted to a specific origin (not `*`) | `app.ts:23` |
| Soft-delete pattern prevents data loss from accidental deletions | `profile.repository.ts:134` |
| ORM (Objection.js/Knex) with parameterized queries — prevents SQL injection | `crops.repository.ts`, `profile.repository.ts` |
| JWT tokens stored in iOS Keychain / Android Keystore via `react-native-keychain` | `useAuth.ts:26` |
| `android:allowBackup="false"` prevents backup extraction | `AndroidManifest.xml:10` |
| Stack traces hidden in production error responses | `error.middleware.ts:53–62` |
| Generic "Invalid email or password" message prevents user enumeration on login | `auth.controller.ts:86, 91` |
| Bcrypt timing-safe comparison prevents timing attacks | `auth.controller.ts:89` |

---

## Recommended Fix Priority

| Priority | Finding | Effort | Impact |
|----------|---------|--------|--------|
| 🔴 P0 — Immediate | FINDING-001: Weak JWT/DB secret defaults | Low | Critical |
| 🔴 P0 — Immediate | FINDING-002: Docker credentials + exposed port | Low | Critical |
| 🟠 P1 — Before Production | FINDING-003: No auth brute-force protection | Medium | High |
| 🟠 P1 — Before Production | FINDING-004: No JWT logout invalidation | High | High |
| 🟠 P1 — Before Production | FINDING-006: HTTP hardcoded API URL in mobile | Low | High |
| 🟠 P1 — Before Production | FINDING-007: `ip` package CVE (npm audit) | Low | High |
| 🟠 P1 — Before Production | FINDING-005: JWT algorithm not pinned | Low | High |
| 🟡 P2 — Sprint Backlog | FINDING-008: Weak password complexity | Low | Medium |
| 🟡 P2 — Sprint Backlog | FINDING-009: Oversized body limit + saved_data | Low | Medium |
| 🟡 P2 — Sprint Backlog | FINDING-010: No 401 handling / token expiry | Medium | Medium |
| 🟡 P2 — Sprint Backlog | FINDING-012: No email verification | High | Medium |
| 🟡 P2 — Sprint Backlog | FINDING-013: Debug log level default | Low | Medium |
| 🟡 P2 — Sprint Backlog | FINDING-011: Version in health endpoint | Low | Medium |
| 🔵 P3 — Tech Debt | FINDING-014: Android release cleartext manifest | Low | Low |
| 🔵 P3 — Tech Debt | FINDING-015: No certificate pinning | High | Low |
| 🔵 P3 — Tech Debt | FINDING-016: Placeholder user in Keychain restore | Low | Low |
| 🔵 P3 — Tech Debt | FINDING-017: Unauthenticated crops endpoint | Low | Low |

---

*This report was generated by static analysis only. Dynamic/runtime testing (penetration testing, fuzzing) is recommended before production launch.*
