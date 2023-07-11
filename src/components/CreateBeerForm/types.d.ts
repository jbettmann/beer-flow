interface FormValues {
  name: string;
  abv: string;
  style: string;
  malt: Tag[];
  hops: Tag[];
  description: string;
  category: { name: string }[];
  nameSake: string;
  notes: string;
  image: File | null | string;
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
