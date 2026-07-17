import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import React from "react";

const SecurityPage = async () => {
  const session = await auth();

  return (
    <section className="w-full max-w-3xl space-y-5">
      <div className="rounded-md border border-border bg-background p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold">Security</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Password recovery and password changes are not exposed by the
              current backend.
            </p>
          </div>
          <Badge variant="outline">Read-only status</Badge>
        </div>

        <div className="mt-5 grid gap-3">
          <div className="rounded-md border border-border p-4">
            <p className="text-sm font-medium">Signed-in email</p>
            <p className="mt-1 break-all text-sm text-muted-foreground">
              {session?.user.email}
            </p>
          </div>
          <div className="rounded-md border border-border p-4">
            <p className="text-sm font-medium">Password management</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Beer Flow can authenticate with a password, but this frontend does
              not have a supported password-change or recovery endpoint. Use
              your configured identity provider or contact an administrator if
              you cannot sign in.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecurityPage;
