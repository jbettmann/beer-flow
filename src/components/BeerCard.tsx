"use client";
import { Beer } from "@/app/types/beer";
import { useBreweryContext } from "@/context/brewery-beer";
import { convertDate, isNew } from "@/lib/utils";
import {
  ExternalLink,
  Hop,
  LayoutGrid,
  Sparkles,
  Wheat,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import ToggleButton from "./Buttons/ToggleButton";
import ImageDisplay from "./ImageDisplay/ImageDisplay";
import UpdateBeerForm from "./UpdateBeerForm/UpdateBeerForm";
import { hopSuggestions, maltSuggestions } from "@/lib/suggestionsDB";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
type Props = {
  beerId: string;
  beerForDrawer?: Beer | null;
  onClose?: () => void;
};

const BeerCard = ({ beerId, beerForDrawer, onClose }: Props) => {
  const [isEditing, setIsEditing] = useState(false);

  const { selectedBeers, selectedBrewery, isAdmin } = useBreweryContext();

  const [beer, setBeer] = useState<Beer | undefined>(undefined);
  const [toggleView, setToggleView] = useState<string>("Overview");

  const handleHopClick = (hop: string) => {
    const hopDetail = hopSuggestions.find((h) => h.name === hop);
    return hopDetail?.id;
  };

  const handleMaltClick = (malt: string) => {
    const maltDetail = maltSuggestions.find((m) => m.name === malt);
    return maltDetail?.id || malt;
  };
  const router = useRouter();
  useEffect(() => {
    // If beerForDrawer exists and beer state is undefined, set it.
    if (beerForDrawer && !beer) {
      setBeer(beerForDrawer);
    } else if (!beerForDrawer) {
      // If beerForDrawer doesn't exist, always try to find the beer from selectedBeers.
      setBeer(selectedBeers?.find((beer) => beer._id === beerId));
    }
  }, [selectedBeers, beerForDrawer, beerId]);

  return (
    beer && (
      <div className=" card w-full  lg:mx-auto beer-card lg:shadow-xl ">
        <div className="flex w-full justify-between mb-2  md:mb-0 bg-primary py-3  sticky top-[-2px] h-10 z-20 md:z-0 md:h-auto md:bg-transparent md:block md:py-0">
          {isAdmin ? (
            <button
              className={`link link-hover text-sm lg:text-xs`}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
          ) : (
            <div></div>
          )}
          <button
            className={`md:hidden link link-hover text-sm lg:text-xs`}
            onClick={() => {
              if (onClose) {
                onClose();
              } else {
                redirect(`/breweries/${selectedBrewery?._id}`);
              }
              if (isEditing) setIsEditing(false);
            }}
          >
            <X size={25} strokeWidth={2} />
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
              <div className="flex items-center justify-around lg:p-6 lg:pb-3 relative gap-2 xs:gap-4 md:gap-6 ">
                {/* Beer Image and Name */}
                <figure className="rounded-lg overflow-hidden relative flex-initial h-auto  w-36 xs:w-2/5  2xl:w-1/4 p-2">
                  <ImageDisplay className="beer-card__image " item={beer} />
                </figure>
                <div className="flex flex-col justify-start">
                  {isNew(beer) ? (
                    <div className="flex w-fit relative pb-2">
                      <div className="tag-new  border-none">NEW</div>
                      <Sparkles
                        size={20}
                        strokeWidth={1}
                        color="#a5b4fc"
                        className="absolute top-[-11px] right-[-16px]"
                      />
                    </div>
                  ) : null}
                  <h3 className="card-title justify-start ">{beer?.name}</h3>

                  <div>
                    <p className="beer-card__item">
                      {beer?.category?.map((c) => c.name).join(", ")}
                    </p>
                    <p className="beer-card__title">
                      <LayoutGrid size={18} strokeWidth={1} />
                      <span className="ml-1">Category</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="my-2 divider"></div>

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
                      <div className="w-full">
                        <p className="beer-card__description break-words">
                          {beer?.description}
                        </p>
                        <p className="beer-card__title">Description</p>
                      </div>
                    </div>

                    {/* Hops & IBU */}
                    <div className="flex justify-between w-full">
                      <div>
                        <div>
                          {beer?.hops?.map((hop, i, array) => (
                            <span className="inline-flex items-center" key={i}>
                              <Link
                                href={`https://www.beermaverick.com/hop/${handleHopClick(
                                  hop
                                )}`}
                                target="_blank"
                                className="flex "
                              >
                                <h5 className="beer-card__item links text-left">
                                  {hop}
                                </h5>
                                {i !== array.length - 1 ? ` ,` : ""}
                              </Link>
                            </span>
                          ))}
                        </div>
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
                      <div>
                        {beer?.malt?.map((m, i, array) => (
                          <span className="inline-flex items-center" key={i}>
                            <Link
                              href={`https://www.google.com/search?q=${handleMaltClick(
                                m
                              )}+malt`}
                              target="_blank"
                              className="flex items-center"
                            >
                              <h5 className="beer-card__item links text-left">
                                {m}
                              </h5>
                              {i !== array.length - 1 ? ` ,` : ""}
                            </Link>
                          </span>
                        ))}
                      </div>
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
                          {convertDate(beer?.releasedOn)}
                        </h4>
                        <p className="beer-card__title">Released Date</p>
                      </div>
                      <div>
                        <h4 className="beer-card__item">
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
