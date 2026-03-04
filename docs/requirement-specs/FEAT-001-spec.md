# Requirement Specification: FEAT-001 - Farmer Onboarding & Profile Creation

## Overview
- **Feature ID**: FEAT-001
- **Feature Title**: Farmer Onboarding & Profile Creation
- **Type**: Core Feature
- **Priority**: P0 (Critical - Foundation for personalized recommendations)
- **Deployment Scope**: Local Development → Production (Mobile App + Backend API)
- **DevOps Required**: Yes (Mobile app deployment to App Store/Play Store, Backend API to cloud)
- **User Story**: As a farmer, I want to create a profile with my farm details, so that the AI can give me personalized recommendations.
- **Platform**: React Native (iOS + Android) + Node.js/Express REST API
- **Database**: PostgreSQL

---

## Functional Requirements

### FR-001: User Registration & Account Creation
- **Description**: Allow new farmers to create an account before profile setup
- **Acceptance Criteria**:
  - [ ] User can register with email and password
  - [ ] Email validation is performed (format check)
  - [ ] Password meets minimum security requirements (8+ chars, 1 number, 1 special char)
  - [ ] Duplicate email registrations are prevented
  - [ ] Verification email is sent (optional for MVP, can be deferred)
  - [ ] User receives confirmation upon successful registration
- **Priority**: Must Have
- **Dependencies**: FEAT-009 (JWT Authentication System)
- **Local Testing**: Can be fully tested with local PostgreSQL database

### FR-002: Onboarding Wizard - Personal Information
- **Description**: Collect farmer's basic personal information
- **Acceptance Criteria**:
  - [ ] User enters full name (first name + last name)
  - [ ] Name fields accept Unicode characters (international names)
  - [ ] User can optionally upload profile photo (future enhancement)
  - [ ] User sees progress indicator (Step 1 of 5)
  - [ ] "Next" button is enabled only when required fields are filled
  - [ ] User can exit and resume onboarding later (progress saved)
- **Priority**: Must Have
- **Dependencies**: FR-001
- **Local Testing**: Fully testable locally

### FR-003: Onboarding Wizard - Farm Size Input
- **Description**: Capture farm size with flexible unit selection
- **Acceptance Criteria**:
  - [ ] User enters numeric farm size value
  - [ ] User selects unit: Hectares or Acres (default: Hectares)
  - [ ] Input validation: Positive numbers only, max 2 decimal places
  - [ ] Farm size range: 0.01 to 100,000 units
  - [ ] Real-time conversion shown (e.g., "2.5 acres = 1.01 hectares")
  - [ ] Progress indicator shows Step 2 of 5
  - [ ] "Back" button returns to Step 1 without data loss
- **Priority**: Must Have
- **Dependencies**: FR-002
- **Local Testing**: Fully testable locally

### FR-004: Onboarding Wizard - Crop Selection
- **Description**: Allow farmers to select their primary crops
- **Acceptance Criteria**:
  - [ ] User sees searchable dropdown of common crops
  - [ ] User can select 1-5 primary crops
  - [ ] Crop list includes: Wheat, Rice, Corn, Cotton, Soybeans, Sugarcane, etc. (minimum 30 crops)
  - [ ] User can type to filter crops (autocomplete)
  - [ ] User can add custom crop if not in list
  - [ ] Selected crops are displayed as chips/tags with remove option
  - [ ] At least 1 crop must be selected to proceed
  - [ ] Progress indicator shows Step 3 of 5
- **Priority**: Must Have
- **Dependencies**: FR-003
- **Local Testing**: Fully testable locally

### FR-005: Onboarding Wizard - Location Input
- **Description**: Capture farm location via GPS or manual entry
- **Acceptance Criteria**:
  - [ ] User sees two options: "Use Current Location" or "Enter Manually"
  - [ ] GPS option requests location permission (first time only)
  - [ ] GPS captures latitude, longitude, and resolves to address
  - [ ] Manual entry includes: Country, State/Province, District/County, Village/Town
  - [ ] Location validation: Coordinates within valid range (lat: -90 to 90, lon: -180 to 180)
  - [ ] Manual entry uses cascading dropdowns (Country → State → District)
  - [ ] Location can be edited after selection
  - [ ] Map preview shown for selected location (optional enhancement)
  - [ ] Progress indicator shows Step 4 of 5
- **Priority**: Must Have
- **Dependencies**: FR-004
- **Local Testing**: GPS can be simulated with mock coordinates
- **Production**: Requires location services

### FR-006: Onboarding Wizard - Farming Experience Level
- **Description**: Capture farmer's experience level for tailored recommendations
- **Acceptance Criteria**:
  - [ ] User selects from 4 experience levels:
    - Beginner (0-2 years)
    - Intermediate (3-5 years)
    - Experienced (6-10 years)
    - Expert (10+ years)
  - [ ] Selection is displayed as radio buttons or card selection UI
  - [ ] One selection is required to proceed
  - [ ] Progress indicator shows Step 5 of 5
  - [ ] "Review" or "Complete" button is shown
- **Priority**: Must Have
- **Dependencies**: FR-005
- **Local Testing**: Fully testable locally

### FR-007: Profile Review & Submission
- **Description**: Allow user to review all entered data before submission
- **Acceptance Criteria**:
  - [ ] User sees summary of all entered information
  - [ ] Each section has an "Edit" button to return to that step
  - [ ] "Submit" button creates the farm profile
  - [ ] Loading indicator shown during submission
  - [ ] Success message displayed upon profile creation
  - [ ] User is redirected to dashboard/home screen after 2 seconds
  - [ ] Profile creation timestamp is recorded
- **Priority**: Must Have
- **Dependencies**: FR-006
- **Local Testing**: Fully testable locally

### FR-008: Profile Data Persistence
- **Description**: Store farm profile data securely in PostgreSQL
- **Acceptance Criteria**:
  - [ ] All onboarding data is stored in database
  - [ ] Profile is linked to authenticated user (userId foreign key)
  - [ ] One user can have only one farm profile (1:1 relationship)
  - [ ] Profile data is encrypted at rest (production)
  - [ ] Profile completeness score is calculated (% of optional fields filled)
  - [ ] Created and updated timestamps are automatically managed
- **Priority**: Must Have
- **Dependencies**: FEAT-009 (Authentication)
- **Local Testing**: PostgreSQL in Docker
- **Production**: Azure Database for PostgreSQL

### FR-009: Profile Editing
- **Description**: Allow farmers to update their profile information post-onboarding
- **Acceptance Criteria**:
  - [ ] User can access profile from settings/menu
  - [ ] All profile fields are editable
  - [ ] Changes are validated before saving
  - [ ] "Save" button updates the profile
  - [ ] Success notification shown on update
  - [ ] Last updated timestamp is shown
  - [ ] User can cancel changes (revert to saved state)
- **Priority**: Should Have
- **Dependencies**: FR-008
- **Local Testing**: Fully testable locally

### FR-010: Profile Deletion (Soft Delete)
- **Description**: Allow users to delete their profile (future consideration for GDPR)
- **Acceptance Criteria**:
  - [ ] User can delete profile from settings
  - [ ] Confirmation dialog shown before deletion
  - [ ] Profile is soft-deleted (marked as deleted, not removed from DB)
  - [ ] User account is retained (can create new profile)
  - [ ] Deletion is logged for audit purposes
- **Priority**: Could Have (Future)
- **Dependencies**: FR-008
- **Local Testing**: Fully testable locally

---

## Non-Functional Requirements

### Performance
- **Onboarding Flow**:
  - Page transitions < 300ms
  - Form validation response < 100ms
  - Profile submission < 2 seconds
  - GPS location fetch < 5 seconds (with timeout fallback)
- **API Response Times**:
  - GET /api/profile: < 200ms
  - POST /api/profile: < 500ms
  - PUT /api/profile: < 500ms
- **Mobile App Performance**:
  - App launch to onboarding screen < 3 seconds
  - Smooth animations at 60 FPS
  - No ANR (Application Not Responding) errors
- **Local Development**: Lower performance requirements acceptable
- **Production**: Must meet above targets with 100 concurrent users

### Security
- **Authentication**:
  - All profile endpoints require valid JWT token
  - Token expiration: 24 hours (refresh token for mobile)
  - Password hashing: bcrypt with 12 rounds
- **Input Validation**:
  - Server-side validation for all inputs
  - SQL injection prevention (parameterized queries)
  - XSS prevention (sanitize all text inputs)
  - File upload validation (profile photo - future)
- **Data Protection**:
  - HTTPS only in production
  - Sensitive data encrypted at rest (database encryption)
  - Location data requires explicit user consent
  - GDPR/CCPA compliance considerations (data export, deletion)
