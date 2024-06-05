"use client";
import { Notifications } from "@/app/types/notifications";
import { Users } from "@/app/types/users";

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
        const errorData = await response.json(); // Parse the JSON response to get the error message
        console.error(errorData);
        alert(errorData.error); // Display the error message
        throw new Error(errorData.error);
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
