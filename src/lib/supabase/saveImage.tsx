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
    return null;
  }

  // Clean and generate filename
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filename = `${uuidv4()}-${sanitizedFileName}`;

  // Upload image
  const { data, error } = await supabase.storage
    .from("Brett_bucket")
    .upload(filename, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Error uploading file:", error.message);
    alert("Error uploading file: " + error.message);
    return null;
  }

  const filepath = data?.path;
  return filepath;
};

export default saveImage;
