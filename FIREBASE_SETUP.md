# Firebase Configuration for MyLinguaLearn

## 0. Configure Environment Variables

Before starting, you need to configure Firebase credentials in a `.env` file.

### Step 1: Create .env File

1. In the project root, copy the example file:

```bash
cp .env.example .env
```

### Step 2: Get Firebase Credentials

1. Go to https://console.firebase.google.com
2. Select your project (or create a new one)
3. Click the gear icon ⚙️ > **Project settings**
4. Scroll to "Your apps" > **Web**
5. If you already have a web app, click on it to see the settings
6. If you don't, click "</>" to add a new web app
7. Copy the values from the `firebaseConfig` object

### Step 3: Get NewsData.io API Key

1. Go to https://newsdata.io/
2. Sign up for a free account (or log in if you already have one)
3. Navigate to your dashboard
4. Find your API key (it starts with `pub_`)
5. The free plan includes 200 credits per day, which is sufficient for development and testing

**Note:** A default API key is included in `.env.example` for quick setup, but you should get your own for production use.

### Step 4: Fill the .env File

Open the `.env` file and replace the placeholder values with your actual Firebase and NewsData.io credentials:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# NewsData.io API - Get your key from https://newsdata.io/
# Free plan: 200 credits/day
VITE_NEWSDATA_API_KEY=pub_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Important:**
- Never commit the `.env` file - it's already in `.gitignore`
- The `.env` file must be in the project root (same level as `package.json`)
- After creating or updating `.env`, restart the development server

## 1. Configure Security Rules and Indexes

Go to Firebase Console: https://console.firebase.google.com

### Step 1: Go to Realtime Database

1. Select your project: **alertu-1546021902504**
2. In the sidebar, click **Realtime Database**
3. Click the **Rules** tab

### Step 2: Copy and Paste Rules

Copy the contents from the `firebase-rules.json` file and paste into the rules editor:

```json
{
  "rules": {
    "articles": {
      ".read": true,
      ".write": "auth != null",
      ".indexOn": ["publishedAt", "createdAt"]
    },
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        "vocabulary": {
          ".indexOn": ["createdAt", "nextReview"]
        },
        "readingHistory": {
          ".indexOn": ["readAt", "timestamp"]
        },
        "activities": {
          ".indexOn": ["timestamp"]
        },
        "quizResults": {
          ".indexOn": ["completedAt"]
        },
        "savedArticles": {
          ".indexOn": ["savedAt"]
        }
      }
    },
    "newsCache": {
      ".read": true,
      ".write": "auth != null",
      ".indexOn": ["fetchedAt"]
    }
  }
}
```

### Step 3: Publish Rules

Click the **Publish** button to apply the rules.

## 2. Configure Authentication

### Step 1: Go to Authentication

1. In the sidebar, click **Authentication**
2. Click the **Sign-in method** tab

### Step 2: Enable Providers

Enable the following authentication methods:

1. **Email/Password**
   - Click "Email/Password"
   - Toggle "Enable" on
   - Click "Save"

2. **Google**
   - Click "Google"
   - Toggle "Enable" on
   - Add a project support email
   - Click "Save"

3. **Anonymous** (for guest mode)
   - Click "Anonymous"
   - Toggle "Enable" on
   - Click "Save"

## 3. Verify Configuration

After applying the rules and configuring authentication:

1. Reload the application page
2. Log in with Google or Email
3. Try accessing the news page
4. The index error should disappear

## 4. Data Structure

The Firebase Realtime Database will have the following structure:

```
/
├── articles/
│   └── {articleId}/
│       ├── title
│       ├── body
│       ├── publishedAt
│       └── ...
│
├── users/
│   └── {userId}/
│       ├── profile/
│       ├── vocabulary/
│       ├── readingHistory/
│       ├── progress/
│       └── ...
│
└── newsCache/
    └── {topic}/
        ├── articles[]
        └── fetchedAt
```

## 5. Troubleshooting

### Error: "Index not defined"

If you still see index errors after applying the rules:

1. Wait 1-2 minutes for the rules to propagate
2. Clear your browser cache
3. Reload the page

### Error: "Permission denied"

Check that:

1. The user is authenticated (logged in)
2. The rules were published correctly
3. The user's UID matches the database path

### Error: "Missing App configuration value"

If you see errors about missing Firebase configuration:

1. Verify that the `.env` file exists in the project root
2. Confirm that all `VITE_FIREBASE_*` variables are defined
3. Make sure there are no extra spaces or quotes around values in `.env`
4. Restart the development server after making `.env` changes
5. Check the browser console for specific error messages

### News Not Loading

If news articles aren't loading:

1. Verify your NewsData.io API key is correct in `.env`
2. Check your NewsData.io dashboard for API usage and remaining credits
3. The free plan has a limit of 200 credits per day
4. Ensure your internet connection is working

## 6. Environment Variables Configuration

If you haven't configured environment variables yet, follow the steps in section 0 of this document. The file `client/src/services/firebaseConfig.ts` is configured to automatically read Firebase credentials from environment variables defined in the `.env` file.

### Verifying Configuration

If you encounter Firebase-related errors:

1. Verify that the `.env` file exists in the project root
2. Confirm that all `VITE_FIREBASE_*` variables are defined
3. Make sure there are no extra spaces or quotes around values in `.env`
4. Restart the development server after making changes to `.env`
5. Check the browser console for specific error messages

## 7. Monitoring

To monitor Firebase usage:

1. Go to **Realtime Database** > **Usage**
2. Check:
   - Number of reads/writes
   - Storage used
   - Simultaneous connections

## Free Plan Limits (Spark)

- **Storage**: 1 GB
- **Transfer**: 10 GB/month
- **Simultaneous connections**: 100

If you exceed these, consider upgrading to the Blaze plan (pay-as-you-go).
