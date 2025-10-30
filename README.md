# MyLinguaLearn - English Learning Platform

![MyLinguaLearn](https://img.shields.io/badge/React-19-blue) ![Firebase](https://img.shields.io/badge/Firebase-Realtime-orange) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

Complete PWA platform for learning English through reading real news articles, with intelligent translation, gamification, and spaced repetition vocabulary system.

## 📋 Table of Contents

- [Features](#-features)
- [Technologies](#-technologies)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Firebase Configuration](#-firebase-configuration)
- [Running the Project](#-running-the-project)
- [Project Structure](#-project-structure)
- [Documentation](#-documentation)
- [License](#-license)

## ✨ Features

### Authentication
- ✅ Google Sign-In (Firebase Auth)
- ✅ Email/Password Authentication
- ✅ Guest Mode (Anonymous)
- ✅ Session Persistence

### Daily News
- ✅ English news feed (NewsData.io API)
- ✅ 13 categories: technology, science, business, health, sports, entertainment, fashion, politics, animals, travel, anime, movies, comedy
- ✅ Web scraping for full content
- ✅ Daily cache to optimize API usage
- ✅ Topic filters

### Interactive Reading
- ✅ Click words for instant translation
- ✅ Save words to vocabulary
- ✅ TTS (Text-to-Speech) with natural voice
- ✅ Full article translation (Chrome AI Translator)
- ✅ Display article images

### Vocabulary
- ✅ Spaced repetition system (SRS)
- ✅ PT/EN Translation
- ✅ Usage examples
- ✅ Pronunciation (IPA)
- ✅ Review tracking

### Gamification
- ✅ XP and leveling system
- ✅ Study streak tracking
- ✅ Comprehension quizzes (Chrome AI Prompt)
- ✅ Conversation coach (Chrome AI)

### PWA & Offline
- ✅ Installable as app
- ✅ Offline cache (IndexedDB)
- ✅ Firebase Realtime Database synchronization

## 🛠 Technologies

### Frontend
- **React 19** - UI Framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - Components
- **Wouter** - Routing
- **Zustand** - State management
- **i18next** - Internationalization
- **Dexie** - IndexedDB wrapper

### Backend
- **Express 4** - Server
- **tRPC 11** - Type-safe APIs
- **Firebase Realtime Database** - Main database
- **Firebase Auth** - Authentication

### External APIs
- **NewsData.io** - News (200 credits/day)
- **Chrome AI APIs** - Translator, Prompt, Writer/Rewriter
- **Web Speech API** - Text-to-Speech

### Tools
- **Vite** - Build tool
- **Cheerio** - Web scraping
- **Axios** - HTTP client
- **date-fns** - Date manipulation

## 📦 Prerequisites

- **Node.js** 18+ and pnpm
- **Firebase Account** (free Spark plan)
- **Chrome/Edge** (for experimental Chrome AI APIs)
- **NewsData.io API Key** (included: `pub_855fb746da0e4fc99115fd9551c3e0cb`)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mylingualearn
```

### 2. Install Dependencies

```bash
pnpm install
```

If you don't have pnpm installed:

```bash
npm install -g pnpm
```

## 🔥 Firebase Configuration

This section provides step-by-step instructions to set up Firebase for local development.

### Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Project name: **mylingualearn** (or any name you prefer)
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Set Up Realtime Database

1. In the sidebar, click **Realtime Database**
2. Click "Create database"
3. Choose location: **us-central1** (or closest to you)
4. Mode: **Test** (temporary) or **Locked**
5. Click "Enable"

### Step 3: Apply Rules and Indexes

1. Go to the **Rules** tab
2. Copy the content from `firebase-rules.json`
3. Paste it in the editor and click **Publish**

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

### Step 4: Configure Authentication

1. In the sidebar, click **Authentication**
2. Click "Get started"
3. Enable the following providers:

   **Email/Password:**
   - Click "Email/Password"
   - Enable and save

   **Google:**
   - Click "Google"
   - Enable
   - Add support email
   - Save

   **Anonymous:**
   - Click "Anonymous"
   - Enable and save

### Step 5: Get Firebase Credentials

1. Click the gear icon ⚙️ > **Project settings**
2. Scroll down to "Your apps" > **Web**
3. Click "</>" to add a web app (if you haven't already)
4. App nickname: **MyLinguaLearn**
5. Copy the `firebaseConfig` object values

You should see something like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

### Step 6: Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Open `.env` and fill in your Firebase credentials with the values from Step 5:

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

# NewsData.io API (optional - included default key)
VITE_NEWSDATA_API_KEY=pub_855fb746da0e4fc99115fd9551c3e0cb
```

3. Replace all placeholder values with your actual Firebase configuration values from Step 5.

**Important:** 
- Never commit your `.env` file to version control. It's already in `.gitignore`.
- The `.env` file must be in the project root directory (same level as `package.json`).
- After creating or updating `.env`, restart your development server for changes to take effect.

### Step 7: Verify Configuration

The Firebase configuration is automatically loaded from environment variables in `client/src/services/firebaseConfig.ts`. Make sure:
- Your `.env` file is in the project root directory
- All `VITE_FIREBASE_*` variables are set correctly
- You've restarted the dev server after creating/updating `.env`

## ▶️ Running the Project

### Development Mode

```bash
pnpm dev
```

The server will be available at: http://localhost:3000

### Production Build

```bash
pnpm build
pnpm start
```

## 📁 Project Structure

```
mylingualearn/
├── client/                      # Frontend React
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── ChatCoachDialog.tsx
│   │   │   ├── QuizDialog.tsx
│   │   │   └── WordTranslationModal.tsx
│   │   ├── contexts/            # React contexts
│   │   │   ├── FirebaseAuthContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── hooks/               # Custom hooks
│   │   ├── i18n/                # Internationalization
│   │   │   ├── config.ts
│   │   │   └── locales/
│   │   │       └── pt-BR.json
│   │   ├── lib/                 # Utilities
│   │   │   └── trpc.ts
│   │   ├── pages/               # Application pages
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Onboarding.tsx
│   │   │   ├── NewsFeed.tsx
│   │   │   ├── ArticleView.tsx
│   │   │   ├── Vocabulary.tsx
│   │   │   ├── Progress.tsx
│   │   │   └── Games.tsx
│   │   ├── services/            # Services
│   │   │   ├── authService.ts
│   │   │   ├── chromeAiService.ts
│   │   │   ├── firebaseConfig.ts
│   │   │   ├── firebaseDatabase.ts
│   │   │   └── storageService.ts
│   │   ├── store/               # Zustand store
│   │   │   └── useStore.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── index.html
│
├── server/                      # Backend Express + tRPC
│   ├── _core/                   # Core framework
│   ├── services/                # Backend services
│   │   ├── articleScraper.ts    # Web scraping
│   │   ├── newsService.ts       # Google News RSS
│   │   └── newsdataService.ts   # NewsData.io API
│   ├── utils/                   # Utilities
│   │   └── htmlDecoder.ts       # HTML decoder
│   └── routers.ts               # tRPC routers
│
├── shared/                      # Shared code
│   └── const.ts
│
├── firebase-rules.json          # Firebase rules
├── FIREBASE_SETUP.md            # Firebase setup guide
├── DATA_ARCHIT الأمURE.md         # Data architecture
├── .env.example                 # Environment variables template
├── README.md                    # This file
└── package.json
```

## 📚 Documentation

### Documentation Files

- **README.md** - This file (overview)
- **FIREBASE_SETUP.md** - Detailed Firebase configuration guide
- **DATA_ARCHITECTURE.md** - Data architecture and Firebase structure
- **firebase-rules.json** - Security rules and indexes

### Data Flow

1. **Authentication**: Firebase Auth → Context → Pages
2. **News**: NewsData.io API → Server (tRPC) → Firebase → Client
3. **Scraping**: Server → Cheerio → Firebase → Client
4. **Vocabulary**: Client → Firebase Realtime Database
5. **Progress**: Client → Firebase Realtime Database

### Chrome AI APIs (Experimental)

To use AI features:

1. Open `chrome://flags`
2. Search and enable:
   - `#optimization-guide-on-device-model`
   - `#prompt-api-for-gemini-nano-high`
   - `#translation-api`
3. Restart Chrome
4. Wait for models to download (may take a few minutes)

## 🐛 Troubleshooting

### Error: "Index not defined"

Follow the instructions in `FIREBASE_SETUP.md` to configure indexes.

### Error: "Permission denied"

Check:
- User is authenticated
- Firebase rules were applied correctly

### News not loading

Check:
- NewsData.io API key is correct
- Daily limit of 200 requests not reached
- Firebase is configured correctly

### Chrome Runs not working

Make sure:
- Using Chrome/Edge version 127+
- Experimental flags enabled
- Models downloaded (may take time)

### Firebase Configuration Not Working

If you're getting Firebase errors:

1. Verify your `.env` file exists in the project root
2. Check that all `VITE_FIREBASE_*` variables are set correctly
3. Ensure there are no extra spaces or quotes around values in `.env`
4. Restart the dev server after changing `.env`
5. Check browser console for specific error messages

 displayed on the page, otherwise display the page content. Make sure to translate all the text to English.
