"use client";

import { Provider as ChakraUiProvider } from "@/components/ui/provider";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ChakraUiProvider>{children}</ChakraUiProvider>
    </SessionProvider>
  );
}
