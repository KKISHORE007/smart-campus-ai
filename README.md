# 🎓 Focused Student Helpdesk Agent — MERN Stack AI Companion

**Project Serial No:** 12  
**Exact Use Case:** *"Answers academic and administrative queries"*  
**Development Methodology:** The Antigravity Method (Iterative, modular, high-signal, zero token waste)  
**Tech Stack:** MERN Stack — **MongoDB, Express.js, React.js (Vite), Node.js** + **OpenAI GPT-4o-Mini RAG**

---

## 🌟 Executive Summary & Architectural Overhaul

Originally conceptualized as a multi-agent Python/FastAPI application, this system has undergone an architectural transformation into a **focused, single-purpose RAG (Retrieval-Augmented Generation) Helpdesk Agent** built entirely on the modern **MERN Stack**. 

The agent serves as a 24/7 digital campus companion that answers academic (syllabus, grading, timetable, exams, attendance) and administrative (fees, certificates, library, hostel, rules) queries with 100% policy accuracy, source citations, and intelligent offline database fallback capabilities.

---

## 🏗️ Technical Architecture & RAG Pipeline

```
┌────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER (React + Vite)                     │
│  - Premium Dark Glassmorphism UI (Inter Font, Gradient Bubbles)        │
│  - Real-time Markdown Rendering & Animated Typing Indicator            │
│  - Expandable RAG Policy Citations & Smart Follow-up Query Chips      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP REST / Axios Proxy (Port 5173 -> 5000)
┌───────────────────────────────────▼────────────────────────────────────┐
│                  BACKEND API LAYER (Node.js + Express)                 │
│  - /api/chat : RAG Query Processing & Session Continuity               │
│  - /api/students : Student Profile Management & Personalization        │
│  - /api/system : Health Check, Analytics & Manual Seeding              │
│  - Custom AppError Handling & Winston Colorized Logging Layer          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Mongoose ORM & OpenAI API
┌───────────────────────────────────▼────────────────────────────────────┐
│             DATA & AI INTELLIGENCE LAYER (MongoDB + RAG)               │
│  - KnowledgeDoc Schema: 15+ Rich College Policy Documents & Chunks     │
│  - Conversation Schema: Persistent Session Memory with Auto-Titling    │
│  - Student Schema: Department/Year Context Injection                   │
│  - RAG Service: OpenAI Embeddings + Cosine Sim OR Offline Keyword Fallback │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features & Capabilities

1. **Academic Query Specialist**: Detailed guidance on B.Tech syllabus, credit structures, 10-point grading systems (CGPA/SGPA calculation), examination rules, attendance requirements (75% mandatory rule), and library privileges.
2. **Administrative Policy Guide**: Transparent fee structures, payment deadlines, late fine rules, hostel curfew timings, guest policies, anti-ragging reporting mechanisms, and 8-department No Dues digital clearance for Transfer Certificates (TC).
3. **Dual-Mode AI Intelligence**:
   - **Online Mode**: Uses OpenAI `gpt-4o-mini` with `text-embedding-3-small` vector embeddings for semantic similarity search.
   - **Offline Fallback Mode**: Automatically switches to an intelligent offline keyword/vector database matching algorithm if API keys are absent or network fails — guaranteeing zero downtime.
4. **Transparent Citations**: Every response generated lists the exact official college policy document or handbook section used as evidence.
5. **Smart Follow-Up Chips**: Generates context-aware follow-up question buttons after every turn to guide students through complex multi-step procedures.
6. **Premium UI/UX Design**: Built with vanilla CSS variables featuring dark glassmorphism cards, glowing gradient borders, responsive sidebar drawers, and custom scrollbars.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** v18.0.0 or higher
- **MongoDB** v6.0 or higher (running locally on port `27017` or MongoDB Atlas connection string)
- **OpenAI API Key** *(Optional — App works in Offline Mock Mode without it)*

### 1. Installation
Clone the repository and install dependencies for both server and client:
```powershell
# Install root, backend, and frontend packages simultaneously
npm run install:all
```

### 2. Environment Setup
Configure the backend environment variables:
```powershell
# Copy the example environment file in server/
Copy-Item server/.env.example server/.env
```
Open `server/.env` and insert your OpenAI API key (if available):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/student_helpdesk
OPENAI_API_KEY=sk-your-openai-api-key-here
CLIENT_URL=http://localhost:5173
```

### 3. Seed Sample College Knowledge Base
Populate MongoDB with 15+ official college policy documents and a demo student profile (`Arjun Sharma | STU-2024-001`):
```powershell
npm run seed
# Or force overwrite: node server/src/scripts/seed.js --force
```

### 4. Run Development Servers Concurrently
Launch both the Express backend server (Port `5000`) and the Vite React frontend (Port `5173`):
```powershell
npm run dev
```
Open your browser and navigate to: **`http://localhost:5173`**

