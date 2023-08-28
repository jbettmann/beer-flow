import BrewerySettingsProfileView from "@/components/Settings/BrewerySettingsProfileView";
import React from "react";

type Props = {
  params: {
    breweryId: string;
  };
};

const SingleBrewerySettingsPage = ({ params: { breweryId } }: Props) => {
  return <BrewerySettingsProfileView breweryId={breweryId} />;
};

export default SingleBrewerySettingsPage;
