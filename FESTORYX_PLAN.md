# Festoryx — Product Architecture & Implementation Plan

## Vision

Festoryx is a **multi-tenant Event Operating System** that enables organizations, colleges, communities, clubs, startups, and companies to create, manage, and scale events from a single platform.

Unlike AAYAM, which was built around a single event ecosystem, Festoryx is a platform where multiple organizations can operate independently while sharing the same infrastructure.

---

# Core Architecture

```text
Festoryx Platform
│
├── Super Admin
│
├── Organization A
│   ├── Events
│   ├── Registrations
│   ├── Payments
│   ├── Submissions
│   └── Quiz Arena
│
├── Organization B
│   ├── Events
│   ├── Registrations
│   ├── Payments
│   ├── Submissions
│   └── Quiz Arena
│
└── Organization N
```

Every organization operates independently.

No organization should be able to access another organization's data.

---

# User Roles

## 1. Super Admin

Platform Owner.

Determined by:

```env
SUPER_ADMIN_EMAIL=
```

### Permissions

* Approve Organizations
* Reject Organizations
* Suspend Organizations
* Delete Organizations
* View All Events
* View All Registrations
* View All Payments
* View All Submissions
* View Platform Analytics
* View Audit Logs
* Override Platform Actions

### Routes

```text
/superadmin/login
/superadmin
/superadmin/organizations
/superadmin/events
/superadmin/payments
/superadmin/analytics
/superadmin/audit-logs
```

---

## 2. Organization Admin

Event Organizer.

Owns exactly one organization in V1.

### Permissions

* Edit Organization
* Upload Branding
* Manage Events
* Manage Registrations
* Verify Payments
* Manage Submissions
* View Analytics
* Configure Modules
* Manage Event Settings

### Routes

```text
/dashboard
/dashboard/events
/dashboard/registrations
/dashboard/payments
/dashboard/submissions
/dashboard/analytics
/dashboard/settings
```

---

## 3. Participant

No Login Required.

### Permissions

* Browse Events
* Register
* Upload Payment Proof
* Join Team Events
* Submit Projects
* Participate in Quiz Sessions

---

# Authentication

## Clerk

Use Clerk for:

* Google Login
* Email Login
* Session Management
* Passwordless Login
* User Identity

### Clerk should NOT manage:

* Event Data
* Organization Data
* Registrations
* Payments
* Business Logic

The database remains the source of truth.

---

# Database Stack

## PostgreSQL

Hosted on:

```text
Supabase
```

## ORM

```text
Prisma
```

---

# Database Models

## User

Stores application users linked to Clerk.

### Fields

* id
* clerkId
* email
* role
* createdAt

---

## Organization

### Fields

* id
* name
* slug
* description
* logo
* type
* email
* phone
* state
* city
* status
* ownerId

### Status

```text
PENDING_VERIFICATION
ACTIVE
REJECTED
SUSPENDED
NEEDS_REVIEW
```

---

## Event

Belongs to Organization.

### Fields

* id
* organizationId
* name
* slug
* description
* banner
* visibility
* status
* registrationConfig
* paymentConfig

### Visibility

```text
PUBLIC
UNLISTED
PRIVATE
```

### Status

```text
DRAFT
PUBLISHED
ARCHIVED
```

---

## Registration

Stores participant registrations.

---

## Team

Stores team metadata.

---

## TeamMember

Stores participant-team relationships.

---

## PaymentProof

Stores:

* Screenshot
* Transaction ID
* Status

---

## Submission

Stores project submissions.

---

## QuizSession

Stores quiz-related event data.

---

## AuditLog

Stores:

* Who
* What
* When
* Organization
* Resource

---

# Homepage Workflow

Homepage must split users into two categories.

---

## Organizer Path

```text
Want to Organize an Event?
```

Buttons:

```text
Create Organization
Sign In
```

Flow:

```text
Homepage
↓
Sign In
↓
Create Organization
↓
Verification
↓
Approval
↓
Dashboard
```

---

## Participant Path

```text
Want to Participate in an Event?
```

Buttons:

```text
Browse Events
```

Flow:

```text
Homepage
↓
Browse Events
↓
Open Event
↓
Register
↓
Confirmation
```

---

# Organization Lifecycle

## Step 1

Sign In with Clerk

---

## Step 2

Create Organization

Required Fields:

* Organization Name
* Organization Type
* Email
* Phone
* State
* City
* Description
* Logo

