"use client";

import { Toaster } from "sonner";
import type { ReactNode } from "react";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { TranslationProvider } from "@/providers/translation-provider";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <TranslationProvider>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            theme="dark"
            richColors
            closeButton
            toastOptions={{
              className: "glass-panel border-border",
            }}
          />
        </AuthProvider>
      </TranslationProvider>
    </ThemeProvider>
  );
}
