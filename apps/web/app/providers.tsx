"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "@/components/common/Toaster/Toaster";
import { ToastProvider } from "@/components/ui/toast";
import { toastManager } from "@/lib/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider toastManager={toastManager}>
        {children}
        <Toaster />
      </ToastProvider>
    </QueryClientProvider>
  );
}
