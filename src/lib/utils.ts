import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "./supabase";
import { v4 as uuidv4 } from "uuid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// auth token from db
export const setAuthToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", token);
  }
};

// create Public URL for images
export const getImagePublicURL = (image: string) => {
  if (image) {
    const { data } = supabase.storage.from("Images").getPublicUrl(image);

    if (!data) {
      console.error("Error fetching image URL: ", data);
      return "";
    }

    return data.publicUrl;
  }
  return null;
};

// Covert beer timestamps to Date objects
export const convertDate = (timestamp: string | Date | null) => {
  if (!timestamp) return;
  let date = new Date(timestamp);
  let day = String(date.getDate()).padStart(2, "0");
  let month = String(date.getMonth() + 1).padStart(2, "0"); //Months are zero based
  let year = date.getFullYear();

  return month + "/" + day + "/" + year;
};
