"use client";
import { Beer } from "@/app/types/beer";
import React, { useState } from "react";
import ImageDisplay from "./ImageDisplay/ImageDisplay";
import CreateBeerForm from "./CreateBeerForm/CreateBeerForm";
import UpdateBeerForm from "./UpdateBeerForm/UpdateBeerForm";
import { convertDate } from "@/lib/utils";
import { Brewery } from "@/app/types/brewery";

type Props = {
  beer: Beer;
  brewery: Brewery;
};

const BeerCard = ({ beer, brewery }: Props) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-slate-100 p-5 rounded-lg">
      <button onClick={() => setIsEditing(!isEditing)}>
        {isEditing ? "Save" : "Edit"}
      </button>
      {isEditing ? (
        <UpdateBeerForm beer={beer} brewery={brewery} />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h1>{beer?.name}</h1>
            <div>
              {beer.image && (
                <ImageDisplay className="beer-card__image " item={beer} />
              )}
              <p className="date-create">
                Released {convertDate(beer.releasedOn)}
              </p>
            </div>
          </div>

          <p>Style: {beer?.style}</p>
          <p>ABV {beer?.abv}%</p>
          {beer?.ibu && <p>IBUs {beer?.ibu}</p>}
          <p>
            Malt: {beer?.malt.map((malt, i) => <span key={i}>{malt} </span>)}
          </p>
          <p>Hops: {beer?.hops.map((hop) => hop).join(", ")}</p>
          <p>Description: {beer?.description}</p>
          {/* <p>Aroma: {beer?.aroma}</p> */}
          <p>
            Category:{" "}
            {beer?.category.map((c, i) => <span key={i}>{c.name}</span>)}
          </p>
          <p>Name Details: {beer?.nameSake}</p>
          <p>Other Notes: {beer?.notes}</p>
          <div className="flex flex-col date-create">
            {isEditing && <p>Created {convertDate(beer.createdAt)}</p>}

            <p>Lasted Updated {convertDate(beer.updatedAt)}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default BeerCard;
