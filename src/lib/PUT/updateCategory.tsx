"use server";
import { Beer } from "@/types/beer";
import { Category } from "@/types/category";
import { FormValues } from "@/components/UpdateCategory/types";

import { revalidatePath } from "next/cache";
import { redirect } from "next/dist/server/api-utils";

type pageProps = {
  updatedCategory: Category | FormValues;
  categoryId: string;
  accessToken: string | undefined;
};

export default async function updateCategory({
  updatedCategory,
  categoryId,
  accessToken,
}: pageProps) {
  if (accessToken) {
    try {
      const response = await fetch(
        `https://beer-bible-api.vercel.app/categories/${categoryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(updatedCategory),
          next: { revalidate: 0 },
        }
      );

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const responseData: Category = await response.json();

      return responseData;
    } catch (err) {
      console.error(err);
      throw err;
    }
  } else {
    throw new Error("User session not found.");
  }
}
