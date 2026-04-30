import { db } from "@/lib/db";
import { clients, documents, works, payments, employees, fileCheckouts } from "@/lib/db/schema";
import { eq, and, desc, sql, lt, isNotNull } from "drizzle-orm";

export class DashboardService {
    async getSummaryStats(tenantId: string) {
        // Run aggregations concurrently
        const [
            clientsResult,
            docsResult,
            worksResult,
            paymentsResult
        ] = await Promise.all([
            db.select({ count: sql<number>`count(*)` }).from(clients).where(eq(clients.tenantId, tenantId)),
            db.select({ count: sql<number>`count(*)` }).from(documents).where(eq(documents.tenantId, tenantId)),
            db.select({ count: sql<number>`count(*)` }).from(works).where(and(eq(works.tenantId, tenantId), eq(works.status, "pending"))),
            db.select({ count: sql<number>`count(*)` }).from(payments).where(and(
                eq(payments.tenantId, tenantId),
                lt(payments.paidAmount, payments.totalAmount),
                lt(payments.dueDate, new Date())
            )),
        ]);

        return {
            totalClients: Number(clientsResult[0]?.count || 0),
            totalDocuments: Number(docsResult[0]?.count || 0),
            pendingWorks: Number(worksResult[0]?.count || 0),
            overduePayments: Number(paymentsResult[0]?.count || 0),
        };
    }

    async getCheckedOutDocuments(tenantId: string) {
        const results = await db
            .select({
                id: documents.id,
                documentCode: documents.docCode,
                documentName: documents.docType,
                checkoutDate: fileCheckouts.checkedOutAt,
                client: {
                    name: clients.name,
                    clientCode: clients.clientCode,
                },
                employee: {
                    name: employees.name,
                }
            })
            .from(documents)
            .innerJoin(clients, eq(documents.clientId, clients.id))
            .innerJoin(fileCheckouts, and(
                eq(fileCheckouts.documentId, documents.id),
                sql`${fileCheckouts.checkedInAt} IS NULL`
            ))
            .innerJoin(employees, eq(fileCheckouts.employeeId, employees.id))
            .where(and(eq(documents.tenantId, tenantId), eq(documents.status, "checked_out")))
            .orderBy(desc(fileCheckouts.checkedOutAt))
            .limit(5);

        return results;
    }

    async getPendingPayments(tenantId: string) {
        const results = await db
            .select({
                id: payments.id,
                filingType: payments.filingType,
                period: payments.period,
                totalAmount: payments.totalAmount,
                paidAmount: payments.paidAmount,
                dueDate: payments.dueDate,
                client: {
                    name: clients.name,
                    clientCode: clients.clientCode,
                }
            })
            .from(payments)
            .innerJoin(clients, eq(payments.clientId, clients.id))
            .where(and(
                eq(payments.tenantId, tenantId),
                lt(payments.paidAmount, payments.totalAmount)
            ))
            .orderBy(payments.dueDate)
            .limit(5);

        return results.map(p => {
            const isOverdue = p.dueDate && new Date(p.dueDate) < new Date();
            return { ...p, status: isOverdue ? "overdue" : "pending" };
        });
    }

    async getRecentActivity(tenantId: string) {
        // Simplified activity feed by just pulling recent clients and works
        // Ideally we would have a unified audit log table
        const recentClients = await db
            .select({
                id: clients.id,
                title: clients.name,
                subtitle: sql<string>`'New client onboarded'`,
                date: clients.createdAt,
                type: sql<string>`'client'`,
            })
            .from(clients)
            .where(eq(clients.tenantId, tenantId))
            .orderBy(desc(clients.createdAt))
            .limit(3);

        const recentWorks = await db
            .select({
                id: works.id,
                title: works.title,
                subtitle: sql<string>`'New task created'`,
                date: works.createdAt,
                type: sql<string>`'work'`,
            })
            .from(works)
            .where(eq(works.tenantId, tenantId))
            .orderBy(desc(works.createdAt))
            .limit(3);

        const recentPayments = await db
            .select({
                id: payments.id,
                title: payments.filingType,
                subtitle: sql<string>`'Payment recorded'`,
                date: payments.createdAt,
                type: sql<string>`'payment'`,
            })
            .from(payments)
            .where(eq(payments.tenantId, tenantId))
            .orderBy(desc(payments.createdAt))
            .limit(3);

        const allActivity = [...recentClients, ...recentWorks, ...recentPayments]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 6);

        return allActivity;
    }

    async getDashboardData(tenantId: string) {
        const [stats, checkedOut, pendingPayments, activity] = await Promise.all([
            this.getSummaryStats(tenantId),
            this.getCheckedOutDocuments(tenantId),
            this.getPendingPayments(tenantId),
            this.getRecentActivity(tenantId)
        ]);

        return { stats, checkedOut, pendingPayments, activity };
    }
}
