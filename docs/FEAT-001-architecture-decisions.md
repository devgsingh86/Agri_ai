# FEAT-001: Farmer Onboarding & Profile Creation - Architecture Decisions Summary

**Feature ID**: FEAT-001  
**Document Version**: 1.0.0  
**Date**: 2024-03-02  
**Architect**: Solution Architect Agent  
**Status**: ✅ Ready for Implementation

---

## Quick Reference

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| API Architecture | RESTful (OpenAPI 3.0) | Simplicity, tooling, caching, mobile compatibility |
| Database | PostgreSQL 16 + PostGIS | ACID compliance, geospatial support, data integrity |
| Token Storage | Keychain/Keystore | Hardware-backed encryption, security best practice |
| Onboarding State | Server-side (JSONB) | Cross-device, data integrity, cleanup after completion |
| GPS Handling | Hybrid (GPS + Manual) | Accuracy with fallback, user control, reliability |
| Crop Selection | Many-to-many (junction table) | Flexibility, query efficiency, extensibility |
| Field Editing | All fields editable | User control, error correction, simplicity for MVP |
| Deployment | Docker (local) + Azure (prod) | Fast iteration locally, managed services in production |

---

## ADR-001: RESTful API vs GraphQL

### Decision
Use **RESTful API** with OpenAPI 3.0 specification

### Context
Need to choose API architecture for mobile app ↔ backend communication.

### Options Considered
1. ✅ **RESTful API** - Traditional, resource-oriented
2. ❌ **GraphQL** - Query language for APIs
3. ❌ **gRPC** - High-performance RPC framework

### Rationale

**Why RESTful?**
- Simple, well-understood by team
- Excellent tooling (Swagger, Postman)
- Standard HTTP caching
- React Native has mature REST clients (Axios, RTK Query)
- Resource-oriented model fits our domain (profiles, crops)

**Why not GraphQL?**
- Learning curve for team
- Overkill for simple, focused data model
- Additional tooling and complexity
- Caching is more complex

**Why not gRPC?**
- Designed for server-to-server communication
- Limited mobile client support
- Binary protocol harder to debug
- Not RESTful (no standard HTTP methods)

### Consequences

**Positive**:
- Fast development with familiar patterns
- Auto-generated API documentation (Swagger UI)
- Easy to test (curl, Postman)
- Can add GraphQL later if needed

**Negative**:
- Multiple endpoints for different resources
- Potential over-fetching (fetch entire profile even if need one field)
- Versioning strategy needed for breaking changes

### Implementation
- OpenAPI 3.0 spec: `/docs/api-specs/FEAT-001-openapi.yaml`
- Swagger UI at `/api-docs` (development)
- 7 endpoints for FEAT-001 (profile CRUD, crops, onboarding progress)

---

## ADR-002: PostgreSQL vs MongoDB

### Decision
Use **PostgreSQL 16** with **PostGIS** extension

### Context
Need to store structured farm profile data with geospatial coordinates.

### Options Considered
1. ✅ **PostgreSQL** - Relational, ACID-compliant
2. ❌ **MongoDB** - Document-oriented, schema-flexible
3. ❌ **MySQL** - Relational, popular alternative

### Rationale

**Why PostgreSQL?**
- **ACID Compliance**: Critical for financial/agricultural data integrity
- **Relational Model**: Clear relationships (user ↔ profile ↔ crops)
- **PostGIS**: Industry-standard geospatial extension (GPS coordinates)
- **Data Integrity**: Foreign keys, check constraints, unique constraints
- **JSONB Support**: Flexible schema for `onboarding_progress.saved_data`
- **Computed Columns**: Auto-calculate `farm_size_hectares` (stored)
- **Mature Ecosystem**: Knex.js, Objection.js, excellent tooling

**Why not MongoDB?**
- We have a stable, relational schema (not rapidly changing)
- Need ACID transactions (profile + crops inserted together)
- Geospatial queries more mature in PostGIS
- Foreign key constraints critical for data integrity

**Why not MySQL?**
- PostGIS support better in PostgreSQL
- JSONB type more powerful than JSON in MySQL
- Generated columns syntax simpler in PostgreSQL

### Consequences

