import { Beer } from "@/app/types/beer";
import React from "react";
import ImageDisplay from "./ImageDisplay/ImageDisplay";

type Props = {
  beer: Beer;
};

const BeerCard = ({ beer }: Props) => {
  return (
    <div className="bg-slate-100 p-5 rounded-lg">
      <div className="flex items-center justify-between">
        <h1>{beer?.name}</h1>
        {beer.image && (
          <ImageDisplay className="beer-card__image " item={beer} />
        )}
      </div>

      <p>Style: {beer?.style}</p>
      <p>ABV {beer?.abv}%</p>
      {beer?.ibu && <p>IBUs {beer?.ibu}</p>}
      <p>Malt: {beer?.malt.map((malt, i) => <span key={i}>{malt} </span>)}</p>
      <p>Hops: {beer?.hops.map((hop) => hop).join(", ")}</p>
      <p>Description: {beer?.flavorNotes}</p>
      <p>Aroma: {beer?.aroma}</p>
      <p>
        Category: {beer?.category.map((c, i) => <span key={i}>{c.name}</span>)}
      </p>
      <p>Name Details: {beer?.nameSake}</p>
      <p>Other Notes: {beer?.notes}</p>
    </div>
  );
};

export default BeerCard;
