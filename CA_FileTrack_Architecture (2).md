# CA FileTrack — Architecture & Project Context

> Single source of truth. Updated after every completed task.

---

## Conversation Log

### Session 1 — Architecture Decisions
- Multi-tenant SaaS (multiple CA firms, each is a tenant)
- Physical storage: flexible — firm defines their own structure (cupboards, cabinets, racks, etc.)
- **Auth: Single shared login per firm for now** — one owner account per tenant. Employee logins deferred to later phase.
- Employees still exist as named records (for assignment/tracking), just no separate login yet.
- Filing types: ITR, GST, TDS, Audit + firm can add custom types
- Notifications: file taken/returned, work status change, payment due reminders
- Tech stack confirmed: Next.js (App Router, src/, TypeScript, Tailwind), shadcn/ui, Neon + Drizzle ORM, NextAuth v5

### Session 2 — File Structure & Dev Task Breakdown
- Auth simplified to single login per firm (employee logins = later phase)
- Employees exist as named DB records only — used for work assignment + checkout tracking
- Full project file structure defined (see below)
- Development broken into small sequential tasks across 12 phases (see Dev Roadmap)
- No plan field on tenants for now — keep it simple

### Session 4 — T-09 to T-13 Complete (Phase 1: Shell & Layout)
- **T-09** `src/app/(dashboard)/layout.tsx` — server component, calls `requireAuth`, renders Sidebar + Topbar
- **T-10** `src/components/layout/Sidebar.tsx` — client component, `usePathname` for active state, indigo highlight
- **T-11** `src/components/layout/Topbar.tsx` — firm name from session, logout via `signOut`, NotificationBell placeholder
- **T-12** `src/components/layout/PageHeader.tsx` — reusable title + optional description + optional action slot
- **T-13** `src/app/(auth)/login/page.tsx` — client component, `signIn("credentials")`, redirect on success, inline error state
- `src/app/(auth)/layout.tsx` — centered auth shell
- `src/components/shared/NotificationBell.tsx` — placeholder, fully wired in T-68
- `src/app/(dashboard)/page.tsx` — stub dashboard, filled in Phase 9

### Session 3 — T-04 to T-08 Complete
- **T-04** `src/lib/db/schema.ts` — all 11 tables + enums + relations written with Drizzle ORM
- **T-05** Pending — run `npx drizzle-kit push` manually to apply to Neon
- **T-06** `src/lib/auth/config.ts` — NextAuth v5 credentials provider; JWT stores tenantId, role, tenantName
- **T-06** `src/lib/auth/helpers.ts` — `getSession`, `requireAuth`, `getTenantId` + type augmentation
- **T-06** `src/app/api/auth/[...nextauth]/route.ts` — NextAuth route handler
- **T-07** `middleware.ts` — protects all routes except `/login` and `/api/auth/*`; redirects logged-in users away from `/login`
- **T-08** `scripts/seed.ts` — creates demo tenant, owner user, 2 employees, storage locations, 1 sample client

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14+ (App Router, `src/`, TypeScript) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Neon (serverless Postgres) |
| ORM | Drizzle ORM |
| Auth | NextAuth v5 — credentials provider, single login per tenant |
| Email (later) | Resend |
| Hosting | Vercel |

---

## Core Concepts

### Client
- Identified by **PAN number** (unique per tenant)
- Auto-assigned **Client Code** on creation: `C-0001`, `C-0002` (FCFS)
- Client Code = label CA sticks on the physical folder

### Document
- A physical file/document a client brings in
- Auto-assigned **Document Code**: `C-0001-D-01`, `C-0001-D-02`
- Always has a status: `in_office` | `checked_out` | `missing` | `returned_to_client`
- When in office → points to a Storage Location node
- When checked out → points to an Employee record

### Storage Location
- Firm defines a custom tree of physical locations
- Example tree: `Cupboard A > Shelf 2 > Section B`
- Levels named by the firm (Cabinet, Drawer, Rack, Box…)
- Document location = leaf node in this tree

### Checkout
- Log of a document leaving the shelf and going to an employee
- Records: employee, date, purpose/work reference
- On return: location updated, checkout closed

