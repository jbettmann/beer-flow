"use client";
import { useBreweryContext } from "@/context/brewery-beer";
import { acceptInvite } from "@/lib/POST/acceptInvite";
import getSingleBrewery from "@/lib/getSingleBrewery";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import path from "path";
import React, { useEffect, useState } from "react";
import useSWR from "swr";

type Props = {};

const AcceptInvite = (props: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { setSelectedBrewery } = useBreweryContext();
  const { data: session, update } = useSession();

  const fetchInvite = async (token: string) => {
    setLoading(true);

    try {
      if (session?.user.accessToken) {
        const response = await acceptInvite({
          token,
          accessToken: session?.user.accessToken,
        });

        console.log({ response });

        if (response.message === "Invitation accepted.") {
          setMessage(response.message);
          alert(
            `You have successfully joined ${response.brewery.companyName}!`
          );
          localStorage.setItem("selectedBreweryId", response.brewery._id);
          setSelectedBrewery(response.brewery);
          await update({ newBreweryId: response.brewery._id });
          router.push(`/breweries/${response.brewery._id}`);
        } else {
          setMessage(response.message);
        }
      } else {
        // router.push("/"); // Redirect to the home page if the user is not authenticate
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // accept-invite url example:
    // const inviteUrl = `http://localhost:3000/accept-invite?token=${token}`;

    const token = searchParams.get("token");

    if (token) {
      fetchInvite(token);
    }
  }, [pathname, session]);

  return (
    <div>
      {loading ? (
        <span className="loading loading-spinner loading-lg">Loading...</span>
      ) : (
        <div>
          <p>{message}</p>
          <Link className="create-btn" href={"/"}>
            Home
          </Link>
          <button
            className="btn btn-outline btn-primary"
            onClick={() => router.refresh()}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default AcceptInvite;
