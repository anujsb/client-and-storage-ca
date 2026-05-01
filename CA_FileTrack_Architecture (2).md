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

### Session 5 — CA Filing System (Phase 13)

**Core architecture decision**: Two separate but linked concepts.
- `filing_records` = compliance artifact ("GSTR-1 Apr 2025 filed on 9 May, ack: AA123456")
- `works` = task execution ("Priya: prepare GSTR-1 for Ramesh Traders")
- Linked via optional `works.filing_record_id` FK — works still exist independently

**New DB tables added + migrated to Neon:**
- `filing_types` — master list of 12 CA filing types with due-date rules. `tenantId = null` = system-wide defaults
- `client_filing_subscriptions` — M2M: which filing types a client needs
- `filing_records` — one row per client × filing type × period; tracks status, filed_date, acknowledgment_no
- `works.filing_record_id` FK added (nullable, links task to a compliance record)

**New enums added to schema:**
- `filing_category`: gst | income_tax | tds | audit | other
- `filing_frequency`: monthly | quarterly | annually | on_demand
- `filing_record_status`: pending | in_progress | filed | late_filed | not_applicable

**Seed data updated (`scripts/seed.ts`):**
- 12 system filing types seeded (GSTR-1, GSTR-1-Q, GSTR-3B, GSTR-3B-Q, GSTR-7, GSTR-9, ITR, ITR-AUDIT, TAX-AUDIT, ETDS-24Q, ETDS-26Q, ETDS-27Q)
- 2 sample clients with realistic subscriptions and filing records for FY 2024-25
- All Indian compliance due dates researched and hardcoded correctly

**New services:**
- `src/services/filing.service.ts` — full filing service: getFilingTypes, getClientSubscriptions, setClientSubscriptions, getClientFilingRecords, getUpcomingFilings, getClientFilingStats, updateFilingRecord, generateFilingRecords
- Period generation logic for monthly / quarterly (Indian FY quarters) / annual filings with correct eTDS quarterly deadlines

**New API routes:**
- `GET /api/filing-types` — all system + tenant filing types
- `GET|PUT /api/clients/[clientId]/subscriptions` — manage client filing subscriptions
- `GET /api/clients/[clientId]/filings` — all filing records for a client
- `POST /api/clients/[clientId]/filings/generate` — auto-generate records for a date range
- `PATCH /api/filing-records/[recordId]` — mark filed, enter ack number, update status
- `GET /api/filing-records/upcoming` — upcoming/overdue records across all clients (used by Works page)

**New UI components (`src/components/filings/`):**
- `FilingTypeBadge.tsx` — compact badge, color-coded by category (GST=emerald, Tax=blue, TDS=amber, Audit=purple)
- `FilingStatusBadge.tsx` — dot + label badge for all 5 statuses
- `FilingRecordTable.tsx` — compliance tracker with category filters, expandable rows, inline mark-as-filed, ack number entry
- `UpcomingFilingsPanel.tsx` — collapsible panel on Works page showing overdue/due-this-week/later filings across all clients

**Modified components:**
- `ClientForm.tsx` — full rewrite: filing type multi-select grouped by category; on create: saves subscriptions + auto-generates filing records
- `ClientTable.tsx` — added Filings column showing FilingTypeBadge chips (up to 4, +N overflow); `ClientService.getClients` now includes `filingSubscriptions` with Drizzle `with:`
- `ClientDetailTabs.tsx` (new) — `ClientOverviewTab` + `ClientFilingsTab` client components

**Redesigned client detail page (`/clients/[clientId]/page.tsx`):**
- 5 tabs: Overview | Filings ⭐ | Works | Documents | Payments (all with icons)
- Overview tab: profile card + filing type badges + 4 stat cards (Total/Overdue/InProgress/Filed) + upcoming filings mini-list + notes
- Filings tab: FilingRecordTable with stats header + Generate Filings button
- Works/Documents/Payments tabs: cards with deep-link buttons to global views

**Works page (`/works/page.tsx`):**
- `UpcomingFilingsPanel` added above the task board — shows overdue + due-this-week + due-later-this-month sections, each with Go to Client + Create Work buttons

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
- Can automatically create and link a dedicated physical storage folder when assigned a parent location.

