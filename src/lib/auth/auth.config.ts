import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * auth.config.ts — edge-safe config only.
 * No DB/ORM imports here. This is what proxy.ts imports.
 * The full auth.ts (with DB queries) is used everywhere else.
 */
export default {
    providers: [
        // Provider listed here so the proxy knows about it,
        // but the actual authorize() logic lives in auth.ts
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            // authorize is intentionally empty here — handled in auth.ts
            async authorize() {
                return null;
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isLoginPage = nextUrl.pathname.startsWith("/login");
            const isPublicPage = nextUrl.pathname === "/" || isLoginPage;

            if (isPublicPage) {
                // Redirect logged-in users away from landing/login to dashboard
                if (isLoggedIn) return Response.redirect(new URL("/dashboard", nextUrl));
                return true;
            }

            // All other routes require auth
            return isLoggedIn;
        },
    },
} satisfies NextAuthConfig;