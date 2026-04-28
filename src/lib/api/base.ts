const DEFAULT_API_BASE_URL = "https://beer-bible-api.vercel.app";

export function getApiBaseUrl() {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    DEFAULT_API_BASE_URL
  );
}

export function buildApiUrl(path: string) {
  if (!path) {
    throw new Error("API path is required");
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, getApiBaseUrl()).toString();
}
