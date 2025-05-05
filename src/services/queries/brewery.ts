"use client";

import { useAuthFetcher } from "@/hooks/use-auth-fetcher";
import useSWR from "swr";

export const useGetBreweryById = (breweryId: string | null) => {
  const httpClient = useAuthFetcher();

  const { data, error, isLoading, mutate } = useSWR(
    breweryId ? `/breweries/${breweryId}` : null,
    httpClient.getById
  );

  return { data, error, isLoading, mutate };
};
