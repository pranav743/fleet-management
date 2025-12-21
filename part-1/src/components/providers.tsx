"use client";

import { Provider as ChakraUiProvider } from "@/components/ui/provider";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ChakraUiProvider>
        {children}
        <Toaster />
      </ChakraUiProvider>
    </SessionProvider>
  );
}
