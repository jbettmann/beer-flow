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
    <Accordion type="single" collapsible key={category}>
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <div>{category}</div>
        </AccordionTrigger>
        <AccordionContent>
          <div>
            {beers
              .filter((beer) => beer.category.includes(category))
              .map((beer) => (
                <Link href={`/beers/${beer._id}`} key={beer._id}>
                  {beer.name}
                </Link>
              ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