**Positive**:
- Strong data integrity
- Efficient geospatial queries
- Can query "all wheat farmers in Punjab" efficiently
- Audit trail via timestamps

**Negative**:
- Schema migrations required for changes
- Vertical scaling initially (can add read replicas later)
- ORM needed for complex queries

### Implementation
- Database: PostgreSQL 16 (Docker for local, Azure for production)
- Extensions: PostGIS (geospatial), uuid-ossp (UUID generation)
- ORM: Objection.js (built on Knex.js)
- Migrations: Knex migrations in `/migrations`

---

## ADR-003: JWT Storage Strategy (Mobile)

### Decision
Use **React Native Keychain** for JWT tokens, **AsyncStorage** for non-sensitive data

### Context
JWT access tokens must be stored securely on mobile devices.

### Options Considered
1. ✅ **Keychain/Keystore** (via react-native-keychain)
2. ❌ **AsyncStorage** - Unencrypted key-value storage
3. ❌ **Secure Storage** (react-native-sensitive-info) - Similar but less maintained

### Rationale

**Why Keychain/Keystore?**
- **Hardware-Backed Encryption**: Uses iOS Keychain and Android Keystore APIs
- **Industry Standard**: Best practice for sensitive tokens
- **Biometric Protection**: Can add Touch ID / Face ID later
- **Tamper-Resistant**: Protected even if device is jailbroken/rooted
- **Per-App Sandboxing**: Isolated from other apps

**Why not AsyncStorage?**
- Unencrypted (stored as plaintext)
- Vulnerable if device is compromised
- Not suitable for sensitive data (JWT tokens)
- Only acceptable for preferences, cache

### Data Storage Matrix

| Data Type | Storage | Reason |
|-----------|---------|--------|
| JWT Access Token | Keychain/Keystore | Most sensitive, encrypted |
| Refresh Token | Keychain/Keystore | Highest sensitivity |
| User Preferences (theme, language) | AsyncStorage | Non-sensitive, fast access |
| Onboarding Cache (temporary) | AsyncStorage | Temporary, can be cleared |
| API Response Cache | AsyncStorage | Non-sensitive, can rebuild |

### Consequences

**Positive**:
- Excellent security posture
- Compliant with OWASP Mobile Security standards
- Can pass security audits

**Negative**:
- More complex than AsyncStorage
- Requires native module (react-native-keychain)
- Slightly slower than AsyncStorage (negligible)

### Implementation
```typescript
// Store token
await Keychain.setGenericPassword('jwt', accessToken, {
  service: 'agri-ai-auth',
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED
});

// Retrieve token
const credentials = await Keychain.getGenericPassword({
  service: 'agri-ai-auth'
});
const token = credentials.password;
```

---

## ADR-004: Onboarding Progress Persistence

### Decision
Store onboarding progress **server-side** in `onboarding_progress` table (JSONB column)

### Context
Users should be able to exit the 5-step onboarding wizard and resume later without losing data.

### Options Considered
1. ✅ **Server-Side (Database)** - JSONB column
2. ❌ **Client-Side Only (AsyncStorage)** - Local storage
3. ❌ **Draft Profile** - Incomplete profile in `farm_profiles` table

### Rationale

**Why Server-Side?**
- **Cross-Device**: User can continue on different device (phone → tablet)
- **Data Integrity**: Server validates before storing
- **JSONB Flexibility**: Schema-less storage for partial data
- **Automatic Cleanup**: Progress deleted after profile creation
- **Analytics**: Track abandonment rates, most-skipped steps

**Why not Client-Side Only?**
- Data lost if user logs out
- Data lost if user reinstalls app
- Can't resume on different device
- No server-side analytics

**Why not Draft Profile?**
- Complex to manage (incomplete profile vs complete)
- Profile validation would need to be optional
- Harder to query "completed profiles only"

