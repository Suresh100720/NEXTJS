# Recruitment App - Project Structure & Architecture Guide

Welcome to your modernized Recruitment Platform! This document provides a clear explanation of how the project is organized and how the full-stack logic works.

---

## 📂 Folder Structure Overview

### 1. `src/app/` (The Routing Engine)
This project uses the **Next.js App Router**. Folders in this directory automatically define your URL paths.
- **`(app)/`**: A "Route Group". The parenthesis mean it doesn't show up in the URL. It's used to wrap all main pages in a shared layout (the `Shell.tsx`).
- **`api/`**: **Your Backend**. Instead of a separate server, your API logic (connecting to MongoDB, calling AI) lives here. 
  - Example: `GET /api/stats` calls the code in `src/app/api/stats/route.ts`.
- **`@modal/`**: A "Parallel Route". This allows the "Candidate Detail" modal to appear *on top* of the current page without changing the background state.

### 2. `src/components/` (The UI Library)
Contains all reusable React components.
- **`dashboard/`**: Specialized components like `StatCards` and `ApplicationsChart`.
- **`ui/`**: Basic building blocks like `Button.tsx` and `Input.tsx`.
- **`Shell.tsx`**: The main layout component containing your sticky sidebar and header.

### 3. `src/lib/` (The Utilities)
- **`db.ts`**: Handles the connection to your MongoDB database using a singleton pattern (prevents too many connections during development).
- **`api.ts`**: A centralized service for the frontend to call the internal API. It uses `BASE_URL = /api`.

### 4. `src/models/` (The Database Schema)
Defines what your data looks like in MongoDB.
- **`Job.ts`**: Schema for recruitment listings.
- **`Candidate.ts`**: Schema for applicant profiles, including their AI-generated summaries.

### 5. `src/types/` (Type Safety)
Contains TypeScript interfaces (`index.ts`) to ensure that both your frontend and backend are speaking the same language.

---

## 🔄 How the Data Flows

### When you click "Candidates":
1.  Next.js loads `src/app/(app)/candidates/page.tsx`.
2.  The **Server Component** calls `getCandidates()` from `src/lib/api.ts`.
3.  The API utility hits your internal route at `/api/candidates`.
4.  The code in `src/app/api/candidates/route.ts` connects to **MongoDB** via `src/lib/db.ts`, fetches the data using the `Candidate` model, and returns it as JSON.
5.  The data is passed to the **Client Component** (`CandidatesClient.tsx`) to be rendered in the table.

### When an AI Summary is generated:
1.  The profile modal calls `/api/candidates/[id]/summary`.
2.  The backend route handler retrieves the candidate from MongoDB.
3.  It sends a prompt to the **Groq SDK** using your `GROQ_API_KEY`.
4.  The AI returns a professional summary, which is sent back to the modal UI.

---

## 🛠️ Key Technologies Used
- **Frontend**: Next.js 14, Tailwind CSS, Lucide React (Icons).
- **Backend**: Next.js Route Handlers (Internal API).
- **Database**: MongoDB & Mongoose.
- **AI**: Groq SDK (Llama 3.1 Model).
