export const httpClientMethods = (
  fetcher: (url: string, options?: RequestInit) => Promise<any>
) => ({
  getAll: (url: string, options?: RequestInit) =>
    fetcher(url, { method: "GET", ...options }),
  getById: (url: string, options?: RequestInit) =>
    fetcher(url, { method: "GET", ...options }),
  post: (url: string, data: unknown, options?: RequestInit) =>
    fetcher(url, { method: "POST", body: JSON.stringify(data), ...options }),
  put: (url: string, id: string, data: unknown, options?: RequestInit) =>
    fetcher(`${url}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      ...options,
    }),
  patch: (url: string, data: unknown, options?: RequestInit) =>
    fetcher(url, {
      method: "PATCH",
      body: JSON.stringify(data),
      ...options,
    }),
  delete: (url: string, options?: RequestInit) =>
    fetcher(url, { method: "DELETE", ...options }),
});
