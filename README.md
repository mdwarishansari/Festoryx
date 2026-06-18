# Festoryx Monorepo

> The Event Operating System for colleges, clubs, communities, companies, and startup organizers.

Festoryx is a multi-tenant event management SaaS platform with integrated real-time interactive quiz tournaments, dynamic registration forms, QR-code payment verification, and time-locked problem statements.

---

## 📂 Monorepo Structure

```text
Festoryx (Repository Root)
├── Festoryx Web/               # Main SaaS Platform (Next.js 16)
│   ├── src/                    # Web frontend, dashboard and actions
│   └── README.md               # Main platform-specific documentation
│
└── Festoryx Quiz/              # Live Competition Suite (Quiz Arena)
    ├── src/                    # Quiz Arena game views (Next.js 16)
    ├── socket-server/          # Live real-time WebSocket server (Node.js & Socket.IO)
    └── README.md               # Quiz Arena-specific documentation
```

---

## 🌐 Ports & Services

When running locally, the platform uses the following default ports:

| Service | Port | Directory | Description |
|---------|------|-----------|-------------|
| **Festoryx Web** | `3000` | `Festoryx Web/` | Main website, public event marketplace, and organizer dashboards |
| **Socket Server** | `3001` | `Festoryx Quiz/socket-server/` | Real-time WebSocket connection hub for Quiz Arena sessions |
| **Festoryx Quiz** | `3002` | `Festoryx Quiz/` | Quiz Arena participant lobbies, projector screens, and host hosts controls |

---

## 🏗️ Multi-Tenant Architecture & Roles

Festoryx operates on a multi-tenant database model scoped by `Organization` and Clerk authentication.

### User Roles

1. **Super Admin**: Platform owner only. Accesses `/admin/*` to monitor the platform, approve/reject/suspend organizations, inspect audit logs, and view platform-wide analytics.
2. **Organization Admin**: Organizers who create and manage a tenant organization. Scoped to create events, configure registration field templates, verify payments, and launch Quiz tournaments under their organization.
3. **Participant**: Public users. No login required; registers for events via dynamic registration forms, submits project links, and joins quiz lobbies using a simple lobby code.

---

## 🔄 Core Workflow

1. **Sign-up & Onboarding**: An organizer signs in with Clerk and completes `/onboarding` to submit organization verification details.
2. **Verification Flow**: The organization is created in `PENDING_VERIFICATION` status. The Super Admin reviews the organization and moves it to `ACTIVE`.
3. **Tenant Setup**: The Organization Admin configures payment QR codes, UPI IDs, default registration templates, and social links.
4. **Event Creation**: Admin creates events with customizable module toggles (Registration, Payments, Project Submission, Live Quiz Arena, Team Support).
5. **Form Field Config**: Dynamic registration fields are configured per event (full name, department, year, semester) using the Field Library Config.
6. **Registration**: Public participants fill out the custom form. If it's a paid event, they see the organization's QR code and instructions, upload a screenshot, and input a transaction ID.
7. **Payment Approval**: The Organization Admin reviews the payment screenshot and approves or rejects the registration (providing a reason). Email notifications are automatically triggered.
8. **Quiz Integration**: Real-time Quiz Arena tournaments are spawned directly from events, linking the play session and scoring to the tenant organization.
9. **Project Submissions**: Participants submit project URLs before the deadline under the time-locked problem statement release mechanism.
10. **Platform Audit Logs**: Every administrative action (onboarding, approval, event editing, payment validation) is logged to the database audit trail.

---

## 🗄️ Database Schema & Synchronized Migrations

Both `Festoryx Web` and `Festoryx Quiz` share the **same database instance** but maintain their own Prisma clients.

### IMPORTANT: Migration Synchronization

Whenever you add a field or update the Prisma schema:
1. Update `Festoryx Web/prisma/schema.prisma`.
2. Copy the modified `schema.prisma` file directly into `Festoryx Quiz/prisma/schema.prisma`.
3. Generate and apply migrations in **both** directories:
   ```bash
   # In Festoryx Web:
   npx prisma migrate dev --name <migration_name>

   # In Festoryx Quiz:
   npx prisma migrate dev --name <migration_name>
   ```
4. *Note:* Database seeds should only be executed from the `Festoryx Web` project.

---

## 🚀 Running Locally

### Step 1: Clone and Environment Config
Create `.env` files based on the `.env.example` templates in both `Festoryx Web/` and `Festoryx Quiz/`.

### Step 2: Database Migration (Web first)
```bash
cd "Festoryx Web"
npm install
npx prisma migrate dev
npm run seed
```

### Step 3: Run Festoryx Web
```bash
# In "Festoryx Web" folder
npm run dev
```
Starts on `http://localhost:3000`.

### Step 4: Run Socket Server
```bash
cd "../Festoryx Quiz/socket-server"
npm install
npm start
```
Starts WebSockets on `http://localhost:3001`.

### Step 5: Run Festoryx Quiz
```bash
cd ..
npm install
npm run dev
```
Starts on `http://localhost:3002`.

---

## 📄 License
MIT License.
