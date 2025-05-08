export const config = {
  runtime: "nodejs", // ✅ Forces Node.js runtime
};
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import getUser from "@/lib/GET/getUser";
import { signJwtAccessToken, signJwtRefreshToken } from "@/lib/jwt";
import { jwtVerify } from "jose";
import type { Account, Profile, Session } from "next-auth";

import { Notifications } from "@/types/notifications";
import * as bcyrpt from "bcryptjs";
import NextAuth, { User as NextAuthUser } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import updateUserInfo from "./lib/PATCH/updateUserInfo";
import createNewUser from "./lib/POST/createNewUser";
import { NewUser } from "./types/users";

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
          const user = await getUser(credentials.email as string);

          if (!user) {
            console.error("Invalid email address. User not found");
            throw new Error("Invalid email address. User not found");
          }

          // Check if user registered using OAuth (i.e., doesn't have a password)
          if (!user.password) {
            console.error("User registered using OAuth");
            throw new Error(
              "This account was created using Google. Please try log in using Googles OAuth method above."
            );
          }

          const passwordFromDB = user.password;

          const isPasswordValid = await bcyrpt.compare(
            credentials.password as string,
            passwordFromDB
          );

          if (!isPasswordValid) {
            console.error("Invalid password");
            throw new Error("Invalid password");
          }

          const { password, _id, ...userWithoutPassword } = user;

          return {
            id: Number(_id),
            selectedBreweryId: null,
            ...userWithoutPassword,
          }; // return the user with required properties
        } catch (error: any) {
          console.error("Error in authorization:", error);
          throw new Error(error);
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
      let picture = profile?.picture ?? user?.image;
      const cookieStore = await cookies();
      let selectedBreweryId =
        cookieStore.get("selectedBreweryId")?.value || null;

      if (!email) {
        // OAuth provider didn't return an email
        return false;
      }

      if (account?.type === "credentials") {
        if (user) {
          if (user.image !== picture) {
            try {
              await updateUserInfo({
                userId: user.id! as string,
                updatedUser: { image: picture },
              });
            } catch (error: string | any) {
              console.error("Error updating user info:", error.message);
            }
          }
          // User exists in your DB
          if (user.id) {
            user.id = user.id.toString();
          }
          user.selectedBreweryId = selectedBreweryId;
          user.breweries = user.breweries;
          user.notifications = user.notifications;

          return true;
        }
        return false;
      }

      let existingUser;
      try {
        existingUser = await getUser(email);
      } catch (err: string | any) {
        console.error(err);
      }
      // Check if user exists and was registered with credentials
      if (existingUser && existingUser.password) {
        console.error(
          "User tried to sign in with OAuth but was registered with credentials"
        );

        return false;
      }

      if (existingUser) {
        if (existingUser.image !== picture) {
          try {
            const userWithNewImage = await updateUserInfo({
              userId: existingUser._id,
              updatedUser: { image: picture },
            });
            picture = userWithNewImage.image;
          } catch (error: string | any) {
            console.error("Error updating user info:", error.message);
          }
        }

        if (
          selectedBreweryId &&
          !existingUser.breweries?.includes(selectedBreweryId)
        ) {
          selectedBreweryId = existingUser.breweries[0]; // fallback if logging in to different account
        }

        user.id = existingUser._id.toString();
        user.breweries = existingUser.breweries.map((b: any) => b.toString());
        user.notifications = { ...existingUser.notifications };
        user.selectedBreweryId = selectedBreweryId || null;

        return true;
      } else if (name && email) {
        try {
          // User does not exist, create the user
          // Create a new user with Mongoose
          const newUser = {
            fullName: name,
            email: email,
            breweries: [],
            image: picture || null,
            notifications: {
              allow: true,
              newBeerRelease: {
                email: true,
                push: true,
              },
              beerUpdate: {
                email: true,
                push: true,
              },
            },
          };

          const savedUser = await createNewUser(newUser as unknown as NewUser);
          if (savedUser) {
            user.id = savedUser._id.toString();
            user.breweries = savedUser.breweries;
            user.notifications = savedUser.notifications;
            user.selectedBreweryId = null;
            return true;
          }
        } catch (err) {
          console.error("Error in insertOne:", err);
        }

        return false;
      }

      return false;
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
      console.log({ nextUrl, auth });
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
          fullName: user.fullName,
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
        breweries: token.breweries as string[],
        selectedBreweryId: token.selectedBreweryId as string | null,
        notifications: token.notifications as Notifications,
      };

      return session;
    },
  },
});
