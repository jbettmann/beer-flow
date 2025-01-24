import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from "uuid";
import { Beer } from "@/app/types/beer";
import { Category, NewCategory } from "@/app/types/category";
import { supabase } from "./supabase";

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
    const { data } = supabase.storage.from("Brett_bucket").getPublicUrl(image);

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
  let year = String(date.getFullYear()).slice(-2); // Gets the last two digits of the year

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

  return (
    !beer.archived &&
    (!viewedBeerIds.includes(beer._id) || beerCreatedAt > oneDayAgo)
  );
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
  const maxEntries = 500;

  let viewedBeers =
    JSON.parse(localStorage.getItem("viewedBeers") as string) || [];

  // If the size exceeds maxEntries, remove oldest entries.
  if (viewedBeers.length > maxEntries) {
    // Keep only the newest entries
    const shortenedViewBeersList = viewedBeers.slice(-maxEntries);

    // Store the new object back in local storage
    localStorage.setItem("viewedBeers", JSON.stringify(shortenedViewBeersList));
  }
};

// create default mark for brewery with no image/logo
export function getInitials(name: string) {
  // Exclude any signs like &,$,/,@,$
  name = name.replace(/[&$/@]/g, "");

  const words = name.split(" ");
  // Filter out the words you want to exclude
  const filteredWords = words.filter(
    (word) => !["at", "the", "and", "of", "to", ""].includes(word.toLowerCase())
  );

  // If there are two or more words, return the first letter of the first two words
  if (filteredWords.length >= 2) {
    return (
      filteredWords[0][0].toUpperCase() + filteredWords[1][0].toUpperCase()
    );
  } else {
    return filteredWords[0][0].toUpperCase();
  }
}

// prevent search debouncing
export const debounce = (func: () => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(null, args as any);
    }, delay);
  };
};
