"use client";
import { useBreweryContext } from "@/context/brewery-beer";
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

  return { data, error, isLoading, mutate };
};

export const useGetBeerById = (beerId: string | null, swrOptions = {}) => {
  const { selectedBrewery } = useBreweryContext();
  const httpClient = useAuthFetcher();
  const { data, error, isLoading, mutate } = useSWR(
    beerId && selectedBrewery
      ? `/breweries/${selectedBrewery?._id}/beers/${beerId}`
      : null,
    httpClient.getById,
    {
      ...swrOptions,
    }
  );

  return { data, error, isLoading, mutate };
};