### Schema Design
```sql
CREATE TABLE onboarding_progress (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,
  current_step INTEGER DEFAULT 1,      -- Which step user is on
  total_steps INTEGER DEFAULT 5,        -- Total steps in wizard
  saved_data JSONB,                     -- Partial profile data
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Consequences

**Positive**:
- Excellent user experience (can exit anytime)
- Cross-device support
- Analytics on onboarding funnel

**Negative**:
- Network required to save progress (offline mode future enhancement)
- Database storage used for incomplete profiles (cleaned up on completion)
- API calls: `POST /api/v1/profile/progress`

### Implementation Flow
1. User starts onboarding → Check for existing progress
2. User exits at Step 3 → `POST /api/v1/profile/progress` (save current step + data)
3. User logs in later → `GET /api/v1/profile/progress` (resume from Step 3)
4. User completes onboarding → `POST /api/v1/profile` (create profile, delete progress)

---

## ADR-005: GPS Location Handling

### Decision
**Hybrid approach**: GPS with manual entry fallback

### Context
Need to capture farm location, but GPS may fail, be denied, or unavailable.

### Options Considered
1. ✅ **Hybrid (GPS + Manual)** - Best of both worlds
2. ❌ **GPS Only** - Would block users
3. ❌ **Manual Only** - Less accurate

### Rationale

**Why Hybrid?**
- **Accuracy**: GPS provides precise coordinates (±10m)
- **Reliability**: Manual entry as fallback (no user blocked)
- **User Control**: Respects privacy (user chooses)
- **Same Data Structure**: Both methods populate same fields
- **Analytics**: `locationType` field tracks method used

**Flow**:
```
[Location Screen]
    │
    ├─► "Use Current Location" (GPS)
    │       ├─ Request permission
    │       ├─ Fetch coordinates (timeout: 10s)
    │       ├─ Reverse geocode to address
    │       └─ Success → Store with locationType='gps'
    │
    └─► "Enter Manually"
            ├─ Cascading dropdowns (Country → State → District)
            ├─ Optional: Village/Town
            └─ Success → Store with locationType='manual'
```

### Consequences

**Positive**:
- No user is blocked
- Accurate coordinates for AI recommendations
- Respects user privacy (explicit permission)

**Negative**:
- Two UI flows to implement
- Permission handling complexity
- Geocoding API calls (future: Google Maps API)

### Implementation
```typescript
async function captureLocation() {
  try {
    const granted = await requestLocationPermission();
    if (!granted) throw new Error('Permission denied');
    
    const coords = await getCurrentPosition({ 
      timeout: 10000, 
      accuracy: 'high' 
    });
    
    const address = await reverseGeocode(coords); // Future: Google Maps API
    
    return {
      locationType: 'gps',
      latitude: coords.latitude,
      longitude: coords.longitude,
      ...address
    };
  } catch (error) {
    // Fallback to manual entry
    showManualEntryForm();
  }
}
```

---

## ADR-006: Multi-Crop Selection Implementation

### Decision
Use **many-to-many relationship** with `farm_crops` junction table

### Context
Users can select 1-5 primary crops. Need to support predefined crops + custom crops.

### Options Considered
1. ✅ **Many-to-Many (Junction Table)** - Normalized
2. ❌ **JSONB Array** - Denormalized
3. ❌ **Comma-Separated String** - Anti-pattern

### Rationale

**Why Many-to-Many?**
- **Data Normalization**: Crop master data separate from user selections
- **Query Efficiency**: Can query "all users growing wheat" efficiently
- **Extensibility**: Can add crop metadata later (season, yield, price)
- **Data Integrity**: Foreign key constraints
- **Custom Crops**: `crop_id` nullable, `is_custom` flag distinguishes

**Schema**:
```sql
-- Crop master data
crops (
  id UUID PRIMARY KEY,
  name VARCHAR(100) UNIQUE,
  scientific_name VARCHAR(200),
  category VARCHAR(50),
  common_regions TEXT[]
)

