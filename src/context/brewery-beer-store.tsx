"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Beer } from "@/types/beer";
import { Brewery } from "@/types/brewery";
import getBreweryBeers from "@/lib/getBreweryBeers";
import getSingleBrewery from "@/lib/getSingleBrewery";
import { User } from "next-auth";

interface BreweryState {
  user: User | null;
  setUser: (user: User | null) => void;
  selectedBrewery: Brewery | null;
  setSelectedBrewery: (
    brewery: Brewery | null,
    user: User | null
  ) => Promise<void>;
  updateSelectedBrewery: (
    updates: Partial<Brewery> | ((prev: Brewery) => Partial<Brewery>)
  ) => void;
  selectedBeers: Beer[] | null;
  setSelectedBeers: (beers: Beer[] | null) => void;
  beersLoading: boolean | null;
  setBeersLoading: (loading: boolean) => void;
  breweryLoading: boolean | null;
  setBreweryLoading: (loading: boolean) => void;
  isAdmin: boolean;
}

export const useBreweryStore = create<BreweryState>()(
  persist(
    (set, get) => ({
      selectedBrewery: null,

      // Set the selected brewery and fetch additional details
      setSelectedBrewery: async (brewery) => {
        console.log({ brewery });
        if (!brewery) {
          set({
            user: null,
            selectedBrewery: null,
            selectedBeers: null,
            beersLoading: false,
            breweryLoading: false,
            isAdmin: false,
          });
          return;
        }

        const breweryId = brewery._id;
        set({ breweryLoading: true, beersLoading: true });

        try {
          const [fetchedBrewery, beers] = await Promise.all([
            getSingleBrewery([
              `https://beer-bible-api.vercel.app/breweries/${breweryId}`,
            ]),
            getBreweryBeers([
              `https://beer-bible-api.vercel.app/breweries/${breweryId}/beers`,
            ]),
          ]);
          console.log({ fetchedBrewery, beers });
          const user = get().user;
          const isAdmin =
            fetchedBrewery.admin?.includes(user?.id) ||
            fetchedBrewery.owner === user?.id;

          set({
            user,
            selectedBrewery: fetchedBrewery,
            selectedBeers: beers,
            beersLoading: false,
            breweryLoading: false,
            isAdmin,
          });
        } catch (error) {
          console.error("Error fetching brewery data:", error);
          set({
            user: null,
            selectedBrewery: null,
            selectedBeers: null,
            beersLoading: false,
            breweryLoading: false,
            isAdmin: false,
          });
        }
      },

      // Update selected brewery partially
      updateSelectedBrewery: (updates) => {
        set((state) => ({
          selectedBrewery: state.selectedBrewery
            ? { ...state.selectedBrewery, ...updates }
            : null,
        }));
      },
      user: null,
      setUser: (user) => set({ user }),
      selectedBeers: null,
      setSelectedBeers: (beers) => set({ selectedBeers: beers }),
      beersLoading: null,
      setBeersLoading: (loading) => set({ beersLoading: loading }),
      breweryLoading: null,
      setBreweryLoading: (loading) => set({ breweryLoading: loading }),

      isAdmin: false,
    }),
    {
      name: "selectedBreweryId", // Persist the brewery ID only
      onRehydrateStorage: () => async (state) => {
        console.log("Rehydrating state...", state);
        // const breweryId = state?.selectedBrewery?._id;

        // if (!breweryId) {
        //   console.info("No brewery ID found to rehydrate.");
        //   return;
        // }

        // try {
        //   const fetchedBrewery = await getSingleBrewery([
        //     `https://beer-bible-api.vercel.app/breweries/${breweryId}`,
        //   ]);

        //   state?.updateSelectedBrewery(fetchedBrewery);
        // } catch (error) {
        //   console.error("Error during rehydration:", error);
        // }
      },

      partialize: (state) => ({
        selectedBrewery: state.selectedBrewery
          ? { _id: state.selectedBrewery._id }
          : null, // Persist only the `_id` of the brewery
      }),
    }
  )
);
