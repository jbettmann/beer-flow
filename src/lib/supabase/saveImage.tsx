"use client";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

type Props = {
  file: File | null;
};

const saveImage = async ({ file }: Props) => {

  if (!file) {
    console.error("No file selected");
    alert("No file selected");
    return;
  }

  // upload image
  const filename = `${uuidv4()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from("Images")
    .upload(filename, file, {
      cacheControl: "3600",
      upsert: false,
    });

  const filepath = data?.path;

  return filepath;
};

export default saveImage;
