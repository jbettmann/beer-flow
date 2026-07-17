import { Brewery } from "@/types/brewery";
import BrewerySettingsList from "@/components/Settings/BrewerySettingsList";
import getBreweries from "@/lib/getBreweries";
import { auth } from "@/auth";
import React from "react";

type Props = {};

const BreweriesSettingsPage = async (props: Props) => {
  const session = await auth();
  const breweries = (await getBreweries()) || [];
  return (
    <section className="w-full max-w-3xl rounded-md border border-border bg-background p-6">
      <div>
        <h3 className="text-xl font-semibold">Brewery settings</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure breweries separately from your personal profile and account.
        </p>
      </div>
      <div className="mt-5 flex flex-col gap-3">
        {breweries.length ? breweries.map((brewery: Brewery) => (
          <BrewerySettingsList
            key={brewery._id}
            brewery={brewery}
            session={session as any}
          />
        )) : <div className="rounded-lg border border-dashed p-8 text-center"><h4 className="font-semibold">No breweries available</h4><p className="mt-1 text-sm text-muted-foreground">Breweries you own or belong to will appear here.</p></div>}
      </div>
    </section>
  );
};

export default BreweriesSettingsPage;