### Work / Task
- Links: Client + Document(s) + Employee + Filing Type + Status
- Statuses: `pending` → `in_progress` → `under_review` → `completed`

### Payment
- Per client, per filing type, per period (e.g. FY 2024-25)
- Tracks total amount, paid amount, due date
- Auto-status: `unpaid` | `partial` | `paid`

---

## Database Schema

```
tenants
  id (uuid), name, slug, plan, created_at

users
  id (uuid), tenant_id, name, email, password_hash, role (owner|admin), created_at

employees
  id (uuid), tenant_id, name, phone, email, is_active, created_at
  -- Named records only. No login. Used for assignment + checkout tracking.

clients
  id (uuid), tenant_id, client_code (C-0001), pan, name, phone, email, address, notes, created_at

documents
  id (uuid), tenant_id, client_id, doc_code (C-0001-D-01), doc_type,
  description, status, location_id (nullable), created_at

storage_locations
  id (uuid), tenant_id, parent_id (self-ref nullable), name, level_label, sort_order, created_at

file_checkouts
  id (uuid), tenant_id, document_id, employee_id, checked_out_at,
  checked_in_at (nullable), purpose, work_id (nullable)

works
  id (uuid), tenant_id, client_id, employee_id, filing_type,
  custom_filing_type (nullable), status, description,
  started_at, due_date, completed_at, created_at

work_documents
  id (uuid), work_id, document_id

payments
  id (uuid), tenant_id, client_id, filing_type, period,
  total_amount, paid_amount, due_date, payment_mode, notes, created_at

notifications
  id (uuid), tenant_id, type, message, is_read, reference_id, reference_type, created_at
```

---

## Project File Structure

