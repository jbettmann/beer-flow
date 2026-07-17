"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  sendStaffInvitesSafely,
  StaffInviteRecipient,
} from "@/lib/invite-results";
import { sendInvite } from "@/lib/POST/sendInvite";
import { validateEmail } from "@/lib/validators/email";
import { Loader2, Plus, Send, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

type InviteRow = StaffInviteRecipient & {
  error: string;
};

type Props = {
  breweryId: string;
  breweryName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvitesSent?: () => void;
};

const createInviteRow = (): InviteRow => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
  email: "",
  role: "member",
  error: "",
});

export default function StaffInviteDialog({
  breweryId,
  breweryName,
  open,
  onOpenChange,
  onInvitesSent,
}: Props) {
  const { data: session } = useSession();
  const titleId = useId();
  const statusId = useId();
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const [rows, setRows] = useState<InviteRow[]>(() => [createInviteRow()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    const focusTimer = window.setTimeout(() => {
      firstInputRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(focusTimer);
  }, [open]);

  const hasValidRows = useMemo(
    () => rows.every((row) => row.email.trim() && validateEmail(row.email.trim())),
    [rows]
  );

  const resetRows = () => {
    setRows([createInviteRow()]);
    setStatusMessage("");
  };

  const closeDialog = () => {
    if (isSubmitting) {
      return;
    }

    onOpenChange(false);
    resetRows();
  };

  const updateRow = (
    id: string,
    field: "email" | "role",
    value: InviteRow["email"] | InviteRow["role"]
  ) => {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
              error: field === "email" ? "" : row.error,
            }
          : row
      )
    );
  };

  const addRecipient = () => {
    setRows((currentRows) => [...currentRows, createInviteRow()]);
  };

  const removeRecipient = (id: string) => {
    setRows((currentRows) =>
      currentRows.length === 1
        ? [{ ...currentRows[0], email: "", role: "member", error: "" }]
        : currentRows.filter((row) => row.id !== id)
    );
  };

  const validateRows = () => {
    let isValid = true;

    setRows((currentRows) =>
      currentRows.map((row) => {
        const email = row.email.trim();
        if (!email) {
          isValid = false;
          return { ...row, error: "Email address is required." };
        }

        if (!validateEmail(email)) {
          isValid = false;
          return { ...row, error: "Enter a valid email address." };
        }

        return { ...row, email, error: "" };
      })
    );

    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage("");

    if (!validateRows()) {
      setStatusMessage("Correct the highlighted recipients before sending.");
      return;
    }

    if (!session?.user?.accessToken) {
      setStatusMessage("Your session expired. Sign in again before inviting staff.");
      return;
    }

    setIsSubmitting(true);

    const recipients = rows.map(({ id, email, role }) => ({
      id,
      email: email.trim(),
      role,
    }));

    const results = await sendStaffInvitesSafely(recipients, (recipient) =>
      sendInvite({
        breweryId,
        accessToken: session.user.accessToken,
        inviteData: {
          email: recipient.email,
          isAdmin: recipient.role === "admin",
        },
      })
    );

    const failedResults = results.filter((result) => result.status === "rejected");
    const successCount = results.length - failedResults.length;

    if (failedResults.length > 0) {
      setRows(
        failedResults.map((result) => ({
          id: result.id,
          email: result.email,
          role: result.role,
          error: result.error || "Unable to send invitation.",
        }))
      );
      setStatusMessage(
        successCount > 0
          ? `${successCount} invitation${
              successCount === 1 ? "" : "s"
            } sent. Correct and retry the remaining recipient${
              failedResults.length === 1 ? "" : "s"
            }.`
          : "No invitations were sent. Correct the errors and retry."
      );
    } else {
      setStatusMessage(
        `${successCount} invitation${successCount === 1 ? "" : "s"} sent.`
      );
      onInvitesSent?.();
      onOpenChange(false);
      resetRows();
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : closeDialog())}
    >
      <DialogContent
        aria-labelledby={titleId}
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle id={titleId}>Invite staff</DialogTitle>
          <DialogDescription>
            Send one invitation per recipient for {breweryName}. Choose Member
            or Admin access for each person.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-3">
            {rows.map((row, index) => {
              const emailId = `invite-email-${row.id}`;
              const roleId = `invite-role-${row.id}`;
              const errorId = `invite-error-${row.id}`;

              return (
                <div
                  key={row.id}
                  className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-[minmax(0,1fr)_9rem_auto] sm:items-start"
                >
                  <div className="space-y-2">
                    <Label htmlFor={emailId}>Email address</Label>
                    <Input
                      ref={index === 0 ? firstInputRef : undefined}
                      id={emailId}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={row.email}
                      onChange={(event) =>
                        updateRow(row.id, "email", event.currentTarget.value)
                      }
                      aria-invalid={Boolean(row.error)}
                      aria-describedby={row.error ? errorId : undefined}
                      placeholder="name@example.com"
                      disabled={isSubmitting}
                    />
                    {row.error ? (
                      <p id={errorId} className="text-sm text-destructive">
                        {row.error}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label id={roleId}>Role</Label>
                    <Select
                      value={row.role}
                      onValueChange={(value: "member" | "admin") =>
                        updateRow(row.id, "role", value)
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger aria-labelledby={roleId} className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-0 self-end sm:mt-7"
                    onClick={() => removeRecipient(row.id)}
                    disabled={isSubmitting}
                    aria-label={`Remove ${row.email || "recipient"}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addRecipient}
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4" />
            Add recipient
          </Button>

          <p
            id={statusId}
            className="min-h-5 text-sm text-muted-foreground"
            aria-live="polite"
          >
            {statusMessage}
          </p>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !hasValidRows}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send invitations
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
