# Festoryx Product Workflow & Security Audit (V1)

This document provides a comprehensive report of the product workflows, multi-tenant security architecture, and system integration verify status for Festoryx Web and Quiz Arena modules.

---

## 1. Role Hierarchy & Main Visitor Paths
Visitor entry is split cleanly into two distinct persona routes at the root index landing page:

*   **PATH 1 (Organizers)**:
    *   `Create Organization` button redirects to Clerk Authentication -> `/onboarding`
    *   `Sign In` button redirects to Clerk Authentication -> `/dashboard`
*   **PATH 2 (Participants)**:
    *   `Browse Events` button redirects to `/events` to find active tech festivals and hackathons.
    *   *No Clerk account is created or required for participants.*

---

## 2. Super Admin System
*   **Sign-in Safeguard**: Access to `/superadmin/login` bypasses standard organizer middleware checks. Upon successful Clerk authentication, the server action checks the authenticated user's email against the configured `SUPER_ADMIN_EMAIL` environment variable.
*   **Privileges**:
    *   Users matching the email are assigned the `SUPER_ADMIN` role database entry and redirected to the `/superadmin` workspace.
    *   Other signed-in users are redirected back to the `/dashboard`.
*   **Console Sections**:
    *   **Organizations Control**: Grouped lists (Pending Verification, Active, Rejected, Suspended, Needs Review) to approve, reject, or request changes on organizations.
    *   **Events Management**: Ability to globally suspend or delete events.
    *   **Audit Logs Console**: Complete stream showing timestamped changes across all user sessions and organizations.
    *   **Platform Analytics**: Global metrics (registrations growth, total collections, active event count).

---

## 3. Organization Onboarding & V1 Ownership Rule
*   **One-Org Rule**: Each Clerk user is limited to owning only one organization in V1.
*   **Enforcement**:
    *   `createOrganization` checks `prisma.organizationMember.findFirst({ where: { userId: user.id } })` and throws a validation error if found.
    *   Onboarding and dashboard layouts check membership status: active owners skip onboarding and redirect directly to `/dashboard`.
*   **Profile Fields**: Name, Type dropdown, Contact Email, Phone, State, City, Description, Logo URL, Website, and Social Links (Instagram, LinkedIn, YouTube, WhatsApp). New profiles default to `PENDING_VERIFICATION`.

---

## 4. Multi-Step Event Wizard Creation
The single-page form has been restructured into an interactive 6-step form wizard flow:
1.  **Step 1: Basic Information**: Name, Slug, Description (short + long), guidelines, schedule, banner image upload (Cloudinary API integration), dates, and time-locked problem statement configuration.
2.  **Step 2: Visibility**: Toggle visibility modes (PUBLIC, PRIVATE, UNLISTED) and form registration availability.
3.  **Step 3: Event Modules**: Checkboxes to toggle active modules: Form Registration, QR Payments, Project Submission, Live Quiz Arena, and Team Support.
4.  **Step 4: Participation & Fees**: Select SOLO/TEAM/BOTH modes, min/max team limits, registration fees, and sorting orders.
5.  **Step 5: Field Library**: Toggle checklist of fields to collect (Name, Email, Phone, College, Branch, Year, GitHub, LinkedIn, Resume, State, City) with individual visible and required checkboxes.
6.  **Step 6: Publish & Review**: Quick preview summary cards and global publication checkbox.

---

## 5. Participant Flow & Dynamic Fields
*   **Dynamic Inputs**: `RegistrationFormClient` loads `formFields` from the event config and builds a Zod validation schema dynamically.
*   **Custom Fields**: Fields outside the standard schema (e.g. GitHub, LinkedIn, Resume, State, City) are automatically compiled into a JSON object and saved in the `customFields` database column.
*   **Payments**: Paid events display a QR code image and instruction card. The participant submits a transaction UTR reference and uploads a screenshot proof to Cloudinary.
*   **Confirmation**: On submission, a confirmation email is generated and sent to the participant's inbox.

---

## 6. Multi-Tenant Security & Email Flows
*   **Action Protection**:
    *   `verifyPayment` in `payment.actions.ts` and `setEventWinners` in `winner.actions.ts` verify the session owner's organization membership against the target registration/event organization owner.
    *   `updateSettings` in `settings.actions.ts` uses `getOrgIdForCurrentUser` to scope updates.
*   **Super Admin Bypass**: Actions allow global modification if the active user satisfies `isSuperAdmin(user)`.
*   **Approved/Rejected Email Triggers**: When a Super Admin updates an organization's status in `organization.actions.ts`, an email notification is automatically dispatched to the organization owner's account:
    *   `getOrganizationApprovedEmail` includes a CTA link to access the organizer dashboard.
    *   `getOrganizationRejectedEmail` includes the feedback reason provided by the administrator.

---

## 7. Quiz Arena Integration
*   **Dashboard Console**: If the `Live Quiz Arena` module is enabled on the event, a Game/Console shortcut button is rendered next to the event in the organizer's dashboard table linking to `http://localhost:3002/admin` (Quiz Arena Admin Panel).
*   **Participant Access**: The public event page displays a "Live Quiz Arena" sidebar widget with a direct join link to `http://localhost:3002/join`.

---

## 8. Verification & Compiling Status

| Component | Status | Verification Detail |
| :--- | :--- | :--- |
| **Festoryx Web Compilation** | ✅ PASSED | `next build` compiled successfully |
| **Festoryx Quiz Compilation** | ✅ PASSED | `next build` compiled successfully |
| **Prisma Schema Match** | ✅ SYNCED | Web and Quiz schemas are identical |
| **Lint & Type Safety Checks** | ✅ PASSED | TypeScript check succeeded on all routes |
