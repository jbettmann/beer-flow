"use server";
import { httpClient } from "@/services/utils/httpClient";
import { NewUser, Users } from "@/types/users";

export default async function createNewUser(newUser: NewUser) {
  try {
    const response = await httpClient.post("/users", newUser);

    const responseData: Users = await response;

    return responseData;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
