type pageProps = {
  token: string | string[];
  accessToken: string;
};
export const acceptInvite = async ({ token, accessToken }: pageProps) => {
  console.log({ token, accessToken });
  try {
    if (token && accessToken) {
      const response = await fetch(
        `https://beer-bible-api.vercel.app/accept-invite?token=${token}`,
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
          `Invitation could not be accepted. ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    }
  } catch (err) {
    throw new Error(err.message);
  }
};
