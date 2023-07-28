// apiService.ts

interface Invite {
  email: string;
  isAdmin: boolean;
}
type Props = {
  inviteData: Invite;
  breweryId: string;
  accessToken: string;
};

export async function sendInvite({
  inviteData,
  breweryId,
  accessToken,
}: Props) {
  console.log({ inviteData, breweryId, accessToken });
  if (breweryId && accessToken) {
    const response = await fetch(
      `https://beer-bible-api.vercel.app/breweries/${breweryId}/invite`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          email: inviteData.email,
          isAdmin: inviteData.isAdmin,
        }),
      }
    );

    // Check if the response is JSON before calling response.json()
    if (response.headers.get("Content-Type")?.includes("application/json")) {
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || response.statusText);
      }

      return data;
    } else {
      // The response isn't JSON
      const text = await response.text();

      throw new Error(`Server responded with non-JSON response: ${text}`);
    }
  }
}
