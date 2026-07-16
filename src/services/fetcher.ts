"use server";
import { auth } from "@/auth";
import { buildApiUrl } from "@/lib/api/base";

const FETCH_TIMEOUT_MS = 8000;

function createTimeoutSignal(signal?: AbortSignal | null) {
  const controller = new AbortController();
  let timedOut = false;

  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, FETCH_TIMEOUT_MS);

  const abortFromExternalSignal = () => {
    controller.abort();
  };

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", abortFromExternalSignal, { once: true });
    }
  }

  return {
    signal: controller.signal,
    timedOut: () => timedOut,
    cleanup: () => {
      clearTimeout(timeoutId);
      signal?.removeEventListener("abort", abortFromExternalSignal);
    },
  };
}

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
  const timeout = createTimeoutSignal(options.signal);
  config.signal = timeout.signal;

  try {
    const res = await fetch(buildApiUrl(endpoint), config);

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
    if (timeout.timedOut()) {
      const url = buildApiUrl(endpoint);
      const timeoutError = new Error(
        `Request to ${url} timed out after ${FETCH_TIMEOUT_MS}ms`
      );
      console.error(timeoutError.message);
      throw timeoutError;
    }

    console.error("Fetch error:", error);
    throw error;
  } finally {
    timeout.cleanup();
  }
};
