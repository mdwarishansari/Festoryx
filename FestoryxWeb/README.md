# Festoryx Web — Events Management & Multi-Tenant SaaS Portal

> The main application for the Festoryx platform, hosting public marketplace portals, organization tenant onboarding, organizer administration dashboards, payment verifications, and custom registration dynamic form libraries.

Developed & Maintained by **[mdwarishansari](https://github.com/mdwarishansari/)** 🧑‍💻

---

## 🚀 Key Features & Subsystems

### 1. 🌐 Public Marketplace & Participant Experience
* **Branded Entry Experience**: Modern splash loading screen featuring circular brand animation and loading feedback.
* **Marketplace Directory**: Discover public events, search, filter by categories, and browse verified host organizations.
* **Dynamic Form Builder Integration**: Dynamically queries and constructs form fields (Name, Email, Phone, College, Year, Team size, Resume, GitHub) based on the event's backend configuration, executing Zod validation on both frontend and backend.
* **Challenge Statement Countdowns**: Time-locked countdowns and banners that dynamically release challenge guidelines or problem statements in local time.
* **SEO & Metadata Optimization**: Full OpenGraph/Twitter card setup, robots.ts instructions, dynamic sitemap.ts generating org/event page maps, and customized favicon setups.

### 2. 🏢 Organization Admin Panel (`/dashboard`)
* **Real-time Analytics Desk**: Live counters and trend graphs showing registration volumes, revenue collected, and event status.
* **Event Operations Controller**: Full CRUD control for events. Features validation locks ensuring active registered events cannot be deleted, protecting integrity.
* **Granular Visibility**: Publish events globally, toggle unlisted (link-only) access, or lock visibility to internal teams.
* **Manual UPI Payment Audit**: Verify transaction screenshots, match UTR numbers, approve/reject registrations with custom feedback notes, triggering transactional confirmation emails.
* **Inbox System**: View, toggle read/unread status, and purge contact inquiries received from participants.
* **Organization Settings**: Custom branding configuration (logo, social handles, winners arena, UPI QR merchant info).

### 3. 👑 Platform Super Admin Panel (`/superadmin`)
* **Tenant Verification Pipeline**: Moderate newly onboarded organizations (`PENDING_VERIFICATION`), approving or rejecting them to toggle dashboard access.
* **Global Overrides**: Modify or clean up any event, participant registration, or payment proof across all tenants.
* **SSO redirection**: Instant, single-sign-on redirect capability into the active Quiz Arena instances.
* **Audit Trail & Maintenance**: Track admin modifications via systemic logs. System includes automated database purgers removing entries older than 30 days.

---

## 🛠️ Complete Tech Stack & Modules

* **Framework**: Next.js 16 (App Router) & React 19
* **Language**: TypeScript
* **Auth & Session**: Clerk SDK (Middleware token parsing + Custom Webhooks)
* **Database Interface**: Prisma ORM v7
* **Database Engine**: PostgreSQL on Supabase (Pooler & Direct engines)
* **Asset Manager**: Cloudinary API (Auto-generating nested folders matching organization/event slugs)
* **Mailing Client**: Nodemailer (SMTP Relay with HTML template compiler)
* **UI & Styling**: Tailwind CSS v4 & custom variables
* **Form & Validation**: React Hook Form, Zod Schema resolver

---

## 🗺️ Application Route Map

The Next.js App Router exposes the following folder structure:

```text
src/app/
├── (public)
│   ├── page.tsx                      # Global Events Marketplace (Homepage)
│   ├── about/page.tsx                # Platform mission and details
│   ├── contact/page.tsx              # Global user inquiry submission form
│   ├── events/[id]/page.tsx          # Single Event detailed landing page
│   ├── org/[id]/page.tsx             # Organization showcase and winners gallery
│   ├── register/[id]/page.tsx        # Dynamic registration form handler
│   └── registration-success/page.tsx # Registration confirmation landing page
│
├── (auth)
│   ├── sign-in/                      # Clerk User sign-in page
│   ├── sign-up/                      # Clerk User sign-up page
│   ├── onboarding/page.tsx           # Organization registration wizard
│   └── verification-pending/page.tsx # Locked screen for pending tenant approvals
│
├── dashboard/
│   ├── page.tsx                      # Organizer Live Overview Dashboard
│   ├── about/page.tsx                # View organizer-specific info
│   ├── analytics/page.tsx            # Revenue & participant metric graphs
│   ├── broadcast/page.tsx            # SMTP bulk email notification controller
│   ├── events/page.tsx               # Create and manage organization events
│   ├── export/page.tsx               # Multi-sheet Excel exporter tool
│   ├── messages/page.tsx             # Inquiry inbox for host contact queries
│   ├── payments/page.tsx             # Registration payment approvals
│   ├── registrations/page.tsx        # Participant registration auditing
│   ├── reset/page.tsx                # Tenant database reset triggers
│   ├── settings/page.tsx             # Manage UPI QR, logo, and social profile links
│   ├── submissions/page.tsx          # Collect and verify link submissions
│   └── winners/page.tsx              # Add winners to the organization showcase
│
└── superadmin/
    ├── login/page.tsx                # Super admin verification gateway
    └── (authenticated)/
        ├── page.tsx                  # Super Admin Command Center
        ├── audit-logs/page.tsx       # Live audit actions list
        ├── sso-redirect/page.tsx     # One-click SSO launchpad into Quiz Arena
        └── [analytics/broadcast/events/export/messages/organizations/payments/registrations/reset/settings/winners] # Global management overlays
```

---

## 🔌 Environment Variables Configuration

Create a `.env` file in the root of `Festoryx Web/` using the following references:

| Variable | Scope | Description |
|---|---|---|
| `DATABASE_URL` | Prisma | PostgreSQL pooled connection URL with `?pgbouncer=true` parameter (Port 6543) |
| `DIRECT_URL` | Prisma | PostgreSQL direct connection URL bypassing poolers for migrations (Port 5432) |
| `NEXT_PUBLIC_SITE_URL` | Routing | Canonical URL of the web server (e.g., `http://localhost:3000` or production domain) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Auth | Clerk public API key retrieved from dashboard |
| `CLERK_SECRET_KEY` | Auth | Clerk private backend API secret |
| `SMTP_HOST` / `SMTP_PORT` | Mailer | Nodemailer SMTP provider details (e.g., `smtp.gmail.com` on `587`) |
| `SMTP_EMAIL` / `SMTP_PASSWORD` | Mailer | Username and App Password used for Nodemailer authentication |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Media | Cloudinary bucket namespace |
| `CLOUDINARY_API_KEY` / `_SECRET` | Media | API keys authorizing remote assets write/delete operations |
| `SUPER_ADMIN_EMAIL` | Security | Privileged email address granted the `SUPER_ADMIN` system role |
| `NEXT_PUBLIC_SOCKET_URL` | Integration | Endpoint of the Quiz Arena Socket.IO relay (Port 3001) |
| `NEXT_PUBLIC_QUIZ_ARENA_URL` | Integration | Direct URL of the live Quiz Arena frontend dashboard (Port 3002) |
| `SESSION_SECRET` | Crypto | Random 32-character key securing server-side session payloads |

---

## 🚀 Local Installation & Execution

### 1. Initialize Project & Install Packages
```bash
npm install
```

### 2. Run Database Migrations
Prisma will sync your PostgreSQL instance schemas:
```bash
npx prisma migrate dev
```

### 3. Seed Platform Templates
Generate standard events and superadmin settings to populate local states:
```bash
npm run seed
```

### 4. Boot Development Server
```bash
npm run dev
```
The client dashboard runs on [http://localhost:3000](http://localhost:3000).

---

## 🔒 Security Architectures
* **Server Action Guards**: Every Server Action validates the session user's role and database permissions before executing modifications.
* **Auto-Sanitization**: Form builder fields sanitize and normalize user inputs against custom regex schemas.
* **Image Expiry Hooks**: Deleting database rows triggers async fetch events to the Cloudinary API to ensure matching remote media files are scrubbed.
