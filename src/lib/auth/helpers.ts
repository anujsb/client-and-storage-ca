import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";

// Use in server components + API routes to get the current session
export async function getSession() {
    return await auth();
}

// Use in server components that require auth — redirects to /login if not signed in
export async function requireAuth() {
    const session = await auth();
    if (!session?.user) redirect("/login");
    return session;
}

// Use in API routes — returns tenantId or throws 401
export async function getTenantId(): Promise<string> {
    const session = await auth();
    if (!session?.user?.tenantId) {
        throw new Error("UNAUTHORIZED");
    }
    return session.user.tenantId;
}

// Extend next-auth types
declare module "next-auth" {
    interface User {
        role: string;
        tenantId: string;
        tenantName: string;
        tenantSlug: string;
    }
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
            tenantId: string;
            tenantName: string;
            tenantSlug: string;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        tenantId: string;
        tenantName: string;
        tenantSlug: string;
    }
}