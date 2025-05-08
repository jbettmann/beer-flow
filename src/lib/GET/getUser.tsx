"use server";
import { httpClient } from "@/services/utils/httpClient";
import { Users } from "@/types/users";

async function getUser(email: string) {
  try {
    const response = await httpClient.getById(`/users/${email}`);

    const responseData: Users = await response;

    return responseData;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export default getUser;
