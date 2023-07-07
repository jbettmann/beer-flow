import { Category } from "./category";

export type Beer = {
  _id: string;
  companyId: number;
  name: string;
  style: string;
  abv: number;
  ibu: number;
  category: Category[];
  malt: [string];
  hops: [string];
  flavorNotes: string;
  aroma: string;
  nameSake: string;
  notes: string;
  archived: boolean;
};
