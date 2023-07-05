import { Category } from "./category";

export type Brewery = {
  _id: string;
  companyName: string;
  owner: number;
  admin: string[];
  staff: string[];
  categories: Category[];
};
