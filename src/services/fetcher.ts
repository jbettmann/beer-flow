export const fetcher = async (endpoint: string, options: RequestInit = {}) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers, // Allow custom headers
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + endpoint, config);

    if (!res.ok) {
      // Handle specific error responses
      if (res.status === 401) {
        console.error("Unauthorized access - redirect to login?");
        // Optionally, you could logout user here
      }
      if (res.status === 404) {
        throw new Error("Resource not found");
      }
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
