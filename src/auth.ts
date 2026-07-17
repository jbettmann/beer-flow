export const config = {
  runtime: "nodejs", // ✅ Forces Node.js runtime
};
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { getUserByCredentials } from "@/lib/GET/getUserByCredentials";
import { buildApiUrl } from "@/lib/api/base";
import { signJwtAccessToken } from "@/lib/jwt";
import type { Account, Profile, Session } from "next-auth";

import { Notifications } from "@/types/notifications";
import NextAuth, { User as NextAuthUser } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getUserByOauth } from "./lib/GET/getUserByOauth";
import {
  mergeRefreshedMembershipTokenFields,
  mergeUniqueStrings,
  resolvePreferredBreweryId,
  sanitizeNextPath,
  toUniqueStringArray,
} from "./lib/invite-flow";

interface MyToken extends JWT {
  id?: string;
  name?: string | null;
  fullName?: string | null;
  email?: string | null;
  picture?: string | null;
  image?: string | null;
  breweries?: string[];
  notifications?: Notifications;
  accessToken?: string | null;
  selectedBreweryId?: string | null;
  account?: Account | null; // Account is optional
}

interface Profiles extends Profile {
  picture?: string;
}

function buildAccessTokenPayload(source: {
  id?: string | null;
  name?: string | null;
  fullName?: string | null;
  email?: string | null;
  breweries?: Array<string | null | undefined>;
  notifications?: Notifications;
  selectedBreweryId?: string | null;
  picture?: string | null;
  image?: string | null;
}) {
  const breweries = toUniqueStringArray(source.breweries ?? []);

  return {
    id: source.id,
    name: source.name,
    fullName: source.fullName || source.name,
    email: source.email,
    breweries,
    notifications: source.notifications,
    selectedBreweryId: source.selectedBreweryId,
    picture: source.picture,
    image: source.image || source.picture,
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",

      credentials: {
        fullName: {
          label: "Full name",
          type: "text",
          placeholder: "Jane Doe",
        },
        email: { label: "Email address", type: "text", placeholder: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, _req) {
        if (!credentials?.fullName || typeof credentials.fullName !== "string") {
          throw new Error("Full name is required");
        }

        if (!credentials?.email) {
          throw new Error("Email address is required");
        }

        if (
          !credentials?.password ||
          typeof credentials.password !== "string"
        ) {
          throw new Error("You'll need to provide a password to login");
        }

        try {
          const user = await getUserByCredentials(
            credentials.fullName as string,
            credentials.email as string,
            credentials.password
          );
          return {
            id: user._id.toString(),
            ...user,
            selectedBreweryId: null,
          };
        } catch (error: any) {
          throw new Error(error.message);
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === "development",

  callbacks: {
    async signIn({
      user,
      profile,
      account,
    }: {
      user: AdapterUser | NextAuthUser;
      profile?: Profiles | undefined;
      account?: Account | null;
    }): Promise<boolean> {
      const email = user?.email ?? profile?.email;
      const picture = profile?.picture ?? user?.image;
      const cookieStore = await cookies();
      let selectedBreweryId =
        cookieStore.get("selectedBreweryId")?.value || null;

      if (!email) {
        // OAuth provider didn't return an email
        return false;
      }

      if (account?.type === "credentials") {
        if (user) {
          user.id = user.id.toString();
          user.name = user.name || user.fullName;
          user.picture = picture;
          user.image = picture;
          user.breweries = (user.breweries ?? []).map((b: any) =>
            b.toString()
          );
          user.selectedBreweryId = resolvePreferredBreweryId(
            user.breweries,
            selectedBreweryId
          );
          user.notifications = { ...(user.notifications ?? {}) };
          return true;
        }
        return false;
      }

      try {
        const existingUser = await getUserByOauth(email);

        user.id = existingUser._id.toString();
        user.name = existingUser.fullName;
        user.fullName = existingUser.fullName;
        user.email = existingUser.email;
        user.picture = picture;
        user.image = picture;
        user.breweries = (existingUser.breweries ?? []).map((b: any) =>
          b.toString()
        );
        user.notifications = { ...(existingUser.notifications ?? {}) };
        user.selectedBreweryId = resolvePreferredBreweryId(
          user.breweries,
          selectedBreweryId,
          (existingUser as any).selectedBreweryId
        );

        return true;
      } catch (err: string | any) {
        console.error("signIn failed");
        throw new Error("Unable to sign in. Please try again.");
      }
    },

    authorized: async ({
      request: { nextUrl },
      auth,
    }: {
      request: NextRequest;
      auth: Session | null;
    }) => {
      const isAuth = !!auth?.user;
      const acceptInvite = nextUrl.pathname.startsWith("/accept-invite");
      const inviteLanding = nextUrl.pathname.startsWith("/invite/");
      const publicRoutes = [
        "/",
        "/help",
        "/privacy-policy",
        "/auth/login",
        "/auth/signup",
        "/auth/create/account",
      ];
      const isAuthPage = nextUrl.pathname === "/auth/login" ||
        nextUrl.pathname === "/auth/signup" ||
        nextUrl.pathname === "/auth/create/account";

      if (isAuth && isAuthPage) {
        const destination = sanitizeNextPath(
          nextUrl.searchParams.get("next"),
          "/dashboard/overview"
        );
        return NextResponse.redirect(new URL(destination, nextUrl));
      }

      if (
        inviteLanding ||
        publicRoutes.some(
          (route) =>
            nextUrl.pathname === route || nextUrl.pathname.startsWith(`${route}/`)
        )
      ) {
        return true;
      }

      if (acceptInvite && nextUrl.searchParams.has("token")) {
        // Let the transitional client relay exchange the raw legacy token for
        // an HttpOnly state cookie before any auth redirect copies the URL.
        return true;
      }

      if (!isAuth) {
        const loginUrl = new URL("/auth/login", nextUrl);
        if (acceptInvite) {
          loginUrl.searchParams.set(
            "next",
            sanitizeNextPath(
              `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`,
              "/accept-invite"
            )
          );
        }
        return NextResponse.redirect(loginUrl);
      }

      if (acceptInvite) {
        return true;
      }

      return true;
    },
    async jwt({
      token,
      user,
      account,
      profile,
      trigger,
      isNewUser,
      session,
    }: {
      token: MyToken;
      user: AdapterUser | NextAuthUser;
      account?: Account | null;
      profile?: Profile;
      trigger?: "signIn" | "signUp" | "update";
      isNewUser?: boolean;
      session?: any;
    }) {
      if (trigger && trigger === "update") {
        let shouldRefreshAccessToken = false;

        if (session.newBreweryId) {
          token.breweries = mergeUniqueStrings(
            token.breweries ?? [],
            session.newBreweryId as string
          );
          shouldRefreshAccessToken = true;
        }
        if (session.removeBreweryId) {
          token.breweries = toUniqueStringArray(token.breweries ?? []).filter(
            (breweryId: string) =>
              breweryId !== (session.removeBreweryId as string)
          );
          shouldRefreshAccessToken = true;
        }
        if (session.updatedNotifications) {
          token.notifications = session.updatedNotifications as Notifications;
        }

        if (Object.prototype.hasOwnProperty.call(session, "selectedBreweryId")) {
          token.selectedBreweryId = resolvePreferredBreweryId(
            token.breweries ?? [],
            session.selectedBreweryId as string | null
          );
          shouldRefreshAccessToken = true;
        }

        token.selectedBreweryId = resolvePreferredBreweryId(
          token.breweries ?? [],
          token.selectedBreweryId
        );

        if (session.refreshMembership && token.accessToken) {
          try {
            const response = await fetch(buildApiUrl("/users/me"), {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token.accessToken}`,
              },
              cache: "no-store",
            });

            if (response.ok) {
              const refreshedUser = await response.json();
              const mergedMembership = mergeRefreshedMembershipTokenFields(
                {
                  id: token.id,
                  name: token.name,
                  fullName: token.fullName,
                  email: token.email,
                  breweries: token.breweries,
                  notifications:
                    (token.notifications as Record<string, unknown> | undefined) ??
                    null,
                  selectedBreweryId: token.selectedBreweryId,
                  picture: token.picture,
                  image: token.image,
                },
                refreshedUser
              );

              if (mergedMembership) {
                token.id = mergedMembership.id;
                token.name = mergedMembership.name;
                token.fullName = mergedMembership.fullName;
                token.email = mergedMembership.email;
                token.breweries = mergedMembership.breweries;
                token.notifications = mergedMembership.notifications as Notifications;
                token.selectedBreweryId = mergedMembership.selectedBreweryId;
                token.picture = mergedMembership.picture;
                token.image = mergedMembership.image;
                shouldRefreshAccessToken = true;
              }
            }
          } catch {
            // Preserve the existing token when membership refresh fails.
          }
        }

        token.breweries = toUniqueStringArray(token.breweries ?? []);

        if (shouldRefreshAccessToken) {
          token.accessToken = await signJwtAccessToken(
            buildAccessTokenPayload({
              id: token.id,
              name: token.name,
              fullName: token.fullName,
              email: token.email,
              breweries: token.breweries,
              notifications: token.notifications,
              selectedBreweryId: token.selectedBreweryId,
              picture: token.picture,
              image: token.image,
            }),
            process.env.AUTH_SECRET!
          );
        }
        return token;
      }

      if (user) {
        const accessTokenPayload = buildAccessTokenPayload({
          id: user.id as string,
          name: user.name,
          fullName: (user as any).fullName || user.name,
          email: user.email,
          breweries: user.breweries,
          notifications: user.notifications,
          selectedBreweryId: user.selectedBreweryId,
          picture: user.picture,
          image: (user as any).image || user.picture,
        });

        const accessToken = await signJwtAccessToken(
          accessTokenPayload,
          process.env.AUTH_SECRET!
        );
        token.id = user.id as string;

        return {
          ...token,
          name: user.name,
          fullName: (user as any).fullName || user.name,
          email: user.email,
          breweries: accessTokenPayload.breweries,
          picture: user.picture,
          image: (user as any).image || user.picture,
          notifications: user.notifications,
          accessToken: accessToken,
          selectedBreweryId: user.selectedBreweryId,
        };
      }

      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      session.user = {
        ...(session.user || {}),
        id: token.id as string,
        name: (token.name as string) || (token.fullName as string) || "",
        fullName: (token.fullName as string) || (token.name as string) || "",
        email: (token.email as string) || "",
        accessToken: token.accessToken as string,
        picture: (token.picture as string) || (token.image as string) || "",
        image: (token.image as string) || (token.picture as string) || "",
        breweries: token.breweries ?? [],
        selectedBreweryId: token.selectedBreweryId as string | null,
        notifications: token.notifications ?? ({} as Notifications),
      };

      return session;
    },
  },
});
