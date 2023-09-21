import { Category, NewCategory } from "./category";
import { Users } from "./users";

export type Brewery = {
  _id: string;
  companyName: string;
  image: string;
  owner: string | Users | number;
  admin: string[] | Users[];
  staff: string[] | Users[];
  categories: NewCategory[] | Category[];
};

export type NewBrewery = {
  companyName: string;
  image: string | undefined;
};
