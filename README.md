# 🛒 homemart4u — Hyperlocal Fresh Groceries & Halal Meats Platform

A modern, production-hardened hyperlocal e-commerce platform built for **homemart4u** (Mulbagal, Karnataka) featuring strict **Frontend/Backend decoupling** across **Vercel** and **Render**.

---

## 🏛️ Architecture Overview

The application is structured into two clean, independent services:

```
home-mart-for-you/
├── frontend/               # Next.js 15 UI Application (Deployed on Vercel)
│   ├── public/             # Static assets, logos, icons, PWA manifest
│   ├── src/
│   │   ├── app/            # Customer, Delivery, and Admin UI pages
│   │   ├── components/     # React UI component library
│   │   ├── context/        # Client AuthContext & CartContext
│   │   └── lib/            # Shared API client & catalog loaders
│   ├── vercel.json         # Vercel project configuration
│   ├── .env.example        # Vercel environment variables template
│   └── package.json        # Frontend scripts and dependencies
│
└── backend/                # Next.js API & Business Logic Server (Deployed on Render)
    ├── prisma/             # Schema, migrations & seeds (PostgreSQL)
    ├── src/
    │   ├── app/api/        # Authoritative API endpoints (Auth, Orders, Payments, WhatsApp)
    │   ├── lib/            # Prisma, JWT, UPI QR, WhatsApp Cloud API, security
    │   └── middleware.ts   # Edge CORS, CSRF, and role-based access control
    ├── render.yaml         # Render blueprint configuration
    ├── .env.example        # Render environment variables template
    └── package.json        # Backend scripts, Prisma, and test suites
```

- **Frontend (Vercel)**: Dedicated client application. Zero direct database connections or private secrets. Communicates with the backend using the shared API client (`NEXT_PUBLIC_API_BASE_URL`) or automatic reverse-proxy rewrites (`/api/*`).
- **Backend (Render)**: Persistent Node.js API engine. Connects to Supabase PostgreSQL using Prisma 6. Executes all business logic, payment verifications, dynamic UPI QR generation, Meta WhatsApp Cloud API webhooks, and fleet delivery management.
- **Database (Supabase)**: PostgreSQL with Row Level Security (RLS) active on all tables.

---

## 🚀 Local Development

### 1. Run the Backend API Server
```bash
cd backend
npm install
npx prisma generate
npm run dev
# Backend starts on http://localhost:10000
```

### 2. Run the Frontend Application
```bash
cd frontend
npm install
npm run dev
# Frontend starts on http://localhost:3000
```

---

## ☁️ Production Deployment

### Step 1: Deploy Backend on Render
1. Create a new **Web Service** or **Blueprint** from the `backend/` directory.
2. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Health Check Path**: `/api/health`
3. Configure environment variables as detailed in `backend/.env.example` (`DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `UPI_*`, `WHATSAPP_*`).

### Step 2: Deploy Frontend on Vercel
1. Import repository on [vercel.com](https://vercel.com).
2. Settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend`
3. Configure environment variables as detailed in `frontend/.env.example`:
   - `NEXT_PUBLIC_API_BASE_URL`: `https://<your-backend>.onrender.com`
   - `RENDER_BACKEND_URL`: `https://<your-backend>.onrender.com`
   - `NEXT_PUBLIC_APP_URL`: `https://homemart4u.in`

---

## 🧪 Testing

Run backend tests:
```bash
cd backend
npm test
# 178 passing across 34 suites
```

Run frontend tests:
```bash
cd frontend
npm test
# 34 passing across 9 suites
```