```
ca-filetrack/
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx              ✅ T-13
│   │   │   └── layout.tsx                ✅ T-13
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                ✅ T-09
│   │   │   ├── page.tsx                  ✅ stub → filled Phase 9
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [clientId]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── documents/page.tsx
│   │   │   │       ├── works/page.tsx
│   │   │   │       └── payments/page.tsx
│   │   │   ├── documents/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [documentId]/page.tsx
│   │   │   ├── works/
│   │   │   │   └── page.tsx
│   │   │   ├── payments/
│   │   │   │   └── page.tsx
│   │   │   ├── employees/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       ├── page.tsx
│   │   │       ├── storage/page.tsx
│   │   │       └── filing-types/page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts          ✅ T-06
│   │       ├── clients/
│   │       │   ├── route.ts
│   │       │   └── [clientId]/route.ts
│   │       ├── documents/
│   │       │   ├── route.ts
│   │       │   └── [documentId]/
│   │       │       ├── route.ts
│   │       │       └── checkout/route.ts
│   │       ├── works/
│   │       │   ├── route.ts
│   │       │   └── [workId]/route.ts
│   │       ├── payments/
│   │       │   ├── route.ts
│   │       │   └── [paymentId]/route.ts
│   │       ├── employees/
│   │       │   ├── route.ts
│   │       │   └── [employeeId]/route.ts
│   │       ├── storage-locations/
│   │       │   ├── route.ts
│   │       │   └── [locationId]/route.ts
│   │       └── notifications/
│   │           └── route.ts
│   │
│   ├── components/
│   │   ├── ui/                           # shadcn/ui — do not manually edit
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx               ✅ T-10
│   │   │   ├── Topbar.tsx                ✅ T-11
│   │   │   └── PageHeader.tsx            ✅ T-12
│   │   ├── clients/
│   │   │   ├── ClientTable.tsx
│   │   │   ├── ClientForm.tsx
│   │   │   └── ClientCard.tsx
│   │   ├── documents/
│   │   │   ├── DocumentTable.tsx
│   │   │   ├── DocumentForm.tsx
│   │   │   ├── DocumentStatusBadge.tsx
│   │   │   ├── CheckoutDialog.tsx
│   │   │   └── CheckinDialog.tsx
│   │   ├── works/
│   │   │   ├── WorkTable.tsx
│   │   │   ├── WorkForm.tsx
│   │   │   └── WorkStatusBadge.tsx
│   │   ├── payments/
│   │   │   ├── PaymentTable.tsx
│   │   │   ├── PaymentForm.tsx
│   │   │   └── PaymentStatusBadge.tsx
│   │   ├── employees/
│   │   │   ├── EmployeeTable.tsx
│   │   │   └── EmployeeForm.tsx
│   │   ├── storage/
│   │   │   ├── StorageTree.tsx
│   │   │   ├── StorageNode.tsx
│   │   │   └── LocationPicker.tsx
│   │   ├── dashboard/
│   │   │   ├── StatCard.tsx
│   │   │   ├── CheckedOutList.tsx
│   │   │   ├── PendingPaymentsList.tsx
│   │   │   └── RecentActivityFeed.tsx
│   │   └── shared/
│   │       ├── SearchInput.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── NotificationBell.tsx      ✅ placeholder → wired T-68
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts                  ✅ T-03
│   │   │   └── schema.ts                 ✅ T-04
│   │   ├── auth/
│   │   │   ├── auth.config.ts            ✅ T-06 (edge-safe)
│   │   │   ├── auth.ts                   ✅ T-06 (full, DB-aware)
│   │   │   └── helpers.ts                ✅ T-06
│   │   ├── validations/
│   │   │   ├── client.ts
│   │   │   ├── document.ts
│   │   │   ├── work.ts
│   │   │   ├── payment.ts
│   │   │   ├── employee.ts
│   │   │   └── storage.ts
│   │   └── utils.ts
│   │
│   ├── services/
│   │   ├── client.service.ts
│   │   ├── document.service.ts
│   │   ├── checkout.service.ts
│   │   ├── work.service.ts
│   │   ├── payment.service.ts
│   │   ├── employee.service.ts
│   │   ├── storage.service.ts
│   │   └── notification.service.ts
│   │
│   ├── types/
│   │   ├── client.ts
│   │   ├── document.ts
│   │   ├── work.ts
│   │   ├── payment.ts
│   │   ├── employee.ts
│   │   ├── storage.ts
│   │   ├── notification.ts
│   │   └── common.ts
│   │
│   └── hooks/
│       ├── useClients.ts
│       ├── useDocuments.ts
│       ├── useWorks.ts
│       ├── usePayments.ts
│       ├── useEmployees.ts
│       └── useNotifications.ts
│
├── drizzle/
│   └── migrations/
│
├── scripts/
│   └── seed.ts                           ✅ T-08
│
├── public/
│   └── logo.svg
│
├── proxy.ts                              ✅ T-07 (Next.js 16 — replaces middleware.ts)
├── drizzle.config.ts                     ✅ T-05
├── .env.local
├── tailwind.config.ts
└── next.config.ts
```

