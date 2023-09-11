"use client";
import { Notifications } from "@/app/types/notifications";
import updateUserNotifications from "@/lib/PUT/updateUserNotfications";
import { set } from "mongoose";
import { useSession } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react";

const NotificationSettings = () => {
  const { data: session, update } = useSession();
  const [notifications, setNotification] = useState<Notifications>(
    session?.user.notifications
  );
  const [hasChanges, setHasChanges] = useState(false); // To track if there are unsaved changes
  const saveTimeout = useRef(null); // Reference to the timeout
  const isInitialRender = useRef(true);

  // Get the keys from the notifications object
  const [notificationKeys, setNotificationKeys] = useState<object>(
    Object.keys(session?.user.notifications).filter(
      (key) => key !== "allow" && key !== "_id"
    )
  );

  console.log({ notifications, notificationKeys });
  const saveChanges = async () => {
    if (hasChanges) {
      try {
        // Call your updateUserNotifications function here
        await updateUserNotifications({
          notifications,
          userId: session?.user.id,
          accessToken: session?.user.accessToken,
        });

        await update({ updatedNotifications: notifications });
        setHasChanges(false); // Reset the hasChanges flag after saving
      } catch (error) {
        console.error(error);
        // Display error to the user or handle it accordingly
      }
    }
  };
  const debouncedSave = () => {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    saveTimeout.current = setTimeout(saveChanges, 500);
  };

  useEffect(() => {
    if (!notifications?.beerUpdate && !notifications?.newBeerRelease) {
      setNotification((prev) => ({
        ...prev,
        allow: false,
      }));
    }
  }, [notifications?.beerUpdate, notifications?.newBeerRelease]);

  // Separate useEffect to set the hasChanges for autoSave
  useEffect(() => {
    setHasChanges(true); // Set the hasChanges flag when the notifications change
  }, [notifications]);

  useEffect(() => {
    // If it's the initial render, just update the ref and return
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    debouncedSave();

    // Cleanup function to run the save immediately if the component is unmounted
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
      if (hasChanges) {
        saveChanges();
      }
    };
  }, [notifications]); // Only run this effect when notifications change

  if (!session?.user?.notifications) {
    return <div>Loading...</div>;
  }

  return (
    notificationKeys && (
      <div className="w-full ">
        {/* <h3>Notification Preferences</h3> */}
        <div className="flex flex-col w-full  ">
          <div className=" flex items-center justify-between">
            <h4>Allow All Notifications</h4>

            <label className="cursor-pointer label w-fit">
              <div className="label-text mr-1">
                {notifications.allow ? "On" : "Off"}
              </div>
              <input
                type="checkbox"
                className="toggle toggle-accent"
                onChange={(e) => {
                  const checked = e.currentTarget.checked;
                  setNotification((prev) => ({
                    ...prev,
                    allow: checked,
                  }));
                }}
                checked={notifications?.allow}
              />
            </label>
          </div>
          <div className="w-11/12 mx-auto ">
            {notifications.allow &&
              notificationKeys.map((key) => (
                <>
                  <div
                    key={key}
                    className=" flex items-center justify-between "
                  >
                    <div className="label-text mr-1">
                      {key === "newBeerRelease"
                        ? "New Beer Release "
                        : "Beer Updates"}
                    </div>
                    <label className="cursor-pointer label w-fit">
                      <div
                        className={`label-text mr-1 ${
                          notifications[key].email ? "" : "text-opacity-50"
                        }`}
                      >
                        {notifications[key].email ? "On" : "Off"}
                      </div>
                      <input
                        type="checkbox"
                        className="toggle toggle-accent bg-[#252525]"
                        onChange={(e) => {
                          const checked = e.currentTarget.checked;
                          setNotification((prev) => ({
                            ...prev,
                            [key]: {
                              ...prev[key],
                              email: checked, // toggles the email property
                            },
                          }));
                        }}
                        checked={notifications[key].email}
                      />
                    </label>
                  </div>
                </>
              ))}
          </div>
        </div>
      </div>
    )
  );
};

export default NotificationSettings;