- **Authorization**:
  - Users can only access their own profile
  - Admin users can view all profiles (future role-based access)
- **Local Development**:
  - HTTP acceptable for API
  - Simpler authentication for testing
  - Mock data for testing edge cases

### Accessibility (WCAG 2.1 Level AA)
- **Mobile App**:
  - Screen reader support (iOS VoiceOver, Android TalkBack)
  - Minimum touch target size: 44x44 points (iOS), 48x48dp (Android)
  - Sufficient color contrast ratios (4.5:1 for text)
  - Form labels properly associated with inputs
  - Error messages are announced to screen readers
  - Keyboard navigation support (external keyboards)
- **Text**:
  - Font size: Minimum 16sp for body text
  - Support for system font scaling (up to 200%)
  - Clear font choices (avoid decorative fonts for data)
- **Localization** (Future):
  - Support for right-to-left languages (Arabic, Hebrew)
  - Multi-language support (English, Hindi, Spanish - Phase 2)

### Scalability
- **User Load**:
  - Local: Single developer testing
  - Production: Support 10,000 concurrent users initially
  - Database: Handle 1 million farmer profiles
- **Data Growth**:
  - Profile data size: Average 5KB per profile
  - Image storage (future): S3/Azure Blob Storage
- **API Rate Limiting**:
  - Local: No rate limiting
  - Production: 100 requests/minute per user
  - Burst capacity: 150 requests/minute

### Availability & Reliability
- **Local Development**:
  - Development uptime not critical
  - Local database can be restarted
- **Production**:
  - 99.9% uptime SLA (8.76 hours downtime/year)
  - Zero data loss policy
  - Automated daily backups (PostgreSQL)
  - Disaster recovery plan (RPO: 24 hours, RTO: 4 hours)
  - Health check endpoint: GET /api/health

### Usability
- **Onboarding Completion**:
  - Target: > 80% completion rate
  - Time to complete: < 5 minutes average
  - Profile data completeness: > 85%
- **User Experience**:
  - Clear progress indicators throughout onboarding
  - Helpful error messages (not technical jargon)
  - Ability to save and resume onboarding
  - No dead ends (always provide a way forward or back)
  - Smooth animations and transitions
- **Mobile Considerations**:
  - Offline mode: Show error message if no internet (defer offline support)
  - Low bandwidth: Optimize API payload sizes
  - Battery efficient: Minimize GPS usage

### Maintainability
- **Code Quality**:
  - ESLint + Prettier for code formatting
  - Unit test coverage > 80%
  - Integration test coverage > 70%
  - API documentation using Swagger/OpenAPI
- **Logging**:
  - Structured logging (JSON format)
  - Log levels: DEBUG, INFO, WARN, ERROR
  - User actions logged (onboarding start, complete, abandon)
  - Error tracking: Sentry or similar (production)
- **Monitoring**:
  - Application Performance Monitoring (APM)
  - Real User Monitoring (RUM) for mobile app
  - Database query performance monitoring

---

## API Specification

### Base URL
- **Local Development**: `http://localhost:3000/api/v1`
- **Production**: `https://api.agri-ai.com/api/v1`

### Authentication
All endpoints require JWT Bearer token in Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

### Endpoint 1: Create Farm Profile

**POST** `/api/v1/profile`

**Description**: Create a new farm profile for the authenticated user

**Authentication**: Required (JWT)

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**:
```json
{
  "personalInfo": {
    "firstName": "string (required, 1-50 chars)",
    "lastName": "string (required, 1-50 chars)",
    "phoneNumber": "string (optional, E.164 format, e.g., +1234567890)"
  },
  "farmDetails": {
    "farmSize": "number (required, 0.01-100000)",
    "farmSizeUnit": "enum (required): 'hectares' | 'acres'",
    "primaryCrops": [
      {
        "cropId": "uuid (optional, if predefined crop)",
        "cropName": "string (required, 1-100 chars)",
        "isCustom": "boolean (default: false)"
      }
    ]
  },
  "location": {
    "locationType": "enum (required): 'gps' | 'manual'",
    "latitude": "number (required if gps, -90 to 90)",
    "longitude": "number (required if gps, -180 to 180)",
    "country": "string (required, 2-100 chars)",
    "state": "string (required, 2-100 chars)",
    "district": "string (required, 2-100 chars)",
    "village": "string (optional, 2-100 chars)",
    "address": "string (optional, resolved from GPS or user-entered)"
  },
  "experience": {
    "level": "enum (required): 'beginner' | 'intermediate' | 'experienced' | 'expert'",
    "yearsOfExperience": "number (optional, 0-100)"
  }
}
```

**Request Example**:
```json
{
  "personalInfo": {
    "firstName": "Rajesh",
    "lastName": "Kumar",
    "phoneNumber": "+919876543210"
  },
  "farmDetails": {
    "farmSize": 5.5,
    "farmSizeUnit": "hectares",
    "primaryCrops": [
      {
        "cropId": "550e8400-e29b-41d4-a716-446655440000",
        "cropName": "Wheat",
        "isCustom": false
      },
      {
        "cropName": "Organic Tomatoes",
        "isCustom": true
      }
    ]
  },
  "location": {
    "locationType": "gps",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "country": "India",
    "state": "Delhi",
    "district": "New Delhi",
    "address": "Connaught Place, New Delhi"
  },
  "experience": {
    "level": "intermediate",
    "yearsOfExperience": 4
  }
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Farm profile created successfully",
  "data": {
    "profileId": "uuid",
    "userId": "uuid",
    "personalInfo": {
      "firstName": "Rajesh",
      "lastName": "Kumar",
      "phoneNumber": "+919876543210"
    },
    "farmDetails": {
      "farmSize": 5.5,
      "farmSizeUnit": "hectares",
      "farmSizeInHectares": 5.5,
      "primaryCrops": [
        {
          "id": "uuid",
          "cropId": "550e8400-e29b-41d4-a716-446655440000",
          "cropName": "Wheat",
          "isCustom": false
        },
        {
          "id": "uuid",
          "cropName": "Organic Tomatoes",
          "isCustom": true
        }
      ]
    },
    "location": {
      "locationType": "gps",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "country": "India",
      "state": "Delhi",
      "district": "New Delhi",
      "village": null,
      "address": "Connaught Place, New Delhi"
    },
    "experience": {
      "level": "intermediate",
      "yearsOfExperience": 4
    },
    "completeness": 92,
    "createdAt": "2024-03-02T12:00:00Z",
    "updatedAt": "2024-03-02T12:00:00Z"
  }
}
```

**Error Responses**:

**400 Bad Request** - Validation errors:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "farmDetails.farmSize",
        "message": "Farm size must be between 0.01 and 100,000"
      },
      {
        "field": "personalInfo.firstName",
        "message": "First name is required and must be 1-50 characters"
      }
    ]
  }
}
```

**401 Unauthorized** - Missing or invalid JWT:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required. Please log in."
  }
}
```

**409 Conflict** - Profile already exists:
```json
{
  "success": false,
  "error": {
    "code": "PROFILE_EXISTS",
    "message": "A farm profile already exists for this user. Use PUT /api/v1/profile to update."
  }
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred. Please try again later.",
    "requestId": "uuid (for support tracking)"
  }
}
```

**Rate Limiting (429 Too Many Requests)**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 60 seconds.",
    "retryAfter": 60
  }
}
```

---

### Endpoint 2: Get Farm Profile

**GET** `/api/v1/profile`

**Description**: Retrieve the farm profile for the authenticated user

**Authentication**: Required (JWT)

**Request Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters**: None

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "profileId": "uuid",
    "userId": "uuid",
    "personalInfo": {
      "firstName": "Rajesh",
      "lastName": "Kumar",
      "phoneNumber": "+919876543210"
    },
    "farmDetails": {
      "farmSize": 5.5,
      "farmSizeUnit": "hectares",
      "farmSizeInHectares": 5.5,
      "primaryCrops": [
        {
          "id": "uuid",
          "cropId": "550e8400-e29b-41d4-a716-446655440000",
          "cropName": "Wheat",
          "isCustom": false
        }
      ]
    },
    "location": {
      "locationType": "gps",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "country": "India",
      "state": "Delhi",
      "district": "New Delhi",
      "village": null,
      "address": "Connaught Place, New Delhi"
    },
    "experience": {
      "level": "intermediate",
      "yearsOfExperience": 4
    },
    "completeness": 92,
    "createdAt": "2024-03-02T12:00:00Z",
    "updatedAt": "2024-03-02T12:00:00Z"
  }
}
```

