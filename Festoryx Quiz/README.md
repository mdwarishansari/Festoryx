# Festoryx Quiz — Live Competition Arena

> Real-Time Quiz Tournament Engine & Live Lobby Management microservice under the Festoryx platform.

Developed by <a href="https://github.com/mdwarishansari"><strong>@mdwarishansari</strong></a> 🧑‍💻

---

## 🌟 Introduction

**Festoryx Quiz Arena** is a real-time event competition manager built specifically for live auditorium tournaments. Scoped to events under organization tenants, it allows hosts to control play flow, calculate live scoring, and coordinate millisecond-precision buzzers.

---

## 🚀 Key Features

### 🎮 Three Standardized Competition Rounds
1. **Buzzer Round:** Lock and unlock buzzers. Displays a real-time queue of players who buzzed with millisecond precision to find the fastest responder.
2. **Simultaneous Answer Round:** Hosts open a 20-second timer. All participants submit responses simultaneously, and the host reveals correct answers and scores.
3. **Pass Round:** Questions are directed to specific teams. Correct responses score points; incorrect ones allow passing to the next team in line.

### 🛡️ Live Sessions & Control Panel
- Spawn new live lobbies from published templates.
- Complete session management: push questions, trigger timers, accept/reject buzzers, pass questions, and evaluate scores live.
- Central **Projector Display** layout displaying active questions, connection instructions, live scores, and visual alerts for buzzer hits.
- Dynamic question importer supporting CSV/JSON bulk formats.
- **Clerk Protection:** Hosts and admins authenticate using Clerk.

---

## 🛠️ Tech Stack

- **Frontend Client:** Next.js 16 (App Router, Server Actions, React 19)
- **Realtime Server:** Node.js Socket.IO server (compiles TypeScript to JS)
- **Database Access:** Prisma ORM with PG Pool adapter
- **Database Engine:** PostgreSQL (shared instance with Festoryx Web)
- **Realtime Transport:** WebSockets (Socket.IO client & server)

---

## 📦 Getting Started

### 1. Project Directory Structure
```text
Festoryx Quiz/
├── socket-server/          # Real-time WebSocket server
│   ├── Dockerfile          # Production Docker runner config
│   ├── index.ts            # Server entry point and Socket handlers
│   └── tsconfig.json
├── prisma/                 # Shared database schema definitions
└── src/                    # Next.js 16 frontend and admin portal
```

### 2. Environment Variables
Create a `.env` file inside the `Festoryx Quiz/` folder:
```env
# ─── Database ───
DATABASE_URL="postgresql://postgres:password@localhost:5432/festoryx"
DIRECT_URL="postgresql://postgres:password@localhost:5432/festoryx"

# ─── App URLs ───
NEXT_PUBLIC_SITE_URL="http://localhost:3002"
NEXT_PUBLIC_FESTORYX_URL="http://localhost:3000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"

# ─── Clerk Authentication ───
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/admin/login"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/admin/login"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/admin"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/admin"

# ─── Session Secret ───
SESSION_SECRET="replace-with-a-32-character-session-secret"
```

### 3. Running the App Locally

First, start the Socket.IO server:
```bash
cd socket-server
npm install
npm run start
```
Starts on `http://localhost:3001`.

Then, launch the Next.js frontend in the `Festoryx Quiz` root directory:
```bash
# In the parent "Festoryx Quiz" folder
npm install
npm run dev
```
Starts on `http://localhost:3002`.

---

## 🐳 Production Deployment (Render Docker)

The Socket.IO server is fully containerized. To build and run using Docker:
```bash
docker build -f socket-server/Dockerfile -t festoryx-quiz-socket .
docker run -p 3001:3001 --env-file .env festoryx-quiz-socket
```
