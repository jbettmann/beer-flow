export const httpClientMethods = (
  fetcher: (url: string, options?: RequestInit) => Promise<any>
) => ({
  getAll: (url: string) => fetcher(url, { method: "GET" }),
  getById: (url: string) => fetcher(url, { method: "GET" }),
  post: (url: string, data: unknown) =>
    fetcher(url, { method: "POST", body: JSON.stringify(data) }),
  put: (url: string, id: string, data: unknown) =>
    fetcher(`${url}/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (url: string) => fetcher(url, { method: "DELETE" }),
});
