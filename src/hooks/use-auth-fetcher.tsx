"use client";

import { fetcher } from "@/services/fetcher";
import { httpClientMethods } from "@/services/utils/httpClientMethods";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export const useAuthFetcher = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const authFetcher = async (endpoint: string, options: RequestInit = {}) => {
    if (status === "loading") return null;

    if (!session?.user?.accessToken) {
      router.push("/auth/login"); // Redirect if no session
      return null;
    }

    const authHeaders = {
      Authorization: `Bearer ${session.user.accessToken}`,
    };

    return fetcher(endpoint, {
      ...options,
      headers: { ...authHeaders, ...options.headers },
    });
  };

  const httpClient = httpClientMethods(authFetcher);

  return httpClient;
};
