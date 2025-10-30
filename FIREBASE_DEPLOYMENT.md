# Firebase Hosting Deployment Guide

This guide explains how to configure environment variables for Firebase Hosting deployments.

## Understanding Environment Variables with Firebase Hosting

Firebase Hosting serves **static files** only. Since Vite bundles your application at **build time**, environment variables need to be available during the build process, not at runtime.

Vite automatically embeds any environment variables prefixed with `VITE_` into your client-side bundle during `pnpm build`.

## Configuration Options

### Option 1: Using `.env.production` (Recommended)

Create a `.env.production` file in your project root with your production Firebase credentials:

```bash
cp .env.example .env.production
```

Then edit `.env.production` with your production Firebase config:

```env
# Firebase Configuration (Production)
VITE_FIREBASE_API_KEY=your_production_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# NewsData.io API
VITE_NEWSDATA_API_KEY=pub_855fb746da0e4fc99115fd9551c3e0cb
```

**How it works:**
- Vite automatically loads `.env.production` when `NODE_ENV=production`
- When you run `pnpm build`, it uses these values
- Values are embedded into the static bundle in `dist/public`
- Firebase Hosting serves the pre-built files

**Build and deploy:**
```bash
# Build with production env vars
pnpm build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### Option 2: Set Environment Variables During Build

Set environment variables inline when building:

```bash
VITE_FIREBASE_API_KEY=xxx VITE_FIREBASE_AUTH_DOMAIN=xxx ... pnpm build
```

Or export them in your shell before building:

```bash
export VITE_FIREBASE_API_KEY=your_api_key
export VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
# ... export other variables
pnpm build
firebase deploy --only hosting
```

### Option 3: Using CI/CD (GitHub Actions, etc.)

If you're using continuous deployment, set environment variables as secrets in your CI/CD platform:

**GitHub Actions example:**

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 10
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install
      
      - run: pnpm build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_DATABASE_URL: ${{ secrets.VITE_FIREBASE_DATABASE_URL }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_FIREBASE_MEASUREMENT_ID: ${{ secrets.VITE_FIREBASE_MEASUREMENT_ID }}
          VITE_NEWSDATA_API_KEY: ${{ secrets.VITE_NEWSDATA_API_KEY }}
      
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-project-id
```

## Important Notes

### Security Considerations

⚠️ **Important Security Warning:**

Environment variables with the `VITE_` prefix are **embedded directly into your client-side JavaScript bundle**. This means:

- ✅ They are publicly visible in the browser
- ✅ Anyone can inspect them in the bundled JavaScript files
- ✅ They are safe for **public** API keys (like Firebase config)
- ❌ **Never** use them for **secret** keys or credentials

Firebase configuration values (API keys, etc.) are designed to be public and protected by Firebase security rules, so this is safe for Firebase config.

### File Management

- `.env` - For local development (already in `.gitignore`)
- `.env.production` - For production builds (should also be in `.gitignore`)
- `.env.example` - Template file (committed to git)

Make sure both `.env` and `.env.production` are in `.gitignore`:

```gitignore
.env
.env.local
.env.production
.env.production.local
```

## Verification

After deploying, verify that your environment variables are correctly embedded:

1. Deploy to Firebase Hosting
2. Open your deployed site
3. Open browser DevTools > Sources
4. Find your JavaScript bundle (usually in `/assets/`)
5. Search for one of your environment variable values (e.g., your API key)
6. You should see it embedded in the code

## Troubleshooting

### Variables not working after deployment

1. **Check file location**: Ensure `.env.production` is in the project root (same level as `package.json`)
2. **Rebuild**: Delete `dist/` folder and rebuild: `rm -rf dist && pnpm build`
3. **Check NODE_ENV**: Vite uses `.env.production` when `NODE_ENV=production` (which is default for `vite build`)
4. **Verify variable names**: Must start with `VITE_` to be included in the bundle
5. **Check for typos**: Variable names are case-sensitive

### Using same Firebase project for dev and production

If you're using the same Firebase project for both development and production, you can:

1. Use the same values in both `.env` and `.env.production`
2. Or symlink them: `ln -s .env .env.production`
3. Or create a script that copies `.env` to `.env.production` before building

### Different Firebase projects for dev/prod

If you have separate Firebase projects:

1. Create separate `.env` and `.env.production` files
2. Each with their respective Firebase project credentials
3. Build will automatically use the correct one based on environment

## Quick Deploy Script

You can create a deploy script in `package.json`:

```json
{
  "scripts": {
    "build:prod": "vite build",
    "deploy": "pnpm build:prod && firebase deploy --only hosting",
    "deploy:hosting": "pnpm build:prod && firebase deploy --only hosting"
  }
}
```

Then simply run:
```bash
pnpm deploy
```

