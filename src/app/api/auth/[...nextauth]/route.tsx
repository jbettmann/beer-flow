import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

import getUser from "@/lib/getUser";
import { signJwtAccessToken, signJwtRefreshToken } from "@/lib/jwt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import type { Account, NextAuthOptions, Profile } from "next-auth";

import { Notifications } from "@/app/types/notifications";
import updateUserInfoDBDirect from "@/lib/PUT/updateUserInfoDBDirect";
import { User as NextAuthUser } from "next-auth";
import { JWT } from "next-auth/jwt";
import User from "../../../../../models/user";

import { AdapterUser } from "next-auth/adapters";

interface MyToken extends JWT {
  id?: string;
  breweries?: string[];
  notifications?: Notifications;
  accessToken?: string;
  refreshToken?: string;
}

interface Profiles extends Profile {
  picture?: string;
  // ... other properties ...
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, email, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "Email address", type: "text", placeholder: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        console.log("credentials", credentials);
        const endpoints =
          "https://beer-bible-api.vercel.app/api/login" ||
          "http://localhost:3000/api/login";
        // Add logic here to look up the user from the credentials supplied
        const res = await fetch("http://localhost:3000/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });
        const user = await res.json();
        if (user) {
          // Any object returned will be saved in `user` property of the JWT
          console.log(user);
          return user._doc;
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null;

          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
    }),
  ],

  // An optional, but recommended, database for persisting user and session data
  // database: process.env.DATABASE_URL,
  // session: {
  //   jwt: true,
  // },
  callbacks: {
    async jwt({
      token,
      user,
      trigger,
      session,
    }: {
      token: MyToken;
      user: AdapterUser | NextAuthUser;

      trigger?: "signIn" | "signUp" | "update";

      session?: any;
    }) {
      // Persist the OAuth access_token and or the user id to the token right after signin

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
        return token;
      }

      if (user) {
        const accessToken = signJwtAccessToken(user); // creates accessToken for API authorization
        const refreshToken = signJwtRefreshToken(user); // sends for new accessToken after expires
        token.id = user.id as string;
        return {
          ...token,
          breweries: user.breweries,
          notifications: user.notifications,
          accessToken: accessToken,
          refreshToken: refreshToken,
        };
      } // If the access token has expired, try to refresh it
      else if (token.accessToken && token.refreshToken) {
        try {
          jwt.verify(
            token.accessToken as string,
            process.env.NEXTAUTH_SECRET as string
          );
        } catch (e) {
          try {
            const { exp, ...rest } = jwt.verify(
              token.refreshToken as string,
              process.env.REFRESH_TOKEN_SECRET as string
            ) as JwtPayload & { exp?: number };

            const newAccessToken = signJwtAccessToken(rest);

            token.accessToken = newAccessToken;
          } catch (err: string | any) {
            console.error("Error refreshing access token", err);

            return { ...token, error: "RefreshAccessTokenError" };
          }
        }
      }

      return token;
    },

    async signIn({
      user,
      profile,
      account,
    }: {
      user: AdapterUser | NextAuthUser;
      profile?: Profiles | undefined;
      account?: Account | null;
    }): Promise<boolean> {
      // Get the user's name and email either from the 'user' object or the 'profile' object
      const name = user?.name ?? profile?.name;
      const email = user?.email ?? profile?.email;
      const picture = profile?.picture ?? user?.image;

      console.log("User", user, "Profile", profile, "Account", account);
      // Connect to MongoDB
      // const client = await db.user.findFirst();
      // const collection = client.db().collection("users");

      if (!email) {
        // OAuth provider didn't return an email
        return false;
      }

      if (account?.type === "credentials") {
        if (user) {
          if (user.image !== picture) {
            console.log("Existing Image", user.image, { picture });
            try {
              await updateUserInfoDBDirect({
                userId: user.id,
                updatedUserInfo: { image: picture },
              });
            } catch (error: string | any) {
              console.error("Error updating user info:", error.message);
            }
          }
          // User exists in your DB
          user.id = user._id.toString(); // or whatever the field for the user id is
          user.breweries = user.breweries; // add breweries to user
          user.notifications = user.notifications; // add notifications to user

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

      if (existingUser) {
        if (existingUser.image !== picture) {
          console.log("Existing Image", existingUser.image, { picture });
          try {
            await updateUserInfoDBDirect({
              userId: existingUser._id,
              updatedUserInfo: { image: picture },
            });
          } catch (error: string | any) {
            console.error("Error updating user info:", error.message);
          }
        }
        // User exists in your DB
        user.id = existingUser.id.toString(); // or whatever the field for the user id is
        user.breweries = existingUser.breweries; // add breweries to user
        user.notifications = existingUser.notifications; // add notifications to user

        return true;
      } else if (name && email) {
        try {
          // User does not exist, create the user
          // Create a new user with Mongoose
          const newUser = new User({
            fullName: name,
            email: email,
            breweries: [],
            image: picture,
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
          });

          const savedUser = await newUser.save();
          if (savedUser) {
            user.id = savedUser.id.toString(); // Add the new user's id to the user object so it will be included in the JWT
            user.breweries = savedUser.breweries; // breweries for new user
            user.notifications = savedUser.notifications; // notifications for new user
            return true;
          }
        } catch (err) {
          console.error("Error in insertOne:", err);
        }

        return false;
      }

      return false;
    },
    async session({ session, token, user }) {
      if (token.accessToken) {
        session.user = token as any;
        session.user.accessToken = token.accessToken as string; // sets users accessToken for API authorization

        session.user.breweries = token.breweries as string[]; // sets user's breweries
        session.user.notifications = token.notifications as Notifications; // sets user's notifications
      }

      return session;
    },
  },
};

const authHandler = (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, authOptions);

export { authHandler as GET, authHandler as POST };
export default NextAuth(authOptions);