```
ca-filetrack/
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                # Sidebar + topbar shell
│   │   │   ├── page.tsx                  # Dashboard home
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx              # Client list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx          # Add client
│   │   │   │   └── [clientId]/
│   │   │   │       ├── page.tsx          # Client detail (tabbed)
│   │   │   │       ├── documents/
│   │   │   │       │   └── page.tsx
│   │   │   │       ├── works/
│   │   │   │       │   └── page.tsx
│   │   │   │       └── payments/
│   │   │   │           └── page.tsx
│   │   │   ├── documents/
│   │   │   │   ├── page.tsx              # All documents (global view)
│   │   │   │   └── [documentId]/
│   │   │   │       └── page.tsx          # Document detail + checkout history
│   │   │   ├── works/
│   │   │   │   └── page.tsx              # Work tracker
│   │   │   ├── payments/
│   │   │   │   └── page.tsx              # Payment overview
│   │   │   ├── employees/
│   │   │   │   └── page.tsx              # Employees + who holds what
│   │   │   └── settings/
│   │   │       ├── page.tsx              # General settings
│   │   │       ├── storage/
│   │   │       │   └── page.tsx          # Storage tree builder
│   │   │       └── filing-types/
│   │   │           └── page.tsx          # Custom filing types
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts
│   │       ├── clients/
│   │       │   ├── route.ts              # GET list, POST create
│   │       │   └── [clientId]/
│   │       │       └── route.ts          # GET, PATCH, DELETE
│   │       ├── documents/
│   │       │   ├── route.ts              # GET list, POST create
│   │       │   └── [documentId]/
│   │       │       ├── route.ts          # GET, PATCH, DELETE
│   │       │       └── checkout/
│   │       │           └── route.ts      # POST checkout, PATCH checkin
│   │       ├── works/
│   │       │   ├── route.ts
│   │       │   └── [workId]/
│   │       │       └── route.ts
│   │       ├── payments/
│   │       │   ├── route.ts
│   │       │   └── [paymentId]/
│   │       │       └── route.ts
│   │       ├── employees/
│   │       │   ├── route.ts
│   │       │   └── [employeeId]/
│   │       │       └── route.ts
│   │       ├── storage-locations/
│   │       │   ├── route.ts              # GET tree, POST add node
│   │       │   └── [locationId]/
│   │       │       └── route.ts          # PATCH rename, DELETE
│   │       └── notifications/
│   │           └── route.ts              # GET, PATCH mark read
│   │
│   ├── components/
│   │   ├── ui/                           # shadcn/ui — do not manually edit
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   └── PageHeader.tsx
│   │   ├── clients/
│   │   │   ├── ClientTable.tsx
│   │   │   ├── ClientForm.tsx
│   │   │   └── ClientCard.tsx
│   │   ├── documents/
│   │   │   ├── DocumentTable.tsx
│   │   │   ├── DocumentForm.tsx
│   │   │   ├── DocumentStatusBadge.tsx
│   │   │   ├── CheckoutDialog.tsx
│   │   │   └── CheckinDialog.tsx
│   │   ├── works/
│   │   │   ├── WorkTable.tsx
│   │   │   ├── WorkForm.tsx
│   │   │   └── WorkStatusBadge.tsx
│   │   ├── payments/
│   │   │   ├── PaymentTable.tsx
│   │   │   ├── PaymentForm.tsx
│   │   │   └── PaymentStatusBadge.tsx
│   │   ├── employees/
│   │   │   ├── EmployeeTable.tsx
│   │   │   └── EmployeeForm.tsx
│   │   ├── storage/
│   │   │   ├── StorageTree.tsx
│   │   │   ├── StorageNode.tsx
│   │   │   └── LocationPicker.tsx        # Drill-down picker used in document forms
│   │   ├── dashboard/
│   │   │   ├── StatCard.tsx
│   │   │   ├── CheckedOutList.tsx
│   │   │   ├── PendingPaymentsList.tsx
│   │   │   └── RecentActivityFeed.tsx
│   │   └── shared/
│   │       ├── SearchInput.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── NotificationBell.tsx
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts                  # Drizzle client (Neon connection)
│   │   │   └── schema.ts                 # All table definitions
│   │   ├── auth/
│   │   │   ├── config.ts                 # NextAuth config
│   │   │   └── helpers.ts                # getSession, requireAuth, getTenantId
│   │   ├── validations/                  # Zod schemas — one file per domain
│   │   │   ├── client.ts
│   │   │   ├── document.ts
│   │   │   ├── work.ts
│   │   │   ├── payment.ts
│   │   │   ├── employee.ts
│   │   │   └── storage.ts
│   │   └── utils.ts                      # generateClientCode, generateDocCode, cn()
│   │
│   ├── services/                         # Business logic — called by API routes only
│   │   ├── client.service.ts
│   │   ├── document.service.ts
│   │   ├── checkout.service.ts
│   │   ├── work.service.ts
│   │   ├── payment.service.ts
│   │   ├── employee.service.ts
│   │   ├── storage.service.ts
│   │   └── notification.service.ts
│   │
│   ├── types/                            # TypeScript types — one file per domain
│   │   ├── client.ts
│   │   ├── document.ts
│   │   ├── work.ts
│   │   ├── payment.ts
│   │   ├── employee.ts
│   │   ├── storage.ts
│   │   ├── notification.ts
│   │   └── common.ts                     # ApiResponse<T>, PaginatedResponse<T>, etc.
│   │
│   └── hooks/                            # Client-side data fetching hooks
│       ├── useClients.ts
│       ├── useDocuments.ts
│       ├── useWorks.ts
│       ├── usePayments.ts
│       ├── useEmployees.ts
│       └── useNotifications.ts
│
├── drizzle/
│   └── migrations/                       # Auto-generated by drizzle-kit
│
├── public/
│   └── logo.svg
│
├── drizzle.config.ts
├── middleware.ts                         # Auth guard — redirects /dashboard/* to /login
├── .env.local
├── tailwind.config.ts
└── next.config.ts
```

