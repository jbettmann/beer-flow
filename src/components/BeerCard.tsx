"use client";
import { Beer } from "@/app/types/beer";
import React, { useEffect, useState } from "react";
import ImageDisplay from "./ImageDisplay/ImageDisplay";
import CreateBeerForm from "./CreateBeerForm/CreateBeerForm";
import UpdateBeerForm from "./UpdateBeerForm/UpdateBeerForm";
import { convertDate, isNew } from "@/lib/utils";
import { Brewery } from "@/app/types/brewery";
import { useBreweryContext } from "@/context/brewery-beer";
import getBreweryBeers from "@/lib/getBreweryBeers";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import ToggleButton from "./Buttons/ToggleButton";
import { Hop, Sparkles, Wheat } from "lucide-react";
import BottomDrawer from "./Drawers/BottomDrawer";

type Props = {
  beerId: string;
};

const BeerCard = ({ beerId }: Props) => {
  const [isEditing, setIsEditing] = useState(false);

  const { selectedBeers, selectedBrewery } = useBreweryContext();

  const [beer, setBeer] = useState<Beer | undefined>(undefined);
  const [toggleView, setToggleView] = useState<string>("Overview");
  console.log({ selectedBrewery, beerId, selectedBeers });
  useEffect(() => {
    setBeer(selectedBeers?.find((beer) => beer._id === beerId));
  }, [selectedBeers]);

  return (
    beer && (
      <div className=" card w-full lg:mx-auto beer-card shadow-xl p-5">
        <div className="flex w-full justify-start">
          <button
            className={`link link-hover text-gray-50`}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        {/* Beer Image and Name */}
        <div className="">
          {isEditing ? (
            <UpdateBeerForm
              beer={beer}
              brewery={selectedBrewery}
              setIsEditing={setIsEditing}
              isEditing={isEditing}
              setBeer={setBeer}
            />
          ) : (
            <>
              <div className="flex items-center justify-around lg:p-6 relative">
                {isNew(beer) ? (
                  <>
                    <div className="tag-new absolute top-[-5px] right-5">
                      NEW{" "}
                    </div>
                    <Sparkles
                      size={20}
                      strokeWidth={1}
                      color="#a5b4fc"
                      className="absolute top-[-15px] right-0"
                    />
                  </>
                ) : null}
                {/* Beer Image and Name */}
                <figure className="rounded-lg overflow-hidden relative w-28 h-40 lg:h-56 lg:w-56 p-2">
                  {beer?.image && (
                    <ImageDisplay className="beer-card__image " item={beer} />
                  )}
                </figure>
                <div className="flex flex-col justify-start">
                  <h3 className="card-title lg:text-3xl">{beer?.name}</h3>

                  <div>
                    <p className="beer-card__item">
                      {beer?.category?.map((c) => c.name).join(", ")}
                    </p>
                    <p className="beer-card__title">Category</p>
                  </div>
                </div>
              </div>
              <div className="divider"></div>

              {/* Beer Card Info */}
              <div className="card-body gap-5 items-center w-full">
                <ToggleButton
                  toggleStates={["Overview", "Details"]}
                  setToggleStates={setToggleView}
                />
                {/* Overview */}
                {toggleView === "Overview" ? (
                  <>
                    {/* Style & ABV */}
                    <div className="flex justify-between w-full">
                      <div>
                        <h4 className="beer-card__item">{beer?.style}</h4>
                        <p className="beer-card__title">Style</p>
                      </div>
                      <div>
                        <h4 className="beer-card__item">{beer?.abv}%</h4>
                        <p className="beer-card__title">ABV</p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="flex justify-between w-full">
                      <div>
                        <p className="beer-card__description">
                          {beer?.description}
                        </p>
                        <p className="beer-card__title">Description</p>
                      </div>
                    </div>

                    {/* Hops & IBU */}
                    <div className="flex justify-between w-full">
                      <div>
                        <h5 className="beer-card__item">
                          {beer?.hops?.map((hop) => hop).join(", ")}
                        </h5>
                        <p className="beer-card__title ">
                          <Hop size={15} strokeWidth={1} />
                          <span className="ml-1"> Hops</span>
                        </p>
                      </div>

                      {beer?.ibu && (
                        <div>
                          <h4 className="beer-card__item">{beer?.ibu}</h4>
                          <p className="beer-card__title">IBUs</p>
                        </div>
                      )}
                    </div>

                    {/* Malts */}
                    <div className="flex flex-col items-start w-full">
                      <h5 className="beer-card__item text-left">
                        {beer?.malt?.map((malt) => malt).join(", ")}
                      </h5>
                      <p className="beer-card__title">
                        <Wheat size={15} strokeWidth={1} />
                        <span className="ml-1"> Malt</span>
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* DETAILS */}
                    {/* Release Date & Last Updated */}
                    <div className="flex justify-between w-full">
                      {/* {isEditing && (
                        <div>
                          <h4 className="beer-card__item">
                            {convertDate(beer?.createdAt)}
                          </h4>
                          <p className="beer-card__title">Created On</p>
                        </div>
                      )} */}
                      <div>
                        <h4 className="beer-card__item">
                          {" "}
                          {convertDate(beer?.releasedOn)}
                        </h4>
                        <p className="beer-card__title">Released Date</p>
                      </div>
                      <div>
                        <h4 className="beer-card__item">
                          {" "}
                          {convertDate(beer?.updatedAt)}
                        </h4>
                        <p className="beer-card__title">Lasted Updated</p>
                      </div>
                    </div>
                    {/* Notes */}
                    <div className="w-full">
                      <p className="beer-card__description">{beer?.notes}</p>
                      <p className="beer-card__title">Notes</p>
                    </div>
                    <div className="w-full">
                      <p className="beer-card__description">{beer?.nameSake}</p>
                      <p className="beer-card__title">Name Sake</p>
                    </div>
                    {/* <p>Aroma: {beer?.aroma}</p> */}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    )
  );
};

export default BeerCard;
