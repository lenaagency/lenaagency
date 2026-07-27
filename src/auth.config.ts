import type { NextAuthConfig } from "next-auth";
import type { MemberRole } from "@/lib/royalty-types";

/**
 * Edge-compatible auth config (used by middleware).
 * Credentials provider + bcrypt stay in auth.ts (Node only).
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      const isLoggedIn = !!auth?.user;
      if (path.startsWith("/royalties")) return isLoggedIn;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const u = user as { role?: MemberRole; org?: string; email?: string | null; name?: string | null };
        token.role = u.role;
        token.org = u.org;
        token.email = u.email;
        token.name = u.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const u = session.user as {
          role?: MemberRole;
          org?: string;
          email?: string | null;
          name?: string | null;
        };
        u.role = token.role as MemberRole | undefined;
        u.org = (token.org as string | undefined) ?? "";
        if (token.email) u.email = token.email as string;
        if (token.name) u.name = token.name as string;
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
