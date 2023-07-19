import React from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import saveImage from "./saveImage";
type Props = {
  file: File | null;
};

// Update Image file in Supabase Storage
export const updateImage = async (prevImage: string, newImage: File) => {
  console.log({ prevImage, newImage });
  if (!prevImage && newImage) {
    return saveImage({ file: newImage });
  }
  if (!newImage) {
    console.error("No file selected");
    alert("No file selected");
    return;
  }

  const { data, error } = await supabase.storage
    .from("Images")
    .remove([prevImage]);

  if (error) {
    console.error("Error removing previous image: ", error);
    return;
  }

  let newSavedImg;
  try {
    newSavedImg = await saveImage({ file: newImage });
  } catch (error) {
    console.error("Error saving new image: ", error);
    return;
  }

  return newSavedImg;
};
