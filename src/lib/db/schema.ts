import { pgTable, uuid, text, timestamp, boolean, integer, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["owner", "admin"]);

export const documentStatusEnum = pgEnum("document_status", [
    "in_office",
    "checked_out",
    "missing",
    "returned_to_client",
]);

export const workStatusEnum = pgEnum("work_status", [
    "pending",
    "in_progress",
    "under_review",
    "completed",
]);

export const workPriorityEnum = pgEnum("work_priority", [
    "low",
    "normal",
    "medium",
    "high",
    "urgent",
]);

export const filingTypeEnum = pgEnum("filing_type", [
    "ITR",
    "GST",
    "TDS",
    "Audit",
    "custom",
]);

export const filingCategoryEnum = pgEnum("filing_category", [
    "gst",
    "income_tax",
    "tds",
    "audit",
    "other",
]);

export const filingFrequencyEnum = pgEnum("filing_frequency", [
    "monthly",
    "quarterly",
    "annually",
    "on_demand",
]);

export const filingRecordStatusEnum = pgEnum("filing_record_status", [
    "pending",
    "in_progress",
    "filed",
    "late_filed",
    "not_applicable",
]);

export const paymentModeEnum = pgEnum("payment_mode", [
    "cash",
    "bank_transfer",
    "upi",
    "cheque",
    "other",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
    "file_checked_out",
    "file_checked_in",
    "file_overdue",
    "work_status_changed",
    "payment_due",
]);

// ─── Tenants ──────────────────────────────────────────────────────────────────

