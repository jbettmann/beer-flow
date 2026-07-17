import DeleteAccount from "@/components/Settings/DeleteAccount";
import { auth } from "@/auth";
import React from "react";

type Props = {};

const AccountPage = async (props: Props) => {
  const session = await auth();
  const displayName = session?.user.name || session?.user.fullName;

  return (
    <section className="w-full max-w-3xl space-y-5">
      <div className="rounded-md border border-border bg-background p-6">
        <h3 className="text-xl font-semibold">Account</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Review account ownership details and unavailable destructive actions.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-border p-4">
            <p className="text-sm font-medium">Name</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {displayName || "Not provided"}
            </p>
          </div>
          <div className="rounded-md border border-border p-4">
            <p className="text-sm font-medium">Email address</p>
            <p className="mt-1 break-all text-sm text-muted-foreground">
              {session?.user.email}
            </p>
          </div>
          <div className="rounded-md border border-border p-4">
            <p className="text-sm font-medium">Membership plan</p>
            <p className="mt-1 text-sm text-muted-foreground">Free</p>
          </div>
        </div>
      </div>
      <DeleteAccount />
    </section>
  );
};

export default AccountPage;
