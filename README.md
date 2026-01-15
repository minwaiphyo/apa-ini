# SingaHomes - Unified Activity System

A hackathon-winning Next.js 15 application for managing activities, registrations, and volunteers for disability services organizations.

## Features

- **Unified Calendar**: One master calendar for all activities with filters by programme, accessibility, and type
- **Role-Based Access**: Separate dashboards for participants, volunteers, and staff
- **Smart Registration**: Dynamic forms with conditional fields, prefill, and caregiver linking
- **Conflict Prevention**: Automatic time conflict detection and capacity management
- **Volunteer Management**: Track volunteer assignments and coverage ratios
- **Staff Tools**: Activity CRUD, attendance rosters, CSV export, and email alerts

## Tech Stack

- **Next.js 15** (App Router) - React framework
- **NextAuth v4** - Authentication and sessions
- **Prisma** - Database ORM
- **PostgreSQL** - Database (via Supabase or local)
- **Supabase JS** - Optional storage and realtime
- **Nodemailer** - Email notifications
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database (or Supabase account)
- SMTP server for emails (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd apa-ini-1
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `SMTP_*` - Email configuration (optional)

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Test Accounts

After seeding:
- **Participant 1**: `participant1@example.com` / `password123`
- **Participant 2**: `participant2@example.com` / `password123`
- **Volunteer**: `volunteer1@example.com` / `password123`
- **Staff**: `staff@example.com` / `password123`

## Project Structure

```
/app
  /(public)          # Public pages (landing, calendar, activity details)
  /(auth)            # Authentication pages
  /(dashboard)       # Role-based dashboards
    /participant     # Participant dashboard
    /volunteer       # Volunteer dashboard
    /staff           # Staff dashboard and management
  /api               # API routes
/components          # React components
/lib                 # Utilities (auth, prisma, scheduling, etc.)
/prisma              # Prisma schema and migrations
```

## Key Features Implementation

### Conflict Detection
- Checks for overlapping activities when registering
- Prevents double-booking for participants and volunteers
- Shows warning banners with conflicting activity details

### Capacity Management
- Real-time capacity tracking
- Email alerts at 80% capacity and when full
- Visual indicators (green/yellow/red pills)

### Volunteer Coverage
- Calculates required volunteers based on participant ratio
- Tracks current volunteer assignments
- Alerts staff when coverage is insufficient

### Dynamic Forms
- Activity-specific registration forms
- Conditional field display based on answers
- Support for text, boolean, select, number, email, tel, textarea

## Demo Script

1. **Show the problem**: "They manage schedules in Canva, signups in forms/sheets..."
2. **Unified Calendar**: Filter by programme + "wheelchair-friendly" → instant results
3. **Register as caregiver**: Dynamic fields appear, prefill works
4. **Try to double-book**: Conflict warning appears
5. **Staff dashboard**: Show roster, capacity alerts, volunteer coverage, CSV export

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Database Setup

For production, use a managed PostgreSQL service:
- Supabase (recommended)
- Railway
- Neon
- AWS RDS

Update `DATABASE_URL` in your deployment environment.

## License

MIT

## Hackathon Notes

This app demonstrates:
- Clear user impact (prevents double booking, reduces admin hours)
- Multi-stakeholder UX (participant/volunteer/staff)
- Data integrity (structured registration answers)
- Operational safety (ratio + coverage warnings)
- Polish (email confirmations, exports, markdown pages)
