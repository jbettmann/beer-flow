import { acceptInvite } from "@/lib/POST/acceptInvite";
import { set } from "mongoose";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

type Props = {};

const AcceptInvite = (props: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchInvite = async (token: string | string[]) => {
    setLoading(true);
    try {
      const response = await acceptInvite({ token });

      setMessage(response.message);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { token } = router.query;
    if (token) {
      fetchInvite(token);
    }
  }, [router.query]);

  return <div>{loading ? <p>Loading...</p> : <p>{message}</p>}</div>;
};

export default AcceptInvite;
