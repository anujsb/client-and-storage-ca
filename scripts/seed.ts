/**
 * Seed script — run once to create your first tenant + owner account.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Requires DATABASE_URL in your .env.local
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";
import bcrypt from "bcryptjs";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
    console.log("🌱 Seeding database...");

    // ── 1. Create tenant ────────────────────────────────────────────────────────
    const [tenant] = await db
        .insert(schema.tenants)
        .values({
            name: "Demo CA Firm",
            slug: "demo-ca",
        })
        .returning();

    console.log(`✅ Tenant created: ${tenant.name} (${tenant.id})`);

    // ── 2. Create owner user ────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash("password123", 12);

    const [user] = await db
        .insert(schema.users)
        .values({
            tenantId: tenant.id,
            name: "CA Owner",
            email: "owner@demo-ca.com",
            passwordHash,
            role: "owner",
        })
        .returning();

    console.log(`✅ User created: ${user.email}`);

    // ── 3. Sample employees ─────────────────────────────────────────────────────
    await db.insert(schema.employees).values([
        { tenantId: tenant.id, name: "Priya Sharma", phone: "9876543210" },
        { tenantId: tenant.id, name: "Rahul Mehta", phone: "9123456780" },
    ]);

    console.log("✅ Sample employees created");

    // ── 4. Sample storage locations ─────────────────────────────────────────────
    const [cupboard] = await db
        .insert(schema.storageLocations)
        .values({
            tenantId: tenant.id,
            parentId: null,
            name: "Main Cupboard",
            levelLabel: "Cupboard",
            sortOrder: 1,
        })
        .returning();

    await db.insert(schema.storageLocations).values([
        {
            tenantId: tenant.id,
            parentId: cupboard.id,
            name: "Shelf 1",
            levelLabel: "Shelf",
            sortOrder: 1,
        },
        {
            tenantId: tenant.id,
            parentId: cupboard.id,
            name: "Shelf 2",
            levelLabel: "Shelf",
            sortOrder: 2,
        },
    ]);

    console.log("✅ Sample storage locations created");

    // ── 5. Sample client ─────────────────────────────────────────────────────────
    const [client] = await db
        .insert(schema.clients)
        .values({
            tenantId: tenant.id,
            clientCode: "C-0001",
            pan: "ABCDE1234F",
            name: "Ramesh Traders",
            phone: "9988776655",
            email: "ramesh@example.com",
        })
        .returning();

    console.log(`✅ Sample client created: ${client.name} (${client.clientCode})`);

    console.log("\n🎉 Seed complete!");
    console.log("─────────────────────────────────");
    console.log(`Login email    : owner@demo-ca.com`);
    console.log(`Login password : password123`);
    console.log("─────────────────────────────────");

    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});