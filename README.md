# Trading Journal - Complete Deployment Guide

## Quick Start

### Local Development

1. **Install Dependencies:**
```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

2. **Start the Application:**
```bash
# Terminal 1 - Start backend
cd server
npm start

# Terminal 2 - Start frontend
cd client
npm run dev
```

3. **Access the App:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

**Demo Account:**
- Email: `demo@trading.com`
- Password: `demo123`

---

## Deployment Guide

### PART 1: Deploy Backend to Railway

#### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

#### Step 2: Login to Railway
```bash
railway login
```
This will open your browser. Sign up or login to Railway.

#### Step 3: Initialize Project
```bash
cd server
railway init
```
- Choose "Create new project"
- Name it: "trading-journal-api"

#### Step 4: Deploy
```bash
railway up
```

#### Step 5: Add Environment Variables
Go to Railway Dashboard (https://railway.app):
1. Click your project
2. Click "Variables" tab
3. Add these variables:
```
JWT_SECRET=TradingJournalSuperSecretKey2024XYZ
NODE_ENV=production
PORT=3001
```

#### Step 6: Get Your Railway URL
```bash
railway domain
```
Your backend URL will be like: `https://trading-journal-api-production-xyz.up.railway.app`

#### Step 7: Test Backend
```bash
curl https://your-railway-url.up.railway.app/api/health
```
Should return: `{"status":"ok","timestamp":"..."}`

---

### PART 2: Deploy Frontend to Vercel

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Deploy
```bash
cd client
vercel
```
- Follow the prompts
- When asked for "Project name", enter: "trading-journal"

#### Step 4: Set Environment Variable
Go to Vercel Dashboard (https://vercel.com):
1. Click your project
2. Click "Settings" → "Environment Variables"
3. Add:
```
VITE_API_URL=https://your-railway-url.up.railway.app/api
```

#### Step 5: Redeploy
After adding the environment variable:
1. Go to "Deployments" tab
2. Click the three dots on latest deployment
3. Click "Redeploy"

Your app will be live at: `https://trading-journal.vercel.app`

---

### PART 3: Update CORS

**Important:** After deploying both services, update the backend CORS:

1. Go to Railway Dashboard
2. Open your project variables
3. Add/update:
```
CLIENT_URL=https://trading-journal.vercel.app
```
4. Railway will auto-restart the server

---

## Project Structure

```
trading-journal/
├── server/
│   ├── db/
│   │   ├── database.js      # SQLite setup
│   │   └── seed.js          # Demo data seeder
│   ├── middleware/
│   │   └── auth.js          # JWT verification
│   ├── routes/
│   │   ├── auth.js
│   │   ├── trades.js
│   │   └── analytics.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── tradesController.js
│   │   └── analyticsController.js
│   ├── index.js             # Server entry point
│   ├── package.json
│   ├── .env
│   ├── Procfile             # For Railway
│   └── railway.json
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js      # API client
│   │   ├── components/
│   │   │   ├── AuthScreen.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── TradeLog.jsx
│   │   │   ├── TradeForm.jsx
│   │   │   ├── TradeTable.jsx
│   │   │   ├── EditModal.jsx
│   │   │   └── Toast.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   ├── .env
│   └── .env.development
│
└── README.md
```

---

## Features

- User authentication with JWT
- Trade logging (LONG/SHORT)
- Automatic PnL calculation
- Performance analytics
- Interactive charts
- PDF report generation
- Mobile responsive design
- Dark theme UI
- Demo account with sample data

---

**Total Cost: $0/month** (Free tiers of Railway + Vercel)
