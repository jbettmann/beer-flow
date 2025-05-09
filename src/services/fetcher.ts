"use server";
import { auth } from "@/auth";

const baseUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

export const fetcher = async (endpoint: string, options: RequestInit = {}) => {
  const session = await auth();
  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
    ...(session?.user && {
      Authorization: `Bearer ${session.user.accessToken}`,
    }),
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(baseUrl + endpoint, config);

    if (!res.ok) {
      if (res.status === 400) {
        const errorData = await res.json();
        console.error("Bad Request:", errorData);
        throw new Error(errorData.message || "Bad Request");
      }
      // Handle specific error responses
      if (res.status === 401) {
        console.error("Unauthorized access - redirect to login?");
        // Optionally, you could logout user here
      }
      if (res.status === 404) {
        throw new Error("Resource not found");
      }
      // if (res.status === 422) {
      //   const errorData = await res.json();
      //   console.error("Unprocessable Entity:", errorData);
      //   throw new Error(errorData.message || "Unprocessable Entity");
      // }
      if (res.status === 500) {
        throw new Error("Internal Server Error");
      }
      // Generic error handling
      const errorData = await res.json();
      throw new Error(errorData.message || `HTTP error! Status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};
