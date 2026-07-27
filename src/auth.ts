import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { findMemberByEmail, verifyMemberPassword } from "@/lib/members";
import type { MemberRole } from "@/lib/royalty-types";

declare module "next-auth" {
  interface User {
    role?: MemberRole;
    org?: string;
  }
  interface Session {
    user: {
      email?: string | null;
      name?: string | null;
      role?: MemberRole;
      org?: string;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .toLowerCase()
          .trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const member = await findMemberByEmail(email);
        if (!member) return null;

        const ok = await verifyMemberPassword(member, password);
        if (!ok) return null;

        return {
          id: member.email,
          email: member.email,
          name: member.name,
          role: member.role,
          org: member.org,
        };
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
});
