# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Database Setup

### Option A: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database:
```sql
CREATE DATABASE mindshub;
```

3. Update `.env`:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/mindshub?schema=public"
```

### Option B: Supabase (Recommended for Hackathon)

1. Create a Supabase project at https://supabase.com
2. Go to Settings > Database
3. Copy the connection string
4. Update `.env`:
```
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

## 3. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="your-postgresql-connection-string"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# Supabase (optional - for storage)
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""

# SMTP (optional - for emails)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="MindsHub <noreply@mindshub.com>"
```

## 4. Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with test data
npm run db:seed
```

## 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Test Accounts

After seeding:
- **Participant 1**: `participant1@example.com` / `password123`
- **Participant 2**: `participant2@example.com` / `password123`
- **Volunteer**: `volunteer1@example.com` / `password123`
- **Staff**: `staff@example.com` / `password123`

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check PostgreSQL is running (if local)
- For Supabase: ensure IP is whitelisted

### NextAuth Issues
- Make sure NEXTAUTH_SECRET is set
- Verify NEXTAUTH_URL matches your dev URL

### Email Not Sending
- Emails are optional - app will log to console if SMTP not configured
- For Gmail: use App Password, not regular password
- Check SMTP settings match your provider

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy

### Database for Production

Use a managed PostgreSQL service:
- Supabase (free tier available)
- Railway
- Neon
- AWS RDS

Update DATABASE_URL in Vercel environment variables.
