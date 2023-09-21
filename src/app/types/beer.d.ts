import { Category } from "./category";

export type Beer = {
  _id: string;
  companyId: string;
  name: string;
  style: string;
  abv: number;
  ibu: number;
  category: Category[];
  malt: string[];
  hops: string[];
  description: string;
  image: string;
  nameSake: string;
  notes: string;
  archived: boolean;
  releasedOn: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type NewBeer = {
  _id?: string;
  name: string;
  style: string;
  image: string;
  abv: number;
  ibu: number;
  category: string[];
  malt: string[];
  hops: string[];
  description: string;
  nameSake: string;
  notes: string;
  archived: boolean;
  releasedOn: Date | string | null;
};