### Document
- A physical file/document a client brings in
- Auto-assigned **Document Code**: `C-0001-D-01`, `C-0001-D-02`
- Always has a status: `in_office` | `checked_out` | `missing` | `returned_to_client`
- When in office → points to a Storage Location node
- When checked out → points to an Employee record

### Storage Location
- Firm defines a custom tree of physical locations
- A standard template is provided by default:
  - `Cupboard 1`
    - `Shelf 1 (GST)`
    - `Shelf 2 (Income Tax)`
    - `Shelf 3 (Tax Audit)`
    - `Shelf 4 (Trust Audit)`
  - `Cupboard 2` (empty)
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
  id (uuid), name, slug, gstin, email, phone, address, preferences (jsonb), created_at

users
  id (uuid), tenant_id, name, email, password_hash, role (owner|admin), created_at

employees
  id (uuid), tenant_id, name, phone, email, is_active, created_at
  -- Named records only. No login. Used for assignment + checkout tracking.

clients
  id (uuid), tenant_id, client_code (C-0001), pan, name, phone, email, address, notes, default_location_id -> storage_locations, created_at

--- FILING SYSTEM (Session 5) ---

filing_types                                           ← NEW
  id (uuid), tenant_id (null = system default), code, name,
  category (gst|income_tax|tds|audit|other),
  frequency (monthly|quarterly|annually|on_demand),
  due_day (int), due_month_offset (int),
  requires_ack_no (bool), description, is_active, created_at

client_filing_subscriptions                            ← NEW
  id (uuid), tenant_id, client_id → clients,
  filing_type_id → filing_types, is_active, notes, created_at

filing_records                                         ← NEW
  id (uuid), tenant_id, client_id → clients,
  filing_type_id → filing_types,
  period_label ("Apr 2025" / "Q1 FY25-26" / "FY 2024-25"),
  period_start (date), period_end (date), due_date (date),
  status (pending|in_progress|filed|late_filed|not_applicable),
  filed_date (nullable), acknowledgment_no (nullable),
  notes, created_at

---------------------------------

storage_locations
  id (uuid), tenant_id, parent_id (self-ref nullable), name, level_label, sort_order, created_at

documents
  id (uuid), tenant_id, client_id, doc_code (C-0001-D-01), doc_type,
  year_period, pages_volume, description, tags (jsonb),
  status, location_id (nullable), created_at

file_checkouts
  id (uuid), tenant_id, document_id, employee_id, checked_out_at,
  checked_in_at (nullable), purpose, work_id (nullable)

works
  id (uuid), tenant_id, client_id, employee_id,
  filing_record_id → filing_records (nullable),   ← ADDED
  title, filing_type (enum), custom_filing_type,
  status, priority, description, tags (jsonb),
  sub_tasks (jsonb), activity_log (jsonb), time_tracking (jsonb),
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
- [x] **T-28** Write `src/types/storage.ts` + Zod schema
- [x] **T-29** Write `src/services/storage.service.ts` — getTree, addNode, rename, delete
- [x] **T-30** Build `/api/storage-locations` + `[locationId]` routes
- [x] **T-31** Build `StorageTree.tsx` — tree view with inline add/rename/delete
- [x] **T-32** Build `LocationPicker.tsx` — drill-down select for use in document forms
- [x] **T-33** Build `/locations` page

### Phase 5 — Documents
- [x] **T-34** Write `src/types/document.ts` + Zod schema
- [x] **T-35** Write `src/services/document.service.ts` — list, getById, create (auto code), update, delete
- [x] **T-36** Build `/api/documents` + `[documentId]` routes
- [x] **T-37** Build `DocumentStatusBadge.tsx` — green/amber/red/gray
- [x] **T-38** Build `DocumentTable.tsx` — code, client, type, status, location or holder
- [x] **T-39** Build `DocumentForm.tsx` — with LocationPicker
- [x] **T-40** Build `/documents` page — global list with status filter tabs

### Phase 6 — Checkout System
- [x] **T-41** Write `src/services/checkout.service.ts` — checkOut, checkIn, getActive
- [x] **T-42** Build `POST /api/documents/[documentId]/checkout`
- [x] **T-43** Build `PATCH /api/documents/[documentId]/checkout` (check in)
- [x] **T-44** Build `CheckoutDialog.tsx` — pick employee, enter purpose
- [x] **T-45** Build `CheckinDialog.tsx` — confirm return, set new storage location
- [x] **T-46** Wire checkout/checkin into `/documents` page and `/documents/[documentId]`

