# Festoryx Monorepo

> The Production-Minded Event Operating System & Competition SaaS for colleges, clubs, communities, companies, and startup organizers.

Festoryx is an enterprise-ready, multi-tenant event management SaaS platform with integrated real-time interactive quiz tournaments, dynamic registration forms, QR-code payment verification, and time-locked problem statements.

---

## 📂 Monorepo Structure

```text
Festoryx (Repository Root)
├── Festoryx Web/               # Main SaaS Platform & Public Portal (Next.js 16)
│   ├── src/                    # Web frontend, onboarding, dashboard, and actions
│   └── README.md               # Web-specific setup and documentation
│
└── Festoryx Quiz/              # Live Competition Suite (Quiz Arena)
    ├── src/                    # Quiz Arena game views & host controllers (Next.js 16)
    ├── socket-server/          # Real-time WebSocket relay server (Node.js & Socket.IO)
    └── README.md               # Quiz Arena-specific documentation
```

---

## 🌐 Ports & Services

When running locally, the platform uses the following default ports:

| Service | Port | Directory | Description |
|---------|------|-----------|-------------|
| **Festoryx Web** | `3000` | `Festoryx Web/` | Main marketplace website, discovery portal, and organizer dashboards |
| **Socket Server** | `3001` | `Festoryx Quiz/socket-server/` | Real-time WebSocket relay connection hub for live Quiz Arena tournaments |
| **Festoryx Quiz** | `3002` | `Festoryx Quiz/` | Quiz Arena participant lobbies, projector screens, and host control panels |

---

## 🏗️ Multi-Tenant SaaS Architecture

Festoryx enforces strict multi-tenancy at the database level. Every resource belongs to an organization, guaranteeing secure data isolation:

- **User**: Authenticated organizer/admin accounts.
- **Organization**: The tenant unit (representing a college, club, or community).
- **Event**: Scope-bound events created under a specific organization.
- **Event Module & Config**: Enables toggling functional modules on a per-event basis.
- **Registration & Team**: Scoped registration entries containing participant details.
- **PaymentProof**: Payment references and screenshots tied to registrations.
- **Submission**: Project/code links scoped to registrations.
- **QuizSession**: Live real-time interactive game instances scoped to events.

---

## 👥 Product Roles & Permissions

1. **Super Admin (Platform Owner)**
   - Only accessible by designated platform administrator accounts.
   - Monitors and manages the global platform state via `/superadmin`.
   - Approves, rejects, suspends, or deletes organizations.
   - Accesses global analytics, platform-wide payment summaries, and system audit logs.
   - Can manually override any system entity or registration status.

2. **Organization Admin (Tenant Owner)**
   - Signs up via Clerk and creates a single Tenant Organization.
   - Manages organization profiles, contact info, and payment details (UPI/QR).
   - Creates and manages organization events, modules, and customization.
   - Moderates event registrations, payment proofs, project submissions, and launches quiz sessions.

3. **Participant (End User)**
   - Form-based access only; **no registration account is created**.
   - Browses public marketplace events or accesses unlisted events via direct links.
   - Registers for events, submits project links, and joins quiz tournaments via unique codes.

---

## 🔄 Core Workflows

### 1. Onboarding & Verification Flow
- **Registration**: Organizers authenticate with Clerk and complete the onboarding wizard (`/onboarding`).
- **Review Mode**: Newly created organizations start in the `PENDING_VERIFICATION` status.
- **Super Admin Approval**: Super Admin reviews the organization and transitions it to `ACTIVE`, `REJECTED`, or `SUSPENDED` (notifying the owner via email).
- **Dashboard Access**: The organizer dashboard (`/dashboard`) is locked until the organization is verified and becomes `ACTIVE`.

### 2. Event Modules & Visibility
At event creation, Organization Admins toggle specific built-in modules:
- **Registration**: Enable forms.
- **Payment**: Require verification of registration fees.
- **Submission**: Collect project URLs.
- **Quiz Arena**: Connect real-time quiz tournaments.
- **Team Support**: Enable team-based registrations instead of solo only.

**Visibility Levels:**
- `PUBLIC`: Listed on the marketplace homepage.
- `UNLISTED`: Hidden from the homepage; accessible only via direct link.
- `PRIVATE`: Internal/authorized members access only.

### 3. Registration Form Builder (Library-Based)
Admins configure forms using a controlled library (e.g., Name, Email, Phone, College, Department, Year, Resume, GitHub) rather than raw text builders. Admins customize labels, ordering, and requirements.

### 4. Manual Payment Verification Flow
- Paid events display UPI and QR details on the registration page.
- Participants pay and upload a transaction screenshot along with the UTR Reference.
- Org Admins review payments and transition status to `APPROVED` or `REJECTED` (with feedback), which triggers an automated email.

### 5. Live Quiz Arena Flow
- Enabled on an event as a module.
- Org Admins launch a lobby via the Quiz Admin console.
- Participants join the lobby using a 6-character access code.
- Interactive rounds include MCQ, Buzzers, and Pass rounds synchronized via Socket.IO.
- Projectors display auditorium screens, and leaderboards update in real-time.

---

## 📁 Cloudinary Storage Conventions

Cloudinary uploads are organized into strict folder trees matching organization and event slugs:
- Logo: `festoryx/organizations/{orgSlug}/logo`
- Banner: `festoryx/events/{eventSlug}/banner`
- Payment Screenshot: `festoryx/registrations/{registrationId}/payment-proof`
- Submissions: `festoryx/submissions/{submissionId}/files`

**Cleanup Rule:** Deleting an event or registration automatically triggers a background API cleanup call to Cloudinary to delete corresponding assets, preventing orphaned files.

---

## 📧 Application Email Strategy

Authentication emails are handled by Clerk. Custom application notifications are sent directly using **Nodemailer and SMTP**:
- **Organization Onboarding Update**: Dispatched upon Super Admin approval/rejection.
- **Registration Receipt**: Sent to participants on submission.
- **Payment Verification**: Notifies participants of approval or rejection (with feedback reason).
- **Quiz Arena Sessions**: Sends direct tournament lobby links when a session starts.
- **Leaderboard Results**: Emails final scores and leaderboard links upon tournament completion.

---

## 🚀 Getting Started Locally

### Step 1: Clone and Configure Environments
Create `.env` files in both `/Festoryx Web` and `/Festoryx Quiz` following the templates in `.env.example`.

### Step 2: Database Setup & Migrations
Both apps connect to the same Supabase/PostgreSQL database using their own Prisma clients.

1. Install dependencies and deploy migrations in the Web project:
   ```bash
   cd "Festoryx Web"
   npm install
   npx prisma migrate dev
   npm run seed
   ```
2. Deploy migrations in the Quiz project:
   ```bash
   cd "../Festoryx Quiz"
   npm install
   npx prisma migrate dev
   ```

### Step 3: Run the Services

1. **Start main Web server (Port 3000):**
   ```bash
   cd "Festoryx Web"
   npm run dev
   ```
2. **Start WebSocket Relay server (Port 3001):**
   ```bash
   cd "../Festoryx Quiz/socket-server"
   npm install
   npm start # or npm run dev
   ```
3. **Start Quiz Arena server (Port 3002):**
   ```bash
   cd "../Festoryx Quiz"
   npm run dev
   ```

---

## 🔒 Security Auditing

- **Multi-Tenant Scoping**: Server Actions verify the session owner's membership against target entity owners before executing modifications.
- **Super Admin Protections**: Super Admin endpoints bypass standard middleware checks and require a secure environment-based email match before granting session overrides.
- **CSRF & CORS**: Sockets enforce explicit CORS origins matching canonical site domains.
