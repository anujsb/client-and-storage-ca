import { db } from "@/lib/db";
import { employees, fileCheckouts } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import type { CreateEmployeeInput, UpdateEmployeeInput } from "@/types/employee";

export const EmployeeService = {
  async listEmployees(tenantId: string) {
    return db.query.employees.findMany({
      where: eq(employees.tenantId, tenantId),
      orderBy: (employees, { asc }) => [asc(employees.name)],
    });
  },

  async getEmployeeById(tenantId: string, employeeId: string) {
    return db.query.employees.findFirst({
      where: and(
        eq(employees.tenantId, tenantId),
        eq(employees.id, employeeId)
      ),
    });
  },

  async createEmployee(tenantId: string, input: CreateEmployeeInput) {
    const [employee] = await db
      .insert(employees)
      .values({
        tenantId,
        name: input.name,
        phone: input.phone ?? null,
        email: input.email || null,
      })
      .returning();
    return employee;
  },

  async updateEmployee(
    tenantId: string,
    employeeId: string,
    input: UpdateEmployeeInput
  ) {
    const [updated] = await db
      .update(employees)
      .set({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.phone !== undefined && { phone: input.phone }),
        ...(input.email !== undefined && { email: input.email || null }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      })
      .where(
        and(eq(employees.tenantId, tenantId), eq(employees.id, employeeId))
      )
      .returning();
    return updated;
  },

  async deleteEmployee(tenantId: string, employeeId: string) {
    const [deleted] = await db
      .delete(employees)
      .where(
        and(eq(employees.tenantId, tenantId), eq(employees.id, employeeId))
      )
      .returning();
    return deleted;
  },

  // Returns IDs of documents currently held by each employee
  async getActiveCheckoutCounts(tenantId: string): Promise<Record<string, number>> {
    const active = await db.query.fileCheckouts.findMany({
      where: and(
        eq(fileCheckouts.tenantId, tenantId),
        isNull(fileCheckouts.checkedInAt)
      ),
      columns: { employeeId: true },
    });

    const counts: Record<string, number> = {};
    for (const row of active) {
      counts[row.employeeId] = (counts[row.employeeId] ?? 0) + 1;
    }
    return counts;
  },
};
