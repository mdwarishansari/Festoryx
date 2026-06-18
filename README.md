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
| **Festoryx Quiz** | `3002` | `Festoryx Quiz/` | Quiz Arena participant lobbies, projector screens, and host controls |

---

## 🏗️ Multi-Tenant Architecture & Roles

Festoryx operates on a multi-tenant database model scoped by `Organization` and Clerk authentication.

### User Roles

1. **Super Admin**: Platform owner only. Accesses `/superadmin/*` to monitor the platform globally, review organization registration requests, approve/reject/suspend tenants, inspect global audit logs, and view platform-wide payment analytics.
2. **Organization Admin**: Organizers who create and manage a tenant organization. Scoped to create events, configure registration field templates, verify payments, and launch Quiz tournaments under their specific organization.
3. **Participant**: Public users. No login required; registers for events via dynamic registration forms, submits project links, and joins quiz lobbies using a simple lobby code.

---

## 🔄 Core Workflow & Verification

1. **Sign-up & Onboarding**: An organizer signs in with Clerk and completes `/onboarding` to submit organization verification details.
2. **Verification Flow**: 
   - The organization is created in `PENDING_VERIFICATION` status.
   - The Super Admin reviews the organization in the `/superadmin` console and moves it to `ACTIVE`, `REJECTED`, or `SUSPENDED`.
   - Once `ACTIVE`, the Organization Admin gains full access to `/dashboard` features.
3. **Tenant Setup**: The Organization Admin configures payment QR codes, UPI IDs, default registration templates, and social links.
4. **Event Creation**: Admin creates events with customizable module toggles (Registration, Payments, Project Submission, Live Quiz Arena, Team Support).

### Event Visibility Levels
- **PUBLIC**: Events appear on the public homepage and event discovery marketplace for any visitor to register.
- **UNLISTED**: Events do not appear on search lists or homepages. Access and registration require the direct link.
- **PRIVATE**: Events are only visible to the Organization Admin and members of that specific tenant.

---

## 📧 Email Notification Setup

Festoryx includes built-in email notification triggers for various system events, configured via standard SMTP:

### Core Email Triggers
- **Organization Status Update**: Notifies the Organization Admin when the Super Admin approves (`ACTIVE`) or rejects their organization.
- **Registration Confirmation**: Sent to participants upon filling the registration form (with payment instructions if it is a paid event).
- **Payment Verification**: Notifies participants when the Organization Admin approves (`APPROVED`) or rejects (`REJECTED` with reason) their payment proof.
- **Live Quiz Arena Session Start**: Sends the direct join URL with access codes to all approved participants once a quiz session goes live.
- **Quiz Results Released**: E-mails participants their final score and a link to the live leaderboard once the host completes the session.

### SMTP Setup
Configure the following environment variables in `.env` files in both directories:
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_EMAIL="your-email@gmail.com"
SMTP_PASSWORD="your-google-app-password"
SMTP_FROM_NAME="Festoryx Team"
```

---

## 🎨 Brand Asset Guidelines

To ensure a premium and clean user interface, follow these asset usage rules:
- **Static Assets (`Logo.svg`, `Logo.png`)**: Use these on standard UI surfaces, sidebars, dashboard headers, and settings tables. This keeps the workspace quiet and professional for admins.
- **Dynamic Asset (`Logo.gif`)**: Reserved strictly for high-impact splash screens, loading screens, and hero/landing pages to create a starlit, premium first impression.

---

## 🗄️ Database Schema & Synchronized Migrations

Both `Festoryx Web` and `Festoryx Quiz` share the **same database instance** but maintain their own Prisma clients.

### Migration Synchronization

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
