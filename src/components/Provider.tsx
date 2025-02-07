"use client";
import { MessagesProvider } from "@/context/messages";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FC, ReactNode } from "react";
import { SessionProvider, signOut } from "next-auth/react";
import { BreweryProvider } from "@/context/brewery-beer";
import { ToastProvider } from "@/context/toast";
import ThemeProvider from "./layout/ThemeToggle/theme-provider";
// import { FlatfileProvider } from "@flatfile/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { SWRConfig } from "swr";
import { fetcher } from "@/services/fetcher";

interface ProviderProps {
  children: ReactNode;
}

const Provider: FC<ProviderProps> = ({ children }) => {
  const queryClient = new QueryClient();
  const PUBLISHABLE_KEY = "pk_c3e79bef76034e9c94f65581643f09cf";

  return (
    <SessionProvider>
      <SWRConfig
        value={{
          fetcher,
          onSuccess: (data, key, config) => {
            console.log("Data fetched successfully:", data);
          },
          onError: async (error) => {
            if (error.message.includes("401")) {
              console.warn("Session expired, logging out...");
              await signOut(); // NextAuth handles token cleanup
            } else {
              console.error("Error fetching data:", error);
            }
          },
        }}
      >
        <NuqsAdapter>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <BreweryProvider>
              <ToastProvider>
                <QueryClientProvider client={queryClient}>
                  <MessagesProvider>{children}</MessagesProvider>
                </QueryClientProvider>
              </ToastProvider>
            </BreweryProvider>
          </ThemeProvider>
        </NuqsAdapter>
      </SWRConfig>
    </SessionProvider>
  );
};

export default Provider;
