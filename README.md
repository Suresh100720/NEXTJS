# 🚀 Recruitment CRM – AI Powered Next.js Platform

A modern full-stack Recruitment CRM built using **Next.js App Router**, **TypeScript**, **MongoDB**, and **AI-powered workflows**.

The platform provides:

* Candidate Management
* Job Management
* AI Resume Enrichment
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

---

# ⚡ Advanced Next.js Concepts Used

* Next.js App Router
* Dynamic & Catch-All Routes
* Parallel & Intercepting Routes
* Modal Routing Pattern
* Server Components
* Client Components
* Server Actions
* Async Server-side Data Fetching
* Optimistic UI
* Cache Revalidation
* Progressive Enhancement
* AI Server-side Processing

---

# ✅ Implementation Highlights

* Secure server-side MongoDB fetching
* Async Server Components without useEffect
* Optimistic UI updates using useOptimistic
* Form loading and validation using useFormStatus & useFormState
* Cache invalidation using revalidatePath & revalidateTag
* Real-time fetching using cache: "no-store"
* AI-powered CV enrichment workflows
* Intercepted modal routes preserving background state

---

# 📂 Project Structure

```bash
recruitment-app/
├── src/
│   ├── app/
│   │   ├── (app)/
│   │   │   ├── @modal/
│   │   │   ├── candidates/
│   │   │   ├── dashboard/
│   │   │   ├── docs/
│   │   │   ├── jobs/
│   │   │   ├── search/
│   │   │   ├── layout.tsx
│   │   │   └── loading.tsx
│   │   ├── api/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   ├── CandidateForm.tsx
│   │   ├── JobForm.tsx
│   │   └── Shell.tsx
│   │
│   ├── lib/
│   │   ├── actions.ts
│   │   ├── api.ts
│   │   └── db.ts
│   │
│   ├── models/
│   │   ├── Candidate.ts
│   │   └── Job.ts
│   │
│   └── types/
│       └── index.ts
│
├── public/
├── .env
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

---

# 🛠️ Tech Stack

## Frontend

* Next.js 14
* React 18
* TypeScript
* Tailwind CSS

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
Optimistic UI Update
```

---

# 🚀 Key Highlights

✅ Full-stack Next.js App Router architecture

✅ AI-powered recruitment workflows

✅ Server-first rendering strategy

✅ Optimistic user experience

✅ Real-time cache management

✅ Modern scalable folder structure

✅ Production-ready architecture

---

# 👨‍💻 Author

Suresh 

---

# 📄 License

MIT License