**Error Responses**:

**401 Unauthorized**:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required. Please log in."
  }
}
```

**404 Not Found** - No profile exists:
```json
{
  "success": false,
  "error": {
    "code": "PROFILE_NOT_FOUND",
    "message": "No farm profile found for this user. Please complete onboarding."
  }
}
```

---

### Endpoint 3: Update Farm Profile

**PUT** `/api/v1/profile`

**Description**: Update the farm profile for the authenticated user (full update)

**Authentication**: Required (JWT)

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**: Same as POST /api/v1/profile (all fields)

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Farm profile updated successfully",
  "data": {
    // Same structure as GET /api/v1/profile response
  }
}
```

**Error Responses**: Same as POST endpoint, except:
- No 409 Conflict (profile already exists)
- 404 Not Found if profile doesn't exist

---

### Endpoint 4: Partially Update Farm Profile

**PATCH** `/api/v1/profile`

**Description**: Partially update specific fields of the farm profile

**Authentication**: Required (JWT)

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**Request Body** (only include fields to update):
```json
{
  "farmDetails": {
    "farmSize": 6.0
  },
  "experience": {
    "level": "experienced"
  }
}
```

**Response (200 OK)**: Same as PUT endpoint

**Error Responses**: Same as PUT endpoint

---

### Endpoint 5: Delete Farm Profile

**DELETE** `/api/v1/profile`

**Description**: Soft delete the farm profile (mark as deleted, retain for audit)

**Authentication**: Required (JWT)

**Request Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Farm profile deleted successfully"
}
```

**Error Responses**:
- 401 Unauthorized
- 404 Not Found (no profile exists)

---

### Endpoint 6: Get Available Crops

**GET** `/api/v1/crops`

**Description**: Retrieve list of predefined crops for selection during onboarding

**Authentication**: Optional (public endpoint for onboarding)

**Query Parameters**:
- `search` (optional): Filter crops by name (case-insensitive partial match)
- `limit` (optional, default: 50): Number of results to return
- `offset` (optional, default: 0): Pagination offset

**Request Example**:
```
GET /api/v1/crops?search=whe&limit=10
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "crops": [
      {
        "id": "uuid",
        "name": "Wheat",
        "scientificName": "Triticum aestivum",
        "category": "Cereal",
        "commonRegions": ["North America", "Europe", "Asia"]
      },
      {
        "id": "uuid",
        "name": "Durum Wheat",
        "scientificName": "Triticum durum",
        "category": "Cereal",
        "commonRegions": ["Mediterranean", "North America"]
      }
    ],
    "total": 2,
    "limit": 10,
    "offset": 0
  }
}
```

**Error Responses**:
- 400 Bad Request (invalid query parameters)
- 500 Internal Server Error

---

### Endpoint 7: Get Onboarding Progress

**GET** `/api/v1/profile/progress`

**Description**: Retrieve the user's onboarding progress (for resuming incomplete onboarding)

**Authentication**: Required (JWT)

**Response (200 OK)** - Incomplete onboarding:
```json
{
  "success": true,
  "data": {
    "isComplete": false,
    "currentStep": 3,
    "totalSteps": 5,
    "completedSteps": [1, 2],
    "savedData": {
      "personalInfo": {
        "firstName": "Rajesh",
        "lastName": "Kumar"
      },
      "farmDetails": {
        "farmSize": 5.5,
        "farmSizeUnit": "hectares"
      }
    }
  }
}
```

**Response (200 OK)** - Completed onboarding:
```json
{
  "success": true,
  "data": {
    "isComplete": true,
    "completedAt": "2024-03-02T12:00:00Z"
  }
}
```

---

## Data Models

### Entity: User (from FEAT-009)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### Entity: FarmProfile
```sql
CREATE TABLE farm_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  
  -- Personal Information
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  phone_number VARCHAR(20),
  
  -- Farm Details
  farm_size DECIMAL(10, 2) NOT NULL CHECK (farm_size > 0 AND farm_size <= 100000),
  farm_size_unit VARCHAR(10) NOT NULL CHECK (farm_size_unit IN ('hectares', 'acres')),
  farm_size_hectares DECIMAL(10, 2) GENERATED ALWAYS AS (
    CASE 
      WHEN farm_size_unit = 'hectares' THEN farm_size
      WHEN farm_size_unit = 'acres' THEN farm_size * 0.404686
    END
  ) STORED,
  
  -- Location
  location_type VARCHAR(10) NOT NULL CHECK (location_type IN ('gps', 'manual')),
  latitude DECIMAL(10, 8) CHECK (latitude BETWEEN -90 AND 90),
  longitude DECIMAL(11, 8) CHECK (longitude BETWEEN -180 AND 180),
  country VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  village VARCHAR(100),
  address TEXT,
  
  -- Experience
  experience_level VARCHAR(20) NOT NULL CHECK (experience_level IN ('beginner', 'intermediate', 'experienced', 'expert')),
  years_of_experience INTEGER CHECK (years_of_experience BETWEEN 0 AND 100),
  
  -- Metadata
  completeness INTEGER DEFAULT 0 CHECK (completeness BETWEEN 0 AND 100),
  is_onboarding_complete BOOLEAN DEFAULT TRUE,
  onboarding_step INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_farm_profiles_user_id ON farm_profiles(user_id);
CREATE INDEX idx_farm_profiles_location ON farm_profiles(country, state, district);
CREATE INDEX idx_farm_profiles_experience ON farm_profiles(experience_level);
CREATE INDEX idx_farm_profiles_created_at ON farm_profiles(created_at);
CREATE INDEX idx_farm_profiles_completeness ON farm_profiles(completeness);

-- Geospatial index (if PostGIS extension is available)
-- CREATE INDEX idx_farm_profiles_geom ON farm_profiles USING GIST (
--   ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
-- );
```

### Entity: Crop (Predefined Crop Master Data)
```sql
CREATE TABLE crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  scientific_name VARCHAR(200),
  category VARCHAR(50), -- e.g., Cereal, Vegetable, Fruit, Legume
  common_regions TEXT[], -- Array of regions
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_crops_name ON crops(name);
CREATE INDEX idx_crops_category ON crops(category);
```

### Entity: FarmCrop (Many-to-Many relationship)
```sql
CREATE TABLE farm_crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_profile_id UUID NOT NULL,
  crop_id UUID, -- NULL if custom crop
  crop_name VARCHAR(100) NOT NULL, -- Redundant for custom crops
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (farm_profile_id) REFERENCES farm_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL
);

CREATE INDEX idx_farm_crops_profile ON farm_crops(farm_profile_id);
CREATE INDEX idx_farm_crops_crop ON farm_crops(crop_id);
CREATE UNIQUE INDEX idx_farm_crops_unique ON farm_crops(farm_profile_id, crop_id) WHERE crop_id IS NOT NULL;
```

### Entity: OnboardingProgress (for saving partial progress)
```sql
CREATE TABLE onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 5,
  saved_data JSONB, -- Store partial form data
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_onboarding_progress_user ON onboarding_progress(user_id);
```

### Data Relationships
- **User → FarmProfile**: 1:1 (One user has one farm profile)
- **FarmProfile → FarmCrop**: 1:Many (One profile has multiple crops)
- **Crop → FarmCrop**: 1:Many (One crop can be used by many profiles)
- **User → OnboardingProgress**: 1:1 (One user has one onboarding progress record)

---

## User Flow - Onboarding Wizard

### Flow Diagram
```
[App Launch / Registration]
         ↓
[Welcome Screen]
   "Let's set up your farm profile"
   [Start Onboarding Button]
         ↓
[Step 1: Personal Info]
   • First Name *
   • Last Name *
   • Phone Number (optional)
   [Progress: 1/5] [Next →]
         ↓
[Step 2: Farm Size]
   • Farm Size (number input) *
   • Unit (Hectares/Acres) *
   • Conversion preview
   [Progress: 2/5] [← Back] [Next →]
         ↓
[Step 3: Crops]
   • Search/Select Crops *
   • Selected: [Wheat] [Rice] [+ Add]
   • Add Custom Crop
   [Progress: 3/5] [← Back] [Next →]
         ↓
[Step 4: Location]
   • [Use GPS] or [Enter Manually]
   • GPS: Shows lat/lon + resolved address
   • Manual: Country > State > District > Village
   • Map preview (optional)
   [Progress: 4/5] [← Back] [Next →]
         ↓
[Step 5: Experience]
   • Select Experience Level *
     ○ Beginner (0-2 years)
     ○ Intermediate (3-5 years)
     ○ Experienced (6-10 years)
     ○ Expert (10+ years)
   • Years of Experience (optional)
   [Progress: 5/5] [← Back] [Review →]
         ↓
