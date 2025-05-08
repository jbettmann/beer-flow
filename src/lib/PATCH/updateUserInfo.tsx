"use server";
import { httpClient } from "@/services/utils/httpClient";
import { Users } from "@/types/users";
import { redirect } from "next/navigation";

export default async function updateUserInfo({
  userId,
  updatedUser,
}: {
  userId: string;
  updatedUser: any;
}) {
  try {
    const response = await httpClient.patch(`/users/${userId}`, updatedUser);

    const responseData: Users = await response;

    return responseData;
  } catch (err) {
    console.error(err);
    redirect("/auth/signin");
  }
}
