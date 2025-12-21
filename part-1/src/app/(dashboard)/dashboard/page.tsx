"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserRole } from "@/types/auth";
import { Center, Spinner } from "@chakra-ui/react";

export default function DashboardRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    switch (session.user.role) {
      case UserRole.OWNER:
        router.push("/owner");
        break;
      case UserRole.DRIVER:
        router.push("/driver");
        break;
      case UserRole.CUSTOMER:
        router.push("/customer");
        break;
      default:
        router.push("/login");
    }
  }, [session, status, router]);

  return (
    <Center h="100vh">
      <Spinner size="xl" />
    </Center>
  );
}
