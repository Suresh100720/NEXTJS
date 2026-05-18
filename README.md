# 🚀 Recruitment CRM – AI Powered Next.js Platform

A modern full-stack Recruitment CRM built using **Next.js App Router**, **TypeScript**, **MongoDB**, and **AI-powered workflows**.

The platform provides:

* Candidate Management
* Job Management
* AI Resume Enrichment
* Real-time Dashboard Analytics
* Server-side Rendering
* Optimistic UI Updates
* Streaming AI Search Experience
* Modern Next.js Architecture

---

# ✨ Features

## 👥 Candidate Management

* Add, edit, delete candidates
* AI-powered CV enrichment
* Candidate filtering and search
* Resume parsing workflows

---

## 💼 Job Management

* Create and manage job postings
* Public job board
* Search and filtering system

---

## 📊 Dashboard Analytics

* Real-time recruitment metrics
* Interactive dashboard cards
* Dynamic statistics and insights

---

## 🤖 AI Features

* AI resume analysis
* Automatic skill extraction
* Candidate profile enhancement
* AI-powered search discovery
* Streaming AI-generated summaries

---

# ⚡ Advanced Next.js Concepts Used

## 🏛️ Routing & Rendering

* Next.js App Router
* Dynamic & Catch-All Routes
* Parallel & Intercepting Routes
* Modal Routing Pattern
* Server Components
* Client Components
* Async Server-side Data Fetching
* Partial Pre-rendering
* Streaming UI Rendering

---

## ⚡ Server Actions & Forms

* Server Actions
* Progressive Enhancement
* useFormStatus
* useFormState
* Optimistic UI
* useOptimistic

---

## 💾 Caching & Revalidation

* fetch() Caching
* force-cache
* no-store
* next.revalidate
* next.tags
* Cache Invalidation
* revalidatePath
* revalidateTag

---

## 🎨 Streaming & Suspense UI

* React Suspense
* Suspense Boundaries
* App Router Streaming
* loading.tsx
* Skeleton UI
* shadcn Skeleton Components

---

## 🤖 AI Integration

* Claude / Llama Resume Enrichment
* AI Candidate Analysis
* Streaming AI Search Summaries

---

# ✅ Implementation Highlights

* Secure server-side MongoDB fetching
* Async Server Components without useEffect
* Optimistic UI updates using useOptimistic
* Form loading and validation using useFormStatus & useFormState
* Cache invalidation using revalidatePath & revalidateTag
* Real-time fetching using cache: "no-store"
* Streaming AI-powered search summaries
* Suspense-based progressive rendering
* AI-powered CV enrichment workflows
* Intercepted modal routes preserving background state

---

# 📂 Project Structure

```bash
recruitment-app/
└── src/
    ├── app/
    │   ├── (app)/
    │   │   ├── @modal/
    │   │   │   └── (.)candidates/
    │   │   │       └── [id]/
    │   │   ├── candidates/
    │   │   │   └── [[...slug]]/
    │   │   ├── dashboard/
    │   │   ├── jobs/
    │   │   └── search/
    │   │       ├── [query]/
    │   │       └── [...query]/
    │   │
    │   └── api/
    │       ├── candidates/
    │       │   ├── bulk-delete/
    │       │   └── [id]/
    │       │       └── summary/
    │       ├── jobs/
    │       │   └── [id]/
    │       ├── search/
    │       │   └── summary/
    │       └── stats/
    │
    ├── components/
    │   ├── dashboard/
    │   └── ui/
    │
    ├── lib/
    │
    ├── models/
    │
    └── types/

```

---

# 🛠️ Tech Stack

## Frontend

* Next.js 14
* React 18
* TypeScript
* Tailwind CSS
* shadcn/ui

---

## Backend

* Node.js
* MongoDB
* Mongoose
* Server Actions

---

## AI Integration

* Claude / Llama Models
* Resume Parsing
* AI Candidate Enrichment
* Streaming AI Summaries

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
AI_API_KEY=your_ai_key
```

---

## Run Development Server

```bash
npm run dev
```

---

# 🌐 Application Flow

```txt
User Action
    ↓
Server Action
    ↓
Database Update
    ↓
AI Processing
    ↓
Cache Revalidation
    ↓
Streaming UI Update
    ↓
Optimistic UI Rendering
```

---

# 🚀 Key Highlights

✅ Full-stack Next.js App Router architecture

✅ AI-powered recruitment workflows

✅ Server-first rendering strategy

✅ Streaming AI search experience

✅ Suspense-based progressive rendering

✅ Real-time cache management

✅ Optimistic user experience

✅ Modern scalable folder structure

✅ Production-ready architecture

---

# 👨‍💻 Author

Suresh

---

# 📄 License

MIT License
