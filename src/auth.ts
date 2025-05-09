export const config = {
  runtime: "nodejs", // ✅ Forces Node.js runtime
};
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { getUserByCredentials } from "@/lib/GET/getUserByCredentials";
import { signJwtAccessToken, signJwtRefreshToken } from "@/lib/jwt";
import { jwtVerify } from "jose";
import type { Account, Profile, Session } from "next-auth";

import { Notifications } from "@/types/notifications";
import NextAuth, { User as NextAuthUser } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getUserByOauth } from "./lib/GET/getUserByOauth";

interface MyToken extends JWT {
  id?: string;
  breweries?: string[];
  notifications?: Notifications;
  accessToken?: string;
  refreshToken?: string;
  selectedBreweryId?: string;
  account?: Account | null; // Account is optional
}

interface Profiles extends Profile {
  picture?: string;
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
        email: { label: "Email address", type: "text", placeholder: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
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
            credentials.email as string,
            credentials.password
          );
          return {
            id: Number(user._id.toString()),
            ...user,
            selectedBreweryId: null,
          };
        } catch (error: any) {
          console.error("Login error:", error.message);
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
      const name = user?.name ?? profile?.name;
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
          user.picture = picture;
          user.selectedBreweryId = selectedBreweryId;
          user.breweries = user.breweries.map((b: any) => b.toString());
          user.notifications = { ...user.notifications };
          return true;
        }
        return false;
      }

      try {
        const existingUser = await getUserByOauth(email);

        user.id = existingUser._id.toString();
        user.picture = picture;
        user.breweries = existingUser.breweries.map((b: any) => b.toString());
        user.notifications = { ...existingUser.notifications };
        user.selectedBreweryId =
          selectedBreweryId || existingUser.breweries[0] || null;

        return true;
      } catch (err: string | any) {
        console.error("signIn error:", err.message);
        throw new Error(err.message);
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
      if (!isAuth) {
        return NextResponse.redirect(new URL("/auth/login", nextUrl));
      }

      if (isAuth && acceptInvite) {
        const loginUrl = new URL("/auth/login", nextUrl);
        loginUrl.searchParams.set("next", nextUrl.toString());
        return NextResponse.redirect(loginUrl);
      }

      return true; // Example: Return true if auth exists, otherwise false
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
        if (session.newBreweryId) {
          (token.breweries as string[]).push(session.newBreweryId);
        }
        if (session.removeBreweryId) {
          token.breweries = (token.breweries as string[]).filter(
            (breweryId: string) =>
              breweryId !== (session.removeBreweryId as string)
          );
        }
        if (session.updatedNotifications) {
          token.notifications = session.updatedNotifications as Notifications;
        }

        if (session.selectedBreweryId) {
          token.selectedBreweryId = session.selectedBreweryId as string;
        }
        return token;
      }

      if (user) {
        const accessToken = await signJwtAccessToken(
          user,
          process.env.AUTH_SECRET!
        );

        const refreshToken = await signJwtRefreshToken(
          user,
          process.env.REFRESH_TOKEN_SECRET!
        );
        token.id = user.id as string;

        return {
          ...token,
          breweries: user.breweries,
          picture: user.picture,
          name: user.fullName || user.name,
          notifications: user.notifications,
          accessToken: accessToken,
          refreshToken: refreshToken,
          selectedBreweryId: user.selectedBreweryId,
        };
      } // If the access token has expired, try to refresh it
      else if (token.accessToken && token.refreshToken) {
        const encoder = new TextEncoder();

        try {
          await jwtVerify(
            token.accessToken as string,
            encoder.encode(process.env.AUTH_SECRET as string)
          );
        } catch (e) {
          try {
            // Access token is invalid; attempt to refresh
            const { payload } = await jwtVerify(
              token.refreshToken as string,
              encoder.encode(process.env.REFRESH_TOKEN_SECRET as string)
            );

            const newAccessToken = await signJwtAccessToken(
              payload,
              process.env.AUTH_SECRET!
            );
            token.accessToken = newAccessToken;
          } catch (err) {
            console.error("Error refreshing access token", err);
            return { ...token, error: "RefreshAccessTokenError" };
          }
        }
      }

      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      session.user = {
        ...(session.user || {}),
        id: token.id as string,
        accessToken: token.accessToken as string,
        refreshToken: token.refreshToken as string,
        picture: token.picture as string,
        breweries: token.breweries as string[],
        selectedBreweryId: token.selectedBreweryId as string | null,
        notifications: token.notifications as Notifications,
      };

      return session;
    },
  },
});
