export const config = {
  runtime: "nodejs", // ✅ Forces Node.js runtime
};
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { getUserByCredentials } from "@/lib/GET/getUserByCredentials";
import { signJwtAccessToken } from "@/lib/jwt";
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
            id: Number(user._id.toString()),
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
          user.selectedBreweryId = selectedBreweryId;
          user.breweries = (user.breweries ?? []).map((b: any) =>
            b.toString()
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
        user.selectedBreweryId =
          selectedBreweryId || (existingUser.breweries ?? [])[0] || null;

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
      const publicRoutes = [
        "/",
        "/help",
        "/privacy-policy",
        "/auth/login",
        "/auth/signup",
        "/auth/create/account",
      ];

      if (
        publicRoutes.some(
          (route) =>
            nextUrl.pathname === route || nextUrl.pathname.startsWith(`${route}/`)
        )
      ) {
        return true;
      }

      if (!isAuth) {
        const loginUrl = new URL("/auth/login", nextUrl);
        if (acceptInvite) {
          loginUrl.searchParams.set("next", nextUrl.toString());
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
        if (session.newBreweryId) {
          token.breweries = [...(token.breweries ?? []), session.newBreweryId];
        }
        if (session.removeBreweryId) {
          token.breweries = (token.breweries ?? []).filter(
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
        const accessTokenPayload = {
          id: user.id,
          name: user.name,
          fullName: (user as any).fullName || user.name,
          email: user.email,
          breweries: user.breweries,
          notifications: user.notifications,
          selectedBreweryId: user.selectedBreweryId,
          picture: user.picture,
          image: (user as any).image || user.picture,
        };

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
          breweries: user.breweries,
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
