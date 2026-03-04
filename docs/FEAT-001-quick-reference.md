# FEAT-001: Quick Reference Guide for Developers

**Feature**: Farmer Onboarding & Profile Creation  
**Status**: Ready for Implementation  
**Tech Stack**: React Native + Node.js/Express + PostgreSQL

---

## 📋 At a Glance

### What We're Building
A 5-step mobile onboarding wizard where farmers create their profile:
1. Personal Info (name, phone)
2. Farm Size (hectares/acres with conversion)
3. Crop Selection (1-5 crops, searchable, custom crops)
4. Location (GPS or manual entry)
5. Experience Level (beginner → expert)

### Key Technologies
- **Mobile**: React Native, Redux Toolkit, React Navigation, React Hook Form
- **Backend**: Node.js, Express, TypeScript, Objection.js
- **Database**: PostgreSQL 16 + PostGIS
- **Auth**: JWT (from FEAT-009)
- **Storage**: Keychain (tokens), AsyncStorage (cache)

---

## 🗂️ File Structure

### Mobile App (`/mobile`)
```
src/
├── features/onboarding/
│   ├── screens/
│   │   ├── WelcomeScreen.tsx
│   │   ├── PersonalInfoScreen.tsx       # Step 1
│   │   ├── FarmSizeScreen.tsx           # Step 2
│   │   ├── CropSelectionScreen.tsx      # Step 3
│   │   ├── LocationScreen.tsx           # Step 4
│   │   ├── ExperienceScreen.tsx         # Step 5
│   │   └── ReviewScreen.tsx
│   ├── components/
│   │   ├── ProgressIndicator.tsx        # Shows "Step 3 of 5"
│   │   ├── StepNavigation.tsx           # Back/Next buttons
│   │   └── CropSelector.tsx             # Searchable crop dropdown
│   ├── services/
│   │   └── profileApi.ts                # RTK Query API definitions
│   └── onboardingSlice.ts               # Redux state
```

### Backend API (`/backend`)
```
src/
├── routes/
│   ├── profile.routes.ts                # Profile CRUD
│   ├── crops.routes.ts                  # Crops list
│   └── onboarding.routes.ts             # Progress save/load
├── controllers/
│   ├── profile.controller.ts            # POST/GET/PUT/PATCH/DELETE
│   ├── crops.controller.ts              # GET /crops?search=...
│   └── onboarding.controller.ts         # Progress endpoints
├── services/
│   ├── profile.service.ts               # Business logic
│   └── validation.service.ts            # Validation rules
├── repositories/
│   ├── profile.repository.ts            # DB queries
│   └── crops.repository.ts              # Crop queries
├── models/
│   ├── FarmProfile.model.ts             # Objection.js model
│   ├── FarmCrop.model.ts
│   └── OnboardingProgress.model.ts
└── validators/
    └── profile.validator.ts             # Joi schemas
```

---

## 🔌 API Endpoints (All `/api/v1`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/profile` | ✅ | Create farm profile |
| GET | `/profile` | ✅ | Get farm profile |
| PUT | `/profile` | ✅ | Update profile (full) |
| PATCH | `/profile` | ✅ | Update profile (partial) |
| DELETE | `/profile` | ✅ | Delete profile (soft) |
| GET | `/crops?search=wheat` | ❌ | Get crops list (public) |
| GET | `/profile/progress` | ✅ | Get onboarding progress |
| POST | `/profile/progress` | ✅ | Save onboarding progress |

---

## 🗄️ Database Tables

### 1. `farm_profiles`
Main table for farmer profiles (1:1 with users)

```sql
Key Fields:
- id (UUID, PK)
- user_id (UUID, FK → users, UNIQUE)
- first_name, last_name, phone_number
- farm_size, farm_size_unit ('hectares'|'acres')
- farm_size_hectares (COMPUTED)                  ← Auto-calculated!
- location_type ('gps'|'manual')
- latitude, longitude
- country, state, district, village, address
- experience_level ('beginner'|'intermediate'|'experienced'|'expert')
- years_of_experience
- completeness (0-100)                           ← Profile completeness %
- created_at, updated_at, deleted_at
```

### 2. `farm_crops`
Junction table for profile ↔ crops (many-to-many)

```sql
Key Fields:
- id (UUID, PK)
- farm_profile_id (UUID, FK → farm_profiles)
- crop_id (UUID, FK → crops, nullable)
- crop_name (VARCHAR, redundant for custom crops)
- is_custom (BOOLEAN)                            ← TRUE for custom crops
- created_at
```

### 3. `crops`
Master data for predefined crops

```sql
Key Fields:
- id (UUID, PK)
- name (VARCHAR, UNIQUE)                         ← e.g., "Wheat"
- scientific_name                                ← e.g., "Triticum aestivum"
- category                                       ← e.g., "Cereal"
- common_regions (TEXT[])                        ← e.g., ["Asia", "Europe"]
```

