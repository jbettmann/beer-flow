import { Beer } from "@/app/types/beer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import Link from "next/link";

type Props = {
  category: string;
  beers: Beer[];
};

export default async function BeerCategory({ category, beers }: Props) {
  return (
    <div className="collapse collapse-arrow  bg-base-200">
      <input type="checkbox" />
      <div className="collapse-title text-xl font-medium">{category}</div>
      <div className="collapse-content">
        <div>
          {beers
            .filter((beer) => beer.category.includes(category))
            .map((beer) => (
              <Link href={`/beers/${beer._id}`} key={beer._id}>
                {beer.name}
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