### Phase 7 — Works
- [x] **T-47** Write `src/types/work.ts` + Zod schema
- [x] **T-48** Write `src/services/work.service.ts`
- [x] **T-49** Build `/api/works` + `[workId]` routes
- [x] **T-50** Build `WorkStatusBadge.tsx`
- [x] **T-51** Build `WorkTable.tsx` / `WorksBoardClient.tsx`
- [x] **T-52** Build `WorkForm.tsx` — link client, employee, documents, filing type
- [x] **T-53** Build `/works` page — active works with status filter

### Phase 8 — Payments
- [x] **T-54** Write `src/types/payment.ts` + Zod schema
- [x] **T-55** Write `src/services/payment.service.ts` — auto-compute payment status
- [x] **T-56** Build `/api/payments` + `[paymentId]` routes
- [x] **T-57** Build `PaymentStatusBadge.tsx` — unpaid/partial/paid
- [x] **T-58** Build `PaymentTable.tsx` + `PaymentForm.tsx`
- [x] **T-59** Build `/payments` page — all payments with status filter

### Phase 9 — Dashboard
- [ ] **T-60** Build `StatCard.tsx` — reusable metric tile
- [ ] **T-61** Build `CheckedOutList.tsx` — docs out, employee name, days elapsed
- [ ] **T-62** Build `PendingPaymentsList.tsx` — overdue + upcoming dues
- [ ] **T-63** Build `RecentActivityFeed.tsx` — checkouts, status changes, new clients
- [ ] **T-64** Build `/` dashboard page — assemble all components

### Phase 10 — Notifications
- [x] **T-65** Write `src/services/notification.service.ts` — create, markRead, getUnread
- [x] **T-66** Build `/api/notifications` routes
- [x] **T-67** Wire triggers: checkout, checkin, work status change, payment due
- [x] **T-68** Build `NotificationBell.tsx` — badge count + dropdown list

### Phase 11 — Settings
- [ ] **T-69** Build `/settings` page — firm name, plan info
- [ ] **T-70** Build `/settings/filing-types` — manage custom filing types

### Phase 12 — Polish
- [ ] **T-71** `EmptyState.tsx` on all list pages
- [ ] **T-72** Skeleton loading states on all tables
- [ ] **T-73** Global search — by PAN, client name, client code, doc code
- [ ] **T-74** Mobile responsiveness pass

### Phase 13 — CA Filing & Compliance System ✅ COMPLETE
- [x] **T-75** Add `filing_types`, `client_filing_subscriptions`, `filing_records` tables to schema + `works.filing_record_id` FK
- [x] **T-76** Run `drizzle-kit push` — all new tables live in Neon
- [x] **T-77** Update `scripts/seed.ts` — 12 system filing types + 2 sample clients with subscriptions + realistic filing records
- [x] **T-78** Build `src/services/filing.service.ts` — full service layer (types, subscriptions, records, generation, stats, upcoming)
- [x] **T-79** Build `GET /api/filing-types` route
- [x] **T-80** Build `GET|PUT /api/clients/[clientId]/subscriptions` route
- [x] **T-81** Build `GET /api/clients/[clientId]/filings` route
- [x] **T-82** Build `POST /api/clients/[clientId]/filings/generate` route
- [x] **T-83** Build `PATCH /api/filing-records/[recordId]` route
- [x] **T-84** Build `GET /api/filing-records/upcoming` route
- [x] **T-85** Build `FilingTypeBadge.tsx` — category-colored compact badge
- [x] **T-86** Build `FilingStatusBadge.tsx` — dot+label for all 5 statuses
- [x] **T-87** Build `FilingRecordTable.tsx` — full compliance tracker with filters, expandable rows, inline mark-as-filed
- [x] **T-88** Build `UpcomingFilingsPanel.tsx` — collapsible panel: overdue / due-this-week / later sections
- [x] **T-89** Rewrite `ClientForm.tsx` — filing type multi-select grouped by category + auto-generate on create
- [x] **T-90** Update `ClientTable.tsx` + `ClientService.getClients` — filing badges column
- [x] **T-91** Build `ClientDetailTabs.tsx` — `ClientOverviewTab` + `ClientFilingsTab` client components
- [x] **T-92** Redesign `/clients/[clientId]/page.tsx` — 5-tab layout (Overview, Filings, Works, Documents, Payments)
- [x] **T-93** Update `/works/page.tsx` — `UpcomingFilingsPanel` above the task board

