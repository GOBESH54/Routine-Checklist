# 🚀 Quick Setup for Cloud Sync

## What I've Done:
✅ Installed Supabase
✅ Created cloud sync functionality  
✅ Data now syncs across all your devices automatically

## What You Need to Do:

### 1️⃣ Create Supabase Account (2 minutes)
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (easiest)
4. Create a new project (choose any name)
5. Wait 2 minutes for setup

### 2️⃣ Get Your Keys
1. In Supabase dashboard, click **Settings** (gear icon)
2. Click **API**
3. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### 3️⃣ Create Database Table
1. In Supabase, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy-paste this and click **RUN**:

```sql
CREATE TABLE user_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  completed_tasks JSONB DEFAULT '{}'::jsonb,
  is_holiday_mode BOOLEAN DEFAULT false,
  routines JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON user_data FOR ALL USING (true) WITH CHECK (true);
```

### 4️⃣ Add Keys to Your Project

**For Local Testing:**
1. Create a file named `.env` in your project folder
2. Add these lines (replace with your actual values):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
3. Restart your dev server: `npm run dev`

**For Vercel (Live Site):**
1. Go to https://vercel.com/dashboard
2. Click your project
3. Go to **Settings** → **Environment Variables**
4. Add two variables:
   - Name: `VITE_SUPABASE_URL` → Value: your URL
   - Name: `VITE_SUPABASE_ANON_KEY` → Value: your key
5. Click **Redeploy** (top right)

## ✅ That's It!
- Open your app on phone → Add tasks
- Open on laptop → See the same tasks!
- Data syncs automatically in real-time
- Works offline (syncs when back online)

## 🆘 Need Help?
If you see "Syncing..." in the header, it's working!
If not, check your `.env` file has the correct keys.
