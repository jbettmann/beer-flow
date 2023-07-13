interface FormValues {
  name: string;
  abv: string;
  style: string;
  malt: Tag[];
  hops: Tag[];
  description: string;
  category: string[] | { label: string; value: string }[];
  nameSake: string;
  notes: string;
  image: File | null | string;
  releaseDate: Date | string | null;
}

interface ErrorValues {
  name?: string;
  abv?: string;
  style?: string;
  malt?: string;
  hops?: string;
  description?: string;

  category?: string;
  nameSake?: string;
  notes?: string;
  image?: string;
}