Optional:

* Website
* Instagram
* LinkedIn
* YouTube
* WhatsApp

---

## Step 3

Status:

```text
PENDING_VERIFICATION
```

---

## Step 4

Super Admin Review

---

## Step 5

Approve

Status:

```text
ACTIVE
```

---

## Step 6

Organization Dashboard Access

---

# Event Creation Workflow

## Step 1

Basic Information

* Name
* Description
* Banner
* Poster
* Dates
* Deadline

---

## Step 2

Visibility

```text
PUBLIC
UNLISTED
PRIVATE
```

---

## Step 3

Modules

```text
Registration
Payments
Submission
Quiz Arena
```

---

## Step 4

Participation Type

```text
SOLO
TEAM
BOTH
```

---

## Step 5

Field Library

Available Fields:

* Name
* Email
* Phone
* College
* Branch
* Year
* GitHub
* LinkedIn
* Resume
* State
* City

Admins can only:

```text
Add
Remove
Reorder
Required
Optional
```

No arbitrary custom fields.

---

## Step 6

Publish

---

# Registration Workflow

## Solo Event

```text
Participant
↓
Register
↓
Confirmation
```

---

## Team Event

```text
Team Name
↓
Leader
↓
Members
↓
Confirmation
```

---

# Payment Workflow

## Admin

Uploads:

* QR Code
* UPI ID
* Instructions

---

## Participant

Sees:

* QR
* Instructions

Uploads:

* Screenshot
* Transaction ID

---

## Admin

Approves or Rejects.

---

# Email System

## Clerk Emails

* Sign In
* Verification
* Login

---

## App Emails

SMTP + Nodemailer

### Organization

* Approved
* Rejected

### Registration

* Registered
* Confirmed

### Payments

* Approved
* Rejected

### Events

* Reminder
* Result Published

---

# Quiz Arena

Quiz Arena is a Module.

Not a separate product.

Flow:

```text
Create Event
↓
Enable Quiz Module
↓
Quiz Arena Available
```

Reuse existing Socket.IO implementation.

Do not rebuild.

---

# Fast Coding (Future)

Future module.

Possible stack:

```text
Judge0
```

Features:

* Code Execution
* Test Cases
* Leaderboards
* Rankings

Not part of current implementation.

---

# Multi-Tenant Security

Every mutation must verify:

```text
User
↓
Organization
↓
Resource
```

Required for:

* Events
* Payments
* Registrations
* Settings
* Submissions
* Analytics

Organization A must never access Organization B data.

---

# Public Design System

Applies to:

* Homepage
* Event Pages
* Registration Pages
* Public Organization Pages

## Hero

Animated Purple Black-Hole Effect

Built With:

* CSS Gradients
* Blur Layers
* Glow Elements
* Framer Motion

No Video.

No GIF Background.

No Lottie.

---

# Dashboard Design System

Applies to:

* Super Admin
* Organization Dashboard

Style:

* Dark
* Premium
* Productive
* Minimal Motion

No giant black-hole backgrounds.

---

# Cloudinary Strategy

Folder-Based Uploads

```text
festoryx/
├── organizations/
├── events/
├── registrations/
└── submissions/
```

Delete remote assets when records are removed.

---

# Environment Variables

Required:

```env
DATABASE_URL=
DIRECT_URL=

NEXT_PUBLIC_SITE_URL=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

SMTP_HOST=
SMTP_PORT=
SMTP_EMAIL=
SMTP_PASSWORD=

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

NEXT_PUBLIC_SOCKET_URL=

SUPER_ADMIN_EMAIL=

SESSION_SECRET=
```

---

# Development Phases

## Phase 1

Complete Festoryx Web

* Roles
* Auth
* Organizations
* Events
* Payments
* Analytics

---

## Phase 2

Quiz Arena Integration

---

## Phase 3

Fast Coding Module

---

## Phase 4

Production Hardening

* Security
* Audit Logs
* Performance
* Monitoring

---

# Completion Criteria

Festoryx is considered complete when:

* Super Admin workflow works
* Organization approval works
* Event creation wizard works
* Registration works
* Payment verification works
* Emails work
* Multi-tenancy is enforced
* Quiz Arena is integrated
* Public pages use the premium cosmic experience
* Dashboards remain productivity-focused
* Builds pass successfully
* Database migrations remain synchronized

```
```