-- Junction table
farm_crops (
  id UUID PRIMARY KEY,
  farm_profile_id UUID,        -- FK to farm_profiles
  crop_id UUID,                 -- FK to crops (NULL if custom)
  crop_name VARCHAR(100),       -- Redundant for custom crops
  is_custom BOOLEAN DEFAULT FALSE
)
```

**Why not JSONB Array?**
```sql
-- Would look like this (not chosen)
farm_profiles (
  ...
  primary_crops JSONB  -- e.g., [{"cropId": "...", "cropName": "Wheat"}]
)
```
- Can't query "all wheat farmers" efficiently
- No foreign key constraints
- Harder to add crop metadata
- Less normalized

### Consequences

**Positive**:
- Efficient queries: "Find all farmers growing wheat in Punjab"
- Can add crop-specific data later (yield, season, market price)
- Maintains data integrity

**Negative**:
- Requires JOIN to fetch profile with crops
- Slightly more complex queries
- Crop deletion needs `ON DELETE SET NULL`

### Implementation
```typescript
// Fetching profile with crops (Objection.js)
const profile = await FarmProfile.query()
  .findById(profileId)
  .withGraphFetched('crops'); // Eager load crops

// Result:
{
  profileId: "...",
  farmDetails: { ... },
  crops: [
    { id: "...", cropId: "...", cropName: "Wheat", isCustom: false },
    { id: "...", cropId: null, cropName: "Organic Tomatoes", isCustom: true }
  ]
}
```

---

## ADR-007: Profile Editing Constraints

### Decision
**All fields editable**, no restrictions (for MVP)

### Context
Should users be able to edit all profile fields after creation? Or should some fields be immutable?

### Options Considered
1. ✅ **All Editable** - Maximum flexibility
2. ❌ **Immutable Fields** - Lock critical fields (location, farm size)
3. ❌ **Approval Workflow** - Admin approval for changes

### Rationale

**Why All Editable?**
- **User Control**: Users own their data
- **Error Correction**: Users can fix mistakes
- **Flexibility**: Farming details change (new crops, expanded farm, moved)
- **Simplicity**: No complex rules for MVP
- **Audit Trail**: `updated_at` timestamp tracks changes

**Future Considerations**:
- May add verification for location changes (detect fraud)
- May add change history table for audit
- May require re-verification after major changes

### Consequences

**Positive**:
- Excellent user experience
- Simple to implement
- No support tickets for "unlock my field"

**Negative**:
- Potential for abuse (change location to get different recommendations)
- No protection against accidental changes
- May need to add restrictions later

### Implementation
- `PUT /api/v1/profile`: Full replacement (all fields required)
- `PATCH /api/v1/profile`: Partial update (only changed fields)
- `updated_at` timestamp automatically updated
- Future: Add `profile_change_history` table

---

## ADR-008: Deployment Strategy (Local vs Production)

### Decision
**Docker Compose** for local development, **Azure App Service** for production

### Context
Need different setups for local development (fast iteration) and production (scalable, managed).

### Local Development

**Backend**:
- Run directly: `npm run dev` (nodemon for hot reload)
- No Docker for Node.js (faster iteration)
- Connect to PostgreSQL in Docker

**Database**:
- Docker Compose: PostgreSQL 16 + PostGIS
- Volume mount for persistence
- Init script: `/scripts/init-db.sql`

**Mobile**:
- Metro bundler
- Connect to `http://localhost:3000` (API)
- iOS Simulator / Android Emulator

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgis/postgis:16-3.4
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: agri_ai_dev
      POSTGRES_USER: agri_dev
      POSTGRES_PASSWORD: dev_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### Production

**Backend**:
- Azure App Service (Linux, Node.js 20)
- Auto-scaling: 2-10 instances
- Health check: `GET /api/health`
- Environment variables from Azure Key Vault

**Database**:
- Azure Database for PostgreSQL (Flexible Server)
- Tier: General Purpose (2 vCores, 32 GB storage)
- Automated backups (7-day retention)
- Geo-redundant backup enabled

**Mobile**:
- iOS: App Store Connect
- Android: Google Play Console
- Connect to `https://api.agri-ai.com`

### Consequences

**Positive**:
- Fast local development (hot reload)
- Production uses managed services (less ops overhead)
- Same PostgreSQL version locally and in production
- Can test production config locally (Docker everything)

**Negative**:
- Environment variables differ (`.env` vs Key Vault)
- CORS settings differ (open locally, restricted in prod)
- SSL/TLS only in production

### Environment Variables