[Review Screen]
   • Personal Info [Edit]
   • Farm Details [Edit]
   • Location [Edit]
   • Experience [Edit]
   [Submit Profile]
         ↓
[Loading / API Call]
   POST /api/v1/profile
         ↓
[Success Screen]
   "Your profile is ready! 🎉"
   "Redirecting to dashboard..."
   (Auto-redirect after 2 seconds)
         ↓
[Dashboard / Home]
```

### Exit & Resume Flow
- At any step, user can tap "Save & Exit"
- Progress is saved to `onboarding_progress` table
- On app re-launch, if onboarding incomplete:
  - Show "Continue where you left off" prompt
  - Resume at saved step with pre-filled data

### Error Handling in Flow
- **Network Error**: Show retry button, cache data locally
- **Validation Error**: Highlight field in red, show error message below
- **GPS Permission Denied**: Fallback to manual entry with helpful message
- **API Error (500)**: Show generic error, offer retry or contact support

---

## Edge Cases & Error Handling

### EC-001: Duplicate Profile Creation
- **Scenario**: User tries to create profile when one already exists
- **Expected Behavior**: 
  - API returns 409 Conflict
  - Mobile app shows: "You already have a profile. Would you like to update it?"
  - Redirect to profile edit screen
- **Prevention**: Check for existing profile before showing onboarding

### EC-002: Invalid Farm Size
- **Scenarios**:
  - Negative number: "Farm size must be a positive number"
  - Zero: "Farm size must be greater than 0"
  - Too large (> 100,000): "Farm size cannot exceed 100,000 units"
  - Non-numeric: "Please enter a valid number"
  - Too many decimals: Round to 2 decimal places automatically
- **Validation**: Client-side (immediate feedback) + Server-side (security)

### EC-003: No Crops Selected
- **Scenario**: User tries to proceed without selecting any crop
- **Expected Behavior**:
  - "Next" button remains disabled
  - Show hint: "Please select at least one crop to continue"
- **Minimum**: 1 crop, **Maximum**: 5 crops

### EC-004: GPS Permission Denied
- **Scenario**: User denies location permission
- **Expected Behavior**:
  - Show message: "Location permission denied. You can enter your location manually."
  - Automatically switch to manual entry mode
  - Provide link to app settings to enable permission later

### EC-005: GPS Timeout
- **Scenario**: GPS signal weak or unavailable
- **Expected Behavior**:
  - Timeout after 10 seconds
  - Show message: "Unable to detect location. Please try again or enter manually."
  - Offer retry or manual entry options

### EC-006: Invalid Coordinates
- **Scenario**: GPS returns invalid or out-of-range coordinates
- **Expected Behavior**:
  - Validate: Lat (-90 to 90), Lon (-180 to 180)
  - If invalid: Reject and ask for manual entry
  - Log error for debugging

### EC-007: Network Timeout During Submission
- **Scenario**: API call fails due to network timeout
- **Expected Behavior**:
  - Show loading indicator for max 30 seconds
  - If timeout: "Network error. Your data is saved. Please try again."
  - Retry button to resubmit (data cached locally)
  - Exponential backoff for retries (3 attempts)

### EC-008: Server Error (500) During Submission
- **Scenario**: Backend throws unexpected error
- **Expected Behavior**:
  - Show user-friendly message: "Something went wrong. Please try again later."
  - Log error details (request ID) for support team
  - Offer retry or contact support options
  - Do NOT expose technical error details to user

### EC-009: Token Expiry During Onboarding
- **Scenario**: JWT token expires while user is filling out form
- **Expected Behavior**:
  - Save form data locally
  - Show: "Your session has expired. Please log in again."
  - After re-login, restore form data and resume

### EC-010: Special Characters in Name
- **Scenario**: User enters name with emojis, special chars (e.g., O'Brien, José)
- **Expected Behavior**:
  - Accept Unicode characters (UTF-8)
  - Accept apostrophes, hyphens, accented characters
  - Reject: Emojis, numbers, special symbols (@, #, $)
  - Validation regex: `^[a-zA-Z\u00C0-\u017F'\- ]+$`

### EC-011: Custom Crop Name Conflict
- **Scenario**: User adds custom crop "Wheat" but it already exists in master list
- **Expected Behavior**:
  - Warn: "This crop already exists. Would you like to use the existing one?"
  - Offer to select from master list instead
  - If user insists, allow custom crop (mark as `isCustom: true`)

### EC-012: Extremely Long Input Strings
- **Scenario**: User enters very long strings (e.g., 1000-char name)
- **Expected Behavior**:
  - Enforce max length on input fields (client-side)
  - Show character counter (e.g., "25/50")
  - Server-side validation rejects if exceeds limit
  - Error: "Field name cannot exceed 50 characters"

### EC-013: Database Connection Failure
- **Scenario**: Database is down or unreachable
- **Expected Behavior**:
  - Health check endpoint returns 503 Service Unavailable
  - API returns 500 Internal Server Error
  - User sees: "Service temporarily unavailable. Please try again in a few minutes."
  - Alert monitoring system (PagerDuty, Slack)

### EC-014: Incomplete Onboarding Abandonment
- **Scenario**: User starts onboarding but exits before completion
- **Expected Behavior**:
  - Save progress to `onboarding_progress` table
  - On next login, show prompt: "Complete your profile to get personalized recommendations"
  - Track abandonment rate in analytics
  - Send reminder notification after 24 hours (future feature)

### EC-015: Profile Completeness Calculation
- **Scenario**: Calculate completeness percentage
- **Formula**:
  ```
  Completeness = (Filled Required Fields / Total Required Fields) * 50 +
                 (Filled Optional Fields / Total Optional Fields) * 50
  ```
- **Example**:
  - Required: firstName, lastName, farmSize, 1 crop, location, experience (6 fields)
  - Optional: phoneNumber, village, yearsOfExperience (3 fields)
  - If all required + 2 optional filled: 50% + 33% = 83%

---

## Security Considerations

### Input Validation
- **SQL Injection Prevention**:
  - Use parameterized queries (Sequelize, TypeORM, or pg-promise)
  - Never concatenate user input into SQL strings
  - Example: `db.query('SELECT * FROM farm_profiles WHERE user_id = $1', [userId])`
- **XSS Prevention**:
  - Sanitize all text inputs (strip HTML tags)
  - Use libraries: DOMPurify, xss
  - Escape output when rendering in mobile app
- **NoSQL Injection** (for JSONB fields):
  - Validate JSON structure before storing
  - Avoid dynamic key insertion from user input
- **File Upload Validation** (future profile photo):
  - Validate file type: JPEG, PNG only
  - Max file size: 5 MB
  - Scan for malware (ClamAV or VirusTotal API)
  - Store in S3/Azure Blob, not filesystem

### Authentication & Authorization
- **JWT Token**:
  - Algorithm: HS256 for local dev, RS256 for production
  - Expiry: 24 hours for access token
  - Refresh token: 30 days (stored in secure HTTP-only cookie)
  - Secret key: Store in environment variable, rotate quarterly
- **Password Security**:
  - Hashing: bcrypt with 12 rounds
  - Minimum requirements: 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  - No password in logs or error messages
- **Authorization Rules**:
  - Users can only access their own profile (check `userId` in JWT matches `user_id` in DB)
  - Admin role can view all profiles (future feature)
  - No cross-user data access

### Data Protection
- **In Transit**:
  - Production: HTTPS only (TLS 1.3), redirect HTTP to HTTPS
  - Local dev: HTTP acceptable
  - Certificate pinning in mobile app (production)
- **At Rest**:
  - Database encryption: Azure Database for PostgreSQL (TDE enabled)
  - Backup encryption: AES-256
  - Sensitive fields: Consider field-level encryption for location data (GDPR)
- **Secrets Management**:
  - Use environment variables (`.env` file not committed to Git)
  - Production: Azure Key Vault or AWS Secrets Manager
  - Rotate secrets quarterly
- **Location Data Privacy**:
  - GPS coordinates require explicit user consent
  - Privacy policy must disclose location usage
  - Users can opt-out and use manual entry
  - Location data not shared with third parties

### GDPR & Privacy Compliance
- **Data Minimization**:
  - Only collect necessary fields
  - Optional fields clearly marked
- **Right to Access**:
  - Users can view their profile anytime (GET /api/v1/profile)
- **Right to Rectification**:
  - Users can edit their profile (PUT/PATCH /api/v1/profile)
- **Right to Erasure**:
  - Soft delete profile (DELETE /api/v1/profile)
  - Hard delete after 90 days (GDPR compliance)
- **Data Portability**:
  - Future: Export profile as JSON (GET /api/v1/profile/export)
- **Consent Management**:
  - Checkbox: "I agree to the Terms of Service and Privacy Policy"
  - Timestamp consent acceptance
  - Allow consent withdrawal

### API Security
- **Rate Limiting**:
  - Local: No limit (dev testing)
  - Production: 100 req/min per user, 1000 req/min per IP
  - Use: express-rate-limit or Redis-based rate limiter
- **CORS**:
  - Allow only specific origins (mobile app domains)
  - Production: `https://app.agri-ai.com`
  - Local: `http://localhost:3000`, `exp://192.168.*`
- **CSRF Protection**:
  - Mobile app: Not applicable (no cookies, JWT in header)
  - Web app (future): Use CSRF tokens
- **Input Size Limits**:
  - Max request body size: 1 MB (prevent DoS)
  - Max JSON nesting depth: 5 levels
- **Security Headers**:
  - Helmet.js middleware for Express
  - Headers: X-Content-Type-Options, X-Frame-Options, CSP

### Logging & Monitoring
- **What to Log**:
  - User actions: Profile created, updated, deleted
  - Authentication events: Login, logout, token refresh
  - Errors: API errors, validation failures
  - Security events: Rate limit exceeded, unauthorized access attempts
- **What NOT to Log**:
  - Passwords or password hashes
  - Full JWT tokens (log last 8 chars only)
  - Sensitive personal data (phone numbers, full addresses)
- **Log Retention**:
  - Application logs: 90 days
  - Audit logs: 7 years (compliance)
- **Monitoring Alerts**:
  - High error rate (> 5% of requests)
  - Slow API responses (> 2 seconds)
  - Multiple failed auth attempts (> 5 in 10 minutes)
  - Database connection failures

---

## Testing Requirements

### Unit Tests
- **Backend**:
  - Test all validation functions (farm size, coordinates, etc.)
  - Test completeness calculation logic
  - Test JWT token generation and verification
  - Test password hashing and comparison
  - Mock database calls (use Jest + Sinon)
  - Coverage target: > 80%
- **Mobile App**:
  - Test form validation logic
  - Test unit conversion (acres ↔ hectares)
  - Test navigation between onboarding steps
  - Test data persistence (save progress)
  - Use: Jest + React Native Testing Library
  - Coverage target: > 70%
- **Run Command**: `npm run test:unit`

### Integration Tests
- **API Integration**:
  - Test full CRUD operations on /api/v1/profile
  - Test authentication flow (JWT validation)
  - Test error responses (400, 401, 404, 409, 500)
  - Test with actual PostgreSQL test database (Docker container)
  - Use: Supertest + Jest
  - Coverage target: > 70%
- **Mobile App Integration**:
  - Test full onboarding flow (5 steps)
  - Test API integration with mock server (MSW or nock)
  - Test offline behavior (network errors)
  - Use: Detox (E2E) or Appium
- **Run Command**: `npm run test:integration`

### Security Tests
- **OWASP Top 10 Checks**:
  - SQL Injection: Test with malicious inputs (`'; DROP TABLE users;--`)
  - XSS: Test with script tags (`<script>alert('XSS')</script>`)
  - Broken Authentication: Test token expiry, invalid tokens
  - Sensitive Data Exposure: Ensure passwords not in responses
  - Broken Access Control: Test cross-user access attempts
- **Tools**:
  - OWASP ZAP or Burp Suite (automated scans)
  - npm audit (dependency vulnerabilities)
  - Snyk or Dependabot (continuous monitoring)
- **Run Command**: `npm run test:security`

### Performance Tests
- **Load Testing**:
  - Simulate 100 concurrent users (local dev)
  - Simulate 1,000 concurrent users (staging)
  - Simulate 10,000 concurrent users (production)
  - Measure API response times, error rates, throughput
  - Tools: k6, Artillery, or JMeter
  - Target: < 2 second response time under load
- **Stress Testing**:
  - Gradually increase load until API breaks
  - Identify breaking point and bottlenecks
  - Ensure graceful degradation (not crash)
- **Soak Testing**:
  - Run at 50% capacity for 24 hours
  - Detect memory leaks, connection pool exhaustion
- **Run Command**: `npm run test:load`

### Usability Testing
- **User Acceptance Testing (UAT)**:
  - Recruit 10-20 farmers for beta testing
  - Measure onboarding completion rate (target: > 80%)
  - Measure time to complete (target: < 5 minutes)
  - Collect feedback on UI/UX
  - Tools: UserTesting.com, Maze, or in-person sessions
- **A/B Testing** (Future):
  - Test different onboarding flows (e.g., 5 steps vs. 3 steps)
  - Test different UI designs (cards vs. forms)
  - Measure conversion rates

### Accessibility Testing
- **Mobile App**:
  - Test with iOS VoiceOver and Android TalkBack
  - Verify all form labels are announced
  - Verify touch targets meet minimum size (44x44 pts)
  - Test with system font scaling at 200%
  - Tools: Accessibility Inspector (Xcode), Android Accessibility Scanner
- **Contrast & Color**:
  - Use contrast checker (4.5:1 ratio for text)
  - Test in grayscale mode (no color-only indicators)
- **Keyboard Navigation**:
  - Test with external keyboard (Bluetooth or USB-C)
  - Ensure all actions accessible via keyboard

### Test Data & Fixtures
- **User Accounts**:
  - Create 10 test users with varied profiles
  - Include edge cases (long names, international chars, max crops)
- **Crop Master Data**:
  - Seed database with 50+ common crops
  - Include diverse categories (cereals, vegetables, fruits)
- **Location Data**:
  - Test with coordinates from different countries
  - Include edge cases (North Pole, Equator, Date Line)

### Continuous Integration (CI)
- **GitHub Actions Workflow**:
  ```yaml
  name: CI
  on: [push, pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v2
        - name: Setup Node.js
          uses: actions/setup-node@v2
          with:
            node-version: '18'
        - name: Install dependencies
          run: npm ci
        - name: Run linter
          run: npm run lint
        - name: Run unit tests
          run: npm run test:unit
        - name: Run integration tests
          run: npm run test:integration
        - name: Upload coverage
          uses: codecov/codecov-action@v2
  ```
- **Required Checks**:
  - All tests pass (unit + integration)
  - Code coverage > 80%
  - No linting errors
  - Security audit passes (npm audit)

---

## Deployment Considerations

### Local Development
- **Database**:
  - PostgreSQL 14+ in Docker container
  - Docker Compose for orchestration
  - Seed script: `npm run db:seed` (create test users, crops)
  - Reset script: `npm run db:reset` (drop and recreate tables)
- **Backend API**:
  - Node.js 18+ with Express
  - Hot reload: nodemon or ts-node-dev
  - Environment: `.env.local` file (not committed)
  - Run: `npm run dev` (starts on http://localhost:3000)
- **Mobile App**:
  - React Native with Expo or React Native CLI
  - iOS Simulator / Android Emulator
  - Hot reload enabled
  - Run: `npm run ios` or `npm run android`
- **Testing**:
  - Full test suite runnable locally
  - Mock external services (geocoding API)
  - Use `localhost` for API calls
- **No DevOps Agent Needed**: All development is self-contained

### Staging Environment (Optional)
- **Purpose**: Pre-production testing with real-like data
- **Infrastructure**:
  - Azure App Service or AWS Elastic Beanstalk
  - Azure Database for PostgreSQL (Basic tier)
  - Azure Blob Storage (for future file uploads)
- **CI/CD**:
  - Auto-deploy from `develop` branch
  - Run full test suite before deployment
  - Blue-green deployment for zero downtime
- **Configuration**:
  - Environment variables from Azure Key Vault
  - HTTPS enabled with Let's Encrypt certificate
- **Access**:
  - Internal testing only (IP whitelist or VPN)
  - Test with real mobile devices (TestFlight for iOS, Firebase App Distribution for Android)
- **Triggers DevOps Agent**: Possibly (if staging deployment is automated)

### Production Deployment (Requires DevOps Agent)
- **Infrastructure**:
  - **Backend API**: Azure App Service (Standard tier) or AKS (Kubernetes)
  - **Database**: Azure Database for PostgreSQL (General Purpose tier)
    - High Availability (HA) enabled
    - Automated backups (daily, retain 30 days)
    - Point-in-time restore capability
  - **File Storage**: Azure Blob Storage (Hot tier) for future profile photos
  - **CDN**: Azure CDN for static assets
  - **Load Balancer**: Azure Application Gateway or AWS ALB
- **Mobile App Deployment**:
  - **iOS**: App Store (via Xcode + App Store Connect)
    - Code signing with distribution certificate
    - Push notification certificate
    - TestFlight for beta testing
  - **Android**: Google Play Store (via Android Studio + Play Console)
    - App signing by Google Play
    - Internal/closed/open testing tracks
  - **OTA Updates**: Expo Updates or CodePush (for minor updates without app store submission)
- **CI/CD Pipeline**:
  - GitHub Actions or Azure DevOps
  - Workflow:
    1. Run tests (unit + integration + security)
    2. Build backend (Docker image)
    3. Build mobile apps (iOS + Android)
    4. Push Docker image to Azure Container Registry
    5. Deploy to App Service or AKS
    6. Run smoke tests
    7. Submit iOS/Android builds to app stores (requires manual approval)
  - Auto-deploy from `main` branch
  - Manual approval for production promotion
- **Secrets Management**:
  - Azure Key Vault for all secrets
  - Managed Identity for secure access (no hardcoded credentials)
  - Secrets injected as environment variables at runtime
- **Monitoring & Observability**:
  - **APM**: Azure Application Insights or New Relic
  - **Logging**: Azure Log Analytics or ELK Stack
  - **Error Tracking**: Sentry or Rollbar
  - **Uptime Monitoring**: Pingdom or StatusCake
  - **Alerts**: PagerDuty or Azure Monitor Alerts
    - Alert on: 5xx errors, slow responses, database connection failures
- **Scaling**:
  - **Auto-scaling**: Scale up/down based on CPU/memory/request rate
  - **Database**: Read replicas for high read traffic
  - **Horizontal scaling**: Multiple API instances behind load balancer
- **Disaster Recovery**:
  - **Backup**: Automated daily backups, retain 30 days
  - **Restore**: Point-in-time restore within 5 minutes
  - **Geo-replication**: Database replicas in secondary region (future)
  - **Failover**: Automatic failover to secondary region (RPO: 1 hour, RTO: 4 hours)
- **Security**:
  - **Network**: VNet isolation, NSG rules
  - **DDoS Protection**: Azure DDoS Protection Standard
  - **WAF**: Web Application Firewall (Azure Application Gateway)
  - **SSL/TLS**: TLS 1.3, HSTS enabled
  - **Vulnerability Scanning**: Qualys or Rapid7
- **Compliance**:
  - GDPR compliance (data residency, user consent)
  - SOC 2 Type II audit (future)
  - Regular security assessments (quarterly)
- **Triggers DevOps Agent**: **YES** (for all production infrastructure and app store deployment)

### Configuration Management
- **Environment Variables**:
  - `NODE_ENV`: `development` | `staging` | `production`
  - `DATABASE_URL`: PostgreSQL connection string
  - `JWT_SECRET`: Secret key for JWT signing
  - `JWT_EXPIRY`: Token expiration time (e.g., `24h`)
  - `API_BASE_URL`: Backend API URL
  - `RATE_LIMIT_MAX`: Max requests per minute
  - `LOG_LEVEL`: `debug` | `info` | `warn` | `error`
  - `GEOCODING_API_KEY`: Google Maps or Mapbox API key (for address resolution)
  - `SENTRY_DSN`: Sentry error tracking DSN
- **Feature Flags** (Future):
  - Use LaunchDarkly or ConfigCat
  - Flags: `enable_profile_photo`, `enable_multi_farm_profiles`

---

## Dependencies

### Internal Dependencies
- **FEAT-009: User Authentication & JWT System** (CRITICAL)
  - **Status**: Must be implemented before FEAT-001
  - **Reason**: Onboarding requires user to be logged in
  - **API Endpoints Needed**:
    - POST /api/v1/auth/register (create user account)
    - POST /api/v1/auth/login (get JWT token)
    - POST /api/v1/auth/refresh (refresh expired token)
    - GET /api/v1/auth/me (get current user info)
  - **Data Models Needed**:
    - `users` table with id, email, password_hash
    - JWT token generation and validation logic
  - **Blocking**: FEAT-001 cannot start until FEAT-009 is complete

### External Dependencies
- **PostgreSQL Database**:
  - Version: 14+ (for GENERATED ALWAYS AS syntax)
  - Extensions: pgcrypto (for gen_random_uuid), PostGIS (optional, for geospatial queries)
- **Node.js**:
  - Version: 18+ LTS
  - Packages: express, pg, bcrypt, jsonwebtoken, joi (validation), dotenv
- **React Native**:
  - Version: 0.72+ (latest stable)
  - Libraries:
    - `react-navigation` (navigation)
    - `react-native-geolocation-service` (GPS)
    - `react-native-picker-select` (dropdowns)
    - `react-native-vector-icons` (icons)
    - `axios` (HTTP client)
    - `react-hook-form` (form management)
    - `yup` (validation)
- **Geocoding API** (Optional for MVP):
  - Google Maps Geocoding API or Mapbox Geocoding API
  - Purpose: Resolve GPS coordinates to human-readable address
  - Fallback: Allow manual address entry if API unavailable
- **Analytics** (Optional):
  - Google Analytics for Firebase (mobile app)
  - Mixpanel or Amplitude (user behavior tracking)
  - Track: Onboarding start, step completions, abandonment points

### Infrastructure Dependencies (Production)
- **Azure Services** (or AWS equivalents):
  - Azure App Service (or AWS Elastic Beanstalk)
  - Azure Database for PostgreSQL (or AWS RDS PostgreSQL)
  - Azure Key Vault (or AWS Secrets Manager)
  - Azure Blob Storage (or AWS S3)
  - Azure Application Insights (or AWS CloudWatch + X-Ray)
- **App Stores**:
  - Apple Developer Program ($99/year)
  - Google Play Developer Account ($25 one-time)
- **Domain & SSL**:
  - Domain name for API (e.g., api.agri-ai.com)
  - SSL certificate (Let's Encrypt or paid)

---

## Assumptions

1. **User Authentication Exists**:
   - FEAT-009 (Authentication) is already implemented and functional
   - Users have valid JWT tokens before accessing onboarding
   - Token validation middleware is in place

2. **Single Farm Profile Per User**:
   - MVP supports one farm profile per user (1:1 relationship)
   - Future versions may support multiple farms per user (1:Many)

3. **Crop Master Data**:
   - A predefined list of 50+ common crops is seeded in the database
   - Crops are categorized (Cereal, Vegetable, Fruit, Legume, etc.)
   - Farmers can add custom crops not in the master list

4. **Location Services**:
   - GPS is available on all mobile devices (iOS, Android)
   - Users grant location permission willingly
   - Fallback to manual entry is always available
   - Geocoding API (Google Maps or Mapbox) is used for address resolution (optional for MVP)

5. **Network Connectivity**:
   - Users have internet connection during onboarding
   - Offline mode is not supported in MVP (future enhancement)
   - API calls may fail due to network issues (handled gracefully)

6. **Language & Localization**:
   - MVP is English-only
   - Future versions will support Hindi, Spanish, French, etc.
   - All text is stored in English in the database

7. **Data Validity**:
   - Users provide accurate information (no verification required for MVP)
   - Farm size is self-reported (no verification via satellite imagery)
   - Location is trusted (no anti-fraud checks in MVP)

8. **Mobile Platforms**:
   - Support iOS 13+ and Android 8+ (API level 26+)
   - React Native is used for cross-platform development
   - Platform-specific features (e.g., location services) use native modules

9. **Performance**:
   - Database queries are optimized with indexes
   - API responses are fast enough for mobile app (<2 seconds)
   - No need for caching layer in MVP (Redis, etc.)

10. **Compliance**:
    - Basic GDPR compliance (data access, rectification, erasure)
    - No HIPAA or PCI-DSS requirements
    - Privacy policy and terms of service are provided separately

---

## Risks & Mitigation

### Risk 1: Dependency on FEAT-009 (Authentication)
- **Impact**: FEAT-001 cannot start without authentication system
- **Probability**: Medium (if FEAT-009 is delayed)
- **Mitigation**:
  - Prioritize FEAT-009 implementation
  - Develop FEAT-001 UI in parallel (with mock authentication)
  - Use mock JWT tokens for local development
  - Coordinate with authentication developer

### Risk 2: Low Onboarding Completion Rate
- **Impact**: Users abandon onboarding, reducing active user base
- **Probability**: High (industry average: 60-70% completion)
- **Target**: > 80% completion rate
- **Mitigation**:
  - Minimize number of steps (5 steps is acceptable, avoid > 7)
  - Make optional fields clearly optional
  - Allow save and resume (progress persistence)
  - Show progress indicator at all times
  - Provide clear value proposition ("Get personalized recommendations")
  - A/B test different onboarding flows
  - Analyze drop-off points with analytics (Mixpanel, Amplitude)
  - Send reminder notifications for incomplete onboarding (future)

### Risk 3: GPS Permission Denial
- **Impact**: Users cannot use GPS for location input
- **Probability**: Medium (privacy-conscious users)
- **Mitigation**:
  - Provide manual entry as fallback
  - Explain why location is needed (personalized recommendations)
  - Allow location permission to be granted later (edit profile)
  - Do not block onboarding if GPS denied
  - Track GPS denial rate in analytics

### Risk 4: Poor Data Quality (Inaccurate User Input)
- **Impact**: AI recommendations are less accurate due to bad data
- **Probability**: Medium (users may enter incorrect farm size, wrong crops)
- **Mitigation**:
  - Provide input validation and helpful hints
  - Show unit conversions (acres ↔ hectares) to catch errors
  - Allow profile editing (users can correct mistakes later)
  - Future: Verify farm size with satellite imagery (Phase 2)
  - Future: Verify location with address validation API (Phase 2)

### Risk 5: Database Performance Degradation
- **Impact**: Slow API responses as user base grows
- **Probability**: Low (with proper indexing)
- **Mitigation**:
  - Implement database indexes on frequently queried fields
  - Monitor query performance with pg_stat_statements
  - Optimize slow queries (EXPLAIN ANALYZE)
  - Scale database vertically (increase CPU/RAM) or horizontally (read replicas)
  - Implement caching layer (Redis) if needed (future)

### Risk 6: Token Expiry During Onboarding
- **Impact**: Users lose progress if token expires mid-onboarding
- **Probability**: Low (onboarding takes < 5 minutes, token expires after 24 hours)
- **Mitigation**:
  - Save progress locally (AsyncStorage on mobile)
  - Implement token refresh mechanism (refresh token)
  - Gracefully handle 401 Unauthorized (prompt re-login)
  - Restore saved progress after re-login

### Risk 7: Third-Party API Failures (Geocoding)
- **Impact**: Cannot resolve GPS coordinates to address
- **Probability**: Low (Google Maps has 99.9% uptime)
- **Mitigation**:
  - Geocoding is optional for MVP (store lat/lon only)
  - Fallback: Display lat/lon if address resolution fails
  - Implement retry logic (3 attempts with exponential backoff)
  - Use alternative geocoding service (Mapbox) as fallback
  - Allow manual address entry as final fallback

### Risk 8: App Store Rejection
- **Impact**: Delayed production launch
- **Probability**: Low (if guidelines followed)
- **Mitigation**:
  - Follow Apple App Store Review Guidelines
  - Follow Google Play Store policies
  - Provide clear privacy policy and terms of service
  - Implement required permissions explanations (location, etc.)
  - Test thoroughly before submission
  - Respond quickly to review feedback

### Risk 9: Security Vulnerabilities
- **Impact**: Data breach, user trust loss, legal issues
- **Probability**: Low (with proper security practices)
- **Mitigation**:
  - Follow OWASP Top 10 guidelines
  - Regular security audits (quarterly)
  - Dependency scanning (npm audit, Snyk)
  - Penetration testing before production launch
  - Implement bug bounty program (future)
  - Security training for development team

### Risk 10: Scalability Issues at Launch
- **Impact**: API crashes under high user load
- **Probability**: Medium (if successful launch)
- **Mitigation**:
  - Perform load testing before launch (10K concurrent users)
  - Implement auto-scaling (Azure App Service or Kubernetes)
  - Use CDN for static assets
  - Implement rate limiting to prevent abuse
  - Have rollback plan ready
  - Monitor performance metrics in real-time (Application Insights)
  - Have on-call DevOps team during launch

---

## Clarifying Questions

### Product & Business Questions
1. **Profile Photos**:
   - Should we support profile photo uploads in MVP, or defer to Phase 2?
   - If yes, what's the max file size and allowed formats?

2. **Multiple Farms**:
   - MVP supports one farm per user. When do we need multi-farm support?
   - Should we design database schema to accommodate future multi-farm feature?

3. **Verification**:
   - Do we need to verify farm details (e.g., with government records, satellite imagery)?
   - Or is self-reported data acceptable for MVP?

4. **Crop Categories**:
   - What's the minimum number of crops needed in the master list (30? 50? 100?)?
   - Should we support crop varieties (e.g., "Basmati Rice" vs. "Jasmine Rice")?

5. **Mandatory vs. Optional Fields**:
   - Is phone number mandatory or optional?
   - Is village/town mandatory or optional?
   - Is years of experience mandatory or optional?

6. **Onboarding Skip**:
   - Can users skip onboarding and complete it later?
   - Or is onboarding mandatory before accessing the app?

7. **Edit Restrictions**:
   - Can users edit their profile after creation, or only certain fields?
   - Are there any fields that cannot be edited after onboarding (e.g., location)?

### Technical Questions
8. **Authentication Flow**:
   - Does FEAT-009 support both email/password and OAuth (Google, Facebook)?
   - Or only email/password in MVP?

9. **Database**:
   - Should we use PostgreSQL from the start, or start with SQLite for local dev?
   - Is PostGIS extension available for geospatial queries, or use lat/lon columns?

10. **Geocoding API**:
    - Should we integrate Google Maps Geocoding API in MVP, or defer to Phase 2?
    - What's the budget for API calls (Google Maps charges per request)?
    - Alternative: Use free APIs like Nominatim (OpenStreetMap)?

11. **File Storage**:
    - If we add profile photos, should we use Azure Blob Storage, AWS S3, or local filesystem?
    - What's the preferred cloud provider (Azure or AWS)?

12. **Mobile App Framework**:
    - Is React Native confirmed, or considering Flutter?
    - Expo or React Native CLI (bare workflow)?

13. **Analytics**:
    - What analytics tool should we integrate (Google Analytics, Mixpanel, Amplitude)?
    - What events should we track (onboarding start, step completions, drop-offs)?

### UX Questions
14. **Progress Persistence**:
    - Should we auto-save progress after each step, or only when user taps "Save & Exit"?
    - How long should we retain incomplete onboarding progress (7 days? 30 days? Forever)?

15. **Unit Preference**:
    - Should we auto-detect unit preference based on user's country (US = acres, others = hectares)?
    - Or always show both options and let user choose?

16. **Location Privacy**:
    - Should we show exact GPS coordinates to the user, or only the resolved address?
    - Should we anonymize location (e.g., show district level only, not exact coordinates)?

17. **Error Messages**:
    - What tone should error messages use (formal, friendly, technical)?
    - Should we provide actionable next steps in all error messages?

### Deployment Questions
18. **Deployment Timeline**:
    - When is the target launch date for MVP?
    - Is there a beta testing phase before public launch?

19. **Rollout Strategy**:
    - Should we launch in all countries at once, or start with one country (e.g., India)?
    - Should we roll out to a small percentage of users first (canary deployment)?

20. **App Store Submission**:
    - Who is responsible for app store submission (developer or separate team)?
    - Do we have Apple Developer and Google Play Developer accounts ready?

---

## Success Criteria (Testable Acceptance Criteria)

### Functional Success Criteria
- [ ] **FR-001**: User can register with email/password successfully
- [ ] **FR-002**: User can enter personal information (first name, last name) and proceed to Step 2
- [ ] **FR-003**: User can enter farm size with unit selection and see real-time conversion
- [ ] **FR-004**: User can select 1-5 crops from master list or add custom crop
- [ ] **FR-005**: User can capture location via GPS or enter manually with cascading dropdowns
- [ ] **FR-006**: User can select farming experience level
- [ ] **FR-007**: User can review all entered data and submit profile successfully
- [ ] **FR-008**: Profile data is persisted in PostgreSQL and linked to user account
- [ ] **FR-009**: User can edit profile from settings and save changes
- [ ] **API-001**: POST /api/v1/profile creates profile and returns 201 Created
- [ ] **API-002**: GET /api/v1/profile retrieves profile and returns 200 OK
- [ ] **API-003**: PUT /api/v1/profile updates profile and returns 200 OK
- [ ] **API-004**: PATCH /api/v1/profile partially updates profile and returns 200 OK
- [ ] **API-005**: DELETE /api/v1/profile soft-deletes profile and returns 200 OK
- [ ] **API-006**: All API endpoints return appropriate error responses (400, 401, 404, 409, 500)

### Non-Functional Success Criteria
- [ ] **Performance**: API response time < 2 seconds for all profile endpoints
- [ ] **Performance**: Mobile app transitions between steps < 300ms
- [ ] **Performance**: GPS location fetch < 5 seconds (with timeout)
- [ ] **Usability**: Onboarding completion rate > 80% (measured in production)
- [ ] **Usability**: Average onboarding time < 5 minutes (measured in production)
- [ ] **Usability**: Profile completeness score > 85% on average (measured in production)
- [ ] **Security**: All API endpoints require valid JWT authentication
- [ ] **Security**: SQL injection attempts are blocked (tested with malicious inputs)
- [ ] **Security**: XSS attempts are blocked (tested with script tags in inputs)
- [ ] **Accessibility**: Mobile app passes iOS VoiceOver and Android TalkBack tests
- [ ] **Accessibility**: Text contrast ratios meet WCAG 2.1 Level AA (4.5:1)
- [ ] **Accessibility**: Touch targets are at least 44x44 pts (iOS) / 48x48dp (Android)
- [ ] **Test Coverage**: Unit test coverage > 80% for backend
- [ ] **Test Coverage**: Unit test coverage > 70% for mobile app
- [ ] **Test Coverage**: Integration test coverage > 70%

### Business Success Criteria (Post-Launch Metrics)
- [ ] **Adoption**: 1,000 farmers complete onboarding in first month
- [ ] **Retention**: 70% of users who complete onboarding return within 7 days
- [ ] **Engagement**: 50% of users update their profile at least once within first month
- [ ] **Data Quality**: < 5% of profiles have invalid or suspicious data
- [ ] **Support**: < 2% of users contact support for onboarding issues

---

## Approval Checklist
- [ ] All functional requirements are clear and specific
- [ ] API contracts are well-defined with request/response schemas
- [ ] Data models are complete with constraints and indexes
- [ ] Security considerations are comprehensive (authentication, validation, encryption)
- [ ] Testing strategy is defined with coverage targets
- [ ] Deployment scope is confirmed (local, staging, production)
- [ ] Dependencies are identified (FEAT-009 is critical blocker)
- [ ] Risks are documented with mitigation strategies
- [ ] Clarifying questions are answered (or deferred to Phase 2)
- [ ] Success criteria are measurable and testable
- [ ] Human approval obtained for this specification

---

## Next Steps

### Immediate Actions
1. **Human Approval**: Get stakeholder/product manager approval on this specification
2. **Clarify Open Questions**: Answer the 20 clarifying questions listed above
3. **Dependency Check**: Confirm FEAT-009 (Authentication) status and timeline

### After Approval
4. **Hand off to SolutionArchitect**: 
   - Review and validate technical architecture
   - Create detailed component diagrams
   - Define database migration scripts
   - Specify API middleware and authentication flow
5. **Wait for Architecture Approval**: Ensure architecture is reviewed and approved
6. **Hand off to TaskSplitter**:
   - Decompose FEAT-001 into atomic implementation tasks
   - Create task manifest for Developer agent
   - Prioritize tasks (e.g., database schema → API → mobile UI)
7. **Proceed to Implementation**: Developer agent implements tasks in order
8. **Testing & QA**: Tester agent validates all acceptance criteria
9. **Security Review**: EthicalHacker agent performs security audit
10. **Deployment**: DevOps agent handles staging and production deployment (if required)

---

## Document Metadata
- **Version**: 1.0
- **Author**: RequirementAnalyzer Agent
- **Created**: 2024-03-02
- **Last Updated**: 2024-03-02
- **Status**: Pending Approval
- **Related Documents**:
  - `docs/backlog.md` (source of user story)
  - `docs/architecture.md` (system architecture)
  - `docs/requirement-specs/FEAT-009-spec.md` (authentication dependency - to be created)
- **Approval Required From**:
  - Product Manager
  - Solution Architect
  - Lead Developer
  - Security Engineer (for security requirements)

---

## Appendix

### A. Sample Crop Master Data (Seed Data)
```sql
INSERT INTO crops (name, scientific_name, category, common_regions) VALUES
  ('Wheat', 'Triticum aestivum', 'Cereal', ARRAY['North America', 'Europe', 'Asia']),
  ('Rice', 'Oryza sativa', 'Cereal', ARRAY['Asia', 'Africa', 'South America']),
  ('Corn (Maize)', 'Zea mays', 'Cereal', ARRAY['North America', 'South America', 'Africa']),
  ('Cotton', 'Gossypium', 'Fiber', ARRAY['India', 'China', 'USA', 'Pakistan']),
  ('Soybeans', 'Glycine max', 'Legume', ARRAY['USA', 'Brazil', 'Argentina', 'China']),
  ('Sugarcane', 'Saccharum officinarum', 'Sugar', ARRAY['Brazil', 'India', 'China', 'Thailand']),
  ('Barley', 'Hordeum vulgare', 'Cereal', ARRAY['Europe', 'North America', 'Australia']),
  ('Sorghum', 'Sorghum bicolor', 'Cereal', ARRAY['Africa', 'India', 'USA', 'China']),
  ('Potatoes', 'Solanum tuberosum', 'Vegetable', ARRAY['China', 'India', 'Russia', 'Europe']),
  ('Tomatoes', 'Solanum lycopersicum', 'Vegetable', ARRAY['China', 'India', 'USA', 'Turkey']);
-- Add 40 more crops...
```

### B. Database Migration Script (Example)
```sql
-- migrations/001_create_farm_profiles.sql
BEGIN;

-- Create farm_profiles table
CREATE TABLE farm_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  phone_number VARCHAR(20),
  farm_size DECIMAL(10, 2) NOT NULL CHECK (farm_size > 0 AND farm_size <= 100000),
  farm_size_unit VARCHAR(10) NOT NULL CHECK (farm_size_unit IN ('hectares', 'acres')),
  farm_size_hectares DECIMAL(10, 2) GENERATED ALWAYS AS (
    CASE 
      WHEN farm_size_unit = 'hectares' THEN farm_size
      WHEN farm_size_unit = 'acres' THEN farm_size * 0.404686
    END
  ) STORED,
  location_type VARCHAR(10) NOT NULL CHECK (location_type IN ('gps', 'manual')),
  latitude DECIMAL(10, 8) CHECK (latitude BETWEEN -90 AND 90),
  longitude DECIMAL(11, 8) CHECK (longitude BETWEEN -180 AND 180),
  country VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  village VARCHAR(100),
  address TEXT,
  experience_level VARCHAR(20) NOT NULL CHECK (experience_level IN ('beginner', 'intermediate', 'experienced', 'expert')),
  years_of_experience INTEGER CHECK (years_of_experience BETWEEN 0 AND 100),
  completeness INTEGER DEFAULT 0 CHECK (completeness BETWEEN 0 AND 100),
  is_onboarding_complete BOOLEAN DEFAULT TRUE,
  onboarding_step INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_farm_profiles_user_id ON farm_profiles(user_id);
CREATE INDEX idx_farm_profiles_location ON farm_profiles(country, state, district);
CREATE INDEX idx_farm_profiles_experience ON farm_profiles(experience_level);
CREATE INDEX idx_farm_profiles_created_at ON farm_profiles(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER farm_profiles_updated_at
BEFORE UPDATE ON farm_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

COMMIT;
```

### C. API Request/Response Examples (More Scenarios)

**Example: Invalid Farm Size**
```bash
POST /api/v1/profile
Authorization: Bearer <token>
{
  "farmDetails": {
    "farmSize": -5,
    "farmSizeUnit": "hectares"
  }
}

Response: 400 Bad Request
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "farmDetails.farmSize",
        "message": "Farm size must be a positive number between 0.01 and 100,000"
      }
    ]
  }
}
```

**Example: Token Expired**
```bash
GET /api/v1/profile
Authorization: Bearer <expired_token>

Response: 401 Unauthorized
{
  "success": false,
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Your session has expired. Please log in again."
  }
}
```

### D. Mobile App Mockup (Text Description)
```
+---------------------------+
|  [← Back]  Step 1 of 5    |
+---------------------------+
|                           |
|  Personal Information     |
|                           |
|  [First Name]             |
|  ┌─────────────────────┐  |
|  │ Rajesh              │  |
|  └─────────────────────┘  |
|                           |
|  [Last Name]              |
|  ┌─────────────────────┐  |
|  │ Kumar               │  |
|  └─────────────────────┘  |
|                           |
|  [Phone Number]           |
|  (Optional)               |
|  ┌─────────────────────┐  |
|  │ +91 9876543210      │  |
|  └─────────────────────┘  |
|                           |
|         [Next →]          |
|                           |
+---------------------------+
|   ⚫ ⚪ ⚪ ⚪ ⚪            |  (Progress dots)
+---------------------------+
```

---

**End of Requirement Specification Document**
