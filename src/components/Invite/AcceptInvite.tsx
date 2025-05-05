"use client";
import { Brewery } from "@/types/brewery";
import { useBreweryContext } from "@/context/brewery-beer";
import { useToast } from "@/context/toast";
import { acceptInvite } from "@/lib/POST/acceptInvite";
import getBreweries from "@/lib/getBreweries";
import getSingleBrewery from "@/lib/getSingleBrewery";
import { useSession } from "next-auth/react";
import { revalidatePath } from "next/cache";
import Link from "next/link";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { mutate } from "swr";

type Props = {};

const AcceptInvite = (props: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(`Accepting Invite... `);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { addToast } = useToast();

  const { data: session, update } = useSession();

  const handleBreweryToStorage = async (brewery: Brewery) => {
    localStorage.setItem("selectedBreweryId", brewery._id);
    // Create a new event
    const selectedBreweryChangedEvent = new Event("selectedBreweryChanged");
    // Dispatch the event
    window.dispatchEvent(selectedBreweryChangedEvent);

    const fetcher = async (url: string) => {
      if (session?.user.accessToken) {
        try {
          const response = await fetch(url, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.user.accessToken}`,
            },
            method: "POST",
            body: JSON.stringify({ breweryIds: session.user.breweries }),
          });

          if (!response.ok) {
            throw new Error(response.statusText);
          }

          const responseData = await response.json();
          return responseData.breweries;
        } catch (err) {
          console.error(err);
          return []; // Return empty array on error
        }
      } else {
        return []; // Return empty array if user has no breweries
      }
    };

    mutate(
      "https://beer-bible-api.vercel.app/users/breweries",
      fetcher("https://beer-bible-api.vercel.app/users/breweries")
    );
  };

  const fetchInvite = async (token: string) => {
    setLoading(true);

    try {
      if (session?.user.accessToken) {
        const response = await acceptInvite({
          token,
          accessToken: session?.user.accessToken,
        });

        if (response.message === "Invitation accepted.") {
          setMessage(response.message);
          addToast(
            `You have successfully joined ${response.brewery.companyName}!`,
            "success"
          );

          await update({ newBreweryId: response.brewery._id });
          handleBreweryToStorage(response.brewery);

          router.push(`/dashboard/breweries/${response.brewery._id}`);
        }
      } else {
        addToast("Unable to process invite. Please try again later", "error");
        setMessage("Unable to process invite. Please try again later");
      }
    } catch (err: string | any) {
      console.error(err);
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
    <div className="mx-auto w-full h-full text-center">
      <div className=" w-full h-[80%] flex flex-col justify-center items-center ">
        {loading ? (
          <>
            <p>{message}</p>
            <span className="loading loading-spinner loading-lg">
              Loading...
            </span>
          </>
        ) : (
          <div className="flex flex-col justify-center items-center">
            <p>{message}</p>
            <div className="flex gap-3">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvite;
