import React, { createContext, useContext, useEffect, useState } from "react";
import getUser from "@/lib/getUser";
import getBreweries from "@/lib/getBreweries";
import { User } from "@/app/types/users";
import { Brewery } from "@/app/types/brewery";
import { getSession } from "next-auth/react";
import { Session } from "next-auth";

interface ContextValue {
  user: User | null;
  breweries: Brewery[] | null;
}

// Create a new context
const UserContext = createContext<ContextValue | undefined>(undefined);

// Create a Provider component for this context
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [breweries, setBreweries] = useState<Brewery[] | null>(null);

  useEffect(() => {
    async function fetchData() {
      const session = await getSession();
      const user = await getUser(session as Session);
      const breweries = await getBreweries(user, session as Session);

      setUser(user);
      setBreweries(breweries);
    }

    fetchData();
  }, []);

  return (
    <UserContext.Provider value={{ user, breweries }}>
      {children}
    </UserContext.Provider>
  );
}

// Create a hook to use this context
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
