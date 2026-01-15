# MindsHub - Feature Summary

## Core Features Implemented

### 1. Unified Activity Calendar ✅
- **Month view** with calendar grid
- **List view** fallback for mobile
- **Filters**: Programme, Accessibility tags, Activity type
- **Real-time capacity indicators** (green/yellow/red pills)
- **Activity cards** with key information
- Public access - no login required to browse

### 2. Role-Based Accounts ✅
- **Three distinct roles**: Participant, Volunteer, Staff
- **Separate dashboards** for each role
- **Role-gated routes** with automatic redirects
- **NextAuth integration** with JWT sessions

#### Participant Features:
- View "My Schedule" (registered activities)
- Browse eligible activities
- Membership tier selector (Ad-hoc, 1x/week, 2x/week, 3+/week)
- Profile with accessibility needs

#### Volunteer Features:
- View "My Commitments" (assigned activities)
- Browse available activities
- See volunteer coverage needs
- Skills and interests tags

#### Staff Features:
- Activity CRUD (Create, Read, Update)
- View all activities with capacity/coverage status
- Attendance roster view
- CSV export for activities
- Email alerts for capacity/coverage issues

### 3. Smart Registration Forms ✅
- **Dynamic form fields** per activity
- **Field types**: text, textarea, boolean, select, number, email, tel
- **Conditional logic**: Show fields based on other field values
- **Prefill capability** (ready for profile integration)
- **Form answers stored** as structured JSON
- **Staff can add fields** in activity editor (10-second setup)

### 4. Conflict & Capacity Management ✅
- **Time conflict detection**:
  - Checks overlapping activities
  - Prevents double-booking
  - Shows warning banner with conflicting activity
  - Works for both participants and volunteers

- **Capacity management**:
  - Real-time capacity tracking
  - Visual indicators (capacity pills)
  - Email alerts at 80% capacity
  - Email alerts when full
  - Hard limit enforcement

- **Volunteer coverage**:
  - Calculates required volunteers based on ratio
  - Tracks current assignments
  - Email alerts when coverage insufficient
  - Visual warnings in staff dashboard

## Technical Implementation

### Database Schema (Prisma)
- **User** + **Profile** (role-specific fields)
- **Programme** (STEP, Social Activities, etc.)
- **Activity** (schedule, capacity, requirements)
- **Registration** (participant signups)
- **VolunteerAssignment** (volunteer signups)
- **CaregiverLink** (one caregiver, many participants)
- **FormTemplate** + **FormField** + **RegistrationAnswer** (dynamic forms)

### API Routes
- `/api/auth/[...nextauth]` - NextAuth endpoints
- `/api/registrations` - Create registration/assignment with conflict check
- `/api/activities` - CRUD operations (staff only)
- `/api/activities/[id]` - Update activity
- `/api/profile/membership-tier` - Update membership tier
- `/api/export/activity/[id]/csv` - CSV export

### Key Libraries
- **Next.js 15** App Router with Server Components
- **NextAuth v4** for authentication
- **Prisma** for database access
- **date-fns** for date handling
- **Tailwind CSS** for styling
- **Nodemailer** for email notifications

## Demo Flow

### 1. Show the Problem (30 seconds)
"They manage schedules in Canva, signups in Google Forms/Sheets, and confirm via WhatsApp. Double bookings happen, and staff spend 8+ hours/week consolidating data."

### 2. Unified Calendar (1 minute)
- Navigate to `/calendar`
- Filter by "STEP" programme
- Filter by "Wheelchair-friendly" accessibility tag
- Show instant results
- Click an activity to see details

### 3. Registration Flow (2 minutes)
- Login as `participant1@example.com` / `password123`
- Go to an activity with dynamic form
- Show conditional fields appearing
- Fill out form (wheelchair access → shows caregiver question)
- Submit registration
- Show confirmation

### 4. Conflict Detection (1 minute)
- Try to register for overlapping activity
- Show conflict warning banner
- Explain how it prevents double-booking

### 5. Staff Dashboard (2 minutes)
- Login as `staff@example.com` / `password123`
- Show activity list with capacity/coverage alerts
- Create new activity with custom form fields
- View attendance roster
- Export CSV
- Show email alert system (explain)

### 6. Volunteer Dashboard (1 minute)
- Login as `volunteer1@example.com` / `password123`
- Show "My Commitments"
- Show available activities with coverage needs
- Register as volunteer

## "Wow" Factors

1. **Conflict Prevention**: Real-time detection prevents double-booking
2. **Dynamic Forms**: Staff can add custom questions in seconds
3. **Multi-stakeholder**: Three distinct experiences, not an afterthought
4. **Operational Safety**: Ratio + coverage warnings critical for disability services
5. **Data Integrity**: Structured answers vs messy spreadsheets
6. **Email Automation**: Alerts reduce manual monitoring
7. **CSV Export**: Easy data portability for the organization

## Time Investment

- **Phase A** (Skeleton): ✅ Complete
- **Phase B** (Calendar + Filters): ✅ Complete
- **Phase C** (Registration + Forms): ✅ Complete
- **Phase D** (Role Dashboards): ✅ Complete
- **Phase E** (Polish): ✅ Complete

All core features implemented and ready for demo!
