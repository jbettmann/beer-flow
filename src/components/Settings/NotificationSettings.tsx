"use client";

import updateUserNotifications from "@/lib/PUT/updateUserNotfications";
import { cn } from "@/lib/utils";
import type { Notifications } from "@/types/notifications";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type NotificationChannelKey = "newBeerRelease" | "beerUpdate";

type NotificationSettingsState = {
  allow: boolean;
  newBeerRelease: {
    email: boolean;
    push: boolean;
  };
  beerUpdate: {
    email: boolean;
    push: boolean;
  };
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

const defaultNotifications: NotificationSettingsState = {
  allow: true,
  newBeerRelease: {
    email: true,
    push: true,
  },
  beerUpdate: {
    email: true,
    push: true,
  },
};

const channelMeta: Record<
  NotificationChannelKey,
  { title: string; description: string }
> = {
  newBeerRelease: {
    title: "New Beer Release",
    description: "Get notified when a brewery publishes a new beer.",
  },
  beerUpdate: {
    title: "Beer Updates",
    description: "Get notified when a tracked beer changes.",
  },
};

const notificationChannels = ["email", "push"] as const;

const normalizeNotifications = (
  notifications?: Partial<NotificationSettingsState> | null
): NotificationSettingsState => ({
  allow: notifications?.allow ?? defaultNotifications.allow,
  newBeerRelease: {
    email:
      notifications?.newBeerRelease?.email ??
      defaultNotifications.newBeerRelease.email,
    push:
      notifications?.newBeerRelease?.push ??
      defaultNotifications.newBeerRelease.push,
  },
  beerUpdate: {
    email:
      notifications?.beerUpdate?.email ?? defaultNotifications.beerUpdate.email,
    push:
      notifications?.beerUpdate?.push ?? defaultNotifications.beerUpdate.push,
  },
});

const NotificationSettings = () => {
  const { data: session, update } = useSession();
  const [notifications, setNotifications] = useState<NotificationSettingsState>(
    () => normalizeNotifications(session?.user?.notifications as Notifications)
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusResetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasHydratedRef = useRef(false);
  const lastSavedSnapshotRef = useRef("");
  const desiredNotificationsRef = useRef(notifications);
  const saveInFlightRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!session?.user?.notifications) return;
    const nextNotifications = normalizeNotifications(
      session?.user?.notifications as Notifications
    );
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;
    setNotifications(nextNotifications);
    lastSavedSnapshotRef.current = JSON.stringify(nextNotifications);
    setSaveStatus("idle");
    setSaveError("");
  }, [session?.user?.notifications]);

  useEffect(() => {
    if (!hasHydratedRef.current) {
      return;
    }

    const currentSnapshot = JSON.stringify(notifications);
    desiredNotificationsRef.current = notifications;
    if (currentSnapshot === lastSavedSnapshotRef.current) {
      return;
    }

    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    if (statusResetTimeout.current) {
      clearTimeout(statusResetTimeout.current);
    }

    setSaveStatus("saving");
    setSaveError("");

    saveTimeout.current = setTimeout(async () => {
      if (saveInFlightRef.current) return;
      saveInFlightRef.current = true;

      try {
        while (
          JSON.stringify(desiredNotificationsRef.current) !==
          lastSavedSnapshotRef.current
        ) {
          if (!session?.user?.id || !session?.user?.accessToken) {
            throw new Error("Missing user session. Please sign in again.");
          }

          const snapshot = desiredNotificationsRef.current;
          await updateUserNotifications({
            notifications: snapshot,
            userId: session.user.id,
            accessToken: session.user.accessToken,
          });
          await update({ updatedNotifications: snapshot });
          lastSavedSnapshotRef.current = JSON.stringify(snapshot);
        }

        if (!mountedRef.current) return;
        setSaveStatus("saved");
        setSaveError("");
        statusResetTimeout.current = setTimeout(() => {
          if (mountedRef.current) setSaveStatus("idle");
        }, 1800);
      } catch (error) {
        if (!mountedRef.current) return;
        const message =
          error instanceof Error
            ? error.message
            : "Unable to save notification preferences.";
        setSaveStatus("error");
        setSaveError(message);
      } finally {
        saveInFlightRef.current = false;
      }
    }, 500);

    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [notifications, session?.user?.accessToken, session?.user?.id, update, retryKey]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
      if (statusResetTimeout.current) {
        clearTimeout(statusResetTimeout.current);
      }
    };
  }, []);

  if (
    !session?.user?.notifications ||
    !session?.user?.id ||
    !session?.user?.accessToken
  ) {
    return (
      <div className="space-y-4" aria-label="Loading notification preferences">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl space-y-6">
      <div className="rounded-md border border-border bg-background p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold">Notifications</h3>
            <p className="mt-1 text-sm text-base-content/70">
              Control which beer updates you receive by email and push.
            </p>
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
              saveStatus === "saving" && "bg-info/15 text-info",
              saveStatus === "saved" && "bg-success/15 text-success",
              saveStatus === "error" && "bg-error/15 text-error",
              saveStatus === "idle" && "bg-base-200 text-base-content/70"
            )}
            aria-live="polite"
          >
            {saveStatus === "saving" && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            )}
            {saveStatus === "saved" && <CheckCircle2 className="h-3.5 w-3.5" />}
            {saveStatus === "error" && <AlertCircle className="h-3.5 w-3.5" />}
            <span>
              {saveStatus === "saving" && "Saving changes"}
              {saveStatus === "saved" && "Saved"}
              {saveStatus === "error" && "Save failed"}
              {saveStatus === "idle" && "All changes saved"}
            </span>
          </div>
        </div>
        {saveStatus === "error" && saveError ? (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-destructive">
            <p>{saveError}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => setRetryKey((key) => key + 1)}>Retry</Button>
          </div>
        ) : null}
      </div>

      <div className="rounded-md border border-border bg-background p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-semibold">Allow notifications</h4>
            <p className="mt-1 text-sm text-base-content/70">
              Master switch for all notification delivery.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="label-text text-sm font-medium">
              {notifications.allow ? "On" : "Off"}
            </span>
            <Switch
              onCheckedChange={(checked) => {
                setNotifications((prev) => ({
                  ...prev,
                  allow: checked,
                }));
              }}
              checked={notifications.allow}
              aria-label="Allow notifications"
            />
          </div>
        </div>
      </div>

      <div
        className={cn(
          "space-y-4 transition-opacity",
          notifications.allow ? "opacity-100" : "opacity-60"
        )}
      >
        {(Object.keys(channelMeta) as NotificationChannelKey[]).map((key) => (
          <div
            key={key}
            className="rounded-md border border-border bg-background p-5"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-md">
                <h5 className="text-base font-semibold">{channelMeta[key].title}</h5>
                <p className="mt-1 text-sm text-base-content/70">
                  {channelMeta[key].description}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {notificationChannels.map((channel) => {
                  const checked = notifications[key][channel];
                  return (
                    <label
                      key={`${key}-${channel}`}
                      className="flex min-w-36 items-center justify-between gap-3 rounded-md border border-border px-4 py-3"
                    >
                      <div>
                        <div className="text-sm font-medium capitalize">
                          {channel}
                        </div>
                        <div className="text-xs text-base-content/60">
                          {notifications.allow
                            ? "Stored preference"
                            : "Disabled until notifications are enabled"}
                        </div>
                      </div>
                      <Switch
                        onCheckedChange={(nextChecked) => {
                          setNotifications((prev) => ({
                            ...prev,
                            [key]: {
                              ...prev[key],
                              [channel]: nextChecked,
                            },
                          }));
                        }}
                        checked={checked}
                        disabled={!notifications.allow || saveStatus === "saving"}
                        aria-label={`${channel} notifications for ${channelMeta[key].title}`}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!notifications.allow ? (
        <p className="text-sm text-base-content/70">
          Notification channels stay visible but disabled while notifications are
          off. Turn them back on to edit email and push delivery preferences.
        </p>
      ) : null}
    </div>
  );
};

export default NotificationSettings;