---

## Development Roadmap

Each task is one focused, completable unit. Check off as done.

### Phase 0 — Project Setup
- [x] **T-01** Init Next.js with TypeScript, Tailwind, `src/` dir, App Router
- [x] **T-02** Install + configure shadcn/ui (button, input, table, dialog, badge, dropdown-menu, select, form, toast, tabs, skeleton)
- [x] **T-03** Install Drizzle ORM + drizzle-kit, configure Neon DB connection
- [x] **T-04** Write full DB schema in `src/lib/db/schema.ts`
- [x] **T-05** Run first migration, verify all tables exist in Neon console
- [x] **T-06** Setup NextAuth v5 — credentials provider (email + password, tenant-scoped)
- [x] **T-07** Write `middleware.ts` — protect all `/(dashboard)` routes
- [x] **T-08** Write seed script — create one test tenant + owner user

### Phase 1 — Shell & Layout
- [x] **T-09** Build `(dashboard)/layout.tsx` — sidebar + topbar wrapper
- [x] **T-10** Build `Sidebar.tsx` — nav links with active state
- [x] **T-11** Build `Topbar.tsx` — firm name, notification bell placeholder, logout button
- [x] **T-12** Build `PageHeader.tsx` — reusable title + optional CTA button
- [x] **T-13** Build `/login` page — form + NextAuth `signIn()`

### Phase 2 — Clients
- [x] **T-14** Write `src/types/client.ts` + `src/lib/validations/client.ts` (Zod)
- [x] **T-15** Write `src/services/client.service.ts` — list, getById, create (auto code), update, delete
- [x] **T-16** Build `GET /POST /api/clients`
- [x] **T-17** Build `GET/PATCH/DELETE /api/clients/[clientId]`
- [x] **T-18** Build `ClientTable.tsx` — columns: code, name, PAN, phone, date added
- [x] **T-19** Build `ClientForm.tsx` — add/edit with validation
- [x] **T-20** Build `/clients` page — table + search bar + Add button
- [x] **T-21** Build `/clients/new` page
- [x] **T-22** Build `/clients/[clientId]` page — overview + tabs (Documents / Works / Payments)

### Phase 3 — Employees
- [x] **T-23** Write `src/types/employee.ts` + Zod schema
- [x] **T-24** Write `src/services/employee.service.ts`
- [x] **T-25** Build `/api/employees` + `/api/employees/[employeeId]` routes
- [x] **T-26** Build `EmployeeTable.tsx` + `EmployeeForm.tsx`
- [x] **T-27** Build `/employees` page — list + "currently holds" files column

### Phase 4 — Storage Locations
- [ ] **T-28** Write `src/types/storage.ts` + Zod schema
- [ ] **T-29** Write `src/services/storage.service.ts` — getTree, addNode, rename, delete
- [ ] **T-30** Build `/api/storage-locations` + `[locationId]` routes
- [ ] **T-31** Build `StorageTree.tsx` — tree view with inline add/rename/delete
- [ ] **T-32** Build `LocationPicker.tsx` — drill-down select for use in document forms
- [ ] **T-33** Build `/settings/storage` page

