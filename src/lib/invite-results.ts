export type StaffInviteRole = "member" | "admin";

export type StaffInviteRecipient = {
  id: string;
  email: string;
  role: StaffInviteRole;
};

export type StaffInviteResult = StaffInviteRecipient & {
  status: "fulfilled" | "rejected";
  error?: string;
};

type SendStaffInvite = (recipient: StaffInviteRecipient) => Promise<unknown>;

const getErrorMessage = (reason: unknown) => {
  if (reason instanceof Error) {
    return reason.message;
  }

  if (typeof reason === "string") {
    return reason;
  }

  return "Unable to send invitation.";
};

export async function sendStaffInvitesSafely(
  recipients: StaffInviteRecipient[],
  sendInvite: SendStaffInvite
): Promise<StaffInviteResult[]> {
  const inviteRequests = recipients.map(async (recipient) => {
    try {
      await sendInvite(recipient);
      return {
        ...recipient,
        status: "fulfilled" as const,
      };
    } catch (error) {
      return {
        ...recipient,
        status: "rejected" as const,
        error: getErrorMessage(error),
      };
    }
  });

  return Promise.all(inviteRequests);
}
