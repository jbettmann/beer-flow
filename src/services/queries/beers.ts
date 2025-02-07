"use client";
import { useAuthFetcher } from "@/hooks/use-auth-fetcher";
import useSWR from "swr";

export const useGetBeerByBreweryId = (
  breweryId: string | null,
  swrOptions = {}
) => {
  const httpClient = useAuthFetcher();
  const { data, error, isLoading, mutate } = useSWR(
    breweryId ? `/breweries/${breweryId}/beers` : null,
    httpClient.getById,
    {
      ...swrOptions,
    }
  );

  console.log("data", data);

  return { data, error, isLoading, mutate };
};
