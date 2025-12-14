import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { UserRole } from "@/types/auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Mock authentication logic
        if (
          credentials?.email === "owner@example.com" &&
          credentials?.password === "password"
        ) {
          return {
            id: "1",
            name: "Vehicle Owner",
            email: "owner@example.com",
            role: UserRole.VEHICLE_OWNER,
          };
        }
        if (
          credentials?.email === "driver@example.com" &&
          credentials?.password === "password"
        ) {
          return {
            id: "2",
            name: "Driver",
            email: "driver@example.com",
            role: UserRole.DRIVER,
          };
        }
        if (
          credentials?.email === "customer@example.com" &&
          credentials?.password === "password"
        ) {
          return {
            id: "3",
            name: "Customer",
            email: "customer@example.com",
            role: UserRole.CUSTOMER,
          };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as UserRole;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
