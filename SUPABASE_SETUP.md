# Supabase Setup Guide

## Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Sign up for free (no credit card needed)
3. Create a new project

## Step 2: Get Your Credentials
1. In your Supabase project dashboard
2. Go to **Settings** → **API**
3. Copy:
   - **Project URL** (looks like: https://xxxxx.supabase.co)
   - **anon/public key** (long string starting with eyJ...)

## Step 3: Create Database Table
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Paste this SQL and click **Run**:

```sql
-- Create user_data table
CREATE TABLE user_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  completed_tasks JSONB DEFAULT '{}'::jsonb,
  is_holiday_mode BOOLEAN DEFAULT false,
  routines JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for simplicity)
CREATE POLICY "Allow all operations" ON user_data
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

## Step 4: Add Environment Variables

### For Local Development:
1. Create a file named `.env` in the project root
2. Add your credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### For Vercel Deployment:
1. Go to your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Add two variables:
   - Name: `VITE_SUPABASE_URL`, Value: your Supabase URL
   - Name: `VITE_SUPABASE_ANON_KEY`, Value: your anon key
4. Redeploy your project

## Step 5: Test
1. Run `npm run dev`
2. Open the app and make changes
3. Open the same URL on another device
4. Your data should sync automatically!

## Notes:
- Data syncs across all devices automatically
- No login required (uses device fingerprint)
- Free tier: 500MB database, 2GB bandwidth/month
- Data persists forever (not deleted)
