## FishBit - Gamified Habit Tracker

A habit tracking web app where your consistency keeps virtual fish happy and healthy

## Prerequisites

Before you start, make sure you have these installed:
1. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/
   - Choose the "LTS" version
   - To check if installed: Open terminal/command prompt and type `node --version`

2. **Git** 
   - Download from: https://git-scm.com/downloads
   - To check if installed: Type `git --version` in terminal

3. **A code editor** (recommended: VS Code)
   - Download from: https://code.visualstudio.com/

## Getting Started (First Time Setup)

### Step 1: Clone the Repository

```bash
# Open terminal/command prompt and run:
git clone https://github.com/YOUR-USERNAME/fishbit.git

# Navigate into the project folder:
cd fishbit
```

### Step 2: Install Dependencies

```bash
# This installs all the required packages (might take 1-2 minutes)
npm install
```

### Step 3: Set Up Environment Variables

1. Create a new file called `.env` in the root folder (same level as `package.json`)
2. Copy the contents from `.env.example`
3. Replace the placeholder values with real Firebase credentials (ask team for these)

Your `.env` file should look like:
```
VITE_FIREBASE_API_KEY=AIzaSy....(actual key here)
VITE_FIREBASE_AUTH_DOMAIN=fishbit-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fishbit-xxx
VITE_FIREBASE_STORAGE_BUCKET=fishbit-xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
```

** IMPORTANT:** Never commit the `.env` file to Git! It contains secret keys.

### Step 4: Run the Development Server

```bash
npm run dev
```

The app should open at: http://localhost:5173

## Daily Workflow

Every time you work on the project:

```bash
# 1. Get latest changes
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Start developing
npm run dev
```

## Project Structure

```
fishbit/
├── src/
│   ├── components/     # Reusable UI components
│   ├── views/          # Page components
│   ├── stores/         # State management (Pinia)
│   ├── services/       # External services (Firebase)
│   ├── router/         # Page routing
│   └── styles/         # CSS files
├── .env               # Your environment variables (DO NOT COMMIT)
├── .env.example       # Template for environment variables
└── package.json       # Project dependencies
```
---

### Quick Start Checklist
- [ ] Node.js installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with Firebase credentials
- [ ] Dev server running (`npm run dev`)

