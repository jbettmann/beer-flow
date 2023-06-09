"use client";
import { MessagesProvider } from "@/context/messages";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FC, ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { UserProvider } from "@/context/userContext";

interface ProviderProps {
  children: ReactNode;
}

const Provider: FC<ProviderProps> = ({ children }) => {
  const queryClient = new QueryClient();

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <MessagesProvider>
          <UserProvider>{children}</UserProvider>
        </MessagesProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
};

export default Provider;
