import { Beer } from "@/app/types/beer";
import React from "react";

type Props = {
  beer: Beer;
};

const BeerCard = ({ beer }: Props) => {
  return (
    <div className="bg-slate-100 p-5 rounded-lg">
      <h1>{beer?.name}</h1>
      <p>ABV {beer?.abv}%</p>
      <p>Style: {beer?.style}</p>

      <p>
        Malt:{" "}
        {beer?.malt.map((malt, i) => (
          <span key={i}>{malt} </span>
        ))}
      </p>
      <p>Hops: {beer?.hops.map((hop) => hop).join(", ")}</p>
      <p>Description: {beer?.flavorNotes}</p>
      <p>Aroma: {beer?.aroma}</p>
      <p>
        Category:{" "}
        {beer?.category.map((c, i) => (
          <span key={i}>{c.name}</span>
        ))}
      </p>
      <p>Name Details: {beer?.nameSake}</p>
      <p>Other Notes: {beer?.notes}</p>
    </div>
  );
};

export default BeerCard;
