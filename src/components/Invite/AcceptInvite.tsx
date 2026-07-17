"use client";

import { useToast } from "@/context/toast";
import {
  buildInviteAcceptAttemptKey,
  getOrCreateInviteAcceptRequest,
  InviteAcceptRoutePayload,
  isValidLegacyInviteToken,
  isValidInviteState,
} from "@/lib/invite-flow";
import Cookies from "js-cookie";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { mutate } from "swr";

const acceptInviteRequests = new Map<string, Promise<InviteAcceptRoutePayload>>();
const legacyRelayRequests = new Map<string, Promise<{ redirectTo: string }>>();

type ViewState = {
  tone: "loading" | "success" | "error";
  message: string;
  retryable: boolean;
};

const fetchAcceptInvite = (state: string, attempt: number) => {
  const requestKey = buildInviteAcceptAttemptKey(state, attempt);

  return getOrCreateInviteAcceptRequest(acceptInviteRequests, requestKey, async () => {
    const response = await fetch("/api/invites/accept", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({ state }),
    });

    return (await response.json()) as InviteAcceptRoutePayload;
  });
};

const relayLegacyInvite = (token: string) =>
  getOrCreateInviteAcceptRequest(legacyRelayRequests, token, async () => {
    const response = await fetch("/api/invites/relay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({ token }),
    });

    return (await response.json()) as { redirectTo: string };
  });

const AcceptInvite = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const inviteError = searchParams.get("error");
  const inviteToken = searchParams.get("token");
  const inviteState = searchParams.get("state");
  const { status, update } = useSession();
  const [attempt, setAttempt] = useState(0);
  const [isRelayingLegacyToken, setIsRelayingLegacyToken] = useState(false);
  const [viewState, setViewState] = useState<ViewState>({
    tone: "loading",
    message: "Preparing your invitation...",
    retryable: false,
  });
  const hasValidLegacyInviteToken = useMemo(
    () => !!inviteToken && isValidLegacyInviteToken(inviteToken),
    [inviteToken]
  );
  const hasValidInviteState = useMemo(
    () => !!inviteState && isValidInviteState(inviteState),
    [inviteState]
  );

  const handleInviteAccepted = useCallback(
    async (response: InviteAcceptRoutePayload) => {
      const breweryId = response.brewery?._id;
      const breweryName = response.brewery?.companyName;

      if (!breweryId || !breweryName) {
        setViewState({
          tone: "error",
          message: "Invitation accepted, but brewery details could not be loaded.",
          retryable: true,
        });
        return;
      }

      await update({
        newBreweryId: breweryId,
        selectedBreweryId: breweryId,
      });
      Cookies.set("selectedBreweryId", breweryId);
      localStorage.setItem("selectedBreweryId", breweryId);
      window.dispatchEvent(new CustomEvent("selectedBreweryChanged"));
      await Promise.all([
        mutate(`/breweries/${breweryId}`),
        mutate(`/breweries/${breweryId}/beers`),
      ]);

      addToast(`You have successfully joined ${breweryName}.`, "success");
      setViewState({
        tone: "success",
        message: response.message,
        retryable: false,
      });
      router.replace(`/dashboard/breweries/${breweryId}`);
    },
    [addToast, router, update]
  );

  useEffect(() => {
    if (!inviteToken) {
      return;
    }

    setIsRelayingLegacyToken(true);
    setViewState({
      tone: "loading",
      message: "Preparing your invitation...",
      retryable: false,
    });

    if (!hasValidLegacyInviteToken) {
      setIsRelayingLegacyToken(false);
      router.replace("/accept-invite?error=invalid");
      return;
    }

    let isActive = true;

    void relayLegacyInvite(inviteToken)
      .then(({ redirectTo }) => {
        if (!isActive) {
          return;
        }

        router.replace(redirectTo);
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        router.replace("/accept-invite?error=invalid");
      })
      .finally(() => {
        if (!isActive) {
          return;
        }

        setIsRelayingLegacyToken(false);
      });

    return () => {
      isActive = false;
    };
  }, [hasValidLegacyInviteToken, inviteToken, router]);

  useEffect(() => {
    if (isRelayingLegacyToken) {
      setViewState({
        tone: "loading",
        message: "Preparing your invitation...",
        retryable: false,
      });
      return;
    }

    if (inviteError === "invalid" || !inviteState || !hasValidInviteState) {
      setViewState({
        tone: "error",
        message: "This invitation link is invalid.",
        retryable: false,
      });
      return;
    }

    if (status === "loading") {
      setViewState({
        tone: "loading",
        message: "Checking your session...",
        retryable: false,
      });
      return;
    }

    if (status !== "authenticated") {
      setViewState({
        tone: "loading",
        message: "Redirecting you to sign in...",
        retryable: false,
      });
      return;
    }

    let isActive = true;

    setViewState({
      tone: "loading",
      message: "Accepting your invitation...",
      retryable: false,
    });

    void fetchAcceptInvite(inviteState, attempt)
      .then(async (response) => {
        if (!isActive) {
          return;
        }

        if (response.status === "success") {
          await handleInviteAccepted(response);
          return;
        }

        if (response.status === "completed") {
          await update({ refreshMembership: true });
          addToast(response.message, "success");
          setViewState({
            tone: "success",
            message: response.message,
            retryable: false,
          });
          router.replace("/dashboard");
          return;
        }

        if (response.status === "email_mismatch") {
          addToast(response.message, "error");
        }

        setViewState({
          tone: "error",
          message: response.message,
          retryable: response.retryable,
        });
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setViewState({
          tone: "error",
          message: "Unable to accept the invitation right now. Please try again.",
          retryable: true,
        });
      });

    return () => {
      isActive = false;
    };
  }, [
    addToast,
    attempt,
    handleInviteAccepted,
    hasValidInviteState,
    isRelayingLegacyToken,
    inviteError,
    inviteState,
    router,
    status,
    update,
  ]);

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center justify-center px-6">
      <div className="w-full rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">Invitation</h1>
        <p
          className="mt-4 text-muted-foreground"
          role={viewState.tone === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          {viewState.message}
        </p>

        {viewState.tone === "loading" ? (
          <div className="mt-6 flex justify-center">
            <span className="loading loading-spinner loading-lg">
              Loading...
            </span>
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link className="btn btn-outline" href="/">
              Home
            </Link>
            {viewState.retryable && inviteState ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setAttempt((currentAttempt) => currentAttempt + 1);
                }}
              >
                Try Again
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvite;
