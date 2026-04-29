"use client";

import createBeer from "@/lib/createBeer";
import saveImage from "@/lib/supabase/saveImage";
import { Brewery } from "@/types/brewery";
import { Beer, NewBeer } from "@/types/beer";
import { FormValues } from "@/components/CreateBeerForm/types";

const toCategoryNames = (categories: FormValues["category"]) =>
  categories.map((category) =>
    typeof category === "string" ? category : category.name
  );

const handleCreateBeer = async (
  values: FormValues,
  brewery: Brewery,
  accessToken?: string
) => {
  const image =
    values.image instanceof File
      ? await saveImage({ file: values.image })
      : typeof values.image === "string"
        ? values.image
        : "";

  const newBeer: NewBeer = {
    _id: values._id,
    name: values.name,
    style: values.style,
    image: image || "",
    abv: Number(values.abv || 0),
    ibu: Number(values.ibu || 0),
    category: toCategoryNames(values.category),
    malt: values.malt ?? [],
    hops: values.hops ?? [],
    description: values.description ?? "",
    nameSake: values.nameSake ?? "",
    notes: values.notes ?? "",
    archived: values.archived,
    releasedOn: values.releasedOn || null,
  };

  // createBeer reads the authenticated brewery from the session server-side.
  void brewery;
  void accessToken;

  const createdBeer = await createBeer(newBeer);
  return createdBeer as Beer | null;
};

export default handleCreateBeer;