| Variable | Local | Production |
|----------|-------|------------|
| `DATABASE_URL` | `localhost:5432/agri_ai_dev` | Azure connection string (from Key Vault) |
| `JWT_SECRET` | `dev-secret-key` | Strong secret (from Key Vault) |
| `NODE_ENV` | `development` | `production` |
| `PORT` | `3000` | `8080` |
| `CORS_ORIGIN` | `*` | Mobile app origins only |
| `RATE_LIMIT` | Disabled | `100 req/min` |

---

## Implementation Checklist for Developer Agent

### Phase 1: Database Setup
- [ ] Create Knex migrations for all tables (users, farm_profiles, crops, farm_crops, onboarding_progress)
- [ ] Seed crops table with 30+ common crops
- [ ] Set up connection pooling (Knex config)
- [ ] Create Objection.js models with relationships

### Phase 2: Backend API (Node.js/Express)
- [ ] Set up Express app with TypeScript
- [ ] Implement middleware (auth, validation, error handling, rate limiting)
- [ ] Implement repositories (data access layer)
- [ ] Implement services (business logic layer)
- [ ] Implement controllers (route handlers)
- [ ] Set up Swagger UI (`/api-docs`)
- [ ] Write unit tests (Jest) - target 80% coverage
- [ ] Write integration tests (Supertest)

### Phase 3: Mobile App (React Native)
- [ ] Set up React Native project with TypeScript
- [ ] Configure Redux Toolkit + RTK Query
- [ ] Implement navigation (React Navigation)
- [ ] Create onboarding screens (5 steps + review)
- [ ] Implement form validation (React Hook Form + Yup)
- [ ] Implement GPS location capture (react-native-geolocation-service)
- [ ] Implement token storage (react-native-keychain)
- [ ] Create profile management screens
- [ ] Write component tests (React Native Testing Library)

### Phase 4: Integration & Testing
- [ ] End-to-end testing (Detox - optional)
- [ ] Manual QA on iOS simulator
- [ ] Manual QA on Android emulator
- [ ] Performance testing (load test API endpoints)
- [ ] Security audit (JWT validation, SQL injection prevention)

### Phase 5: Documentation
- [ ] README with setup instructions
- [ ] API documentation (Swagger UI)
- [ ] Mobile app architecture diagram
- [ ] Deployment guide (Azure setup)

---

## Success Criteria

**Backend API**:
- ✅ All 7 endpoints implemented and tested
- ✅ OpenAPI spec matches implementation
- ✅ Unit test coverage > 80%
- ✅ API response times meet targets (< 500ms)
- ✅ JWT authentication works correctly
- ✅ Input validation prevents invalid data

**Mobile App**:
- ✅ Onboarding flow is smooth (< 5 minutes to complete)
- ✅ Progress is saved and resumable
- ✅ GPS and manual location both work
- ✅ Crop search is fast (< 100ms)
- ✅ Profile editing works correctly
- ✅ Error messages are user-friendly
- ✅ Tokens are stored securely (Keychain/Keystore)

**Database**:
- ✅ Schema matches design
- ✅ Indexes improve query performance
- ✅ Foreign keys enforce data integrity
- ✅ Migrations run successfully

---

## Questions for Product Manager

1. **Crop List**: Do we want to support international crops initially, or focus on region-specific crops (e.g., India)?
2. **Geocoding API**: Should we integrate Google Maps API for reverse geocoding, or defer to later?
3. **Profile Photos**: Should we implement profile photo upload in FEAT-001, or defer to FEAT-002?
4. **Offline Mode**: Should onboarding work offline (sync later), or require internet connection?
5. **Location Verification**: Should we verify location changes to prevent fraud, or trust users?
6. **Change History**: Do we need a full audit trail of profile changes, or is `updated_at` sufficient?

---

## Approval

**Solution Architect**: ✅ Architecture approved  
**Ready for Development**: ✅ Yes  
**Estimated Effort**: 3-4 weeks (1 developer)  
**Risk Level**: Low (well-defined requirements, mature tech stack)

**Next Steps**:
1. Present architecture to team for feedback
2. Get Product Manager approval on open questions
3. Assign to Developer agent for implementation
4. Set up project board with tasks from checklist

---

**Document Status**: ✅ Complete  
**Last Updated**: 2024-03-02  
**Next Review**: After Developer implementation (code review phase)
