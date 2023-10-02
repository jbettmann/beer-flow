import { Category, NewCategory } from "@/app/types/category";

interface FormValues {
  _id?: string;
  name: string;
  abv: string | number;
  ibu: number | string;
  style: string;
  malt: Tag[];
  hops: Tag[];
  description: string;
  category: Category[] | { value: string; label: string }[];
  nameSake: string;
  notes: string;
  image: File | null | string;
  releasedOn: Date | string | null;
  archived: boolean;
}

interface ErrorValues {
  name?: string;
  abv?: string;
  ibu?: string;
  style?: string;
  malt?: string;
  hops?: string;
  description?: string;
  category?: string;
  nameSake?: string;
  notes?: string;
  image?: string | undefined;
}

type RefsType = {
  name: React.RefObject<HTMLInputElement>;
  abv: React.RefObject<HTMLInputElement>;
  style: React.RefObject<HTMLInputElement>;
  image: React.RefObject<HTMLInputElement>;
  [key: string]: React.RefObject<HTMLInputElement>;
};
