import React from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import saveImage from "./saveImage";
type Props = {
  file: File | null;
};

// Update Image file in Supabase Storage
export const deleteImage = async (image: string) => {
  if (!image) {
    return;
  }

  const { data, error } = await supabase.storage
    .from("Brett_bucket")
    .remove([image]);

  if (error) {
    console.error("Error removing previous image: ", error);
    return;
  }
};
