# 🚀 Recruitment CRM – AI Powered Next.js Platform

A modern full-stack Recruitment CRM built using **Next.js App Router**, **TypeScript**, **MongoDB**, **TanStack Query**, and **AI-powered workflows**.

The platform provides:

* Candidate Management
* Job Management
* AI Resume Enrichment
* Streaming AI Search
* Real-time Dashboard Analytics
* Optimistic UI Updates
* Secure Authentication
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

## 🏛️ Rendering & Routing

* SSR (Server-Side Rendering)
* SSG (Static Site Generation)
* ISR (Incremental Static Regeneration)
* Dynamic Rendering
* Partial Pre-rendering
* Streaming UI Rendering
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
* Google OAuth
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

## 🧪 Testing & Monitoring

* Vitest
* React Testing Library
* Mocking Server Actions
* Playwright E2E Testing
* Sentry Error Tracking
* AI Usage Logging
* Token Usage Monitoring
* Latency Tracking

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
* Form validation using useFormStatus & useFormState
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
* End-to-end testing with Playwright
* Error tracking and AI monitoring with Sentry

---

# 📂 Project Structure

```bash
recruitment-app/
├── playwright/                   # Playwright E2E Test Suite
│   └── e2e/
│       └── workflow.spec.ts      # End-to-end user workflow tests
├── public/                       # Static public assets (SVGs, logos, images)
│   └── hero-illustration.svg
├── src/                          # Application Source Code
│   ├── app/                      # Next.js App Router Structure
│   │   ├── (app)/                # Private Route Group (Authed Recruiter Shell)
│   │   │   ├── @modal/           # Parallel routes for dynamic modal overlays
│   │   │   ├── ai-performance/   # AI Telemetry logs & Sentry testing dashboard
│   │   │   ├── assistant/        # Copilot AI Recruiter Chatbot interface
│   │   │   ├── candidates/       # Candidate profiles & CV manual/AI form uploads
│   │   │   ├── chat/             # Dual-viewport mobile & desktop recruiter chats
│   │   │   ├── dashboard/        # Recruiter performance metrics & overview
│   │   │   ├── jobs/             # Job posting, generation, and details
│   │   │   ├── search/           # Global AI-driven semantic candidate search
│   │   │   ├── layout.tsx
│   │   │   └── loading.tsx
│   │   ├── api/                  # Backend REST API Endpoints (Auth, AI Loggers)
│   │   │   ├── assistant/
│   │   │   ├── auth/             # NextAuth routing handlers
│   │   │   ├── chat/
│   │   │   ├── completion/
│   │   │   └── search/
│   │   ├── login/                # Authentication Sign-In page
│   │   ├── register/             # Account Registration page
│   │   ├── globals.css           # Global CSS & Tailwind rules
│   │   ├── layout.tsx            # Global HTML shell wrapper
│   │   └── page.tsx              # Welcome Landing page
│   ├── components/               # Reusable React UI Components
│   │   ├── __tests__/            # React Testing Library unit tests (Vitest)
│   │   │   └── CandidateForm.test.tsx
│   │   ├── ui/                   # Generic primitives (Buttons, Inputs, Modals)
│   │   ├── CandidateForm.tsx
│   │   ├── JobForm.tsx
│   │   └── Shell.tsx             # Shared global responsive layout shell
│   ├── lib/                      # Core Utility Functions & Helpers
│   │   ├── actions.ts            # Next.js Server Actions (with Sentry capturing)
│   │   ├── aiLogger.ts           # Centralized DB logging for LLM performance
│   │   ├── api.ts                # Client API wrappers
│   │   ├── db.ts                 # Mongoose/MongoDB connection wrapper
│   │   └── firebase.ts           # Client-side Firebase init
│   ├── models/                   # MongoDB Database Schemas
│   │   ├── AiLog.ts              # Schema for tracking prompt, model & latency
│   │   ├── Candidate.ts          # Schema for candidates and resume data
│   │   └── Job.ts                # Schema for job postings
│   ├── auth.ts                   # NextAuth core configuration
│   ├── auth.config.ts            # Middleware authentication rules
│   ├── middleware.ts             # Route-guard middleware (protects shell)
│   └── instrumentation.ts        # Next.js startup hook (registers Sentry configs)
├── .env                          # Local Environment Variables & API Keys
├── next.config.mjs               # Next.js global configuration & Sentry wrappers
├── sentry.client.config.ts       # Sentry Web Client configurations
├── sentry.server.config.ts       # Sentry Node.js Server configurations
├── sentry.edge.config.ts         # Sentry Edge Runtime configurations
├── vitest.config.ts              # Vitest Runner configurations
├── playwright.config.ts          # Playwright Test runner configurations
└── package.json                  # Dependencies, scripts, and package manifests

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

# 🧪 Testing & Monitoring

* Vitest
* React Testing Library
* Playwright
* Sentry
* AI Usage Monitoring

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
