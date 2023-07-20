"use client";
import { Beer } from "@/app/types/beer";
import { Category } from "@/app/types/category";
import Link from "next/link";
import ImageDisplay from "./ImageDisplay/ImageDisplay";

type Props = {
  category: Category;
  beers: Beer[];
  isOpen: boolean;
  onClick: () => void;
  breweryId: string;
};

// in BeerCategory.tsx
export default function BeerCategory({
  category,
  beers,
  isOpen,
  onClick,
  breweryId,
}: Props) {
  const filteredBeers = () => {
    if (!beers) return [];
    if (category.name === "All Beers") {
      return beers;
    }
    if (category.name === "Archived") {
      return beers.filter((beer) => beer.archived);
    }
    return beers.filter((beer) =>
      beer.category
        ? beer.category.some((cat) => cat.name === category.name)
        : false
    );
  };

  // This assumes each beer belongs to exactly one category.
  const groupBeersByCategory = (beers: Beer[]) => {
    const groupedBeers: { [key: string]: Beer[] } = {};

    for (let beer of beers) {
      const categoryName = beer.category[0].name;

      if (groupedBeers[categoryName]) {
        groupedBeers[categoryName].push(beer);
      } else {
        groupedBeers[categoryName] = [beer];
      }
    }

    return groupedBeers;
  };

  const renderAllBeers = (beers: Beer[]) => {
    const groupedBeers = groupBeersByCategory(beers);

    return Object.entries(groupedBeers).map(
      ([categoryName, beersInCategory]) => (
        <div
          key={categoryName}
          className={`collapse collapse-arrow  bg-base-200`}
        >
          <input type="checkbox" />
          <div className="collapse-title text-xl font-medium">
            {categoryName}
          </div>
          <div className="collapse-content">
            {beersInCategory.map((beer) => (
              <Link
                href={`/breweries/${breweryId}/beers/${beer._id}`}
                key={beer._id}
              >
                {beer.name}
              </Link>
            ))}
          </div>
        </div>
      )
    );
  };

  const renderArchivedBeers = () => {
    if (!beers) return null;
    const archivedBeers = beers.filter((beer) => beer.archived);
    return renderAllBeers(archivedBeers);
  };

  console.log({ beers });

  return (
    <div
      onClick={onClick}
      className={`collapse  ${
        isOpen ? "collapse-open" : ""
      } collapse-arrow  bg-base-200`}
    >
      <div className="collapse-title text-xl font-medium">{category.name}</div>
      <div className="collapse-content">
        <div className="flex flex-col">
          {category.name === "Archived"
            ? renderArchivedBeers()
            : filteredBeers().map((beer) => (
                <Link
                  className="flex items-center"
                  href={`/breweries/${breweryId}/beers/${beer._id}`}
                  key={beer._id}
                  onClick={(e) => e.stopPropagation()}
                >
                  {beer.image && (
                    <ImageDisplay
                      className="beer-category__image"
                      item={beer}
                    />
                  )}
                  {beer.name}
                </Link>
              ))}
        </div>
      </div>
    </div>
  );
}
