"use client";

import { resolvePreferredBreweryId, toUniqueStringArray } from "@/lib/invite-flow";
import { useGetBeerByBreweryId } from "@/services/queries/beers";
import { useGetBreweryById } from "@/services/queries/brewery";
import { Beer } from "@/types/beer";
import { Brewery } from "@/types/brewery";
import Cookies from "js-cookie";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, {
  FC,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { mutate as mutateCache } from "swr";

type SelectOptions = { route?: string; replace?: boolean };

type BreweryContextProps = {
  selectedBrewery: Brewery | null;
  setSelectedBrewery: React.Dispatch<React.SetStateAction<Brewery | null>>;
  selectBrewery: (brewery: Brewery, options?: SelectOptions) => Promise<void>;
  mutateBrewery: () => void;
  selectedBeers: Beer[] | null;
  setBreweryId: (breweryId: string | null) => void;
  setSelectedBeers: React.Dispatch<React.SetStateAction<Beer[] | null>>;
  mutateBeers: () => void;
  beersLoading: boolean | null;
  breweryLoading: boolean | null;
  isAdmin: boolean;
};

const BreweryContext = createContext<BreweryContextProps | undefined>(undefined);

export const BreweryProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [selectedBrewery, setSelectedBrewery] = useState<Brewery | null>(null);
  const [selectedBeers, setSelectedBeers] = useState<Beer[] | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [breweryId, setBreweryIdState] = useState<string | null>(null);
  const canonicalIdRef = useRef<string | null>(null);
  const pendingSelectionIdRef = useRef<string | null | undefined>(undefined);
  const failedIdsRef = useRef(new Set<string>());
  const transitionSequenceRef = useRef(0);
  const sessionUpdateQueueRef = useRef<Promise<unknown>>(Promise.resolve());

  const { data: beers, error: beersError, isLoading: beersLoading, mutate: mutateBeers } =
    useGetBeerByBreweryId(breweryId);
  const { data: brewery, error: breweryError, isLoading: breweryLoading, mutate: mutateBrewery } =
    useGetBreweryById(breweryId);

  const persistSelection = useCallback((id: string | null) => {
    if (id) {
      Cookies.set("selectedBreweryId", id, { sameSite: "lax" });
      localStorage.setItem("selectedBreweryId", id);
      return;
    }

    Cookies.remove("selectedBreweryId");
    localStorage.removeItem("selectedBreweryId");
  }, []);

  const setCanonicalId = useCallback((id: string | null) => {
    canonicalIdRef.current = id;
    setBreweryIdState(id);
    persistSelection(id);
  }, [persistSelection]);

  const queueSessionUpdate = useCallback((payload: Record<string, unknown>) => {
    const request = sessionUpdateQueueRef.current.then(() => update(payload));
    sessionUpdateQueueRef.current = request.catch(() => undefined);
    return request;
  }, [update]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const memberships = toUniqueStringArray(session.user.breweries ?? []).filter(
      (id) => !failedIdsRef.current.has(id)
    );
    const sessionSelection = session.user.selectedBreweryId ?? null;
    const pendingSelection = pendingSelectionIdRef.current;

    // An explicit user transition is authoritative until NextAuth has applied it.
    // This prevents the previous session snapshot from switching the UI back.
    if (pendingSelection !== undefined) {
      if (sessionSelection !== pendingSelection) return;
      pendingSelectionIdRef.current = undefined;
    }

    const resolved = resolvePreferredBreweryId(
      memberships,
      sessionSelection,
      localStorage.getItem("selectedBreweryId")
    );

    if (canonicalIdRef.current !== resolved) {
      setSelectedBrewery(null);
      setSelectedBeers(null);
      setIsAdmin(false);
      setCanonicalId(resolved);
    } else {
      persistSelection(resolved);
    }

    if (sessionSelection !== resolved) {
      pendingSelectionIdRef.current = resolved;
      void queueSessionUpdate({ selectedBreweryId: resolved }).catch(() => {
        pendingSelectionIdRef.current = undefined;
      });
    }
  }, [
    persistSelection,
    queueSessionUpdate,
    session?.user.breweries,
    session?.user.selectedBreweryId,
    setCanonicalId,
    status,
  ]);

  useEffect(() => {
    if (brewery && brewery._id === canonicalIdRef.current) {
      setSelectedBrewery(brewery);
    }
  }, [brewery]);

  useEffect(() => {
    if (beers !== undefined) setSelectedBeers(beers);
    else if (beersError) setSelectedBeers(null);
  }, [beers, beersError]);

  useEffect(() => {
    if (!breweryError || !breweryId || breweryError.message !== "Resource not found") return;

    failedIdsRef.current.add(breweryId);
    const memberships = toUniqueStringArray(session?.user.breweries ?? []).filter(
      (id) => !failedIdsRef.current.has(id)
    );
    const fallback = resolvePreferredBreweryId(memberships);
    pendingSelectionIdRef.current = fallback;
    setSelectedBrewery(null);
    setSelectedBeers(null);
    setIsAdmin(false);
    setCanonicalId(fallback);
    void queueSessionUpdate({
      removeBreweryId: breweryId,
      selectedBreweryId: fallback,
    }).catch(() => {
      pendingSelectionIdRef.current = undefined;
    });
  }, [breweryError, breweryId, queueSessionUpdate, session?.user.breweries, setCanonicalId]);

  useEffect(() => {
    if (!selectedBrewery) {
      setIsAdmin(false);
      return;
    }

    const userId = session?.user?.id ?? "";
    const admin = (selectedBrewery.admin ?? []).some((entry: any) =>
      typeof entry === "object" ? entry?._id === userId : entry === userId
    );
    const owner = typeof selectedBrewery.owner === "object"
      ? selectedBrewery.owner?._id === userId
      : selectedBrewery.owner === userId;
    setIsAdmin(admin || owner);
  }, [selectedBrewery, session?.user?.id]);

  const selectBrewery = useCallback(async (next: Brewery, options: SelectOptions = {}) => {
    const id = next._id;
    const sequence = ++transitionSequenceRef.current;
    const previousId = canonicalIdRef.current;
    const previousBrewery = selectedBrewery;

    failedIdsRef.current.delete(id);
    pendingSelectionIdRef.current = id;

    // Populate the canonical cache before changing its key. Consumers therefore
    // observe the ID, object, browser persistence, and cache in one render.
    await mutateCache(`/breweries/${id}`, next, { revalidate: false });
    setCanonicalId(id);
    setSelectedBrewery(next);
    setSelectedBeers(null);

    let updatedSession;
    try {
      updatedSession = await queueSessionUpdate({ selectedBreweryId: id });
      if (updatedSession?.user?.selectedBreweryId !== id) {
        throw new Error("The selected brewery could not be saved to the session.");
      }
    } catch (error) {
      if (sequence === transitionSequenceRef.current) {
        pendingSelectionIdRef.current = undefined;
        setCanonicalId(previousId);
        setSelectedBrewery(previousBrewery);
      }
      throw error;
    }

    if (sequence !== transitionSequenceRef.current) return;
    pendingSelectionIdRef.current = undefined;

    // A transient beers request must not roll back a session selection that is
    // already committed. SWR records either the fresh data or its terminal error.
    await Promise.allSettled([
      mutateCache(`/breweries/${id}`, next, { revalidate: false }),
      mutateCache(`/breweries/${id}/beers`),
    ]);
    if (sequence !== transitionSequenceRef.current) return;

    const route = options.route ?? `/dashboard/breweries/${id}/beers`;
    options.replace ? router.replace(route) : router.push(route);
    router.refresh();
  }, [queueSessionUpdate, router, selectedBrewery, setCanonicalId]);

  return (
    <BreweryContext.Provider value={{
      selectedBrewery,
      setSelectedBrewery,
      selectBrewery,
      mutateBrewery,
      selectedBeers,
      setBreweryId: setCanonicalId,
      setSelectedBeers,
      mutateBeers,
      beersLoading: breweryId ? beersLoading : false,
      breweryLoading: breweryId ? breweryLoading : false,
      isAdmin,
    }}>
      {children}
    </BreweryContext.Provider>
  );
};

export const useBreweryContext = () => {
  const context = useContext(BreweryContext);
  if (!context) throw new Error("useBreweryContext must be used within a BreweryProvider");
  return context;
};
