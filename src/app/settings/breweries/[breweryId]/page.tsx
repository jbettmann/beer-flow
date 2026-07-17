import BrewerySettingsProfileView from "@/components/Settings/BrewerySettingsProfileView";
import React from "react";

type Props = {
  params: Promise<{
    breweryId: string;
  }>;
};

const SingleBrewerySettingsPage = async ({ params }: Props) => {
  const { breweryId } = await params;
  return <BrewerySettingsProfileView breweryId={breweryId} />;
};

export default SingleBrewerySettingsPage;
