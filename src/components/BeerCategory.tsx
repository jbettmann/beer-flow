"use client";
import { Beer } from "@/app/types/beer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import Link from "next/link";
import { Category } from "@/app/types/category";

type Props = {
  category: Category;
  beers: Beer[];
  isOpen: boolean;
  onClick: () => void;
};

// in BeerCategory.tsx
export default function BeerCategory({
  category,
  beers,
  isOpen,
  onClick,
}: Props) {
  const filteredBeers = () => {
    if (category.name === "All Beers") {
      return beers;
    }
    if (category.name === "Archived") {
      return beers.filter((beer) => beer.archived);
    }
    return beers.filter((beer) =>
      beer.category.some((cat) => cat.name === category.name)
    );
  };

  // This assumes each beer belongs to exactly one category.
  const groupBeersByCategory = (beers: Beer[]) => {
    const groupedBeers: { [key: string]: Beer[] } = {};

    for (let beer of beers) {
      const categoryName = beer.category[0].name;
      console.log({ categoryName });
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
              <Link href={`/beers/${beer._id}`} key={beer._id}>
                {beer.name}
              </Link>
            ))}
          </div>
        </div>
      )
    );
  };

  const renderArchivedBeers = () => {
    const archivedBeers = beers.filter((beer) => beer.archived);
    return renderAllBeers(archivedBeers);
  };

  return (
    <div
      onClick={onClick}
      className={`collapse  ${
        isOpen ? "collapse-open" : ""
      } collapse-arrow  bg-base-200`}
    >
      <div className="collapse-title text-xl font-medium">{category.name}</div>
      <div className="collapse-content">
        <div>
          {category.name === "Archived"
            ? renderArchivedBeers()
            : filteredBeers().map((beer) => (
                <Link
                  href={`/beers/${beer._id}`}
                  key={beer._id}
                  onClick={(e) => e.stopPropagation()}
                >
                  {beer.name}
                </Link>
              ))}
        </div>
      </div>
    </div>
  );
}
