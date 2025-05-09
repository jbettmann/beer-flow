import { fetcher } from "../fetcher";
import { httpClientMethods } from "./httpClientMethods";

export const httpClient = httpClientMethods(fetcher);