### 4. `onboarding_progress`
Temporary storage for incomplete onboarding

```sql
Key Fields:
- id (UUID, PK)
- user_id (UUID, FK → users, UNIQUE)
- current_step (1-5)
- saved_data (JSONB)                             ← Partial profile data
- created_at, updated_at
```

---

## 🔐 Authentication

### How It Works
1. User logs in (FEAT-009) → Receives JWT token
2. Mobile app stores token in **Keychain** (iOS) / **Keystore** (Android)
3. All API requests include: `Authorization: Bearer <token>`
4. Backend validates token → Extracts `userId` → Processes request

### Middleware (Backend)
```typescript
// auth.middleware.ts
async function authenticateJWT(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.sub, email: decoded.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

### Token Storage (Mobile)
```typescript
// Store token
await Keychain.setGenericPassword('jwt', accessToken, {
  service: 'agri-ai-auth',
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED
});

// Retrieve token
const credentials = await Keychain.getGenericPassword();
const token = credentials.password;
```

---

## 📊 Data Flow: Onboarding

```
┌────────────────────────────────────────────────────────────┐
│                    ONBOARDING FLOW                         │
└────────────────────────────────────────────────────────────┘

Step 1: Personal Info
  User enters name → Redux state → Auto-save to server
  POST /api/v1/profile/progress { currentStep: 1, savedData: {...} }
          ↓
Step 2: Farm Size
  User enters size & unit → Real-time conversion shown
  POST /api/v1/profile/progress { currentStep: 2, savedData: {...} }
          ↓
Step 3: Crop Selection
  GET /api/v1/crops?search=... → User selects 1-5 crops
  POST /api/v1/profile/progress { currentStep: 3, savedData: {...} }
          ↓
Step 4: Location
  User taps "Use GPS" → Request permission → Get coordinates
  OR User taps "Enter Manually" → Cascading dropdowns
  POST /api/v1/profile/progress { currentStep: 4, savedData: {...} }
          ↓
Step 5: Experience
  User selects level → POST progress
          ↓
Review Screen
  User sees all data → Taps "Submit"
          ↓
POST /api/v1/profile
  ├─► Validate all fields (server-side)
  ├─► BEGIN TRANSACTION
  │     ├─► INSERT INTO farm_profiles
  │     ├─► INSERT INTO farm_crops (for each crop)
  │     └─► DELETE FROM onboarding_progress
  ├─► COMMIT
  └─► Calculate completeness (% of optional fields filled)
          ↓
Success Response
  { profileId, completeness, createdAt, ... }
          ↓
