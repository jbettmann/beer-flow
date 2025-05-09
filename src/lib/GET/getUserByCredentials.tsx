"use server";
import { auth } from "@/auth";
import { httpClient } from "@/services/utils/httpClient";
import { Users } from "@/types/users";

export const getUserByCredentials = async (
  email: string,
  password: string
): Promise<Users> => {
  try {
    const user = await httpClient.post("/users/credentials/login", {
      email,
      password,
    });

    return user as Users;
  } catch (err: any) {
    const errorMessage =
      err?.response?.error ||
      err?.message ||
      "Unexpected error logging in with credentials";

    console.error("Credential login failed:", errorMessage);
    throw new Error(errorMessage);
  }
};
