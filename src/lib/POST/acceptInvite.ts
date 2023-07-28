type pageProps = {
  token: string | string[];
};
export const acceptInvite = async ({ token }: pageProps) => {
  try {
    const response = await fetch(`/accept-invite?token=${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Invitation could not be accepted. ${response.statusText}`
      );
    }
    const data = await response.json();
    return data;
  } catch (err) {
    throw new Error(err.message);
  }
};