---

## 📂 Project Directory Structure

```text
smart_campus_ai/
├── package.json                 # Root script runner (concurrently)
├── README.md                    # System documentation
├── server/                      # Node.js + Express Backend
│   ├── package.json             # Backend dependencies
│   ├── .env.example             # Environment configuration template
│   ├── src/
│   │   ├── index.js             # Express entry point & auto-seeder
│   │   ├── config/db.js         # Mongoose connection with retry logic
│   │   ├── models/
│   │   │   ├── Student.js       # Student profile & context methods
│   │   │   ├── Conversation.js  # Chat session & message subdocuments
│   │   │   └── KnowledgeDoc.js  # RAG document & text chunk schema
│   │   ├── services/
│   │   │   ├── ragService.js    # Embeddings, chunking & cosine similarity
│   │   │   ├── helpdeskAgent.js # Core AI prompt, OpenAI & offline fallback
│   │   │   └── seedService.js   # 15+ realistic college policy documents
│   │   ├── routes/
│   │   │   ├── chatRoutes.js    # POST /api/chat, GET /api/chat/history
│   │   │   ├── studentRoutes.js # POST /api/students, GET /api/students
│   │   │   └── systemRoutes.js  # GET /api/system/health, stats, seed
│   │   ├── middleware/
│   │   │   └── errorHandler.js  # AppError & global async error trapper
│   │   ├── utils/
│   │   │   └── logger.js        # Winston colorized console & file logger
│   │   └── scripts/
│   │       └── seed.js          # Standalone CLI seeder
│   └── logs/                    # Automated Winston log files
└── client/                      # React + Vite Frontend
    ├── package.json             # Frontend dependencies
    ├── vite.config.js           # Vite config with API proxy
    ├── index.html               # HTML root with Inter typography
    └── src/
        ├── main.jsx             # React Router DOM entry point
        ├── App.jsx              # Main layout wrapper
        ├── pages/
        │   ├── Chat.jsx         # Helpdesk Chat interface & state
        │   └── About.jsx        # Architecture & features landing page
        ├── components/
        │   ├── Header.jsx       # Glassmorphism navbar & status badge
        │   ├── Sidebar.jsx      # Student ID & 6 FAQ quick shortcuts
        │   ├── ChatMessage.jsx  # Markdown bubbles & source citations
        │   └── TypingIndicator.jsx # Animated bouncing dots
        ├── services/
        │   └── api.js           # Axios REST client wrapper
        └── styles/
            └── index.css        # Premium dark glassmorphism stylesheet
```

---

## 🧪 Testing Sample Queries

Try asking the agent the following queries in the React UI to verify its domain expertise:

| Category | Example Query | Expected Policy Citation |
|---|---|---|
| **Fee Structure** | *"What is the complete fee breakdown for B.Tech and what is the late fine?"* | Comprehensive Fee Structure & Payment Deadlines |
| **Attendance** | *"What happens if my attendance is 68% due to dengue hospitalization?"* | Mandatory Attendance Policy & Shortage Condonation Rules |
| **Grading & CGPA** | *"How is CGPA converted to percentage for campus placements?"* | Examination Rules, Grading System & CGPA Calculation |
| **Library Rules** | *"How many books can I issue and what is the overdue fine?"* | Central Library Rules, Timings, Book Issuance & Fine Policy |
| **Certificates** | *"What is the step-by-step procedure to get my Transfer Certificate?"* | Transfer Certificate (TC), Migration Certificate & Bonafide |
| **Hostel & Mess** | *"What are the hostel curfew timings and guest rules?"* | Hostel Rules, Curfew Timings & Room Allocation Guidelines |
| **Anti-Ragging** | *"What is the punishment for ragging and what is the 24x7 helpline?"* | Zero-Tolerance Anti-Ragging Policy & Reporting Mechanism |
| **Placements** | *"What is the CGPA cutoff for major IT companies and what is the job policy?"* | Training & Placement Cell Guidelines & Internship Policy |

---

## 🛡️ Production Deployment Checklist

1. **Environment Protection**: Ensure `NODE_ENV=production` in server environment variables.
2. **Database Security**: Connect to an authenticated MongoDB Atlas cluster using SSL/TLS.
3. **Vector Search Indexing**: If deploying on MongoDB Atlas, create an Atlas Vector Search index on `chunks.embedding` for sub-millisecond similarity queries.
4. **Rate Limiting**: Enabled via `express-rate-limit` on `/api/chat` endpoints to prevent API abuse.
5. **Static Bundle Serving**: In production, build the Vite React app (`npm run build`) and serve the static files from `client/dist` directly through Express using `express.static`.
6. **Logging & Monitoring**: Winston file logs (`logs/app.log` and `logs/error.log`) should be monitored using Datadog, PM2, or AWS CloudWatch.

---

*Built with precision using the Antigravity Method.*
