"use client";
import { Beer } from "@/app/types/beer";
import React, { useEffect, useState } from "react";
import ImageDisplay from "./ImageDisplay/ImageDisplay";
import CreateBeerForm from "./CreateBeerForm/CreateBeerForm";
import UpdateBeerForm from "./UpdateBeerForm/UpdateBeerForm";
import { convertDate } from "@/lib/utils";
import { Brewery } from "@/app/types/brewery";
import { useBreweryContext } from "@/context/brewery-beer";
import getBreweryBeers from "@/lib/getBreweryBeers";
import { useSession } from "next-auth/react";
import useSWR from "swr";

type Props = {
  beerId: string;
  brewery: Brewery | undefined;
};

const BeerCard = ({ brewery, beerId }: Props) => {
  const [isEditing, setIsEditing] = useState(false);

  const { selectedBeers } = useBreweryContext();

  const [beer, setBeer] = useState<Beer | undefined>(undefined);

  console.log({ brewery, beerId, selectedBeers });
  useEffect(() => {
    setBeer(selectedBeers?.find((beer) => beer._id === beerId));
  }, [selectedBeers]);

  return (
    beer && (
      <div className="bg-slate-100 p-5 rounded-lg">
        <div className="flex w-full justify-end">
          <button
            className={`ink link-hover link-neutral`}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>
        {isEditing ? (
          <UpdateBeerForm
            beer={beer}
            brewery={brewery}
            setIsEditing={setIsEditing}
            setBeer={setBeer}
          />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h1>{beer?.name}</h1>
              <div>
                {beer?.image && (
                  <ImageDisplay className="beer-card__image " item={beer} />
                )}
                <p className="date-create">
                  Released {convertDate(beer?.releasedOn)}
                </p>
              </div>
            </div>

            <p>Style: {beer?.style}</p>
            <p>ABV {beer?.abv}%</p>
            {beer?.ibu && <p>IBUs {beer?.ibu}</p>}
            <p>
              Malt: {beer?.malt?.map((malt, i) => <span key={i}>{malt} </span>)}
            </p>
            <p>Hops: {beer?.hops?.map((hop) => hop).join(", ")}</p>
            <p>Description: {beer?.description}</p>
            {/* <p>Aroma: {beer?.aroma}</p> */}
            <p>
              Category:{" "}
              {beer?.category?.map((c, i) => <span key={i}>{c.name}</span>)}
            </p>
            <p>Name Details: {beer?.nameSake}</p>
            <p>Other Notes: {beer?.notes}</p>
            <div className="flex flex-col date-create">
              {isEditing && <p>Created {convertDate(beer?.createdAt)}</p>}

              <p>Lasted Updated {convertDate(beer?.updatedAt)}</p>
            </div>
          </>
        )}
      </div>
    )
  );
};

export default BeerCard;
