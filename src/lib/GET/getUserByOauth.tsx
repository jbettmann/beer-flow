"use server";
import { auth } from "@/auth";
import { httpClient } from "@/services/utils/httpClient";
import { Users } from "@/types/users";

export const getUserByOauth = async (email: string): Promise<Users> => {
  try {
    const user = await httpClient.post("/users/oauth", {
      email,
    });

    return user as Users;
  } catch (err: any) {
    const errorMessage =
      err?.response?.error ||
      err?.message ||
      "Unexpected error logging in with credentials";

    console.error("OAuth login failed:", errorMessage);
    throw new Error(errorMessage);
  }
};
