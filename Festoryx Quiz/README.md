# Festoryx Quiz — Live Arena & Real-Time Competition Suite

> A millisecond-precision real-time quiz tournament engine, live lobby controller, and big-screen projector system powered by Next.js 16 and a high-performance Socket.IO Node.js relay server.

Developed by **[mdwarishansari](https://github.com/mdwarishansari/)** 🧑‍💻

---

## 🌟 Introduction & Live Tournament Overview

The **Festoryx Quiz Arena** is a specialized real-time microservice built to manage live, interactive quiz tournaments in auditoriums, halls, or online events. Operating as a component of the multi-tenant Festoryx platform, it allows verified organizers to spawn live game sessions from custom templates, sync participants on their mobile devices, and output beautiful layout views to auditorium projectors.

---

## 🚀 Key Features & Gameplay Modes

### 1. 🎮 Three Standardized Competition Rounds
* **Buzzer Round**: Lock and unlock buzzer networks globally. Real-time participant interaction capture with millisecond-precision timestamp queuing. Allows hosts to see exactly who clicked first and accept or reject their answer.
* **Simultaneous Answer Round**: Launches a shared 20-second timer across all connected players. Participants select MCQs concurrently on their devices. Correct options and live leaderboards are displayed on the projector screen at the end of the round.
* **Pass Round**: Hosts direct questions to specific teams in a turn-based system. Teams can choose to answer or pass, with points shifting dynamically down the pass queue.

### 2. 📺 Multi-Screen State Coordination
* **Participant Controller (`/lobby`, `/quiz`)**: A responsive mobile-first UI for players to join wait rooms, buzz in, and submit answers.
* **Projector View (`/screen`)**: A gorgeous, large-screen UI meant for auditorium projectors. Renders active questions, connection guidelines, active buzzer notifications, countdown timers, and live leaderboard summaries.
* **Admin Dashboard (`/admin`)**: A comprehensive command console for host controllers to drive the session. Features include spawning questions, triggering timers, manually scoring teams, passing questions, and overriding states.

### 3. 📥 Question Importer
* Bulk-import questions from CSV/JSON templates into the database to quickly construct custom lobbies.

---

## 🏗️ Real-Time WebSocket Architecture

Festoryx Quiz uses a hub-and-spoke socket topology to maintain synchronization between multiple clients with sub-50ms latency:

```text
               ┌───────────────────────┐
               │    Next.js Admin      │
               │   (Host Controller)   │
               └───────────┬───────────┘
                           │ WS Events
                           ▼
  ┌──────────────────────────────────────────────────┐
  │       Render Docker Socket.IO Server            │
  │     - Coordinates Game Lobby Rooms               │
  │     - Evaluates Millisecond Buzzer Latency       │
  │     - Relays Real-Time Scoring Broadcasts        │
  └───────────┬──────────────────────────┬───────────┘
              │                          │
              │ WS Events                │ WS Events
              ▼                          ▼
  ┌───────────────────────┐  ┌───────────────────────┐
  │  Auditorium Projector │  │ Participant Mobile    │
  │    (/screen Layout)   │  │   (/quiz Viewport)    │
  └───────────────────────┘  └───────────────────────┘
```

The WebSocket server maintains local in-memory states of rooms, active question pointers, and buzzer timing arrays, while persisting final session records and team scores to PostgreSQL via Prisma.

---

## 📂 Project Structure

```text
Festoryx Quiz/
├── prisma/                 # Database schema models and migrations
├── socket-server/          # Standalone WebSocket Relay
│   ├── Dockerfile          # Multi-stage production container configuration
│   ├── index.ts            # Entry point containing Socket.IO handlers
│   ├── package.json        # Service-specific dependencies
│   └── tsconfig.json       # TypeScript compiler settings
│
├── src/                    # Next.js 16 Client Portal
│   ├── actions/            # Server actions managing session configurations
│   ├── app/                # App Router pages and screens
│   ├── components/         # Game components (Buzzer buttons, Projector panels)
│   └── lib/                # Shared utilities and prisma client instance
│
├── package.json            # Client dependencies and local workspace scripts
└── README.md               # This documentation file
```

---

## 🔌 Environment Variables

Create a `.env` file in the root of `Festoryx Quiz/` using the following:

| Variable | Scope | Description |
|---|---|---|
| `DATABASE_URL` | Prisma | PostgreSQL database connection string (shared with Festoryx Web) |
| `DIRECT_URL` | Prisma | PostgreSQL direct connection string bypassing pools for migrations |
| `NEXT_PUBLIC_SITE_URL` | Routing | Base URL of this Quiz Next.js frontend (Port 3002) |
| `NEXT_PUBLIC_FESTORYX_URL`| Routing | URL of the main Festoryx Web SaaS application (Port 3000) |
| `NEXT_PUBLIC_SOCKET_URL` | Socket | Endpoint of the WebSocket server (Port 3001) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Auth | Clerk public API key (must share same Clerk app credentials as Web) |
| `CLERK_SECRET_KEY` | Auth | Clerk private backend secret |
| `SUPER_ADMIN_EMAIL` | Security | Admin credentials matching the Web platform configuration |
| `SESSION_SECRET` | Crypto | 32-character encryption key for session cookies |

---

## 🚀 Local Installation & Run Guide

### 1. Boot up the WebSocket Server (Port 3001)
```bash
cd socket-server
npm install
npm run dev
```

### 2. Boot up the Quiz Client (Port 3002)
```bash
# In the "Festoryx Quiz" parent directory
npm install
npm run dev
```
Open [http://localhost:3002](http://localhost:3002) in your browser.

---

## 🐳 Production Containerization (Docker)

The Socket.IO server is fully containerized using a multi-stage Docker configuration to optimize production performance and size.

### Build the Image
```bash
docker build -f socket-server/Dockerfile -t festoryx-quiz-socket .
```

### Run the Container
```bash
docker run -p 3001:3001 --env-file .env festoryx-quiz-socket
```
This maps the socket instance to port 3001, loading environment variables to ensure appropriate CORS validations.