export const tenants = pgTable("tenants", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(), // used in URLs / lookup
    gstin: text("gstin"),
    email: text("email"),
    phone: text("phone"),
    address: text("address"),
    preferences: jsonb("preferences").$type<{
        emailAlerts?: boolean;
        overdueAlerts?: boolean;
        paymentAlerts?: boolean;
        defaultTaskView?: string;
    }>(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull().default("owner"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Employees ────────────────────────────────────────────────────────────────
// Named records only. No login. Used for work assignment + checkout tracking.

export const employees = pgTable("employees", {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phone: text("phone"),
    email: text("email"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Clients ──────────────────────────────────────────────────────────────────

export const clients = pgTable("clients", {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    clientCode: text("client_code").notNull(), // C-0001, C-0002, etc.
    pan: text("pan").notNull(),                // unique per tenant, validated
    name: text("name").notNull(),
    phone: text("phone"),
    email: text("email"),
    address: text("address"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Storage Locations ────────────────────────────────────────────────────────
// Self-referencing tree. Firms define their own structure.
// e.g. Cupboard A (root) > Shelf 2 > Section B (leaf)

export const storageLocations = pgTable("storage_locations", {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id"), // null = root node
    name: text("name").notNull(),
    levelLabel: text("level_label"), // e.g. "Cupboard", "Shelf", "Section"
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Documents ────────────────────────────────────────────────────────────────

export const documents = pgTable("documents", {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
        .notNull()
        .references(() => clients.id, { onDelete: "cascade" }),
    docCode: text("doc_code").notNull(), // C-0001-D-01, etc.
    docType: text("doc_type").notNull(), // free text — ITR, GST, invoice, etc.
    yearPeriod: text("year_period"), // e.g. "FY 2022-23"
    pagesVolume: text("pages_volume"), // e.g. "142 Pages (1 Vol)"
    description: text("description"),
    tags: jsonb("tags").$type<string[]>(),
    customFields: jsonb("custom_fields").$type<Record<string, string>>(),
    status: documentStatusEnum("status").notNull().default("in_office"),
    locationId: uuid("location_id").references(() => storageLocations.id, {
        onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── File Checkouts ───────────────────────────────────────────────────────────

export const fileCheckouts = pgTable("file_checkouts", {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    documentId: uuid("document_id")
        .notNull()
        .references(() => documents.id, { onDelete: "cascade" }),
    employeeId: uuid("employee_id")
        .notNull()
        .references(() => employees.id, { onDelete: "restrict" }),
    workId: uuid("work_id"), // optional — link to a work record
    purpose: text("purpose"),
    checkedOutAt: timestamp("checked_out_at").notNull().defaultNow(),
    checkedInAt: timestamp("checked_in_at"), // null = currently checked out
});

// ─── Filing Types ─────────────────────────────────────────────────────────────
// Master list of CA filing types. null tenantId = system-wide defaults.

export const filingTypes = pgTable("filing_types", {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }), // null = system default
    code: text("code").notNull(),           // e.g. "GSTR-1", "ITR", "ETDS-26Q"
    name: text("name").notNull(),           // e.g. "GSTR-1 – Outward Supplies (Monthly)"
    category: filingCategoryEnum("category").notNull().default("other"),
    frequency: filingFrequencyEnum("frequency").notNull().default("monthly"),
    dueDay: integer("due_day"),             // Day of month (e.g. 11 for GSTR-1)
    dueMonthOffset: integer("due_month_offset").default(1), // 1 = following month
    requiresAckNo: boolean("requires_ack_no").notNull().default(true),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Client Filing Subscriptions ─────────────────────────────────────────────
// Which filing types does each client need?

export const clientFilingSubscriptions = pgTable("client_filing_subscriptions", {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
        .notNull()
        .references(() => clients.id, { onDelete: "cascade" }),
    filingTypeId: uuid("filing_type_id")
        .notNull()
        .references(() => filingTypes.id, { onDelete: "cascade" }),
    isActive: boolean("is_active").notNull().default(true),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Filing Records ───────────────────────────────────────────────────────────
// One row per client × filing type × period. The compliance tracker.

export const filingRecords = pgTable("filing_records", {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
        .notNull()
        .references(() => clients.id, { onDelete: "cascade" }),
    filingTypeId: uuid("filing_type_id")
        .notNull()
        .references(() => filingTypes.id, { onDelete: "cascade" }),
    periodLabel: text("period_label").notNull(),    // "Apr 2025", "Q1 FY2025-26", "FY 2024-25"
    periodStart: timestamp("period_start").notNull(),
    periodEnd: timestamp("period_end").notNull(),
    dueDate: timestamp("due_date").notNull(),
    status: filingRecordStatusEnum("status").notNull().default("pending"),
    filedDate: timestamp("filed_date"),
    acknowledgmentNo: text("acknowledgment_no"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Works ────────────────────────────────────────────────────────────────────

export const works = pgTable("works", {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
        .notNull()
        .references(() => clients.id, { onDelete: "cascade" }),
    employeeId: uuid("employee_id").references(() => employees.id, {
        onDelete: "set null",
    }),
    filingRecordId: uuid("filing_record_id").references(() => filingRecords.id, {
        onDelete: "set null",
    }),
    title: text("title").notNull(),
    filingType: filingTypeEnum("filing_type").notNull(),
    customFilingType: text("custom_filing_type"), // used when filingType = 'custom'
    status: workStatusEnum("status").notNull().default("pending"),
    priority: workPriorityEnum("priority").notNull().default("normal"),
    description: text("description"),
    tags: jsonb("tags").$type<string[]>(),
    subTasks: jsonb("sub_tasks").$type<Array<{ id: string; title: string; completed: boolean; assigneeId?: string }>>(),
    activityLog: jsonb("activity_log").$type<Array<{ id: string; type: string; message: string; timestamp: string; userId: string; userName: string }>>(),
    timeTracking: jsonb("time_tracking").$type<{ estimatedMinutes?: number; loggedMinutes?: number }>(),
    startedAt: timestamp("started_at"),
    dueDate: timestamp("due_date"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Work Documents (M2M) ─────────────────────────────────────────────────────

export const workDocuments = pgTable("work_documents", {
    id: uuid("id").primaryKey().defaultRandom(),
    workId: uuid("work_id")
        .notNull()
        .references(() => works.id, { onDelete: "cascade" }),
    documentId: uuid("document_id")
        .notNull()
        .references(() => documents.id, { onDelete: "cascade" }),
});

// ─── Payments ─────────────────────────────────────────────────────────────────

export const payments = pgTable("payments", {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
        .notNull()
        .references(() => clients.id, { onDelete: "cascade" }),
    filingType: text("filing_type").notNull(), // kept as text — flexible
    period: text("period").notNull(), // e.g. "FY 2024-25", "Q1 2025"
    totalAmount: integer("total_amount").notNull(), // stored in paise (₹1 = 100)
    paidAmount: integer("paid_amount").notNull().default(0),
    dueDate: timestamp("due_date"),
    paymentMode: paymentModeEnum("payment_mode"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Notifications ────────────────────────────────────────────────────────────

export const notifications = pgTable("notifications", {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    referenceId: uuid("reference_id"),   // id of related record (doc, work, payment)
    referenceType: text("reference_type"), // "document" | "work" | "payment"
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const tenantsRelations = relations(tenants, ({ many }) => ({
    users: many(users),
    employees: many(employees),
    clients: many(clients),
    storageLocations: many(storageLocations),
    documents: many(documents),
    works: many(works),
    payments: many(payments),
    notifications: many(notifications),
    filingTypes: many(filingTypes),
    clientFilingSubscriptions: many(clientFilingSubscriptions),
    filingRecords: many(filingRecords),
}));

export const usersRelations = relations(users, ({ one }) => ({
    tenant: one(tenants, { fields: [users.tenantId], references: [tenants.id] }),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
    tenant: one(tenants, { fields: [employees.tenantId], references: [tenants.id] }),
    checkouts: many(fileCheckouts),
    works: many(works),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
    tenant: one(tenants, { fields: [clients.tenantId], references: [tenants.id] }),
    documents: many(documents),
    works: many(works),
    payments: many(payments),
    filingSubscriptions: many(clientFilingSubscriptions),
    filingRecords: many(filingRecords),
}));

export const filingTypesRelations = relations(filingTypes, ({ one, many }) => ({
    tenant: one(tenants, { fields: [filingTypes.tenantId], references: [tenants.id] }),
    subscriptions: many(clientFilingSubscriptions),
    filingRecords: many(filingRecords),
}));

export const clientFilingSubscriptionsRelations = relations(clientFilingSubscriptions, ({ one }) => ({
    tenant: one(tenants, { fields: [clientFilingSubscriptions.tenantId], references: [tenants.id] }),
    client: one(clients, { fields: [clientFilingSubscriptions.clientId], references: [clients.id] }),
    filingType: one(filingTypes, { fields: [clientFilingSubscriptions.filingTypeId], references: [filingTypes.id] }),
}));

export const filingRecordsRelations = relations(filingRecords, ({ one, many }) => ({
    tenant: one(tenants, { fields: [filingRecords.tenantId], references: [tenants.id] }),
    client: one(clients, { fields: [filingRecords.clientId], references: [clients.id] }),
    filingType: one(filingTypes, { fields: [filingRecords.filingTypeId], references: [filingTypes.id] }),
    works: many(works),
}));

export const storageLocationsRelations = relations(storageLocations, ({ one, many }) => ({
    tenant: one(tenants, { fields: [storageLocations.tenantId], references: [tenants.id] }),
    parent: one(storageLocations, {
        fields: [storageLocations.parentId],
        references: [storageLocations.id],
        relationName: "children",
    }),
    children: many(storageLocations, { relationName: "children" }),
    documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
    tenant: one(tenants, { fields: [documents.tenantId], references: [tenants.id] }),
    client: one(clients, { fields: [documents.clientId], references: [clients.id] }),
    location: one(storageLocations, { fields: [documents.locationId], references: [storageLocations.id] }),
    checkouts: many(fileCheckouts),
    workDocuments: many(workDocuments),
}));

export const fileCheckoutsRelations = relations(fileCheckouts, ({ one }) => ({
    tenant: one(tenants, { fields: [fileCheckouts.tenantId], references: [tenants.id] }),
    document: one(documents, { fields: [fileCheckouts.documentId], references: [documents.id] }),
    employee: one(employees, { fields: [fileCheckouts.employeeId], references: [employees.id] }),
    work: one(works, { fields: [fileCheckouts.workId], references: [works.id] }),
}));

export const worksRelations = relations(works, ({ one, many }) => ({
    tenant: one(tenants, { fields: [works.tenantId], references: [tenants.id] }),
    client: one(clients, { fields: [works.clientId], references: [clients.id] }),
    employee: one(employees, { fields: [works.employeeId], references: [employees.id] }),
    filingRecord: one(filingRecords, { fields: [works.filingRecordId], references: [filingRecords.id] }),
    workDocuments: many(workDocuments),
}));

export const workDocumentsRelations = relations(workDocuments, ({ one }) => ({
    work: one(works, { fields: [workDocuments.workId], references: [works.id] }),
    document: one(documents, { fields: [workDocuments.documentId], references: [documents.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
    tenant: one(tenants, { fields: [payments.tenantId], references: [tenants.id] }),
    client: one(clients, { fields: [payments.clientId], references: [clients.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
    tenant: one(tenants, { fields: [notifications.tenantId], references: [tenants.id] }),
}));