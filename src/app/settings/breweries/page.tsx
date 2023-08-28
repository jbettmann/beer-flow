import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Brewery } from "@/app/types/brewery";
import ImageDisplay from "@/components/ImageDisplay/ImageDisplay";
import BrewerySettingsList from "@/components/Settings/BrewerySettingsList";
import getBreweries from "@/lib/getBreweries";
import { getInitials } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import React from "react";

type Props = {};

const BreweriesSettingsPage = async (props: Props) => {
  const session = await getServerSession(authOptions);
  const breweries = await getBreweries();
  return (
    <div>
      <h4>Brewery Settings</h4>
      {breweries.map((brewery: Brewery) => (
        <BrewerySettingsList
          key={brewery._id}
          brewery={brewery}
          session={session}
        />
      ))}
    </div>
  );
};

export default BreweriesSettingsPage;
