import { Category } from "./category";

export type Brewery = {
  _id: string;
  companyName: string;
  image: string;
  owner: number;
  admin: string[];
  staff: string[];
  categories: Category[];
};

export type NewBrewery = {
  companyName: string;
  image: string | undefined;
};
