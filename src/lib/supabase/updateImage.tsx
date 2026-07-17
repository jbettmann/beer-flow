import { supabase } from "@/lib/supabase";
import saveImage from "./saveImage";

// Update Image file in Supabase Storage
export const updateImage = async (prevImage: string, newImage: File) => {
  if (!prevImage && newImage) {
    return saveImage({ file: newImage });
  }
  if (!newImage) {
    console.error("No file selected");
    alert("No file selected");
    return;
  }

  let newSavedImg;
  try {
    newSavedImg = await saveImage({ file: newImage });
  } catch (error) {
    console.error("Error saving new image: ", error);
    return;
  }

  if (!newSavedImg) return;

  const { error } = await supabase.storage
    .from("Brett_bucket")
    .remove([prevImage]);
  if (error) console.error("Error removing previous image: ", error);

  return newSavedImg;
};
