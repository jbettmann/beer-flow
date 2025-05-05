import { handleBeerView, isNew } from "@/lib/utils";
import { Beer } from "@/types/beer";
import { ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import ImageDisplay from "../ImageDisplay/ImageDisplay";

type Props = {
  beer: Beer;
  breweryId: string;
  setBeerForDrawer: (beer: Beer) => void;
  setBottomDrawerOpen: (isOpen: boolean) => void;
};

const BeerSnippet = ({
  beer,
  breweryId,
  setBeerForDrawer,
  setBottomDrawerOpen,
}: Props) => {
  return (
    <>
      {/* Small screen bottom drawer view */}
      <button
        className="flex items-center justify-between w-full md:hidden md:disabled"
        onClick={(e) => {
          e.stopPropagation();
          setBeerForDrawer(beer);
          setBottomDrawerOpen(true);
          handleBeerView(beer._id);
        }}
      >
        <div className="inline-flex items-center">
          <ImageDisplay className="beer-category__image" item={beer} />

          <p className="beer-category__name">{beer.name}</p>
        </div>
        <div className="inline-flex justify-center items-center ">
          {isNew(beer) && (
            <Sparkles size={18} strokeWidth={1} color="#a5b4fc" />
          )}

          <ChevronRight size={24} strokeWidth={1} />
        </div>
      </button>
      {/* Desktop modal page  */}
      <Link
        className="hidden md:flex items-center justify-between"
        href={`/dashboard/breweries/${breweryId}/beers/${beer._id}`}
        key={beer._id}
        onClick={(e) => {
          e.stopPropagation();
          handleBeerView(beer._id);
        }}
      >
        <div className="inline-flex items-center">
          <ImageDisplay className="beer-category__image" item={beer} />

          <p className="beer-category__name">{beer.name}</p>
        </div>
        <div className="inline-flex justify-center items-center ">
          {isNew(beer) && (
            <Sparkles size={18} strokeWidth={1} color="#a5b4fc" />
          )}

          <ChevronRight size={24} strokeWidth={1} />
        </div>
      </Link>
    </>
  );
};

export default BeerSnippet;
