"use client";
import { MessagesProvider } from "@/context/messages";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FC, ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { BreweryProvider } from "@/context/brewery-beer";
import { ToastProvider } from "@/context/toast";
import { FlatfileProvider } from "@flatfile/react";

interface ProviderProps {
  children: ReactNode;
}

const Provider: FC<ProviderProps> = ({ children }) => {
  const queryClient = new QueryClient();
  const PUBLISHABLE_KEY = "pk_c3e79bef76034e9c94f65581643f09cf";

  return (
    <SessionProvider>
      <BreweryProvider>
        <FlatfileProvider publishableKey={PUBLISHABLE_KEY}>
          <ToastProvider>
            <QueryClientProvider client={queryClient}>
              <MessagesProvider>{children}</MessagesProvider>
            </QueryClientProvider>
          </ToastProvider>
        </FlatfileProvider>
      </BreweryProvider>
    </SessionProvider>
  );
};

export default Provider;
