"use client";
import { MessagesProvider } from "@/context/messages";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FC, ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { BreweryProvider } from "@/context/brewery-beer";
import { ToastProvider } from "@/context/toast";

interface ProviderProps {
  children: ReactNode;
}

const Provider: FC<ProviderProps> = ({ children }) => {
  const queryClient = new QueryClient();

  return (
    <SessionProvider>
      <BreweryProvider>
        <ToastProvider>
          <QueryClientProvider client={queryClient}>
            <MessagesProvider>{children}</MessagesProvider>
          </QueryClientProvider>
        </ToastProvider>
      </BreweryProvider>
    </SessionProvider>
  );
};

export default Provider;