### Filing Type Reference (System Defaults)
| Code | Name | Category | Frequency | Due Rule |
|---|---|---|---|---|
| `GSTR-1` | Outward Supplies (Monthly) | GST | Monthly | 11th of following month |
| `GSTR-1-Q` | Outward Supplies (Quarterly/QRMP) | GST | Quarterly | 13th of following month |
| `GSTR-3B` | Summary Return (Monthly) | GST | Monthly | 20th of following month |
| `GSTR-3B-Q` | Summary Return (Quarterly/QRMP) | GST | Quarterly | 22nd of following month |
| `GSTR-7` | TDS Under GST | GST | Monthly | 10th of following month |
| `GSTR-9` | Annual Return | GST | Annually | 31 Dec of following FY |
| `ITR` | Income Tax Return (Non-Audit) | Income Tax | Annually | 31 Jul |
| `ITR-AUDIT` | Income Tax Return (Audit) | Income Tax | Annually | 31 Oct |
| `TAX-AUDIT` | Tax Audit Report (Form 3CD) | Audit | Annually | 30 Sep |
| `ETDS-24Q` | Salary TDS (Form 24Q) | TDS | Quarterly | Q1:31Jul, Q2:31Oct, Q3:31Jan, Q4:31May |
| `ETDS-26Q` | Non-Salary TDS (Form 26Q) | TDS | Quarterly | same as 24Q |
| `ETDS-27Q` | NRI TDS (Form 27Q) | TDS | Quarterly | same as 24Q |

---

## UI Design Principles (Premium Data-Rich Aesthetic)

### 1. Primary Color Palette (Tailwind-compatible)
- **Brand (Primary Blue):**
  - `--brand-50: #eff6ff` (Light backgrounds, hover states)
  - `--brand-500: #3b82f6` (Primary buttons, active icons)
  - `--brand-600: #2563eb` (Deep brand color)
  - `--brand-900: #1e3a8a` (Headings, bold text)
- **Neutral (Slate):**
  - `--bg-main: #f8fafc` (The global background color)
  - `--border-light: #f1f5f9` (Subtle dividers)
  - `--border-base: #e2e8f0` (Main card/input borders)
  - `--text-muted: #64748b` (Helper text, secondary labels)
  - `--text-dark: #0f172a` (Primary body text)

### 2. Status Color Tokens
| Status Type | Background (10%) | Text & Border | Hex |
|---|---|---|---|
| In Office / Paid / Success | `bg-green-50` | `text-green-600` | `#10b981` |
| Checked Out / Partial / Review | `bg-amber-50` | `text-amber-600` | `#f59e0b` |
| Missing / Unpaid / Alert | `bg-red-50` | `text-red-600` | `#ef4444` |
| In Progress / Task Active | `bg-blue-50` | `text-blue-600` | `#3b82f6` |
| Pending / Default | `bg-slate-50` | `text-slate-600` | `#64748b` |

### 3. Typography & Spacing
- **Font Family:** Inter, system-ui, sans-serif.
- **Base Text Size:** 14px (0.875rem) for body text.
- **Border Radius:** 0.75rem (12px) for cards, 1.5rem (24px) for dashboard containers.
- **Shadows:** `0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)` (Soft Shadow).

### 4. Component Guidelines
- **Cards:** White bg, `#e2e8f0` border, soft shadow.
- **Badges:** Rounded (8px), weight 500, with a matching status color dot indicator.
- **Tables:** Minimalist headers, uppercase, small tracking, hover row interactivity.
- **Background Pattern:** Subtle dot grid (radial gradient at 32px intervals).

### 5. Mobile Adaptation
- Convert sidebars to bottom nav/hamburger.
- Turn tables into stacked list cards.
- FAB for critical actions (Log Document, New Task).