### Phase 5 — Documents
- [ ] **T-34** Write `src/types/document.ts` + Zod schema
- [ ] **T-35** Write `src/services/document.service.ts` — list, getById, create (auto code), update, delete
- [ ] **T-36** Build `/api/documents` + `[documentId]` routes
- [ ] **T-37** Build `DocumentStatusBadge.tsx` — green/amber/red/gray
- [ ] **T-38** Build `DocumentTable.tsx` — code, client, type, status, location or holder
- [ ] **T-39** Build `DocumentForm.tsx` — with LocationPicker
- [ ] **T-40** Build `/documents` page — global list with status filter tabs

### Phase 6 — Checkout System
- [ ] **T-41** Write `src/services/checkout.service.ts` — checkOut, checkIn, getActive
- [ ] **T-42** Build `POST /api/documents/[documentId]/checkout`
- [ ] **T-43** Build `PATCH /api/documents/[documentId]/checkout` (check in)
- [ ] **T-44** Build `CheckoutDialog.tsx` — pick employee, enter purpose
- [ ] **T-45** Build `CheckinDialog.tsx` — confirm return, set new storage location
- [ ] **T-46** Wire checkout/checkin into `/documents` page and `/documents/[documentId]`

### Phase 7 — Works
- [ ] **T-47** Write `src/types/work.ts` + Zod schema
- [ ] **T-48** Write `src/services/work.service.ts`
- [ ] **T-49** Build `/api/works` + `[workId]` routes
- [ ] **T-50** Build `WorkStatusBadge.tsx`
- [ ] **T-51** Build `WorkTable.tsx` — client, employee, filing type, status, due date
- [ ] **T-52** Build `WorkForm.tsx` — link client, employee, documents, filing type
- [ ] **T-53** Build `/works` page — active works with status filter

### Phase 8 — Payments
- [ ] **T-54** Write `src/types/payment.ts` + Zod schema
- [ ] **T-55** Write `src/services/payment.service.ts` — auto-compute payment status
- [ ] **T-56** Build `/api/payments` + `[paymentId]` routes
- [ ] **T-57** Build `PaymentStatusBadge.tsx` — unpaid/partial/paid
- [ ] **T-58** Build `PaymentTable.tsx` + `PaymentForm.tsx`
- [ ] **T-59** Build `/payments` page — all payments with status filter

### Phase 9 — Dashboard
- [ ] **T-60** Build `StatCard.tsx` — reusable metric tile
- [ ] **T-61** Build `CheckedOutList.tsx` — docs out, employee name, days elapsed
- [ ] **T-62** Build `PendingPaymentsList.tsx` — overdue + upcoming dues
- [ ] **T-63** Build `RecentActivityFeed.tsx` — checkouts, status changes, new clients
- [ ] **T-64** Build `/` dashboard page — assemble all components

### Phase 10 — Notifications
- [ ] **T-65** Write `src/services/notification.service.ts` — create, markRead, getUnread
- [ ] **T-66** Build `/api/notifications` routes
- [ ] **T-67** Wire triggers: checkout, checkin, work status change, payment due
- [ ] **T-68** Build `NotificationBell.tsx` — badge count + dropdown list

### Phase 11 — Settings
- [ ] **T-69** Build `/settings` page — firm name, plan info
- [ ] **T-70** Build `/settings/filing-types` — manage custom filing types

### Phase 12 — Polish
- [ ] **T-71** `EmptyState.tsx` on all list pages
- [ ] **T-72** Skeleton loading states on all tables
- [ ] **T-73** Global search — by PAN, client name, client code, doc code
- [ ] **T-74** Mobile responsiveness pass

---

## UI Design Principles

- Light theme 
- Single accent: 
- Status always visible via color-coded badges
- shadcn/ui components everywhere — no custom if shadcn has it
- Every list: search bar + filter + empty state + loading skeleton
- Dialogs only for quick actions (checkout, checkin, confirm delete) — not for full pages

## Status Badge Color Reference

| Status | Color |
|---|---|
| `in_office` | Green |
| `checked_out` | Amber |
| `missing` | Red |
| `returned_to_client` | Gray |
| Work `pending` | Slate |
| Work `in_progress` | Blue |
| Work `under_review` | Amber |
| Work `completed` | Green |
| Payment `unpaid` | Red |
| Payment `partial` | Amber |
| Payment `paid` | Green |
