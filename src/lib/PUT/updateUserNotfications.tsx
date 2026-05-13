"use client";
import { Notifications } from "@/types/notifications";
import { Users } from "@/types/users";

type NotificationUpdateProps = {
  notifications: Notifications; // The entire notification settings
  accessToken: string | undefined;
  userId: string | number | undefined;
};

export default async function updateUserNotifications({
  notifications,
  userId,
  accessToken,
}: NotificationUpdateProps) {
  if (accessToken && userId) {
    try {
      const response = await fetch(
        `https://beer-bible-api.vercel.app/users/${userId}/notifications`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ notifications }),
        }
      );

      // Check if the response is not ok (non-2xx status code)
      if (!response.ok) {
        let errorMessage = "Unable to update notification preferences.";
        try {
          const errorData = await response.json();
          errorMessage =
            errorData?.error || errorData?.message || errorMessage;
        } catch {
          // Keep the fallback message when the API does not return JSON.
        }
        throw new Error(errorMessage);
      }

      const responseData: Users = await response.json();
      return responseData;
    } catch (err) {
      console.error(err);
      throw err;
    }
  } else {
    throw new Error("User session not found.");
  }
}
