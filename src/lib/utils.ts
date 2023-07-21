import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "./supabase";
import { v4 as uuidv4 } from "uuid";
import { Beer } from "@/app/types/beer";

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

// Checks if beer is less than a week old to display NEW tag
// Helper function to calculate if the beer is less than a week old
export function isNew(beer: Beer) {
  // Check if the beer has been viewed
  const viewedBeers = localStorage.getItem("viewedBeers");
  const viewedBeerIds = viewedBeers ? JSON.parse(viewedBeers) : [];

  // Check if the beer is less than a day old
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
  const oneDayAgo = Date.now() - oneDayInMilliseconds;
  const beerCreatedAt = new Date(beer.createdAt).getTime();

  return !viewedBeerIds.includes(beer._id) || beerCreatedAt > oneDayAgo;
}
export const handleBeerView = (beerId: string) => {
  // Get the existing data from local storage
  let viewedBeers = localStorage.getItem("viewedBeers");

  let viewedBeerIds = viewedBeers ? JSON.parse(viewedBeers) : [];

  // If this beer hasn't been viewed yet, add it to the list
  if (!viewedBeerIds.includes(beerId)) {
    viewedBeerIds.push(beerId);
  }

  // Save the updated list back to local storage
  localStorage.setItem("viewedBeers", JSON.stringify(viewedBeerIds));

  manageLocalStorageSize();
};
//  keep track of local storage size
const manageLocalStorageSize = () => {
  const maxEntries = 20;
  let viewedBeers = JSON.parse(localStorage.getItem("viewedBeers")) || {};

  // If the size exceeds maxEntries, remove oldest entries.
  if (Object.keys(viewedBeers).length > maxEntries) {
    // Convert to an array of [key, value] pairs
    let entries = Object.entries(viewedBeers);

    // Sort by timestamp (i.e., value)
    entries.sort((a, b) => a[1] - b[1]);

    // Keep only the newest entries
    entries = entries.slice(-maxEntries);

    // Convert back to an object
    viewedBeers = Object.fromEntries(entries);

    // Store the new object back in local storage
    localStorage.setItem("viewedBeers", JSON.stringify(viewedBeers));
  }
};
