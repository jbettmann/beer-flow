"use client";
import { MessagesProvider } from "@/context/messages";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FC, ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { BreweryProvider } from "@/context/brewery-beer";

interface ProviderProps {
  children: ReactNode;
}

const Provider: FC<ProviderProps> = ({ children }) => {
  const queryClient = new QueryClient();

  return (
    <SessionProvider>
      <BreweryProvider>
        <QueryClientProvider client={queryClient}>
          <MessagesProvider>{children}</MessagesProvider>
        </QueryClientProvider>
      </BreweryProvider>
    </SessionProvider>
  );
};

export default Provider;
