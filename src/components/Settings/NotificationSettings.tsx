"use client";
import { Notifications } from "@/app/types/notifications";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

const NotificationSettings = () => {
  const { data: session } = useSession();
  const [notifications, setNotification] = useState<Notifications>(
    session?.user.notifications
  );
  console.log(session?.user.notifications);
  // Get the keys from the notifications object
  const notificationKeys = Object.keys(session.user.notifications).filter(
    (key) => key !== "allow" // Excluding 'allow' if you don't want to display it
  );

  useEffect(() => {
    if (!notifications.beerUpdate && !notifications.newBeerRelease) {
      setNotification((prev) => ({
        ...prev,
        allow: false,
      }));
    }
  }, [notifications.beerUpdate, notifications.newBeerRelease]);

  return (
    <div className="w-full">
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
              onClick={(e) => {
                e.stopPropagation(),
                  setNotification((prev) => ({
                    ...prev,
                    allow: !notifications?.allow,
                  }));
              }}
              checked={notifications?.allow}
            />
          </label>
        </div>
        <div className="w-11/12 mx-auto">
          {notifications.allow &&
            notificationKeys.map((key) => (
              <>
                <div key={key} className=" flex items-center justify-between ">
                  <div className="label-text mr-1">
                    {key === "newBeerRelease"
                      ? "New Beer Release "
                      : "Beer Updates"}
                  </div>
                  <label className="cursor-pointer label w-fit">
                    <div className="label-text mr-1">
                      {notifications[key] ? "On" : "Off"}
                    </div>
                    <input
                      type="checkbox"
                      className="toggle toggle-accent"
                      onClick={(e) => {
                        e.stopPropagation(),
                          setNotification((prev) => ({
                            ...prev,
                            [key]: !notifications[key],
                          }));
                      }}
                      checked={notifications[key]}
                    />
                  </label>
                </div>
              </>
            ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
