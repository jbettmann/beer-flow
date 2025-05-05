// @ts-ignore
import { httpClient } from "../utils/httpClientMethods";
import useSWRMutation from "swr/mutation";

export const useUpdateClientProfile = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    `/client-profiles/`,
    // @ts-ignore
    (url, { arg }) => httpClient.put(url, arg.id, arg.body)
  );

  return { trigger, isMutating, error };
};

export const useAddClient = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    `/client-profile/add-new-client`,
    // @ts-ignore
    (url, { arg }) => httpClient.post(`${url}/${arg.id}`, arg.body)
  );

  return { trigger, isMutating, error };
};

export const useDeleteClientProfile = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    `/client-profile`,
    // @ts-ignore
    (url, { arg }) => httpClient.delete(`${url}/${arg.id}`)
  );

  return { trigger, isMutating, error };
};
