"use client";
import React from "react";
import { Button } from "@/components/ui/button";

const DeleteAccount = () => {
  return (
    <section className="rounded-md border border-destructive/30 bg-destructive/5 p-5">
      <h3 className="text-base font-semibold text-destructive">
        Account deletion
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Self-service account deletion is not available in this version. Contact
        support or a system administrator to request account removal.
      </p>
      <Button
        className="mt-4"
        variant="destructive"
        disabled
        aria-disabled="true"
      >
        Delete account unavailable
      </Button>
    </section>
  );
};

export default DeleteAccount;
