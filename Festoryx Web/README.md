# Festoryx Web — Events Management Portal

> The main application for the Festoryx SaaS platform, hosting public marketplace portals, organizer dashboards, registration verification flows, and dynamic form libraries.

Developed & Maintained by <a href="https://github.com/mdwarishansari/"><strong>@mdwarishansari</strong></a> 🧑‍💻

---

## 🚀 Key Features

### 💻 Public-Facing Site
- **Dynamic Splash Loading Screen:** A polished introductory experience featuring the circular brand logo.
- **Marketplace Homepage:** Shows public events from all active organizations, plus featured organizations.
- **Dynamic Event Listings:** Responsive listings with customized loading shimmer states.
- **Dynamic Event Registrations:** Dynamically queries field configurations defined in the database for the event/organization, maps inputs, and validates rules on both client and server.
- **IST Standardized Challenge Statement Banners:** Dynamic countdown and release banners indicating challenge/problem statement releases.
- **SEO Optimized:** Fully configured SEO headers, OpenGraph profiles, robots.ts crawler instructions, and custom meta icon assets.

### 🛡️ Admin Dashboard
- **Live Overview Panel:** Real-time stats panel reflecting registrations, payments, and events.
- **Robust Event Management:** Create, read, update, and delete events. Safeguards prevent deleting events that already have active registrations.
- **Onboarding Flow:** Organizer signs up with Clerk, goes through `/onboarding` to submit organization profile info.
- **Interactive Registration & Payment Verification:** Review submissions, verify payment receipts, reject invalid entries with required note explanations, and delete registrations with full Cloudinary receipt/image cleanup.
- **Unified Message Inbox:** Receive contact form queries with options to toggle read/unread status and delete.
- **Global Settings Form:** Manage organization-specific meta settings, social links, and UPI QR codes.
- **Reset & Seed System:** Easily reset database states and seed standard templates/events for demonstration.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, Server Actions, React 19)
- **Authentication:** Clerk Auth
- **Database ORM:** Prisma ORM
- **Database Engine:** PostgreSQL (Supabase / local PG instance)
- **File & Media Storage:** Cloudinary SDK (for event banners and payment screenshot uploads)
- **Styling:** Tailwind CSS v4 & Custom Cosmic Void design tokens
- **Icons:** Lucide React Icons

---

## 📦 Getting Started

### 1. Prerequisites
Ensure you have the following installed on your machine:
- Node.js (v18.x or later)
- PostgreSQL database
- Cloudinary Account
- Clerk Account (Publishable Key and Secret Key)

### 2. Installation
Install the dependencies:
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the project folder and populate the variables:
```env
# ─── Database (PostgreSQL Connection Pooling) ───
DATABASE_URL="postgresql://postgres:password@localhost:5432/festoryx?pgbouncer=true"
DIRECT_URL="postgresql://postgres:password@localhost:5432/festoryx"

# ─── Clerk Authentication ───
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/onboarding"

# ─── Cloudinary SDK (Media Storage) ───
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# ─── Email Configuration (Nodemailer + Gmail SMTP) ───
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_EMAIL="your-email@gmail.com"
SMTP_PASSWORD="your-google-app-password"
SMTP_FROM_NAME="Festoryx Team"

# ─── Super Admin ───
SUPER_ADMIN_EMAIL="your-super-admin@email.com"

# ─── Quiz Arena Integration ───
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
NEXT_PUBLIC_QUIZ_ARENA_URL="http://localhost:3002"

# ─── Session Secret ───
SESSION_SECRET="replace-with-a-32-character-session-secret"

# ─── Canonical Site URLs ───
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 4. Database Setup & Seeding
Deploy database migrations:
```bash
npx prisma migrate dev
```

Seed the default templates:
```bash
npm run seed
```

### 5. Running the Application
Run the local Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security & Validations
- Backend validation ensures that payment registration rejections are accompanied by a descriptive message.
- Multi-step registration forms enforce appropriate team name requirements dynamically based on event configuration.
- Cascading deletion rules keep the database cleanly synchronized with remote media assets.
