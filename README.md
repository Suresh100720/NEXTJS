# 🚀 Recruitment CRM – AI Powered Next.js Platform

A modern full-stack Recruitment CRM built using **Next.js App Router**, **TypeScript**, **MongoDB**, **TanStack Query**, and **AI-powered workflows**.

The platform provides:

* Candidate Management
* Job Management
* AI Resume Enrichment
* Streaming AI Search
* Real-time Dashboard Analytics
* Server-side Rendering
* Optimistic UI Updates
* Modern Next.js Architecture

---

# ✨ Features

## 👥 Candidate Management

* Add, edit, delete candidates
* AI-powered CV enrichment
* Candidate filtering and search
* Resume parsing workflows
* Protected dashboard access

---

## 💼 Job Management

* Public SEO-optimized job board
* Dynamic job pages
* Search and filtering system
* Dynamic OpenGraph metadata

---

## 📊 Dashboard Analytics

* Real-time recruitment metrics
* Interactive dashboard cards
* Dynamic statistics and insights
* Secure authenticated dashboards

---

## 🤖 AI Features

* AI resume analysis
* Automatic skill extraction
* Candidate profile enhancement
* Claude-powered streaming chat
* AI-powered search discovery
* Streaming AI summaries

---

# ⚡ Advanced Next.js Concepts Implemented

## 🏛️ Rendering Strategies

* SSR (Server-Side Rendering)
* SSG (Static Site Generation)
* ISR (Incremental Static Regeneration)
* Dynamic Rendering
* Partial Pre-rendering
* Streaming UI Rendering

---

## 🌐 Routing & Navigation

* Next.js App Router
* Dynamic Routes
* Catch-All Routes
* Parallel Routes
* Intercepting Routes
* Modal Routing Pattern

---

## ⚡ Data Fetching & Caching

* fetch() caching
* force-cache
* no-store
* next.revalidate
* next.tags
* Cache Invalidation
* revalidatePath
* revalidateTag
* Route Segment Config
* dynamic
* fetchCache
* runtime

---

## 🔐 Authentication & Middleware

* Auth.js (NextAuth v5)
* Credentials Authentication
* Google OAuth Login
* Middleware Route Protection
* Request Rewriting
* Redirect Handling
* Matcher Patterns
* Protected Dashboard Routes
* Server-side Sessions

---

## 🧠 AI SDK & Streaming

* Vercel AI SDK
* useChat
* useCompletion
* Streaming UI
* AI Tool Calling
* Elasticsearch Tool Calls
* MongoDB Tool Calls
* Claude Streaming API

---

## ⚛️ React Streaming & Suspense

* React Suspense
* Suspense Boundaries
* loading.tsx
* Skeleton UI
* shadcn Skeleton Components
* App Router Streaming

---

## 🚀 TanStack Query

* Queries
* Mutations
* Query Invalidation
* Optimistic Updates
* Hydration
* Prefetching
* Dehydration

---

## 🎨 Performance Optimization

* next/image
* next/font
* Lazy Loading
* Core Web Vitals
* LCP Optimization
* INP Optimization
* CLS Prevention
* React Profiler
* Lighthouse Auditing
* Bundle Analysis

---

## 🌍 SEO & Metadata

* Metadata API
* Dynamic Metadata
* OpenGraph Images
* sitemap.ts
* robots.ts
* Dynamic SEO Metadata

---

# ✅ Implementation Highlights

* Secure server-side MongoDB fetching
* Async Server Components without useEffect
* Streaming AI search results with Suspense
* Optimistic UI updates using useOptimistic
* Form loading and validation using useFormStatus & useFormState
* Protected dashboard routes using middleware and sessions
* Cache invalidation using revalidatePath & revalidateTag
* Real-time fetching using cache: "no-store"
* Public Job Board using SSG + ISR
* Dynamic private dashboards using SSR
* AI-powered CV enrichment workflows
* Streaming Claude AI chat endpoint
* Suspense-based progressive rendering
* Dynamic OpenGraph images per job
* Image optimization and font subsetting

---

# 📂 Project Structure

```bash
recruitment-app/
├── public/                 # Static assets (images, icons)
├── src/                    # Main Source Code
│   ├── app/                # App Router (Pages, Layouts & Route Handlers)
│   │   ├── (app)/          # Core Recruiter Dashboard Page Group
│   │   ├── api/            # API Route Endpoints (Server-Side Logic)
│   │   ├── login/          # User Login page
│   │   ├── register/       # User Registration page
│   │   └── layout.tsx      # Main application layout, styles & providers
│   ├── components/         # Reusable UI Components
│   ├── lib/                # Shared libraries (DB connect, API clients)
│   ├── models/             # Mongoose schemas (MongoDB Models)
│   └── types/              # Global TypeScript declarations
├── next.config.mjs         # Next.js configurations & Bundle Analyzer
├── package.json            # Node.js dependencies & scripts
├── seed.js                 # Local MongoDB database seeder script
└── tsconfig.json           # TypeScript configuration
---

# 🛠️ Tech Stack

## Frontend

* Next.js 14
* React 18
* TypeScript
* Tailwind CSS
* shadcn/ui
* TanStack Query

---

## Backend

* Node.js
* MongoDB
* Mongoose
* Server Actions
* Route Handlers

---

## Authentication

* Auth.js (NextAuth v5)
* Credentials Provider
* Google OAuth

---

## AI Integration

* Claude AI
* Vercel AI SDK
* Elasticsearch
* Resume Parsing
* AI Candidate Enrichment

---

# ⚙️ Setup Instructions

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create `.env` file:

```env
MONGODB_URI=your_mongodb_url
AUTH_SECRET=your_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
AI_API_KEY=your_ai_key
```

---

## Run Development Server

```bash
npm run dev
```

---

# 🌐 Application Architecture Flow

```txt
User Action
    ↓
Middleware Authentication
    ↓
Server Actions / Route Handlers
    ↓
MongoDB / Elasticsearch
    ↓
Claude AI Processing
    ↓
Cache Revalidation
    ↓
Streaming UI Rendering
    ↓
Optimistic Client Updates
```

---

# 🚀 Key Highlights

✅ Full-stack Next.js App Router architecture

✅ AI-powered recruitment workflows

✅ Streaming AI chat and search experience

✅ Suspense-based progressive rendering

✅ Protected dashboard authentication

✅ Real-time cache management

✅ SEO-optimized public job board

✅ Optimistic user experience

✅ Production-ready scalable architecture

---

# 👨‍💻 Author

Suresh

---

# 📄 License

MIT License
