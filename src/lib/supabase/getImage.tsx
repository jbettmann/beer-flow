import { supabase } from "../supabase";

// create Public URL for images
export const getImagePublicURL = (image: string) => {
  if (image) {
    const { data } = supabase.storage.from("Brett_bucket").getPublicUrl(image);

    if (!data) {
      console.error("Error fetching image URL: ", data);
      return "";
    }

    return data.publicUrl;
  }
  return null;
};
