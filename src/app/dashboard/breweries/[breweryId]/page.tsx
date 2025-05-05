import BreweryProfiles from "@/components/BreweryProfiles";
import getSingleBrewery from "@/lib/getSingleBrewery";

import { notFound, redirect } from "next/navigation";

type pageProps = {
  params: {
    breweryId: string;
  };
};

export default async function SingleBreweryPage({ params }: pageProps) {
  const { breweryId } = await params;

  return notFound();
}
