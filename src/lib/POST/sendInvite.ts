// apiService.ts

interface Invite {
  email: string;
  isAdmin: boolean;
}
type Props = {
  inviteData: Invite;
  breweryId: string;
};

export async function sendInvite({ inviteData, breweryId }: Props) {
  const response = await fetch(`/breweries/${breweryId}/invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: inviteData.email,
      isAdmin: inviteData.isAdmin,
    }),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return await response.json();
}
