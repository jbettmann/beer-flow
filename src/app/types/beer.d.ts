import { Category } from "./category";

export type Beer = {
  _id: string;
  companyId: number;
  name: string;
  style: string;
  abv: number;
  ibu: number;
  category: Category[];
  malt: string[];
  hops: string[];
  description: string;

  nameSake: string;
  notes: string;
  archived: boolean;
  releasedOn: Date | string | null;
};

export type NewBeer = {
  name: string;
  style: string;
  abv: number;
  ibu: number;
  category: Category[];
  malt: string[];
  hops: string[];
  description: string;
  nameSake: string;
  notes: string;
  archived: boolean;
  releasedOn: Date | string | null;
};
