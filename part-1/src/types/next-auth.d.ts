import { UserRole } from "@/types/auth";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      email?: string | null;
    } & DefaultSession["user"];

    accessToken?: string;
    error?: string;
  }

  interface User extends DefaultUser {
    id: string; // ✅ REQUIRED
    role: UserRole;
    accessToken: string;
    refreshToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    error?: string;
  }
}