Mobile: Show success message → Auto-redirect to dashboard
```

---

## ✅ Validation Rules

### Farm Size
- Type: Number
- Range: 0.01 to 100,000
- Decimals: Max 2 (e.g., 5.25 ✅, 5.12345 ❌)
- Unit: 'hectares' or 'acres'

### Crops
- Minimum: 1 crop
- Maximum: 5 crops
- Custom crops allowed (marked with `isCustom: true`)

### Location (GPS)
- Latitude: -90 to 90
- Longitude: -180 to 180
- Timeout: 10 seconds (fallback to manual)

### Location (Manual)
- Country: Required (2-100 chars)
- State: Required (2-100 chars)
- District: Required (2-100 chars)
- Village: Optional (2-100 chars)

### Name
- Pattern: `^[a-zA-Z\u00C0-\u017F'\- ]+$`
- Accepts: Unicode, apostrophes, hyphens, spaces
- Rejects: Numbers, emojis, special symbols

### Phone Number
- Format: E.164 (e.g., `+919876543210`)
- Pattern: `^\+[1-9]\d{1,14}$`

---

## 🛠️ Common Tasks

### Task 1: Add New Crop to Master List

```sql
-- Backend: Seed script or migration
INSERT INTO crops (name, scientific_name, category, common_regions)
VALUES (
  'Quinoa',
  'Chenopodium quinoa',
  'Grain',
  ARRAY['South America', 'Asia']
);
```

### Task 2: Calculate Profile Completeness

```typescript
// service/profile.service.ts
function calculateCompleteness(profile: FarmProfile): number {
  const totalFields = 10; // Total optional fields
  let filledFields = 5;   // Required fields always filled
  
  if (profile.phoneNumber) filledFields++;
  if (profile.village) filledFields++;
  if (profile.address) filledFields++;
  if (profile.yearsOfExperience) filledFields++;
  if (profile.latitude && profile.longitude) filledFields++;
  
  return Math.round((filledFields / totalFields) * 100);
}
```

### Task 3: Convert Farm Size to Hectares

```typescript
// utils/conversion.ts
function toHectares(size: number, unit: 'hectares' | 'acres'): number {
  if (unit === 'hectares') return size;
  if (unit === 'acres') return size * 0.404686; // 1 acre = 0.404686 hectares
}

// Example:
toHectares(5, 'acres')    // → 2.02343 hectares
toHectares(5, 'hectares') // → 5 hectares
```

### Task 4: Search Crops

```typescript
// repository/crops.repository.ts
async function searchCrops(query: string, limit = 50, offset = 0) {
  return Crop.query()
    .where('name', 'ilike', `%${query}%`)  // Case-insensitive partial match
    .orderBy('name', 'asc')
    .limit(limit)
    .offset(offset);
}

// Example:
await searchCrops('wheat')  // → ["Wheat", "Durum Wheat"]
```

### Task 5: Save Onboarding Progress

```typescript
// service/onboarding.service.ts
async function saveProgress(userId: string, step: number, data: any) {
  return OnboardingProgress.query()
    .insert({
      userId,
      currentStep: step,
      totalSteps: 5,
      savedData: data
    })
    .onConflict('user_id')  // If exists, update instead of insert
    .merge(['currentStep', 'savedData', 'updatedAt']);
}
```

---

## 🧪 Testing Checklist

### Unit Tests (Backend)
- [ ] Validation schemas (Joi)
- [ ] Service layer (business logic)
- [ ] Repository layer (DB queries)
- [ ] Conversion utilities (acres ↔ hectares)
- [ ] Completeness calculation

### Integration Tests (Backend)
- [ ] POST /profile (success, validation errors, conflict)
- [ ] GET /profile (success, not found, unauthorized)
- [ ] PUT /profile (success, not found)
- [ ] PATCH /profile (success, partial update)
- [ ] DELETE /profile (success, not found)
- [ ] GET /crops (success, search filter, pagination)
- [ ] GET /profile/progress (incomplete, complete)
- [ ] POST /profile/progress (save, overwrite)

### Component Tests (Mobile)
- [ ] PersonalInfoScreen (form validation)
- [ ] FarmSizeScreen (conversion display)
- [ ] CropSelectionScreen (search, selection)
- [ ] LocationScreen (GPS permission, manual entry)
- [ ] ExperienceScreen (radio selection)
- [ ] ReviewScreen (display all data)

### E2E Tests (Optional - Detox)
- [ ] Complete onboarding flow (happy path)
- [ ] Exit and resume onboarding
- [ ] Edit profile after creation

---

## 🐛 Common Issues & Solutions

### Issue: JWT Token Expired During Onboarding
**Symptom**: 401 Unauthorized error during profile submission  
**Solution**: Implement token refresh logic (FEAT-009) or save progress before token expires

### Issue: GPS Timeout on Android
**Symptom**: Location never resolves, hangs forever  
**Solution**: Set timeout to 10s, fallback to manual entry
```typescript
getCurrentPosition({ timeout: 10000 })
  .catch(() => showManualEntry())
```

### Issue: Farm Size Conversion Rounding Errors
**Symptom**: 5.5 acres → 2.0234686 hectares (too many decimals)  
**Solution**: Round to 2 decimal places
```typescript
Math.round(hectares * 100) / 100  // → 2.02
```

### Issue: Profile Already Exists (409 Conflict)
**Symptom**: User tries to create profile, but already has one  
**Solution**: Check for existing profile before showing onboarding
```typescript
const profile = await getProfile(userId);
if (profile) {
  navigate('Dashboard');
} else {
  navigate('Onboarding');
}
```

### Issue: Crop Search Too Slow
**Symptom**: Lag when typing in crop search  
**Solution**: Debounce input (300ms delay)
```typescript
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 300);

useEffect(() => {
  if (debouncedSearch) {
    fetchCrops(debouncedSearch);
  }
}, [debouncedSearch]);
```

---

## 📚 Related Documents

- **Requirement Spec**: `/docs/requirement-specs/FEAT-001-spec.md`
- **OpenAPI Spec**: `/docs/api-specs/FEAT-001-openapi.yaml`
- **Architecture Doc**: `/docs/architecture.md`
- **ADR Summary**: `/docs/FEAT-001-architecture-decisions.md`
- **Backlog**: `/docs/backlog.md`

---

## 🚀 Ready to Start?

1. **Backend First**: Set up database, models, repositories, services, controllers
2. **Test API**: Use Postman/Insomnia to test all endpoints
3. **Mobile UI**: Build screens, navigation, form handling
4. **Integration**: Connect mobile app to API (RTK Query)
5. **Testing**: Unit, integration, E2E
6. **Deploy**: Push to staging → QA → production

**Estimated Time**: 3-4 weeks (1 developer)

---

**Questions?** Check the full architecture document or ask the Solution Architect agent.
