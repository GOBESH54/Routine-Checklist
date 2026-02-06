# 🔥 Firebase Setup Guide (5 Minutes)

## Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click **"Add project"**
3. Enter project name: `routine-tracker`
4. Disable Google Analytics (not needed)
5. Click **"Create project"**

## Step 2: Register Web App
1. In Firebase console, click the **Web icon** (</>)
2. App nickname: `Routine Tracker`
3. Click **"Register app"**
4. Copy the `firebaseConfig` object (you'll need these values)

## Step 3: Enable Firestore Database
1. In Firebase console, go to **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select location closest to you
5. Click **"Enable"**

## Step 4: Set Firestore Rules
1. Go to **"Firestore Database"** → **"Rules"** tab
2. Replace with this:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if true;
    }
  }
}
```
3. Click **"Publish"**

## Step 5: Add Environment Variables

### For Local Development:
Create `.env` file in project root:
```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### For Vercel:
1. Go to Vercel project → **Settings** → **Environment Variables**
2. Add all 6 variables above
3. Click **"Redeploy"**

## ✅ Done!
- Data syncs across all devices
- Real-time updates
- Free tier: 1GB storage, 50K reads/day
