import { buildApiUrl } from "@/lib/api/base";

type pageProps = {
  token: string | string[];
  accessToken: string;
};
export const acceptInvite = async ({ token, accessToken }: pageProps) => {
  try {
    if (token && accessToken) {
      const inviteToken = Array.isArray(token) ? token[0] : token;
      const response = await fetch(
        `${buildApiUrl("/accept-invite")}?token=${encodeURIComponent(
          inviteToken
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Invitation could not be accepted at this time. Please try again later.`
        );
      }

      const data = await response.json();
      return data;
    }
  } catch (err: any) {
    throw new Error(err.message);
  }
};
