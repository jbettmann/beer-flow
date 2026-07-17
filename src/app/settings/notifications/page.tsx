import NotificationSettings from "@/components/Settings/NotificationSettings";
import React from "react";

type Props = {};

const NotificationsPage = (props: Props) => {
  return (
    <section className="w-full max-w-3xl">
      <NotificationSettings />
    </section>
  );
};

export default NotificationsPage;
