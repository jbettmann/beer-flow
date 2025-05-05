import { Category, NewCategory } from "@/types/category";

interface FormValues {
  _id?: string;
  name: string;
  abv?: number | null | undefined;
  ibu?: number | null | undefined;
  style: string;
  malt?: Tag[];
  hops?: Tag[];
  description?: string | undefined;
  category: (string | { name: string })[];
  nameSake?: string | undefined;
  notes?: string | undefined;
  image?: string | File | null | undefined;
  releasedOn?: Date | string | null;
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
