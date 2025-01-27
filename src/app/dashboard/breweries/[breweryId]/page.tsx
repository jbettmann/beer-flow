import BreweryProfiles from "@/components/BreweryProfiles";

import { notFound, redirect } from "next/navigation";

type pageProps = {
  params: {
    breweryId: string;
  };
};

export default async function SingleBreweryPage({ params }: pageProps) {
  const { breweryId } = await params;

  if (!breweryId || breweryId === "undefined") redirect("/dashboard/breweries");

  return (
    <main className="w-full h-screen">
      <BreweryProfiles />
    </main>
  );
}
