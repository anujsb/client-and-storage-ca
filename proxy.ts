import NextAuth from "next-auth";
import authConfig from "@/lib/auth/auth.config";

/**
 * proxy.ts — Next.js 16 replaced middleware.ts with this file.
 * IMPORTANT: Only import from auth.config.ts here, never from auth.ts.
 * auth.ts imports Drizzle/Neon which are not edge-compatible.
 */
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
    matcher: [
        /*
         * Match all paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico
         * - public folder files
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};