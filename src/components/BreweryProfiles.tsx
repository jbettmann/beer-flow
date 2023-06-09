import { Brewery } from "@/app/types/brewery";
import { FC } from "react";

type Props = {
  promise: Promise<Brewery[]>;
};

export default async function BreweryProfiles({ promise }: Props) {
  const breweries = await promise;

  const content = breweries.map((brewery) => {
    return (
      <section key={brewery._id}>
        <h2>{brewery.companyName}</h2>
      </section>
    );
  });
  return content;
}
