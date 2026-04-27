import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

// Use in server components to get the current session
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